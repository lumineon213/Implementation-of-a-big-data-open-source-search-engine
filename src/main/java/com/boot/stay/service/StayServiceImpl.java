package com.boot.stay.service;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrQuery.SortClause;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.stay.dao.StayDAO; 
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StayServiceImpl implements StayService {

    @Autowired
    private SolrClient solrClient;

    @Autowired
    private StayDAO stayDao; 

    private static final String CORE_NAME = "stay_core";

    // -------------------------------------------------------------------
    // 1. 목록 조회 (searchStay) - Solr에서만 조회
    // -------------------------------------------------------------------
    @Override
    public Map<String, Object> searchStay(String keyword, int page, int size) throws Exception {
        SolrQuery query = new SolrQuery();
        if (keyword == null || keyword.trim().isEmpty()) {
            query.setQuery("*:*");
        } else {
            query.setQuery("title:*" + keyword + "* OR road_address:*" + keyword + "*");
        }
        query.setStart((page - 1) * size);
        query.setRows(size);
        query.setSorts(List.of(new SortClause("view_count_i", SolrQuery.ORDER.desc), new SortClause("id", SolrQuery.ORDER.desc)));
        
        QueryResponse res = solrClient.query(CORE_NAME, query);
        List<Map<String, Object>> list = new ArrayList<>();
        
        for (SolrDocument doc : res.getResults()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.getFieldValue("id"));
            map.put("title", doc.getFieldValue("title"));
            map.put("address", doc.getFieldValue("road_address"));
            map.put("image_url", doc.getFieldValue("image_url"));
            map.put("description", null); // 리스트에서는 상세 설명 생략
            Object vc = doc.getFieldValue("view_count_i");
            map.put("view_count", (vc instanceof Number) ? ((Number) vc).intValue() : 0);
            list.add(map);
        }
        return Map.of("list", list, "total", res.getResults().getNumFound());
    }

    // -------------------------------------------------------------------
    // 2. 상세 조회 (getStayDetail) - DB + Solr (하이브리드 로직)
    // -------------------------------------------------------------------
    @Override
    public Map<String, Object> getStayDetail(String id) throws Exception {
        // 1. DB (STAY_DETAIL 테이블)에서 모든 상세 정보를 가져옴
        Map<String, Object> detailData = stayDao.selectStayDetailById(id);
        
        if (detailData == null) {
            return null; 
        }

        // 2. Solr에서 조회수(view_count)만 가져와서 합칩니다.
        try {
            QueryResponse res = solrClient.query(CORE_NAME, new SolrQuery("id:" + id));
            if (!res.getResults().isEmpty()) {
                Object vc = res.getResults().get(0).getFieldValue("view_count_i");
                detailData.put("view_count", (vc instanceof Number) ? ((Number) vc).intValue() : 0);
            } else {
                 detailData.put("view_count", 0);
            }
        } catch (Exception e) {
             System.err.println("ERROR: Solr에서 조회수 가져오기 실패: " + e.getMessage());
             detailData.put("view_count", 0); 
        }
        
        return detailData;
    }

    // -------------------------------------------------------------------
    // 3. 조회수 증가 (increaseViewCount)
    // -------------------------------------------------------------------
    @Override
    @Transactional
    public void increaseViewCount(String id) throws Exception {
        try {
            SolrInputDocument doc = new SolrInputDocument();
            doc.addField("id", id);
            Map<String, Integer> modifier = new HashMap<>();
            modifier.put("inc", 1);
            doc.addField("view_count_i", modifier);
            solrClient.add(CORE_NAME, doc);
            solrClient.commit(CORE_NAME);
        } catch (Exception e) {
            System.err.println("조회수 증가 실패 (ID: " + id + "): " + e.getMessage());
        }
    }
    
    // 4. 동기화 (Python 스크립트가 담당)
    @Override
    public String syncStayData() throws Exception {
        return "데이터는 외부 스크립트를 통해 주입됩니다.";
    }
}