package com.boot.Tour.controller;

import com.boot.Tour.dao.TourDAO;
import com.boot.Tour.dto.TourDTO;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // 리액트 주소 허용
public class SolrDataController {

    @Autowired
    private TourDAO tourDAO; // DB에서 꺼내오기

    @Autowired
    private SolrClient solrClient; // Solr에 넣기

    // 이 주소를 브라우저에서 실행하면 DB -> Solr로 데이터가 복사됩니다.
    @GetMapping("/api/solr/import")
    public String importData() {
        try {
            // 1. DB에서 전체 데이터 가져오기
            List<TourDTO> dbList = tourDAO.selectAllSpots();
            
            if (dbList.isEmpty()) {
                return "DB에 가져올 데이터가 없습니다.";
            }

            // 2. Solr에 하나씩 담기
            for (TourDTO dto : dbList) {
                SolrInputDocument doc = new SolrInputDocument();
                
                // Solr 필드명(왼쪽) - 자바 변수(오른쪽) 매핑
                // (주의: Solr 스키마(Managed-schema)에 이 필드들이 없으면 에러가 날 수 있으니
                // 에러가 나면 Solr Admin에서 필드를 만들어주거나, _default 설정을 써야 함)
                
                doc.addField("id", dto.getSpotId());       
                doc.addField("title", dto.getTitle());
                doc.addField("address", dto.getAddress());
                doc.addField("image_url", dto.getImageUrl());
                doc.addField("theme_id", dto.getThemeId());
                
                // 상세 정보도 검색엔진에 넣기
                doc.addField("latitude", dto.getLatitude());
                doc.addField("longitude", dto.getLongitude());
                doc.addField("tel", dto.getTel());
                doc.addField("homepage", dto.getHomepage());
                doc.addField("description", dto.getDescription());

                // ★ "mycore" 부분을 본인의 진짜 코어 이름으로 바꾸세요!
                solrClient.add("Search", doc); 
            }

            // 3. 저장 확정 (Commit) - 이거 안 하면 저장 안 됨!
            solrClient.commit("Search"); // ★ 여기도 코어 이름 확인!
            
            return "성공! " + dbList.size() + "건의 데이터가 Solr로 복사되었습니다.";

        } catch (Exception e) {
            e.printStackTrace();
            return "실패: " + e.getMessage();
        }
    }

    // Solr에서 모든 데이터를 가져오는 엔드포인트
    @GetMapping("/api/solr/all")
    public ResponseEntity<?> getAllData() {
        List<TourDTO> list = new ArrayList<>();
        try {
            SolrQuery query = new SolrQuery();
            query.setQuery("*:*");
            query.setRows(1000); // 충분한 데이터 가져오기
            
            QueryResponse response = solrClient.query("Search", query);
            SolrDocumentList results = response.getResults();

            System.out.println("Solr 쿼리 결과 개수: " + results.getNumFound());

            for (SolrDocument doc : results) {
                try {
                    TourDTO dto = new TourDTO();
                    
                    String idStr = getSafeString(doc.getFieldValue("id"));
                    if(idStr != null && !idStr.isEmpty()) {
                        try {
                            dto.setSpotId(Long.parseLong(idStr));
                        } catch (NumberFormatException e) {
                            System.err.println("ID 파싱 실패: " + idStr);
                            continue; // 이 문서는 건너뛰기
                        }
                    }

                    dto.setTitle(getSafeString(doc.getFieldValue("title")));
                    dto.setAddress(getSafeString(doc.getFieldValue("address")));
                    dto.setImageUrl(getSafeString(doc.getFieldValue("image_url")));
                    dto.setDescription(getSafeString(doc.getFieldValue("description")));
                    
                    String themeIdStr = getSafeString(doc.getFieldValue("theme_id"));
                    if (themeIdStr != null && !themeIdStr.isEmpty()) {
                        try {
                            dto.setThemeId(Integer.parseInt(themeIdStr));
                        } catch (NumberFormatException e) {
                            System.err.println("ThemeId 파싱 실패: " + themeIdStr);
                        }
                    }
                    
                    dto.setLatitude(getSafeString(doc.getFieldValue("latitude")));
                    dto.setLongitude(getSafeString(doc.getFieldValue("longitude")));
                    dto.setTel(getSafeString(doc.getFieldValue("tel")));
                    dto.setHomepage(getSafeString(doc.getFieldValue("homepage")));
                    
                    list.add(dto);
                } catch (Exception e) {
                    System.err.println("문서 변환 중 에러: " + e.getMessage());
                    e.printStackTrace();
                    // 개별 문서 에러는 건너뛰고 계속 진행
                }
            }
            
            System.out.println("변환된 DTO 개수: " + list.size());
            return ResponseEntity.ok(list);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "데이터 조회 실패");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("data", new ArrayList<>());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 안전한 문자열 변환 헬퍼
    private String getSafeString(Object obj) {
        if (obj == null) return null;
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            return list.isEmpty() ? null : list.get(0).toString();
        }
        return obj.toString();
    }
}