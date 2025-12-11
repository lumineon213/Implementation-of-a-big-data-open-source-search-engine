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

    private static final String CORE = "walk_core";

    @Override
    public String syncWalkData() throws Exception {

        // 기존 데이터 삭제
        solrClient.deleteByQuery(CORE, "*:*");
        solrClient.commit(CORE);

        String url = "http://apis.data.go.kr/6260000/WalkingService/getWalkingKr"
                + "?ServiceKey=" + apiKey
                + "&pageNo=1&numOfRows=999&resultType=json";

        RestTemplate rest = new RestTemplate();
        String response = rest.getForObject(url, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode items = mapper.readTree(response)
                .path("getWalkingKr")
                .path("item");

        List<SolrInputDocument> docs = new ArrayList<>();

        for (JsonNode item : items) {

            String rawId = item.path("UC_SEQ").asText();
            String id = "WALK_" + rawId;

            SolrInputDocument doc = new SolrInputDocument();

            doc.addField("id", id);
            doc.addField("type", "WALK_TOURISM");

            doc.addField("main_title", item.path("MAIN_TITLE").asText());
            doc.addField("title", item.path("TITLE").asText());
            doc.addField("subtitle", item.path("SUBTITLE").asText());
            doc.addField("category", item.path("CATE2_NM").asText());

            doc.addField("place", item.path("PLACE").asText());
            doc.addField("address", item.path("ADDR1").asText());
            doc.addField("address2", item.path("ADDR2").asText());

            doc.addField("traffic_info", item.path("TRFC_INFO").asText());
            doc.addField("etc_info", item.path("MIDDLE_SIZE_RM1").asText());

            doc.addField("latitude", item.path("LAT").asDouble());
            doc.addField("longitude", item.path("LNG").asDouble());

            doc.addField("image_url", item.path("MAIN_IMG_NORMAL").asText());
            doc.addField("thumbnail", item.path("MAIN_IMG_THUMB").asText());

            doc.addField("contents", item.path("ITEMCNTNTS").asText());

            docs.add(doc);
        }

        solrClient.add(CORE, docs);
        solrClient.commit(CORE);

        return "Walk 데이터 저장: " + docs.size() + "건";
    }

    @Override
    public Map<String, Object> searchWalk(String keyword, int page, int size) throws Exception {

        SolrQuery query = new SolrQuery(
                (keyword == null || keyword.isBlank())
                        ? "*:*"
                        : "title:*" + keyword + "* OR subtitle:*" + keyword + "*"
        );

        query.setStart((page - 1) * size);
        query.setRows(size);

        QueryResponse res = solrClient.query(CORE, query);
        SolrDocumentList list = res.getResults();

        List<Map<String, Object>> result = new ArrayList<>();

        for (SolrDocument doc : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", doc.get("id"));
            m.put("title", doc.get("title"));
            m.put("subtitle", doc.get("subtitle"));
            m.put("address", doc.get("address"));
            m.put("image_url", doc.get("image_url"));
            m.put("latitude", doc.get("latitude"));
            m.put("longitude", doc.get("longitude"));
            result.add(m);
        }

        Map<String, Object> out = new HashMap<>();
        out.put("list", result);
        out.put("total", list.getNumFound());

        return out;
    }

    @Override
    public Map<String, Object> getById(String id) throws Exception {

        SolrQuery query = new SolrQuery("id:" + id);
        query.setRows(1);

        QueryResponse res = solrClient.query(CORE, query);
        SolrDocumentList list = res.getResults();

        if (list.isEmpty()) return null;

        SolrDocument doc = list.get(0);

        Map<String, Object> m = new HashMap<>();

        m.put("id", doc.get("id"));
        m.put("main_title", doc.get("main_title"));
        m.put("title", doc.get("title"));
        m.put("subtitle", doc.get("subtitle"));
        m.put("category", doc.get("category"));

        m.put("place", doc.get("place"));
        m.put("address", doc.get("address"));
        m.put("address2", doc.get("address2"));

        m.put("traffic_info", doc.get("traffic_info"));
        m.put("etc_info", doc.get("etc_info"));

        m.put("latitude", doc.get("latitude"));
        m.put("longitude", doc.get("longitude"));

        m.put("image_url", doc.get("image_url"));
        m.put("thumbnail", doc.get("thumbnail"));

        m.put("contents", doc.get("contents"));
        m.put("type", doc.get("type"));

        return m;
    }
}
