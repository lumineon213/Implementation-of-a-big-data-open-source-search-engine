package com.boot.stay.service;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrQuery.SortClause;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.stay.dao.stayDAO;
import com.boot.stay.dto.stayDTO;

import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class stayServiceImpl implements stayService {

    @Autowired
    private SolrClient solrClient;

    @Autowired
    private stayDAO stayDao; 

    private static final String CORE_NAME = "stay_core";

    // -------------------------------------------------------------------
    // 1. 목록 조회 (searchStay) - Solr에서만 조회
    // -------------------------------------------------------------------
    @Override
    public Map<String, Object> searchStay(String keyword, int page, int size) throws Exception {
        
        SolrQuery query = new SolrQuery();
        
        // 1. 쿼리 설정
        if (keyword != null && !keyword.isEmpty()) {
            query.setQuery("title:" + keyword + " OR road_address:" + keyword);
        } else {
            query.setQuery("*:*");
        }
        
        // 이미지 필터링: image_url 필드가 존재하는 문서만 조회
        query.addFilterQuery("image_url:[* TO *]");
        
        // 요청 필드 설정 (Solr에 저장된 필드 이름)
        query.setFields("id", "title", "road_address", "image_url", "description", "view_count_i", "latitude", "longitude");
        query.setStart((page - 1) * size);
        query.setRows(size);
        
        // 2. Solr 쿼리 실행
        QueryResponse response = solrClient.query(CORE_NAME, query);
        
        // 📌 Map 대신 DTO 리스트 사용
        List<stayDTO> results = new ArrayList<>();
        
        // 3. Solr 배열 데이터를 DTO 객체로 매핑 (핵심 수정)
        for (SolrDocument doc : response.getResults()) {
        	stayDTO dto = new stayDTO();
            
            // DTO의 Setter를 사용하여 값 설정
            // Solr 필드명과 DTO 필드명 매핑
            dto.setContent_id(doc.getFieldValue("id").toString()); // Solr id -> DTO content_id
            
            // 배열 형태의 필드는 헬퍼 메서드를 사용해 안전하게 변환
            dto.setTitle(getFirstStringValue(doc, "title"));
            dto.setAddress(getFirstStringValue(doc, "road_address"));
            dto.setFirstimage(getFirstStringValue(doc, "image_url")); // Solr image_url -> DTO firstimage
            
            dto.setLatitude(getFirstDoubleValue(doc, "latitude"));
            dto.setLongitude(getFirstDoubleValue(doc, "longitude"));
            
            // view_count_i 필드를 Integer로 변환
            Object viewCountValue = doc.getFieldValue("view_count_i");
            if (viewCountValue instanceof Integer) {
                dto.setView_count((Integer) viewCountValue);
            } else if (viewCountValue != null) {
                 try {
                     dto.setView_count(Integer.parseInt(viewCountValue.toString()));
                 } catch (NumberFormatException ignored) { /* 무시 */ }
            }
            
            results.add(dto);
        }
        
        // 4. 응답 Map 구성 (리스트는 DTO 리스트, total은 숫자)
        return Map.of("list", results, "total", response.getResults().getNumFound());
    }

    // -------------------------------------------------------------------
    // 2. 상세 조회 (getStayDetail) - DB + Solr (하이브리드 로직)
    // -------------------------------------------------------------------
    @Override
    public stayDTO getStayDetail(String id) throws Exception {
    	
    	try {
    		stayDao.increaseDbViewCount(id);
        } catch (Exception e) {
            System.err.println("상세 보기 요청 중 조회수 증가 실패: " + e.getMessage());
        }
    	
        // 1. DB에서 상세 정보 조회 (MyBatis가 DTO로 자동 매핑)
    	stayDTO stayDto = stayDao.selectStayDetailById(id);
        
    	// 📌 [콘솔 출력 추가]
        if (stayDto != null) {
            // DTO 객체의 내용을 콘솔에 출력합니다.
            System.out.println(">>> [DB 조회 성공] Stay Detail DTO: " + stayDto);
        } else {
            System.out.println(">>> [DB 조회 실패] Stay Detail DTO: null (해당 ID의 데이터 없음)");
        }
    	
        // 📌 [NPE 방지] DB 결과가 null이면 Controller로 null을 반환합니다.
        if (stayDto == null) {
            return null; 
        }

        // 2. (선택적 로직) Solr에서 실시간 조회수 가져와 DTO에 합치는 로직
        // 여기에 Solr 조회수 가져오기 로직이 들어갑니다.
        
        return stayDto;
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
    
 // -------------------------------------------------------------------
    //  헬퍼 메서드 (Solr 배열 데이터 처리)
    // -------------------------------------------------------------------
    private String getFirstStringValue(SolrDocument doc, String fieldName) {
        Object value = doc.getFieldValue(fieldName);
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            return list.isEmpty() ? "" : String.valueOf(list.get(0));
        }
        return value != null ? String.valueOf(value) : "";
    }
    
    private Double getFirstDoubleValue(SolrDocument doc, String fieldName) {
        Object value = doc.getFieldValue(fieldName);
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            if (!list.isEmpty()) {
                try {
                    return Double.parseDouble(String.valueOf(list.get(0)));
                } catch (NumberFormatException ignored) {
                    // 무시하고 0.0 반환
                }
            }
        }
        return 0.0;
    }
}