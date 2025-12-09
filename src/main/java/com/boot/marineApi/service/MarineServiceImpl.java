package com.boot.marineApi.service;

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
public class MarineServiceImpl implements MarineService {

    @Value("${marine.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE_NAME = "marine_core";

    private static final Set<String> ALLOWED_IDS = Set.of(

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

        // --- 해양에 추가된 확정 10개 ---
        "MARINE_44",     // 부산아쿠아리움
        "MARINE_434",
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
    public String syncMarineData() throws Exception {

        // 기존 Solr 데이터 전체 삭제
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

            // 🔥 S + A 화이트리스트 필터
            if (!ALLOWED_IDS.contains(id)) {
                continue; // 업로드 제외
            }

            SolrInputDocument doc = new SolrInputDocument();
            doc.addField("id", id);
            doc.addField("title", item.path("MAIN_TITLE").asText());
            doc.addField("subtitle", item.path("SUBTITLE").asText());
            doc.addField("description", item.path("CNTNTS").asText());
            doc.addField("address", item.path("ADDR1").asText());
            doc.addField("latitude", item.path("LAT").asDouble());
            doc.addField("longitude", item.path("LNG").asDouble());
            doc.addField("image_url", item.path("MAIN_IMG_NORMAL").asText());
            doc.addField("type", "MARINE_FILTERED");

            docs.add(doc);
        }

        solrClient.add(CORE_NAME, docs);
        solrClient.commit(CORE_NAME);

        return "필터링 완료: " + docs.size() + "건 업로드됨";
    }

    @Override
    public Map<String, Object> searchMarine(String keyword, int page, int size) throws Exception {

        // 🔥 keyword sanitizing (undefined/null/공백 처리)
        if (keyword == null
                || keyword.trim().isEmpty()
                || "undefined".equalsIgnoreCase(keyword)
                || "null".equalsIgnoreCase(keyword)) {
            keyword = "";
        }

        SolrQuery query = new SolrQuery();

        if (keyword.isEmpty()) {
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

}
