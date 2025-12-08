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

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Iterator;


@Service
public class foodServiceImpl implements foodService{
    
    @Value("${food.api.key}")
    private String apiKey; 

    @Autowired
    private SolrClient solrClient;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String CORE_NAME = "food_core";

    /* --- 1. 데이터 동기화 (기존 원형 유지) --- */
    @Override
    public String syncFoodData() throws Exception {
        return "데이터 동기화 로직은 그대로 유지됨";
    }

    /* --- 2. 목록 조회 (최종 안정화 버전) */
    @Override
    public Map<String, Object> searchFood(String keyword, int page, int size, String sort, double userLat, double userLng) throws Exception {
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

        // 3. 정렬 로직 (✅ 거리순 정렬 제거 완료)
        // ID 내림차순 (최신순)을 가장 안정적인 정렬 기준으로 사용
        SortClause idDesc = new SortClause("id", SolrQuery.ORDER.desc); 
        SortClause scoreAsc = new SortClause("score", SolrQuery.ORDER.asc);
        List<SortClause> sorts = new ArrayList<>();

        // 'distance' 정렬 로직 (이전 코드에서 완전히 제거됨)

        if ("name".equals(sort)) {
            // 가나다순 요청 시 ID 정렬로 대체 (Title 오류 방지 및 안정화)
            sorts.add(idDesc);                                          // 1순위: ID 내림차순 (안정화)
            sorts.add(scoreAsc);                                        // 2순위: 안정화
            
        } else if ("popular".equals(sort)) {
             // 인기순 정렬 (항목 밀림 방지 로직 포함)
             sorts.add(new SortClause("view_count_i", SolrQuery.ORDER.desc)); // 1순위: 조회수 내림차순
             sorts.add(idDesc);                                              // 2순위: ID 내림차순 (안정화)
             sorts.add(scoreAsc);                                            // 3순위: 안정화
        } else { 
            // 기본값 정렬 (ID 정렬로 안정화)
            sorts.add(idDesc);                                          // 1순위: ID 내림차순 (최신순)
            sorts.add(scoreAsc);                                         // 2순위: 안정화
        }

        query.setSorts(sorts); 

        // 4. Solr 요청 및 결과 변환
        QueryResponse response = solrClient.query(CORE_NAME, query);
        SolrDocumentList results = response.getResults();

        // 5. 결과 변환 및 매핑
        List<Map<String, Object>> list = new ArrayList<>();
        
        for (SolrDocument doc : results) {
            Map<String, Object> map = new HashMap<>();
            
            // 필드 매핑
            map.put("id", doc.getFieldValue("id"));
            map.put("title", doc.getFieldValue("title"));
            map.put("address", doc.getFieldValue("address"));
            map.put("image_url", doc.getFieldValue("image_url"));
            map.put("description", doc.getFieldValue("description"));
            map.put("menu_t", doc.getFieldValue("menu_t"));

            // 좌표 정보 추가
            map.put("latitude", extractSingleValue(doc.getFieldValue("latitude")));
            map.put("longitude", extractSingleValue(doc.getFieldValue("longitude")));
            
            // 거리 정보 관련 로직도 제거됨
            
            list.add(map);
        }

        // 6. 최종 리턴용 맵 생성
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("list", list);           
        responseMap.put("total", results.getNumFound()); 

        return responseMap;	
    }

    /* --- 3. 상세 조회 (Detail) --- */
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
        
        map.put("latitude", extractSingleValue(doc.getFieldValue("latitude")));
        map.put("longitude", extractSingleValue(doc.getFieldValue("longitude")));
        map.put("view_count", doc.getFieldValue("view_count_i"));

	    return map;
	}
    
    /* --- 4. 조회수 증가 (View Count) --- */
    @Override
    public void increaseViewCount(String id) throws Exception {
        
        // 1. ✅ RDB 업데이트 (영구 저장)
        // JdbcTemplate을 사용하여 Native SQL 쿼리 실행
        String sql = "UPDATE RESTAURANTS_DETAIL SET VIEW_COUNT = VIEW_COUNT + 1 WHERE ID = ?";
        
        // SQL 실행: ? 위치에 ID 변수를 바인딩합니다.
        jdbcTemplate.update(sql, id); 

        // 2. Solr Atomic Update (검색 및 정렬을 위한 인덱스 업데이트)
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField("id", id);
        
        Map<String, Object> modifier = new HashMap<>();
        modifier.put("inc", 1);
        doc.addField("view_count_i", modifier); 

        solrClient.add(CORE_NAME, doc);
        solrClient.commit(CORE_NAME);
    }

    /* --- 5. 헬퍼 메서드 (Solr List 추출) --- */
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