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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ThemeServiceImpl implements ThemeService {

    @Value("${theme.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE = "theme_core";   // ← 새로운 코어

    @Override
    public String syncThemeData() throws Exception {

    	String apiUrl = "http://apis.data.go.kr/6260000/RecommendedService/getRecommendedKr";

    	String requestUrl = apiUrl
    	        + "?ServiceKey=" + apiKey   // ← ServiceKey (대문자!) + 인코딩 금지
    	        + "&pageNo=1"
    	        + "&numOfRows=999"
    	        + "&resultType=json";

    	RestTemplate rest = new RestTemplate();
    	String response = rest.getForObject(requestUrl, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);

        JsonNode items = root.path("getRecommendedKr").path("item");

        List<SolrInputDocument> docs = new ArrayList<>();

        for (JsonNode item : items) {
            SolrInputDocument doc = new SolrInputDocument();

            doc.addField("id", "THEME_" + item.path("UC_SEQ").asText());
            doc.addField("title", item.path("MAIN_TITLE").asText());
            doc.addField("subtitle", item.path("SUBTITLE").asText());
            doc.addField("description", item.path("CNTNTS").asText());
            doc.addField("address", item.path("ADDR1").asText());
            doc.addField("latitude", item.path("LAT").asText());
            doc.addField("longitude", item.path("LNG").asText());
            doc.addField("image_url", item.path("MAIN_IMG_NORMAL").asText());
            doc.addField("type", "THEME");

            docs.add(doc);
        }

        solrClient.add(CORE, docs);
        solrClient.commit(CORE);

        return "테마 여행 데이터 저장: " + docs.size() + "건";
    }

    @Override
    public Map<String, Object> searchTheme(String keyword, int page, int size) throws Exception {

        SolrQuery query = new SolrQuery();

        // 빈 문자열도 전체 검색 처리
        boolean empty = (keyword == null || keyword.trim().isEmpty());

        if (empty) {
            query.setQuery("*:*");
        } else {
            String kw = keyword.trim();
            query.setQuery(
                    "title:*" + kw + "* OR subtitle:*" + kw + "* OR address:*" + kw + "*"
            );
        }

        // 페이징
        int start = (page - 1) * size;
        query.setStart(start);
        query.setRows(size);

        QueryResponse res = solrClient.query(CORE, query);
        SolrDocumentList list = res.getResults();

        List<Map<String, Object>> result = new ArrayList<>();

        for (SolrDocument doc : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.get("id"));
            map.put("title", doc.get("title"));
            map.put("subtitle", doc.get("subtitle"));
            map.put("address", doc.get("address"));
            map.put("image_url", doc.get("image_url"));
            result.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", result);
        response.put("total", list.getNumFound());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil(list.getNumFound() / (double) size));

        return response;
    }

}
