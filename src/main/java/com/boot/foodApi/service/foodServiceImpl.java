package com.boot.foodApi.service;

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
public class foodServiceImpl implements foodService{
	@Value("${food.api.key}") 
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    // Solr 코어 이름
    private static final String CORE_NAME = "food_core";
    
    @Override
    public String syncFoodData() throws Exception {
        System.out.println(">>> [Service] 맛집 데이터 동기화 시작...");

        // 1. API 호출
        String apiUrl = "http://apis.data.go.kr/6260000/FoodService/getFoodKr";
        String serviceKey = URLEncoder.encode(apiKey, "UTF-8");
        // 1000개 요청
        String requestUrl = apiUrl + "?serviceKey=" + serviceKey + "&numOfRows=1000&pageNo=1&resultType=json";

        System.out.println(">>> 요청 URL: " + requestUrl);

        RestTemplate restTemplate = new RestTemplate();
        URI uri = new URI(requestUrl);
        String response = restTemplate.getForObject(uri, String.class);

        // 2. JSON 파싱
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);
        
        // 공공데이터 구조에 따라 경로 확인 (getFoodKr -> item)
        JsonNode items = root.path("getFoodKr").path("item");

        if (items.isMissingNode() || items.isEmpty()) {
            System.out.println("API 응답 전체: " + response);
            return "실패: API 데이터가 비어있습니다. (키 확인 또는 API 호출 횟수 초과)";
        }

        // 3. Solr 문서 생성
        List<SolrInputDocument> docs = new ArrayList<>();

        if (items.isArray()) {
            for (JsonNode item : items) {
                SolrInputDocument doc = new SolrInputDocument();
                
                // 기존에 작성하신 훌륭한 매핑 로직 그대로 사용
                doc.addField("id", "FOOD_" + item.path("UC_SEQ").asText());
                doc.addField("title", item.path("TITLE").asText());
                
                String desc = item.path("ITEMCNTNTS").asText();
                doc.addField("description", desc.isEmpty() ? item.path("TITLE").asText() : desc);
                
                doc.addField("menu_t", item.path("RPRSNTV_MENU").asText());
                doc.addField("opentime_t", item.path("USAGE_DAY_WEEK_AND_TIME").asText());
                doc.addField("address", item.path("ADDR1").asText());
                doc.addField("place", item.path("GUGUN_NM").asText());
                
                doc.addField("latitude", item.path("LAT").asText());
                doc.addField("longitude", item.path("LNG").asText());
                doc.addField("image_url", item.path("MAIN_IMG_THUMB").asText());
                doc.addField("type", "FOOD");

                docs.add(doc);
            }
        }

        // 4. Solr 전송 및 커밋 (개선된 방식)
        if (!docs.isEmpty()) {
            solrClient.add(CORE_NAME, docs); // 코어 이름 지정
            solrClient.commit(CORE_NAME);    // 커밋
            System.out.println(">>> 저장 완료: " + docs.size() + "건");
            return "성공: " + docs.size() + "개의 맛집 데이터 저장 완료";
        }

        return "데이터 없음";
    }

	@Override
	public List<Map<String, Object>> searchFood(String keyword) throws Exception {
		SolrQuery query = new SolrQuery();

        // 1. 검색어 설정 (키워드가 null이면 전체 검색 *:* )
        if (keyword == null || keyword.trim().isEmpty()) {
            query.setQuery("*:*"); // 전체 조회 (리스트 띄우기용)
        } else {
            // 제목이나 메뉴에 키워드가 포함된 것 검색
            query.setQuery("title:*" + keyword + "* OR menu_t:*" + keyword + "*");
        }

        // 2. 페이징 (일단 100개 가져오기)
        query.setStart(0);
        query.setRows(100); 

        // 3. Solr에 요청 보내기
        QueryResponse response = solrClient.query(CORE_NAME, query);
        SolrDocumentList results = response.getResults();

        // 4. 결과를 예쁜 Map 리스트로 변환해서 리턴
        List<Map<String, Object>> list = new ArrayList<>();
        
        for (SolrDocument doc : results) {
            Map<String, Object> map = new HashMap<>();
            
            // Solr 필드명 -> 자바 Map 키로 옮기기
            map.put("id", doc.getFieldValue("id"));
            map.put("title", doc.getFieldValue("title"));
            map.put("address", doc.getFieldValue("address"));
            map.put("image_url", doc.getFieldValue("image_url"));
            map.put("description", doc.getFieldValue("description"));
            map.put("menu_t", doc.getFieldValue("menu_t"));
            
            // ✨ 좌표 정보 추가 - 디버깅 추가
            Object latObj = doc.getFieldValue("latitude");
            Object lngObj = doc.getFieldValue("longitude");
            
            System.out.println(">>> 음식점: " + doc.getFieldValue("title"));
            System.out.println(">>> latitude 원본: " + latObj + " (타입: " + (latObj != null ? latObj.getClass().getName() : "null") + ")");
            System.out.println(">>> longitude 원본: " + lngObj + " (타입: " + (lngObj != null ? lngObj.getClass().getName() : "null") + ")");
            
            // 배열인 경우 첫 번째 값을 꺼내고, 아니면 그대로 사용
            if (latObj instanceof java.util.Collection) {
                java.util.Collection<?> latCol = (java.util.Collection<?>) latObj;
                Object latValue = latCol.isEmpty() ? null : latCol.iterator().next();
                map.put("latitude", latValue);
                System.out.println(">>> latitude 변환: " + latValue);
            } else {
                map.put("latitude", latObj);
            }
            
            if (lngObj instanceof java.util.Collection) {
                java.util.Collection<?> lngCol = (java.util.Collection<?>) lngObj;
                Object lngValue = lngCol.isEmpty() ? null : lngCol.iterator().next();
                map.put("longitude", lngValue);
                System.out.println(">>> longitude 변환: " + lngValue);
            } else {
                map.put("longitude", lngObj);
            }
            
            System.out.println(">>> 최종 Map: " + map);
            System.out.println("====================");
            
            list.add(map);
        }
        
        return list;
	}

	@Override
	public Map<String, Object> searchFood(String keyword, int page, int size) throws Exception {
		SolrQuery query = new SolrQuery();

	    // 1. 검색어 설정
	    if (keyword == null || keyword.trim().isEmpty()) {
	        query.setQuery("*:*");
	    } else {
	        query.setQuery("title:*" + keyword + "* OR menu_t:*" + keyword + "*");
	    }

	    // 2. 페이징 설정 (핵심!)
	    // page가 1이면 start=0, page가 2이면 start=10 ...
	    int start = (page - 1) * size;
	    query.setStart(start);
	    query.setRows(size); 

	    // 3. Solr 요청
	    QueryResponse response = solrClient.query(CORE_NAME, query);
	    SolrDocumentList results = response.getResults();

	    // 4. 결과 변환 (리스트 + 전체 개수)
	    List<Map<String, Object>> list = new ArrayList<>();
	    
	    for (SolrDocument doc : results) {
	        Map<String, Object> map = new HashMap<>();
	        map.put("id", doc.getFieldValue("id"));
	        map.put("title", doc.getFieldValue("title"));
	        map.put("address", doc.getFieldValue("address"));
	        map.put("image_url", doc.getFieldValue("image_url"));
	        map.put("description", doc.getFieldValue("description"));
	        map.put("menu_t", doc.getFieldValue("menu_t"));
	        
	        list.add(map);
	    }

	    // 5. 최종 리턴용 맵 생성
	    Map<String, Object> responseMap = new HashMap<>();
	    responseMap.put("list", list);            // 잘라낸 데이터 10개
	    responseMap.put("total", results.getNumFound()); // 검색된 전체 데이터 개수

	    return responseMap;	
	    }
	@Override
	public Map<String, Object> getFoodDetail(String id) throws Exception {
	    // Solr에서 ID로 문서 가져오기
	    SolrDocument doc = solrClient.getById(CORE_NAME, id);

	    if (doc == null) {
	        return null; // 없으면 null 리턴
	    }

	    // Map으로 예쁘게 포장
	    Map<String, Object> map = new HashMap<>();
	    map.put("id", doc.getFieldValue("id"));
	    map.put("title", doc.getFieldValue("title"));
	    map.put("address", doc.getFieldValue("address"));
	    map.put("image_url", doc.getFieldValue("image_url"));
	    map.put("description", doc.getFieldValue("description"));
	    map.put("menu_t", doc.getFieldValue("menu_t"));
	    map.put("opentime_t", doc.getFieldValue("opentime_t")); // 운영시간
	    map.put("latitude", doc.getFieldValue("latitude"));     // 위도 (지도용)
	    map.put("longitude", doc.getFieldValue("longitude"));   // 경도 (지도용)
	    map.put("view_count", doc.getFieldValue("view_count_i"));

	    return map;
	}
	
	@Override
	public void increaseViewCount(String id) throws Exception {
	    SolrInputDocument doc = new SolrInputDocument();
	    doc.addField("id", id);
	    
	    // Solr의 부분 업데이트 문법: {"inc": 1} -> view_count_i 필드 값을 1 증가
	    Map<String, Object> modifier = new HashMap<>();
	    modifier.put("inc", 1); 
	    doc.addField("view_count_i", modifier); // view_count_i 필드 기준으로 업데이트

	    // Solr에 전송 및 반영
	    solrClient.add(CORE_NAME, doc);
	    solrClient.commit(CORE_NAME); 

  }
}
