package com.boot.urbanApi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class UrbanServiceImpl implements UrbanService {

    @Value("${marine.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE_NAME = "urban_core";

    // Marine에서 쓰는 ALLOWED_IDS 그대로 공유
    private static final Set<String> MARINE_ALLOWED_IDS = Set.of(

        // --- 기존 Marine 33개 ---
        "MARINE_139", "MARINE_338", "MARINE_339", "MARINE_341",
        "MARINE_401", "MARINE_429", "MARINE_839", "MARINE_1315",
        "MARINE_1624", "MARINE_1683", "MARINE_1769", "MARINE_1906",
        "MARINE_1908", "MARINE_1942", "MARINE_1955", "MARINE_1965",

        "MARINE_1680", "MARINE_2142", "MARINE_1874", "MARINE_2097",
        "MARINE_2294", "MARINE_2397", "MARINE_990", "MARINE_1364",
        "MARINE_1899", "MARINE_996", "MARINE_2243", "MARINE_1753",
        "MARINE_2134", "MARINE_2135", "MARINE_2132", "MARINE_2410",
        "MARINE_2293",

        // --- 해양에 추가된 확정 11개 ---
        "MARINE_434",     // 부산캠핑장
        "MARINE_44",     // 부산아쿠아리움
        "MARINE_140",    // 요트투어
        "MARINE_336",    // 낙동강 탐방선
        "MARINE_2586",   // 브레이크아웃(해변 기반)
        "MARINE_1852",   // 부산항 힐링야영장

        "MARINE_1177",   // 캐비네 드 쁘아송(해안 기반)
        "MARINE_1312",   // 어린이 워터파크(해변)
        "MARINE_2060",   // 바다 vs 강
        "MARINE_1187",   // 원데이클래스(오렌지바다)
        "MARINE_1748"    // 그린온더브라운(광안리 해변)
    );


    @Override
    public String syncUrbanData() throws Exception {

        solrClient.deleteByQuery(CORE_NAME, "*:*");
        solrClient.commit(CORE_NAME);

        RestTemplate rest = new RestTemplate();

        String url = "http://apis.data.go.kr/6260000/MarintimeService/getMaritimeKr"
                + "?ServiceKey=" + apiKey
                + "&pageNo=1&numOfRows=999&resultType=json";

        String response = rest.getForObject(url, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode items = mapper.readTree(response)
                .path("getMaritimeKr")
                .path("item");

        List<SolrInputDocument> docs = new ArrayList<>();

        for (JsonNode item : items) {

            String id = "MARINE_" + item.path("UC_SEQ").asText();

            if (MARINE_ALLOWED_IDS.contains(id)) continue;

            SolrInputDocument doc = new SolrInputDocument();

            doc.addField("id", id);
            doc.addField("main_title", item.path("MAIN_TITLE").asText());
            doc.addField("title", item.path("TITLE").asText());
            doc.addField("subtitle", item.path("SUBTITLE").asText());

            doc.addField("address", item.path("ADDR1").asText());
            doc.addField("address2", item.path("ADDR2").asText());

            doc.addField("tel", item.path("CNTCT_TEL").asText());
            doc.addField("homepage", item.path("HOMEPAGE_URL").asText());
            doc.addField("traffic_info", item.path("TRFC_INFO").asText());

            doc.addField("usage_day", item.path("USAGE_DAY").asText());
            doc.addField("holiday", item.path("HLDY_INFO").asText());
            doc.addField("usage_time", item.path("USAGE_DAY_WEEK_AND_TIME").asText());
            doc.addField("usage_amount", item.path("USAGE_AMOUNT").asText());
            doc.addField("facilities", item.path("MIDDLE_SIZE_RM1").asText());

            doc.addField("description", item.path("CNTNTS").asText());   // 요약 설명
            doc.addField("contents", item.path("ITEMCNTNTS").asText());  // 상세 본문

            doc.addField("latitude", item.path("LAT").asDouble());
            doc.addField("longitude", item.path("LNG").asDouble());

            doc.addField("image_url", item.path("MAIN_IMG_NORMAL").asText());
            doc.addField("thumbnail", item.path("MAIN_IMG_THUMB").asText());

            doc.addField("type", "URBAN_TOURISM");

            docs.add(doc);
        }

        solrClient.add(CORE_NAME, docs);
        solrClient.commit(CORE_NAME);

        return "Urban 관광 FULL 데이터 저장 완료: " + docs.size() + "건";
    }


    @Override
    public Map<String, Object> searchUrban(String keyword, int page, int size) throws Exception {

        SolrQuery query = new SolrQuery();

        if (keyword == null || keyword.isBlank()) {
            query.setQuery("*:*");
        } else {
            query.setQuery("title:*" + keyword + "* OR subtitle:*" + keyword + "*");
        }

        query.setStart((page - 1) * size);
        query.setRows(size);

        QueryResponse res = solrClient.query(CORE_NAME, query);
        SolrDocumentList list = res.getResults();

        List<Map<String, Object>> out = new ArrayList<>();

        for (SolrDocument doc : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", doc.get("id"));
            m.put("title", doc.get("title"));
            m.put("subtitle", doc.getOrDefault("subtitle", ""));
            m.put("address", doc.get("address"));
            m.put("image_url", doc.get("image_url"));
            out.add(m);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", out);
        result.put("total", list.getNumFound());

        return result;
    }
    
    @Override
    public Map<String, Object> getById(String id) throws Exception {

        SolrQuery query = new SolrQuery("id:" + id);
        query.setRows(1);

        QueryResponse res = solrClient.query(CORE_NAME, query);
        SolrDocumentList list = res.getResults();

        if (list.isEmpty()) return null;

        SolrDocument doc = list.get(0);

        Map<String, Object> result = new HashMap<>();

        result.put("id", doc.get("id"));
        result.put("main_title", doc.get("main_title"));
        result.put("title", doc.get("title"));
        result.put("subtitle", doc.get("subtitle"));

        result.put("address", doc.get("address"));
        result.put("address2", doc.get("address2"));

        result.put("tel", doc.get("tel"));
        result.put("homepage", doc.get("homepage"));
        result.put("traffic_info", doc.get("traffic_info"));

        result.put("usage_day", doc.get("usage_day"));
        result.put("holiday", doc.get("holiday"));
        result.put("usage_time", doc.get("usage_time"));
        result.put("usage_amount", doc.get("usage_amount"));
        result.put("facilities", doc.get("facilities"));

        result.put("description", doc.get("description"));
        result.put("contents", doc.get("contents"));

        result.put("latitude", extractSingle(doc.get("latitude")));
        result.put("longitude", extractSingle(doc.get("longitude")));

        result.put("image_url", doc.get("image_url"));
        result.put("thumbnail", doc.get("thumbnail"));

        result.put("type", doc.get("type"));

        return result;
    }


    private Object extractSingle(Object value) {
        if (value instanceof Collection<?> col) {
            return col.isEmpty() ? null : col.iterator().next();
        }
        return value;
    }

}
