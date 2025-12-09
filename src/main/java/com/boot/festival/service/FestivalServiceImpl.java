package com.boot.festival.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class FestivalServiceImpl implements FestivalService {

    @Value("${festival.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE_NAME = "festival_core";

    /* ====================== 1. 데이터 동기화 (공공API → Solr 저장) ====================== */
    @Override
    public String syncFestivalData() throws Exception {
    	String apiUrl = "https://apis.data.go.kr/6260000/FestivalService/getFestivalKr" 
                + "?serviceKey=" + apiKey 
                + "&numOfRows=100&pageNo=1&resultType=json";

        // RestTemplate + UTF-8 강제 설정
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters()
                    .add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

        // 1. JSON 문자열로 먼저 받기 (가장 안전한 방법)
        String jsonString = restTemplate.getForObject(apiUrl, String.class);

        // 디버깅용 (필요시 주석 해제)
        // System.out.println("=== 공공데이터 API 응답 ===");
        // System.out.println(jsonString.substring(0, Math.min(1000, jsonString.length())));

        // 2. Jackson으로 파싱
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> response = mapper.readValue(jsonString,
                new TypeReference<Map<String, Object>>() {});

        // 3. 데이터 추출
        if (response == null || !response.containsKey("getFestivalKr")) {
            return "API 응답에 getFestivalKr 키가 없습니다.";
        }

        Map<String, Object> body = (Map<String, Object>) response.get("getFestivalKr");
        Object itemObj = body.get("item");

        List<Map<String, Object>> items;
        if (itemObj instanceof List) {
            items = (List<Map<String, Object>>) itemObj;
        } else if (itemObj instanceof Map) {
            Map<String, Object> wrapper = (Map<String, Object>) itemObj;
            if (wrapper.containsKey("item") && wrapper.get("item") instanceof List) {
                items = (List<Map<String, Object>>) wrapper.get("item");
            } else {
                items = List.of(wrapper);
            }
        } else {
            return "item 데이터가 없습니다.";
        }

        // 4. Solr에 저장
        int count = 0;
        for (Map<String, Object> item : items) {
            SolrInputDocument doc = new SolrInputDocument();

            String ucSeq = String.valueOf(item.getOrDefault("UC_SEQ", "unknown_" + count));
            doc.addField("id", ucSeq);                      // Solr 기본 PK

            doc.addField("UC_SEQ", ucSeq);
            doc.addField("MAIN_TITLE_text", item.get("MAIN_TITLE"));
            doc.addField("GUGUN_NM_s", item.get("GUGUN_NM"));
            doc.addField("LAT_d", item.get("LAT"));
            doc.addField("LNG_d", item.get("LNG"));
            doc.addField("PLACE_s", item.get("PLACE"));
            doc.addField("TITLE_text", item.get("TITLE"));
            doc.addField("ADDR1_s", item.get("ADDR1"));
            doc.addField("MAIN_IMG_NORMAL_s", item.get("MAIN_IMG_NORMAL"));
            doc.addField("ITEMCNTNTS_text", item.get("ITEMCNTNTS"));
            doc.addField("VIEW_COUNT_i", 0);

            solrClient.add(CORE_NAME, doc);
            count++;
        }

        solrClient.commit(CORE_NAME);

        return "성공! 총 " + count + "개의 축제 데이터를 Solr에 저장했습니다.";
    }

    /* ====================== 2. 검색 ====================== */
    @Override
    public Map<String, Object> searchFestival(String keyword, int page, int size) throws Exception {
        SolrQuery query = new SolrQuery();

        if (keyword == null || keyword.trim().isEmpty()) {
            query.setQuery("*:*");
        } else {
            String q = keyword.trim();
            query.setQuery("MAIN_TITLE_text:*" + q + "* OR TITLE_text:*" + q + "* OR ITEMCNTNTS_text:*" + q + "*");
        }

        query.setStart((page - 1) * size);
        query.setRows(size);
        query.addSort("VIEW_COUNT_i", SolrQuery.ORDER.desc);

        QueryResponse resp = solrClient.query(CORE_NAME, query);
        SolrDocumentList results = resp.getResults();

        List<Map<String, Object>> list = new ArrayList<>();
        for (SolrDocument doc : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("ucSeq", doc.getFieldValue("UC_SEQ"));
            map.put("mainTitle", doc.getFieldValue("MAIN_TITLE_text"));
            map.put("gugunNm", doc.getFieldValue("GUGUN_NM_s"));
            map.put("lat", doc.getFieldValue("LAT_d"));
            map.put("lng", doc.getFieldValue("LNG_d"));
            map.put("place", doc.getFieldValue("PLACE_s"));
            map.put("title", doc.getFieldValue("TITLE_text"));
            map.put("addr1", doc.getFieldValue("ADDR1_s"));
            map.put("mainImgNormal", doc.getFieldValue("MAIN_IMG_NORMAL_s"));
            map.put("description", doc.getFieldValue("ITEMCNTNTS_text"));

            list.add(map);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", results.getNumFound());

        return result;
    }

    /* ====================== 3. 상세 조회 ====================== */
    @Override
    public Map<String, Object> getFestivalDetail(String id) throws Exception {
        SolrDocument doc = solrClient.getById(CORE_NAME, id);
        if (doc == null) return null;

        Map<String, Object> map = new HashMap<>();
        map.put("ucSeq", doc.getFieldValue("UC_SEQ"));
        map.put("mainTitle", doc.getFieldValue("MAIN_TITLE_text"));
        map.put("gugunNm", doc.getFieldValue("GUGUN_NM_s"));
        map.put("lat", doc.getFieldValue("LAT_d"));
        map.put("lng", doc.getFieldValue("LNG_d"));
        map.put("place", doc.getFieldValue("PLACE_s"));
        map.put("title", doc.getFieldValue("TITLE_text"));
        map.put("addr1", doc.getFieldValue("ADDR1_s"));
        map.put("mainImgNormal", doc.getFieldValue("MAIN_IMG_NORMAL_s"));
        map.put("itemCntnts", doc.getFieldValue("ITEMCNTNTS_text"));
        map.put("viewCount", doc.getFieldValue("VIEW_COUNT_i"));

        return map;
    }

    /* ====================== 4. 조회수 증가 ====================== */
    @Override
    public void increaseViewCount(String id) throws Exception {
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField("id", id);

        Map<String, Object> inc = new HashMap<>();
        inc.put("inc", 1);
        doc.addField("VIEW_COUNT_i", inc);

        solrClient.add(CORE_NAME, doc);
        solrClient.commit(CORE_NAME);
    }
}