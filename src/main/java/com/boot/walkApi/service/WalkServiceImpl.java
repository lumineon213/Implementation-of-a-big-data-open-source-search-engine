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

        String apiUrl = "http://apis.data.go.kr/6260000/WalkService/getWalkingKr";
        String serviceKey = URLEncoder.encode(apiKey, "UTF-8");
        
        String requestUrl = apiUrl + "?serviceKey=" + serviceKey
                + "&numOfRows=999&pageNo=1&resultType=json";

        RestTemplate rt = new RestTemplate();
        String response = rt.getForObject(requestUrl, String.class);

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
    public List<Map<String, Object>> searchWalk(String keyword) throws Exception {

        SolrQuery query = new SolrQuery();
        query.setQuery(keyword == null ? "*:*" : "title:*" + keyword + "*");
        query.setRows(200);

        QueryResponse res = solrClient.query(CORE_NAME, query);
        SolrDocumentList list = res.getResults();

        List<Map<String, Object>> result = new ArrayList<>();

        for (SolrDocument doc : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.get("id"));
            map.put("title", doc.get("title"));
            map.put("address", doc.get("address"));
            map.put("image_url", doc.get("image_url"));
            map.put("latitude", doc.get("latitude"));
            map.put("longitude", doc.get("longitude"));
            result.add(map);
        }

        return result;
    }
}
