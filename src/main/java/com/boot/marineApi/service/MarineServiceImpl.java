package com.boot.marineApi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.common.SolrInputDocument;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
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

    @Override
    public String syncMarineData() throws Exception {

        String apiUrl = "http://apis.data.go.kr/6260000/MarintimeService/getMaritimeKr";

        String requestUrl = apiUrl
                + "?ServiceKey=" + apiKey
                + "&pageNo=1"
                + "&numOfRows=999"
                + "&resultType=json";

        RestTemplate rest = new RestTemplate();
        String response = rest.getForObject(requestUrl, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);

        JsonNode items = root.path("getMaritimeKr").path("item");

        System.out.println("marine items size = " + items.size());

        List<SolrInputDocument> docs = new ArrayList<>();

        for (JsonNode item : items) {

            SolrInputDocument doc = new SolrInputDocument();

            doc.addField("id", "MARINE_" + item.path("UC_SEQ").asText());
            doc.addField("title", item.path("MAIN_TITLE").asText());
            doc.addField("subtitle", item.path("SUBTITLE").asText());
            doc.addField("description", item.path("CNTNTS").asText());
            doc.addField("address", item.path("ADDR1").asText());
            doc.addField("latitude", item.path("LAT").asText());
            doc.addField("longitude", item.path("LNG").asText());
            doc.addField("image_url", item.path("MAIN_IMG_NORMAL").asText());
            doc.addField("type", "MARINE");

            docs.add(doc);
        }

        System.out.println("marine docs size = " + docs.size());

        solrClient.add(CORE_NAME, docs);
        solrClient.commit(CORE_NAME);

        return "Marine 데이터 저장: " + docs.size() + "건";
    }

    @Override
    public Map<String, Object> searchMarine(String keyword, int page, int size) throws Exception {

        SolrQuery query = new SolrQuery();
        query.setQuery(
                (keyword == null || keyword.isEmpty())
                        ? "*:*"
                        : "title:*" + keyword + "*"
        );

        int start = (page - 1) * size;

        query.setStart(start);
        query.setRows(size);
        
        // 모든 필드 반환
        query.setFields("*");

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
            map.put("type", doc.get("type"));
            resultList.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("list", resultList);
        response.put("total", list.getNumFound());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil(list.getNumFound() / (double) size));

        return response;
    }
}
