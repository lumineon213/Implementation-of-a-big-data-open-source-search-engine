package com.boot.festival.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FestivalServiceImpl implements FestivalService {

	@Value("${festival.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE_NAME = "festival_core";

    // ITEMCNTNTS_text에서 날짜 패턴을 추출: YYYY.M.D [.~] YYYY.M.D 형태를 모두 포괄
    private static final Pattern DATE_PATTERN = 
    	    // 예: 2025. 11. 15. 또는 2025.05.29 ~ 06.08 형태를 포괄적으로 포착
    	    Pattern.compile("(\\d{4}[\\s\\.]\\s*\\d{1,2}[\\s\\.]\\s*\\d{1,2}[\\s\\.]?)\\s*[~-]?\\s*(\\d{4}[\\s\\.]\\s*\\d{1,2}[\\s\\.]\\s*\\d{1,2}[\\s\\.]?)?");
    
    // 날짜 포맷터: YYYY.MM.DD
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd");


    /* ====================== MultiValued 필드를 String으로 안전하게 변환하는 유틸리티 ====================== */
    
    /**
     * SolrDocument에서 필드 값을 가져와 String으로 안전하게 변환합니다.
     * 필드가 List 형태로 반환될 경우 첫 번째 요소만 사용합니다.
     * @param doc SolrDocument
     * @param fieldName Solr 필드 이름
     * @return String 값 또는 null
     */
    private String getSolrString(SolrDocument doc, String fieldName) {
        Object value = doc.getFieldValue(fieldName);
        if (value == null) {
            return null;
        }
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            return list.isEmpty() ? null : String.valueOf(list.get(0));
        }
        return String.valueOf(value);
    }
    
    /* ====================== 날짜 추출 및 상태 판단 유틸리티 메서드 ====================== */
    
    private Map<String, String> getFestivalStatusAndPeriod(String itemCntnts) {
        Map<String, String> result = new HashMap<>();
        result.put("status", "upcoming"); // 기본값: 예정
        result.put("period", "정보 없음");
        
        if (itemCntnts == null) return result;

        try {
            Matcher matcher = DATE_PATTERN.matcher(itemCntnts);
            if (!matcher.find()) {
                return result; 
            }

            String dateRange = matcher.group(0); // 예: 2024. 10. 03. ~ 10. 06.
            result.put("period", dateRange.replaceAll("\\s+", " ")); 

            String cleanedRange = dateRange.replaceAll("[^\\d\\.]", " ").trim();
            String[] parts = cleanedRange.split("\\s+");
            
            if (parts.length < 6) {
                return result; 
            }

            // YYYY.MM.DD 형태로 변환
            String start = String.format("%s.%s.%s", parts[0], parts[1], parts[2]);
            String end = String.format("%s.%s.%s", parts[3], parts[4], parts[5]);

            LocalDate startDate = LocalDate.parse(start, FORMATTER);
            LocalDate endDate = LocalDate.parse(end, FORMATTER);
            LocalDate today = LocalDate.now();

            if (today.isBefore(startDate)) {
                result.put("status", "upcoming"); 
            } else if (today.isAfter(endDate)) {
                result.put("status", "ended"); 
            } else {
                result.put("status", "ongoing"); 
            }
        } catch (DateTimeParseException e) {
            System.err.println("날짜 형식 불일치 오류: " + e.getMessage());
            return result; 
        } catch (Exception e) {
            System.err.println("날짜 추출 중 일반 오류: " + e.getMessage());
            return result;
        }
        return result;
    }
    
    /* ====================== 1. 데이터 동기화 (공공API → Solr 저장) ====================== */
    @Override
    public String syncFestivalData() throws Exception {
    	String apiUrl = "https://apis.data.go.kr/6260000/FestivalService/getFestivalKr" 
                + "?serviceKey=" + apiKey 
                + "&numOfRows=100&pageNo=1&resultType=json";

        // RestTemplate + UTF-8 강제 설정
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters()
                    .add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

        // 1. JSON 문자열로 먼저 받기 (가장 안전한 방법)
        String jsonString = restTemplate.getForObject(apiUrl, String.class);

        // 2. Jackson으로 파싱
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> response = mapper.readValue(jsonString,
                new TypeReference<Map<String, Object>>() {});

        // 3. 데이터 추출
        if (response == null || !response.containsKey("getFestivalKr")) {
            return "API 응답에 getFestivalKr 키가 없습니다.";
        }

        Map<String, Object> body = (Map<String, Object>) response.get("getFestivalKr");
        Object itemObj = body.get("item");

        List<Map<String, Object>> items;
        if (itemObj instanceof List) {
            items = (List<Map<String, Object>>) itemObj;
        } else if (itemObj instanceof Map) {
            Map<String, Object> wrapper = (Map<String, Object>) itemObj;
            if (wrapper.containsKey("item") && wrapper.get("item") instanceof List) {
                items = (List<Map<String, Object>>) wrapper.get("item");
            } else {
                items = List.of(wrapper);
            }
        } else {
            return "item 데이터가 없습니다.";
        }

        // 4. Solr에 저장
        int count = 0;
        for (Map<String, Object> item : items) {
            SolrInputDocument doc = new SolrInputDocument();

            String ucSeq = String.valueOf(item.getOrDefault("UC_SEQ", "unknown_" + count));
            doc.addField("id", ucSeq);                      // Solr 기본 PK

            // API 필드를 Solr 필드에 매핑
            doc.addField("UC_SEQ", ucSeq);
            doc.addField("MAIN_TITLE_text", item.get("MAIN_TITLE"));
            doc.addField("GUGUN_NM_s", item.get("GUGUN_NM"));
            doc.addField("LAT_d", item.get("LAT"));
            doc.addField("LNG_d", item.get("LNG"));
            doc.addField("PLACE_s", item.get("PLACE"));
            doc.addField("TITLE_text", item.get("TITLE"));
            doc.addField("ADDR1_s", item.get("ADDR1"));
            doc.addField("MAIN_IMG_NORMAL_s", item.get("MAIN_IMG_NORMAL"));
            doc.addField("ITEMCNTNTS_text", item.get("ITEMCNTNTS"));
            doc.addField("VIEW_COUNT_i", 0);

            solrClient.add(CORE_NAME, doc);
            count++;
        }

        solrClient.commit(CORE_NAME);

        return "성공! 총 " + count + "개의 축제 데이터를 Solr에 저장했습니다.";
    }

    /* ====================== 2. 검색 ====================== */
    @Override
    public Map<String, Object> searchFestival(String keyword, int page, int size) throws Exception {
        SolrQuery query = new SolrQuery();

        if (keyword == null || keyword.trim().isEmpty()) {
            query.setQuery("*:*");
        } else {
            String q = keyword.trim();
            query.setQuery("MAIN_TITLE_text:*" + q + "* OR TITLE_text:*" + q + "* OR ITEMCNTNTS_text:*" + q + "*");
        }

        query.setStart((page - 1) * size);
        query.setRows(size);
        query.addSort("VIEW_COUNT_i", SolrQuery.ORDER.desc);

        QueryResponse resp = solrClient.query(CORE_NAME, query);
        SolrDocumentList results = resp.getResults();

        List<Map<String, Object>> list = new ArrayList<>();
        for (SolrDocument doc : results) {
            Map<String, Object> map = new HashMap<>();
            
            // ⭐ ClassCastException 해결: 안전하게 String으로 변환
            String mainTitle = getSolrString(doc, "MAIN_TITLE_text");
            String itemCntnts = getSolrString(doc, "ITEMCNTNTS_text");

            // 기존 필드 매핑
            map.put("ucSeq", doc.getFieldValue("UC_SEQ"));
            map.put("mainTitle", mainTitle);
            map.put("gugunNm", doc.getFieldValue("GUGUN_NM_s"));
            map.put("lat", doc.getFieldValue("LAT_d"));
            map.put("lng", doc.getFieldValue("LNG_d"));
            map.put("place", doc.getFieldValue("PLACE_s"));
            map.put("title", doc.getFieldValue("TITLE_text"));
            map.put("addr1", doc.getFieldValue("ADDR1_s"));
            map.put("mainImgNormal", doc.getFieldValue("MAIN_IMG_NORMAL_s"));
            map.put("description", itemCntnts);

            // ⭐ 날짜 추출 및 상태 판단 로직 적용
            Map<String, String> statusMap = getFestivalStatusAndPeriod(itemCntnts);
            map.put("status", statusMap.get("status"));
            map.put("period", statusMap.get("period")); 

            list.add(map);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", results.getNumFound());

        return result;
    }

    /* ====================== 3. 상세 조회 ====================== */
    @Override
    public Map<String, Object> getFestivalDetail(String id) throws Exception {
        SolrDocument doc = solrClient.getById(CORE_NAME, id);
        if (doc == null) return null;

        Map<String, Object> map = new HashMap<>();
        
        // ⭐ ClassCastException 해결: 안전하게 String으로 변환
        String mainTitle = getSolrString(doc, "MAIN_TITLE_text");
        String itemCntnts = getSolrString(doc, "ITEMCNTNTS_text");

        map.put("ucSeq", doc.getFieldValue("UC_SEQ"));
        map.put("mainTitle", mainTitle);
        map.put("gugunNm", doc.getFieldValue("GUGUN_NM_s"));
        map.put("lat", doc.getFieldValue("LAT_d"));
        map.put("lng", doc.getFieldValue("LNG_d"));
        map.put("place", doc.getFieldValue("PLACE_s"));
        map.put("title", doc.getFieldValue("TITLE_text"));
        map.put("addr1", doc.getFieldValue("ADDR1_s"));
        map.put("mainImgNormal", doc.getFieldValue("MAIN_IMG_NORMAL_s"));
        
        // 상세 조회는 추가 필드 매핑이 필요할 수 있습니다.
        // 현재는 'ITEMCNTNTS_text'만 매핑되어 있지만, UI에서 필요했던 다른 필드들도 추가해야 합니다.
        // (예: trfcInfo, usageDayWeekAndTime, hldyInfo, usageAmount, middleSizeRm1 등)

        map.put("itemCntnts", itemCntnts);
        map.put("viewCount", doc.getFieldValue("VIEW_COUNT_i"));
        
        // ⭐ 상세 조회 시에도 상태와 기간 정보 추가
        Map<String, String> statusMap = getFestivalStatusAndPeriod(itemCntnts);
        map.put("status", statusMap.get("status"));
        map.put("period", statusMap.get("period"));

        return map;
    }

    /* ====================== 4. 조회수 증가 ====================== */
    @Override
    public void increaseViewCount(String id) throws Exception {
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField("id", id);

        Map<String, Object> inc = new HashMap<>();
        inc.put("inc", 1);
        doc.addField("VIEW_COUNT_i", inc);

        solrClient.add(CORE_NAME, doc);
        solrClient.commit(CORE_NAME);
    }
}