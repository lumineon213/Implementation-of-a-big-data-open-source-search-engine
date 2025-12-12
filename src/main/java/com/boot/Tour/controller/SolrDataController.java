package com.boot.Tour.controller;

import com.boot.Tour.dao.TourDAO;
import com.boot.Tour.dto.TourDTO;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
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
}