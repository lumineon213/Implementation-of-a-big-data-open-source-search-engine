package com.boot.foodApi.service;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrQuery.SortClause;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Iterator;

@Service
public class foodServiceImpl implements foodService {
    
    @Value("${food.api.key}")
    private String apiKey; 

    @Autowired
    private SolrClient solrClient;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String CORE_NAME = "food_core";

    /* --- 1. 데이터 동기화 --- */
    @Override
    public String syncFoodData() throws Exception {
        return "데이터 동기화 로직은 그대로 유지됨";
    }

    /* --- 2. 목록 조회 --- */
    @Override
    public Map<String, Object> searchFood(String keyword, int page, int size) throws Exception {
        SolrQuery query = new SolrQuery();

        // 1. 검색어 설정
        if (keyword == null || keyword.trim().isEmpty()) {
            query.setQuery("*:*");
        } else {
            query.setQuery("title:*" + keyword + "* OR menu_t:*" + keyword + "*");
        }

        // 2. 페이징 설정
        int start = (page - 1) * size;
        query.setStart(start);
        query.setRows(size); 

        // 3. 정렬 로직 (무조건 인기순 고정)
        List<SortClause> sorts = new ArrayList<>();
        // 1순위: 조회수 내림차순 (인기순)
        sorts.add(new SortClause("view_count_i", SolrQuery.ORDER.desc)); 
        // 2순위: ID 내림차순 (최신순, 동점자 처리)
        sorts.add(new SortClause("id", SolrQuery.ORDER.desc));           
        // 3순위: 점수 (안정화)
        sorts.add(new SortClause("score", SolrQuery.ORDER.asc));         

        query.setSorts(sorts); 

        // 4. Solr 요청
        QueryResponse response = solrClient.query(CORE_NAME, query);
        SolrDocumentList results = response.getResults();

        // 5. 결과 변환
        List<Map<String, Object>> list = new ArrayList<>();
        
        for (SolrDocument doc : results) {
            Map<String, Object> map = new HashMap<>();
            
            map.put("id", doc.getFieldValue("id"));
            map.put("title", doc.getFieldValue("title"));
            map.put("address", doc.getFieldValue("address"));
            map.put("image_url", doc.getFieldValue("image_url"));
            map.put("description", doc.getFieldValue("description"));
            map.put("menu_t", doc.getFieldValue("menu_t"));

            Object latObj = doc.getFieldValue("latitude");
            Object lngObj = doc.getFieldValue("longitude");
            
            if (latObj instanceof Collection) {
                Collection<?> latCol = (Collection<?>) latObj;
                map.put("latitude", latCol.isEmpty() ? null : latCol.iterator().next());
            } else {
                map.put("latitude", latObj);
            }
            
            if (lngObj instanceof Collection) {
                Collection<?> lngCol = (Collection<?>) lngObj;
                map.put("longitude", lngCol.isEmpty() ? null : lngCol.iterator().next());
            } else {
                map.put("longitude", lngObj);
            }
            
            list.add(map);
        }

        // 6. 리턴
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("list", list);           
        responseMap.put("total", results.getNumFound()); 

        return responseMap; 
    }

    /* --- 3. 상세 조회--- */
    @Override
    public Map<String, Object> getFoodDetail(String id) throws Exception {
        SolrDocument doc = solrClient.getById(CORE_NAME, id);
        if (doc == null) return null;

        Map<String, Object> map = new HashMap<>();
        map.put("id", doc.getFieldValue("id"));
        map.put("title", doc.getFieldValue("title"));
        map.put("address", doc.getFieldValue("address"));
        map.put("image_url", doc.getFieldValue("image_url"));
        map.put("description", doc.getFieldValue("description"));
        map.put("menu_t", doc.getFieldValue("menu_t"));
        map.put("opentime_t", doc.getFieldValue("opentime_t"));
        map.put("view_count", doc.getFieldValue("view_count_i"));
        
        // 상세 조회에서도 동일하게 팀원분의 로직을 사용
        Object latObj = doc.getFieldValue("latitude");
        Object lngObj = doc.getFieldValue("longitude");
        
        if (latObj instanceof Collection) {
            Collection<?> latCol = (Collection<?>) latObj;
            map.put("latitude", latCol.isEmpty() ? null : latCol.iterator().next());
        } else {
            map.put("latitude", latObj);
        }
        
        if (lngObj instanceof Collection) {
            Collection<?> lngCol = (Collection<?>) lngObj;
            map.put("longitude", lngCol.isEmpty() ? null : lngCol.iterator().next());
        } else {
            map.put("longitude", lngObj);
        }

        return map;
    }
    
    /* --- 4. 조회수 증가 (DB + Solr) --- */
    @Override
    @Transactional
    public void increaseViewCount(String id) throws Exception {
        // 1. DB 업데이트
        String sql = "UPDATE RESTAURANTS_DETAIL SET VIEW_COUNT = VIEW_COUNT + 1 WHERE ID = ?";
        jdbcTemplate.update(sql, id); 

        // 2. Solr 업데이트
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField("id", id);
        
        Map<String, Object> modifier = new HashMap<>();
        modifier.put("inc", 1);
        doc.addField("view_count_i", modifier); 

        solrClient.add(CORE_NAME, doc);
        solrClient.commit(CORE_NAME);
    }

    /* --- 5. 헬퍼 메서드 --- */
    private Object extractSingleValue(Object solrValue) {
        if (solrValue instanceof Collection) {
            Collection<?> col = (Collection<?>) solrValue;
            if (col.isEmpty()) return null;
            
            Iterator<?> iterator = col.iterator();
            return iterator.hasNext() ? iterator.next() : null;
        }
        return solrValue;
    }
}