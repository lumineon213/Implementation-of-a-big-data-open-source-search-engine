package com.boot.themeApi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.apache.solr.client.solrj.SolrQuery; 
import org.apache.solr.client.solrj.response.QueryResponse; 
import org.apache.solr.common.SolrDocument; 
import org.apache.solr.common.SolrDocumentList; 

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ThemeServiceImpl implements ThemeService {

    @Value("${theme.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE = "theme_core";

    @Override
    public String syncThemeData() throws Exception {

        // 기존 데이터 삭제
        solrClient.deleteByQuery(CORE, "*:*");
        solrClient.commit(CORE);

        String apiUrl = "http://apis.data.go.kr/6260000/RecommendedService/getRecommendedKr";

        String requestUrl = apiUrl
                + "?ServiceKey=" + apiKey
                + "&pageNo=1"
                + "&numOfRows=999"
                + "&resultType=json";

        RestTemplate rest = new RestTemplate();
        String response = rest.getForObject(requestUrl, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode items = mapper.readTree(response)
                .path("getRecommendedKr")
                .path("item");

        List<SolrInputDocument> docs = new ArrayList<>();

        for (JsonNode item : items) {

            String rawId = item.path("UC_SEQ").asText();
            String id = "THEME_" + rawId;

            SolrInputDocument doc = new SolrInputDocument();

            // 기본 ID & 타입
            doc.addField("id", id);
            doc.addField("type", "THEME_TOURISM");

            // 제목 정보
            doc.addField("main_title", item.path("MAIN_TITLE").asText());
            doc.addField("title", item.path("TITLE").asText());
            doc.addField("subtitle", item.path("SUBTITLE").asText());

            // 위치/구군/카테고리
            doc.addField("place", item.path("PLACE").asText());
            doc.addField("main_place", item.path("MAIN_PLACE").asText());
            doc.addField("gugun", item.path("GUGUN_NM").asText());
            doc.addField("category", item.path("CATE2_NM").asText());

            // 주소
            doc.addField("address", item.path("ADDR1").asText());
            doc.addField("address2", item.path("ADDR2").asText());

            // 연락처/홈페이지
            doc.addField("tel", item.path("CNTCT_TEL").asText());
            doc.addField("homepage", item.path("HOMEPAGE_URL").asText());
            doc.addField("traffic_info", item.path("TRFC_INFO").asText());

            // 운영 정보
            doc.addField("usage_day", item.path("USAGE_DAY").asText());
            doc.addField("holiday", item.path("HLDY_INFO").asText());
            doc.addField("usage_time", item.path("USAGE_DAY_WEEK_AND_TIME").asText());
            doc.addField("usage_amount", item.path("USAGE_AMOUNT").asText());
            doc.addField("facilities", item.path("MIDDLE_SIZE_RM1").asText());

            // 위경도
            doc.addField("latitude", item.path("LAT").asDouble());
            doc.addField("longitude", item.path("LNG").asDouble());

            // 이미지
            doc.addField("image_url", item.path("MAIN_IMG_NORMAL").asText());
            doc.addField("thumbnail", item.path("MAIN_IMG_THUMB").asText());

            // 설명
            doc.addField("description", item.path("CNTNTS").asText());
            doc.addField("contents", item.path("ITEMCNTNTS").asText());

            docs.add(doc);
        }

        solrClient.add(CORE, docs);
        solrClient.commit(CORE);

        return "테마 여행 FULL 데이터 저장 완료: " + docs.size() + "건";
    }

    // -------------------- 검색 --------------------
    @Override
    public Map<String, Object> searchTheme(String keyword, int page, int size) throws Exception {

        SolrQuery query = new SolrQuery();

        if (keyword == null || keyword.trim().isEmpty()) {
            query.setQuery("*:*");
        } else {
            String kw = keyword.trim();
            query.setQuery(
                    "title:*" + kw + "* OR subtitle:*" + kw + "* OR place:*" + kw + "* OR category:*" + kw + "* OR address:*" + kw + "*"
            );
        }

        query.setStart((page - 1) * size);
        query.setRows(size);

        QueryResponse res = solrClient.query(CORE, query);
        SolrDocumentList list = res.getResults();

        List<Map<String, Object>> out = new ArrayList<>();

        for (SolrDocument doc : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", doc.get("id"));
            m.put("title", doc.get("title"));
            m.put("subtitle", doc.getOrDefault("subtitle", ""));
            m.put("place", doc.get("place"));
            m.put("image_url", doc.get("image_url"));
            m.put("type", doc.get("type"));
            out.add(m);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", out);
        result.put("total", list.getNumFound());

        return result;
    }

    // -------------------- 상세 조회 --------------------
    @Override
    public Map<String, Object> getById(String id) throws Exception {

        SolrQuery query = new SolrQuery("id:" + id);
        query.setRows(1);

        QueryResponse res = solrClient.query(CORE, query);
        SolrDocumentList list = res.getResults();

        if (list.isEmpty()) return null;

        SolrDocument doc = list.get(0);

        Map<String, Object> result = new HashMap<>();

        // Urban의 상세조회 구조를 그대로 Theme에 적용
        for (String key : doc.getFieldNames()) {
            result.put(key, extractSingle(doc.get(key)));
        }

        return result;
    }

    // Urban과 동일한 처리
    private Object extractSingle(Object value) {
        if (value instanceof Collection<?> col) {
            return col.isEmpty() ? null : col.iterator().next();
        }
        return value;
    }
}
