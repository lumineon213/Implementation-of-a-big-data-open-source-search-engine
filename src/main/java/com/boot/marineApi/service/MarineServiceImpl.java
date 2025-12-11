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
            "MARINE_139","MARINE_338","MARINE_339","MARINE_341","MARINE_401","MARINE_429","MARINE_839","MARINE_1315",
            "MARINE_1624","MARINE_1683","MARINE_1769","MARINE_1906","MARINE_1908","MARINE_1942","MARINE_1955","MARINE_1965",
            "MARINE_1680","MARINE_2142","MARINE_1874","MARINE_2097","MARINE_2294","MARINE_2397","MARINE_990","MARINE_1364",
            "MARINE_1899","MARINE_996","MARINE_2243","MARINE_1753","MARINE_2134","MARINE_2135","MARINE_2132","MARINE_2410",
            "MARINE_2293",
            "MARINE_44","MARINE_434","MARINE_140","MARINE_336","MARINE_2586",
            "MARINE_1852","MARINE_1177","MARINE_1312","MARINE_2060","MARINE_1187","MARINE_1748"
    );

    // =====================================================================================
    // 🔥 스키마 자동 정비: tel 필드가 string 타입인지 검사 → 아니면 자동 삭제→재생성
    // =====================================================================================
    private void ensureSchema() {
        ensureField("tel", "string");
    }

    private void ensureField(String fieldName, String requiredType) {

        String baseUrl = "http://localhost:8983/solr/" + CORE_NAME + "/schema";
        RestTemplate rest = new RestTemplate();

        try {
            Map res = rest.getForObject(baseUrl + "/fields/" + fieldName + "?wt=json", Map.class);

            // 필드 존재
            if (res != null && res.containsKey("field")) {
                Map field = (Map) res.get("field");
                String currentType = (String) field.get("type");

                if (!currentType.equals(requiredType)) {
                    deleteField(fieldName);
                    addField(fieldName, requiredType);
                }
                return;
            }
        } catch (Exception ignored) {
            // 조회 실패 = 필드 없음
        }

        // 필드 없음 → 생성
        addField(fieldName, requiredType);
    }

    private void addField(String name, String type) {

        String baseUrl = "http://localhost:8983/solr/" + CORE_NAME + "/schema";

        String json = String.format("""
        {
          "add-field": {
            "name": "%s",
            "type": "%s",
            "stored": true,
            "indexed": true
          }
        }
        """, name, type);

        RestTemplate rest = new RestTemplate();
        rest.postForObject(baseUrl, json, String.class);
    }

    private void deleteField(String name) {

        String baseUrl = "http://localhost:8983/solr/" + CORE_NAME + "/schema";

        String json = String.format("""
        {
          "delete-field": {
            "name": "%s"
          }
        }
        """, name);

        RestTemplate rest = new RestTemplate();
        rest.postForObject(baseUrl, json, String.class);
    }

    // =====================================================================================
    // 🔥 데이터 동기화
    // =====================================================================================

    @Override
    public String syncMarineData() throws Exception {

        // 💥 저장 전에 스키마 자동 점검 + 자동수리
        ensureSchema();

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

            String rawSeq = item.path("UC_SEQ").asText();
            String id = "MARINE_" + rawSeq;

            if (!ALLOWED_IDS.contains(id)) continue;

            SolrInputDocument doc = new SolrInputDocument();

            doc.addField("id", id);

            doc.addField("main_title", safeString(item.path("MAIN_TITLE").asText()));
            doc.addField("title", safeString(item.path("TITLE").asText()));
            doc.addField("subtitle", safeString(item.path("SUBTITLE").asText()));
            doc.addField("description", safeString(item.path("CNTNTS").asText()));
            doc.addField("contents", safeString(item.path("ITEMCNTNTS").asText()));

            doc.addField("address", safeString(item.path("ADDR1").asText()));
            doc.addField("address2", safeString(item.path("ADDR2").asText()));

            // tel → 무조건 string 타입으로 들어가도록 강제 변환
            doc.addField("tel", normalizeTel(item.path("CNTCT_TEL").asText()));

            doc.addField("homepage", safeString(item.path("HOMEPAGE_URL").asText()));
            doc.addField("traffic_info", safeString(item.path("TRFC_INFO").asText()));

            doc.addField("usage_day", safeString(item.path("USAGE_DAY").asText()));
            doc.addField("holiday", safeString(item.path("HLDY_INFO").asText()));
            doc.addField("usage_time", safeString(item.path("USAGE_DAY_WEEK_AND_TIME").asText()));
            doc.addField("usage_amount", safeString(item.path("USAGE_AMOUNT").asText()));
            doc.addField("facilities", safeString(item.path("MIDDLE_SIZE_RM1").asText()));

            doc.addField("latitude", safeDouble(item.path("LAT").asText()));
            doc.addField("longitude", safeDouble(item.path("LNG").asText()));

            doc.addField("image_url", safeString(item.path("MAIN_IMG_NORMAL").asText()));
            doc.addField("thumbnail", safeString(item.path("MAIN_IMG_THUMB").asText()));

            doc.addField("type", "MARINE_TOURISM");

            docs.add(doc);
        }

        solrClient.add(CORE_NAME, docs);
        solrClient.commit(CORE_NAME);

        return "필터링 완료: " + docs.size() + "건 업로드됨";
    }

    // =====================================================================================
    // 🔧 유틸 함수
    // =====================================================================================

    private String safeString(String v) {
        if (v == null) return "";
        v = v.trim();
        if (v.equalsIgnoreCase("null") || v.equalsIgnoreCase("undefined")) return "";
        return v;
    }

    private String normalizeTel(String tel) {
        if (tel == null) return "";
        tel = tel.trim();

        // 날짜처럼 생긴 전화번호 방지
        if (tel.matches("\\d{3,4}-\\d{3,4}")) {
            return tel.replace("-", " ");
        }
        return safeString(tel);
    }

    private double safeDouble(String v) {
        try {
            return Double.parseDouble(v);
        } catch (Exception e) {
            return 0.0;
        }
    }

    // =====================================================================================
    // 검색 & 상세조회
    // =====================================================================================

    @Override
    public Map<String, Object> searchMarine(String keyword, int page, int size) throws Exception {

        if (keyword == null || keyword.trim().isEmpty()
                || keyword.equalsIgnoreCase("undefined")
                || keyword.equalsIgnoreCase("null")) {
            keyword = "";
        }

        SolrQuery query = new SolrQuery(
                keyword.isEmpty()
                        ? "*:*"
                        : "title:*" + keyword + "* OR subtitle:*" + keyword + "*"
        );

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

        return Map.of(
                "list", out,
                "total", list.getNumFound()
        );
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

        for (String key : doc.getFieldNames()) {
            result.put(key, doc.get(key));
        }

        return result;
    }
}
