package com.boot.festival.service;

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
import org.springframework.web.client.RestTemplate; // RestTemplate 추가

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collection; // SolrDocument에서 Collection 타입 추출을 위해 import

@Service
public class FestivalServiceImpl implements FestivalService { 
    
    @Value("${festival.api.key}")
    private String apiKey; 
    
    @Autowired
    private SolrClient solrClient;
    
    // Solr Core 이름 상수
    private static final String CORE_NAME = "festival_core";

    /* --- 1. 데이터 동기화 (API 호출 및 Solr 인덱싱 구현) --- */
    @Override
    public String syncFestivalData() throws Exception {
        // 1. 외부 API URL 구성
        // 모든 페이지의 데이터를 가져오려면 반복문이 필요하지만, 여기서는 첫 페이지 100개만 가져옵니다.
        String apiUrl = "https://apis.data.go.kr/6260000/FestivalService/getFestivalKr" +
                        "?serviceKey=" + apiKey +
                        "&numOfRows=100" +
                        "&pageNo=1" +
                        "&resultType=json"; // JSON 형식으로 받도록 명시

        // 2. HTTP 클라이언트를 사용하여 데이터 가져오기
        RestTemplate restTemplate = new RestTemplate();
        
        // API 응답 구조에 맞게 Map<String, Object> 형태로 받습니다.
        // 공공데이터 API 응답 구조: { getFestivalKr: { item: { item: [...] } } }
        Map<String, Object> response = restTemplate.getForObject(apiUrl, Map.class);
        
        // 3. Solr 인덱싱 로직
        if (response != null && response.containsKey("getFestivalKr")) {
            Map<String, Object> body = (Map<String, Object>) response.get("getFestivalKr");
            Map<String, Object> itemsMap = (Map<String, Object>) body.get("item"); // 응답 구조에 따라 수정

            // 'item' 필드 안에 실제 데이터 리스트가 있다고 가정
            List<Map<String, Object>> items;
            
            // 데이터가 리스트로 오거나 단일 객체로 올 수 있으므로 처리
            Object itemObject = itemsMap.get("item");
            if (itemObject instanceof List) {
                items = (List<Map<String, Object>>) itemObject;
            } else if (itemObject instanceof Map) {
                items = List.of((Map<String, Object>) itemObject);
            } else {
                return "API 응답 구조 오류: 아이템 리스트를 찾을 수 없습니다.";
            }

            int count = 0;
            // 4. API 필드와 Solr 필드를 매핑하여 Solr 문서에 추가
            for (Map<String, Object> item : items) {
                SolrInputDocument doc = new SolrInputDocument();
                
                // PK: Solr ID는 'UC_SEQ'를 사용하고, 필드명도 'UC_SEQ'를 사용합니다.
                String ucSeq = String.valueOf(item.get("UC_SEQ"));
                doc.addField("id", ucSeq); 
                
                // Solr 필드 매핑 (API 응답 필드와 Service 코드의 Solr 필드명 일치)
                doc.addField("UC_SEQ", ucSeq); 
                doc.addField("MAIN_TITLE_text", item.get("MAIN_TITLE"));
                doc.addField("GUGUN_NM_s", item.get("GUGUN_NM"));
                doc.addField("LAT_d", item.get("LAT"));
                doc.addField("LNG_d", item.get("LNG"));
                doc.addField("PLACE_s", item.get("PLACE"));
                doc.addField("TITLE_text", item.get("TITLE"));
                doc.addField("ADDR1_s", item.get("ADDR1"));
                doc.addField("CNTCT_TEL_s", item.get("CNTCT_TEL"));
                doc.addField("HOMEPAGE_URL_s", item.get("HOMEPAGE_URL"));
                doc.addField("TRFC_INFO_s", item.get("TRFC_INFO"));
                doc.addField("USAGE_DAY_WEEK_AND_TIME_s", item.get("USAGE_DAY_WEEK_AND_TIME"));
                doc.addField("HLDY_INFO_s", item.get("HLDY_INFO"));
                doc.addField("USAGE_AMOUNT_s", item.get("USAGE_AMOUNT"));
                doc.addField("MIDDLE_SIZE_RM1_s", item.get("MIDDLE_SIZE_RM1"));
                doc.addField("MAIN_IMG_NORMAL_s", item.get("MAIN_IMG_NORMAL"));
                doc.addField("MAIN_IMG_THUMB_s", item.get("MAIN_IMG_THUMB"));
                doc.addField("ITEMCNTNTS_text", item.get("ITEMCNTNTS"));
                
                // 조회수 필드 초기화 (API에 없으므로)
                doc.addField("VIEW_COUNT_i", 0); 

                solrClient.add(CORE_NAME, doc);
                count++;
            }
            
            // 5. 변경 사항 최종 커밋 (Solr에 데이터 반영)
            solrClient.commit(CORE_NAME); 
            
            return "Solr 데이터 저장 성공! 총 " + count + "개 문서 인덱싱됨.";

        } else {
            return "API 응답에서 데이터 본문을 찾을 수 없습니다.";
        }
    }

    /* --- 2. 목록 조회 (검색) --- */
    @Override
    public Map<String, Object> searchFestival(String keyword, int page, int size) throws Exception {
        SolrQuery query = new SolrQuery();

        // 1. 검색어 설정
        if (keyword == null || keyword.trim().isEmpty()) {
            query.setQuery("*:*");
        } else {
            String q = keyword.trim();
            // Solr 필드명: MAIN_TITLE_text, TITLE_text, ITEMCNTNTS_text를 사용합니다.
            query.setQuery("MAIN_TITLE_text:*" + q + "* OR TITLE_text:*" + q + "* OR ITEMCNTNTS_text:*" + q + "*"); 
        }

        // 2. 페이징 설정
        int start = (page - 1) * size;
        query.setStart(start);
        query.setRows(size); 

        // 3. 정렬 로직 (조회수 내림차순, 콘텐츠 ID 내림차순 정렬)
        query.addSort("VIEW_COUNT_i", SolrQuery.ORDER.desc);
        // query.addSort("UC_SEQ", SolrQuery.ORDER.desc); // UC_SEQ는 문자열이므로 정렬 기준이 적절한지 확인

        // 4. Solr 요청 및 결과 변환
        QueryResponse response = solrClient.query(CORE_NAME, query);
        SolrDocumentList results = response.getResults();

        List<Map<String, Object>> list = new ArrayList<>();
        
        for (SolrDocument doc : results) {
            Map<String, Object> map = new HashMap<>();
            
            // API 응답 필드에 맞게 Solr 필드를 매핑 (프론트엔드에서 사용할 키 이름 사용)
            map.put("ucSeq", doc.getFieldValue("UC_SEQ"));
            map.put("mainTitle", doc.getFieldValue("MAIN_TITLE_text"));
            map.put("gugunNm", doc.getFieldValue("GUGUN_NM_s"));
            map.put("lat", doc.getFieldValue("LAT_d"));
            map.put("lng", doc.getFieldValue("LNG_d"));
            map.put("place", doc.getFieldValue("PLACE_s"));
            map.put("title", doc.getFieldValue("TITLE_text"));
            map.put("addr1", doc.getFieldValue("ADDR1_s"));
            map.put("mainImgNormal", doc.getFieldValue("MAIN_IMG_NORMAL_s"));
            map.put("description", doc.getFieldValue("ITEMCNTNTS_text")); // 상세 내용을 description 키로 반환
            
            list.add(map);
        }

        // 5. 리턴
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("list", list);           
        responseMap.put("total", results.getNumFound()); 

        return responseMap; 
    }

    /* --- 3. 상세 조회--- */
    @Override
    public Map<String, Object> getFestivalDetail(String id) throws Exception {
        SolrDocument doc = solrClient.getById(CORE_NAME, id); // id는 UC_SEQ입니다.
        if (doc == null) return null;

        Map<String, Object> map = new HashMap<>();
        // 상세 필드 매핑
        map.put("ucSeq", doc.getFieldValue("UC_SEQ"));
        map.put("mainTitle", doc.getFieldValue("MAIN_TITLE_text"));
        map.put("gugunNm", doc.getFieldValue("GUGUN_NM_s"));
        map.put("lat", doc.getFieldValue("LAT_d"));
        map.put("lng", doc.getFieldValue("LNG_d"));
        map.put("place", doc.getFieldValue("PLACE_s"));
        map.put("title", doc.getFieldValue("TITLE_text"));
        map.put("addr1", doc.getFieldValue("ADDR1_s"));
        map.put("cntctTel", doc.getFieldValue("CNTCT_TEL_s"));
        map.put("homepageUrl", doc.getFieldValue("HOMEPAGE_URL_s"));
        map.put("usageDayWeekAndTime", doc.getFieldValue("USAGE_DAY_WEEK_AND_TIME_s"));
        map.put("hldyInfo", doc.getFieldValue("HLDY_INFO_s"));
        map.put("usageAmount", doc.getFieldValue("USAGE_AMOUNT_s"));
        map.put("middleSizeRm1", doc.getFieldValue("MIDDLE_SIZE_RM1_s"));
        map.put("mainImgNormal", doc.getFieldValue("MAIN_IMG_NORMAL_s"));
        map.put("mainImgThumb", doc.getFieldValue("MAIN_IMG_THUMB_s"));
        map.put("itemCntnts", doc.getFieldValue("ITEMCNTNTS_text"));
        map.put("viewCount", doc.getFieldValue("VIEW_COUNT_i"));

        return map;
    }
    
    /* --- 4. 조회수 증가 (순수 Solr 업데이트) --- */
    @Override
    public void increaseViewCount(String id) throws Exception {
        // 1. Solr 업데이트
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField("id", id);
        
        Map<String, Object> modifier = new HashMap<>();
        modifier.put("inc", 1);
        doc.addField("VIEW_COUNT_i", modifier); 

        solrClient.add(CORE_NAME, doc);
        solrClient.commit(CORE_NAME); 
    }
}