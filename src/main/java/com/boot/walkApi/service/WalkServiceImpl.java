package com.boot.walkApi.service;

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

import java.net.URI;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WalkServiceImpl implements WalkService {

    @Value("${walk.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE_NAME = "walk_core";

    @Override
    public String syncWalkData() throws Exception {
    	System.out.println(">>> [Service] 맛집 데이터 동기화 시작...");
    	
    	String apiUrl = "http://apis.data.go.kr/6260000/WalkingService/getWalkingKr";

        String requestUrl = apiUrl
    	        + "?ServiceKey=" + apiKey   // ← ServiceKey (대문자!) + 인코딩 금지
    	        + "&pageNo=1"
    	        + "&numOfRows=999"
    	        + "&resultType=json";


    	RestTemplate rest = new RestTemplate();
    	String response = rest.getForObject(requestUrl, String.class);

        System.out.println(">>> 요청 URL: " + requestUrl);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);

        JsonNode items = root.path("getWalkingKr").path("item");

        List<SolrInputDocument> docs = new ArrayList<>();

        for (JsonNode item : items) {
            SolrInputDocument doc = new SolrInputDocument();

            doc.addField("id", "WALK_" + item.path("UC_SEQ").asText());
            doc.addField("title", item.path("MAIN_TITLE").asText());
            doc.addField("subtitle", item.path("SUBTITLE").asText());
            doc.addField("description", item.path("CNTNTS").asText());
            doc.addField("address", item.path("ADDR1").asText());
            doc.addField("latitude", item.path("LAT").asText());
            doc.addField("longitude", item.path("LNG").asText());
            doc.addField("image_url", item.path("MAIN_IMG_NORMAL").asText());
            doc.addField("tags", item.path("TRFC_INFO").asText());
            doc.addField("type", "WALK");

            docs.add(doc);
        }

        solrClient.add(CORE_NAME, docs);
        solrClient.commit(CORE_NAME);

        return "Walk 데이터 저장: " + docs.size() + "건";
    }

    @Override
    public Map<String, Object> searchWalk(String keyword, int page, int size) throws Exception {

        SolrQuery query = new SolrQuery();
        query.setQuery(
            (keyword == null || keyword.isEmpty())
                ? "*:*"
                : "title:*" + keyword + "*"
        );

        // 페이징
        int start = (page - 1) * size;
        query.setStart(start);
        query.setRows(size);

        QueryResponse res = solrClient.query(CORE_NAME, query);
        SolrDocumentList list = res.getResults();

        List<Map<String, Object>> resultList = new ArrayList<>();

        for (SolrDocument doc : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.get("id"));
            map.put("title", doc.get("title"));
            map.put("subtitle", doc.get("subtitle"));
            map.put("address", doc.get("address"));
            map.put("latitude", doc.get("latitude"));
            map.put("longitude", doc.get("longitude"));
            map.put("image_url", doc.get("image_url"));
            map.put("tags", doc.get("tags"));
            map.put("type", doc.get("type"));
            map.put("description", doc.get("description"));
            resultList.add(map);
        }

        // total 값 반드시 넣어야 함
        Map<String, Object> response = new HashMap<>();
        response.put("list", resultList);
        response.put("total", list.getNumFound());

        return response;
    }

}
