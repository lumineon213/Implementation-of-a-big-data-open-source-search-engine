package com.boot.festivalApi.service;

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

import java.net.URI;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FestivalServiceImpl implements FestivalService {

    @Value("${festival.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE_NAME = "festival_core";

    @Override
    public String syncFestivalData() throws Exception {
        System.out.println(">>> [Service] 축제 데이터 동기화 시작...");

        String apiUrl = "http://apis.data.go.kr/6260000/FestivalService/getFestivalKr";
        String serviceKey = URLEncoder.encode(apiKey, "UTF-8");
        String requestUrl = apiUrl
                + "?serviceKey=" + serviceKey
                + "&numOfRows=1000"
                + "&pageNo=1"
                + "&resultType=json";

        System.out.println(">>> 요청 URL: " + requestUrl);

        RestTemplate restTemplate = new RestTemplate();
        URI uri = new URI(requestUrl);
        String response = restTemplate.getForObject(uri, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);

        // 공공데이터 구조에 따라 경로 확인 (getFestivalKr -> item)
        JsonNode items = root.path("getFestivalKr").path("item");

        if (items.isMissingNode() || items.isEmpty()) {
            System.out.println("API 응답 전체: " + response);
            return "실패: API 데이터가 비어있습니다. (키 확인 또는 API 호출 횟수 초과)";
        }

        List<SolrInputDocument> docs = new ArrayList<>();

        if (items.isArray()) {
            for (JsonNode item : items) {
                SolrInputDocument doc = new SolrInputDocument();

                String ucSeq = item.path("UC_SEQ").asText();
                doc.addField("id", "FEST_" + ucSeq);

                String mainTitle = item.path("MAIN_TITLE").asText();
                String title = item.path("TITLE").asText();
                String subtitle = item.path("SUBTITLE").asText();

                doc.addField("title", mainTitle.isEmpty() ? title : mainTitle);
                doc.addField("subtitle", subtitle);

                doc.addField("address", item.path("ADDR1").asText());
                doc.addField("place", item.path("PLACE").asText());
                doc.addField("gugun", item.path("GUGUN_NM").asText());

                doc.addField("latitude", item.path("LAT").asText());
                doc.addField("longitude", item.path("LNG").asText());

                doc.addField("homepage", item.path("HOMEPAGE_URL").asText());
                doc.addField("phone", item.path("CNTCT_TEL").asText());

                doc.addField("usage_day", item.path("USAGE_DAY").asText());
                doc.addField("usage_time", item.path("USAGE_DAY_WEEK_AND_TIME").asText());
                doc.addField("usage_amount", item.path("USAGE_AMOUNT").asText());
                doc.addField("facility", item.path("MIDDLE_SIZE_RM1").asText());
                doc.addField("traffic_info", item.path("TRFC_INFO").asText());

                // description은 여러 필드를 조합해서 생성
                StringBuilder desc = new StringBuilder();
                String usageDay = item.path("USAGE_DAY").asText();
                String amount = item.path("USAGE_AMOUNT").asText();
                String traffic = item.path("TRFC_INFO").asText();

                if (!usageDay.isEmpty()) {
                    desc.append("운영기간: ").append(usageDay).append(". ");
                }
                if (!amount.isEmpty()) {
                    desc.append("이용요금: ").append(amount).append(". ");
                }
                if (!traffic.isEmpty()) {
                    desc.append("교통정보: ").append(traffic).append(". ");
                }

                doc.addField("description", desc.toString());

                doc.addField("type", "FESTIVAL");

                docs.add(doc);
            }
        }

        if (!docs.isEmpty()) {
            solrClient.add(CORE_NAME, docs);
            solrClient.commit(CORE_NAME);
            System.out.println(">>> 축제 데이터 저장 완료: " + docs.size() + "건");
            return "성공: " + docs.size() + "개의 축제 데이터 저장 완료";
        }

        return "데이터 없음";
    }

    @Override
    public Map<String, Object> searchFestival(String keyword, int page, int size) throws Exception {
        SolrQuery query = new SolrQuery();

        if (keyword == null || keyword.trim().isEmpty()) {
            query.setQuery("*:*");
        } else {
            query.setQuery("title:*" + keyword + "* OR address:*" + keyword + "* OR gugun:*" + keyword + "*");
        }

        int start = (page - 1) * size;
        query.setStart(start);
        query.setRows(size);

        QueryResponse response = solrClient.query(CORE_NAME, query);
        SolrDocumentList results = response.getResults();

        List<Map<String, Object>> list = new ArrayList<>();

        for (SolrDocument doc : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.getFieldValue("id"));
            map.put("title", doc.getFieldValue("title"));
            map.put("subtitle", doc.getFieldValue("subtitle"));
            map.put("address", doc.getFieldValue("address"));
            map.put("place", doc.getFieldValue("place"));
            map.put("gugun", doc.getFieldValue("gugun"));
            map.put("description", doc.getFieldValue("description"));

            Object latObj = doc.getFieldValue("latitude");
            Object lngObj = doc.getFieldValue("longitude");

            if (latObj instanceof java.util.Collection) {
                java.util.Collection<?> col = (java.util.Collection<?>) latObj;
                map.put("latitude", col.isEmpty() ? null : col.iterator().next());
            } else {
                map.put("latitude", latObj);
            }

            if (lngObj instanceof java.util.Collection) {
                java.util.Collection<?> col = (java.util.Collection<?>) lngObj;
                map.put("longitude", col.isEmpty() ? null : col.iterator().next());
            } else {
                map.put("longitude", lngObj);
            }

            list.add(map);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", results.getNumFound());

        return result;
    }

    @Override
    public Map<String, Object> getFestivalDetail(String id) throws Exception {
        SolrDocument doc = solrClient.getById(CORE_NAME, id);

        if (doc == null) {
            return null;
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", doc.getFieldValue("id"));
        map.put("title", doc.getFieldValue("title"));
        map.put("subtitle", doc.getFieldValue("subtitle"));
        map.put("address", doc.getFieldValue("address"));
        map.put("place", doc.getFieldValue("place"));
        map.put("gugun", doc.getFieldValue("gugun"));
        map.put("description", doc.getFieldValue("description"));
        map.put("homepage", doc.getFieldValue("homepage"));
        map.put("phone", doc.getFieldValue("phone"));
        map.put("usage_day", doc.getFieldValue("usage_day"));
        map.put("usage_time", doc.getFieldValue("usage_time"));
        map.put("usage_amount", doc.getFieldValue("usage_amount"));
        map.put("facility", doc.getFieldValue("facility"));
        map.put("traffic_info", doc.getFieldValue("traffic_info"));
        map.put("latitude", doc.getFieldValue("latitude"));
        map.put("longitude", doc.getFieldValue("longitude"));

        return map;
    }
}
