package com.boot.solr.service;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class UnifiedSearchService {

    @Autowired
    private SolrClient solrClient;

    // 모든 Solr 코어 목록
    private static final String[] CORE_NAMES = {
        "Search",           // Tour 코어
        "stay_core",
        "food_core",
        "shopping_core",
        "marine_core",
        "urban_core",
        "walk_core",
        "festival_core",
        "theme_core"
    };

    private final ExecutorService executorService = Executors.newFixedThreadPool(9); // 코어 개수에 맞게 조정

    /**
     * 통합 검색: 모든 코어에서 검색하고 결과를 합침
     */
    public Map<String, Object> unifiedSearch(String query, int rows) throws Exception {
        // 검색어가 없으면 빈 결과 반환 (final 변수로 만들기 위해 별도 변수 사용)
        final String searchQuery;
        if (query == null || query.trim().isEmpty() || query.equals("*:*")) {
            searchQuery = "*:*";
        } else {
            searchQuery = query;
        }

        // 모든 코어에서 병렬 검색
        List<CompletableFuture<List<Map<String, Object>>>> futures = new ArrayList<>();
        for (String coreName : CORE_NAMES) {
            CompletableFuture<List<Map<String, Object>>> future = CompletableFuture.supplyAsync(() -> {
                try {
                    return searchCore(coreName, searchQuery, rows);
                } catch (Exception e) {
                    System.err.println("코어 " + coreName + " 검색 실패: " + e.getMessage());
                    e.printStackTrace(); // 스택 트레이스 출력
                    return new ArrayList<Map<String, Object>>();
                }
            }, executorService);
            futures.add(future);
        }

        // 모든 검색 결과 대기 및 합치기
        List<Map<String, Object>> allResults = new ArrayList<>();
        for (CompletableFuture<List<Map<String, Object>>> future : futures) {
            try {
                List<Map<String, Object>> coreResults = future.get();
                if (coreResults != null) {
                    allResults.addAll(coreResults);
                }
            } catch (Exception e) {
                System.err.println("검색 결과 합치기 실패: " + e.getMessage());
                e.printStackTrace();
                // 개별 코어 실패는 무시하고 계속 진행
            }
        }

        // 카테고리 정보 추가 및 정렬 (관련도 순)
        for (Map<String, Object> result : allResults) {
            // 코어 이름에 따라 카테고리 설정
            String coreName = (String) result.get("_core");
            if (coreName != null) {
                result.put("category", getCategoryFromCore(coreName));
            }
        }

        // 결과 정렬 (관련도 순으로 유지)
        // Solr의 score가 높은 순서대로 정렬 (이미 Solr에서 정렬된 결과)

        Map<String, Object> response = new HashMap<>();
        response.put("list", allResults);
        response.put("total", allResults.size());

        return response;
    }

    /**
     * 개별 코어 검색
     */
    private List<Map<String, Object>> searchCore(String coreName, String query, int rows) throws Exception {
        try {
            SolrQuery solrQuery = new SolrQuery();

            // 검색 쿼리 설정 (각 코어의 필드에 맞게)
            if (query.equals("*:*")) {
                solrQuery.setQuery("*:*");
            } else {
                // 공통 검색 필드 (각 코어마다 다를 수 있음)
                String searchQuery = buildSearchQuery(query, coreName);
                solrQuery.setQuery(searchQuery);
            }

            solrQuery.setRows(rows);
            solrQuery.setFields("*"); // 모든 필드 가져오기

            QueryResponse response = solrClient.query(coreName, solrQuery);
            SolrDocumentList docs = response.getResults();

            List<Map<String, Object>> results = new ArrayList<>();
            for (SolrDocument doc : docs) {
                try {
                    Map<String, Object> map = convertDocumentToMap(doc);
                    map.put("_core", coreName); // 코어 이름 저장
                    results.add(map);
                } catch (Exception e) {
                    System.err.println("문서 변환 실패 (코어: " + coreName + "): " + e.getMessage());
                    // 개별 문서 변환 실패는 무시하고 계속 진행
                }
            }

            return results;
        } catch (org.apache.solr.client.solrj.SolrServerException e) {
            System.err.println("Solr 서버 에러 (코어: " + coreName + "): " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("코어 검색 중 에러 (코어: " + coreName + "): " + e.getMessage());
            throw e;
        }
    }

    /**
     * 코어별 검색 쿼리 생성
     */
    private String buildSearchQuery(String keyword, String coreName) {
        String kw = keyword.trim();
        
        switch (coreName) {
            case "Search":  // Tour 코어
                return "title:*" + kw + "* OR address:*" + kw + "*";
            case "food_core":
                return "title:*" + kw + "* OR menu_t:*" + kw + "*";
            case "stay_core":
                return "title:*" + kw + "* OR road_address:*" + kw + "* OR description:*" + kw + "*";
            case "shopping_core":
                return "main_title:*" + kw + "* OR title:*" + kw + "* OR place:*" + kw + "* OR gugun_nm:*" + kw + "*";
            case "marine_core":
            case "urban_core":
            case "walk_core":
                return "title:*" + kw + "* OR subtitle:*" + kw + "*";
            case "festival_core":
                return "MAIN_TITLE_text:*" + kw + "* OR TITLE_text:*" + kw + "* OR ITEMCNTNTS_text:*" + kw + "*";
            case "theme_core":
                // 확실히 있는 필드만 사용: title, subtitle, address
                return "title:*" + kw + "* OR subtitle:*" + kw + "* OR address:*" + kw + "*";
            default:
                return "title:*" + kw + "* OR description:*" + kw + "*";
        }
    }

    /**
     * SolrDocument를 Map으로 변환
     */
    private Map<String, Object> convertDocumentToMap(SolrDocument doc) {
        Map<String, Object> map = new HashMap<>();
        
        for (String fieldName : doc.getFieldNames()) {
            Object value = doc.getFieldValue(fieldName);
            
            // Collection 타입 처리
            if (value instanceof Collection) {
                Collection<?> col = (Collection<?>) value;
                if (!col.isEmpty()) {
                    map.put(fieldName, col.iterator().next()); // 첫 번째 값만 사용
                }
            } else {
                map.put(fieldName, value);
            }
        }

        // 공통 필드 정규화
        normalizeFields(map);

        return map;
    }

    /**
     * 필드 이름 정규화 (각 코어마다 필드명이 다를 수 있음)
     */
    private void normalizeFields(Map<String, Object> map) {
        // id 필드
        if (!map.containsKey("id") && map.containsKey("UC_SEQ")) {
            map.put("id", map.get("UC_SEQ"));
        }

        // title 필드
        if (!map.containsKey("title")) {
            if (map.containsKey("MAIN_TITLE_text")) {
                map.put("title", map.get("MAIN_TITLE_text"));
            } else if (map.containsKey("mainTitle")) {
                map.put("title", map.get("mainTitle"));
            } else if (map.containsKey("main_title")) {
                map.put("title", map.get("main_title"));
            }
        }

        // description 필드
        if (!map.containsKey("description")) {
            if (map.containsKey("ITEMCNTNTS_text")) {
                map.put("description", map.get("ITEMCNTNTS_text"));
            } else if (map.containsKey("contents")) {
                map.put("description", map.get("contents"));
            }
        }

        // address 필드
        if (!map.containsKey("address")) {
            if (map.containsKey("road_address")) {
                map.put("address", map.get("road_address"));
            } else if (map.containsKey("ADDR1_s")) {
                map.put("address", map.get("ADDR1_s"));
            } else if (map.containsKey("addr1")) {
                map.put("address", map.get("addr1"));
            }
        }

        // place 필드
        if (!map.containsKey("place")) {
            if (map.containsKey("PLACE_s")) {
                map.put("place", map.get("PLACE_s"));
            } else if (map.containsKey("GUGUN_NM_s")) {
                map.put("place", map.get("GUGUN_NM_s"));
            } else if (map.containsKey("gugunNm")) {
                map.put("place", map.get("gugunNm"));
            }
        }

        // image_url 필드
        if (!map.containsKey("image_url")) {
            if (map.containsKey("MAIN_IMG_NORMAL_s")) {
                map.put("image_url", map.get("MAIN_IMG_NORMAL_s"));
            } else if (map.containsKey("mainImgNormal")) {
                map.put("image_url", map.get("mainImgNormal"));
            }
        }
    }

    /**
     * 코어 이름으로부터 카테고리 반환
     */
    private String getCategoryFromCore(String coreName) {
        switch (coreName) {
            case "Search":
                return "관광지";
            case "stay_core":
                return "숙박";
            case "food_core":
                return "맛집";
            case "shopping_core":
                return "쇼핑";
            case "marine_core":
                return "해양";
            case "urban_core":
                return "도시";
            case "walk_core":
                return "걷기";
            case "festival_core":
                return "축제";
            case "theme_core":
                return "테마";
            default:
                return "기타";
        }
    }

    /**
     * 검색어 제안: 입력된 검색어로 시작하는 제목들을 반환
     * @param query 입력된 검색어
     * @param limit 제안 개수 제한 (기본 10개)
     * @return 검색어 제안 리스트
     */
    public List<String> getSearchSuggestions(String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        String searchKeyword = query.trim();
        Set<String> suggestions = new LinkedHashSet<>(); // 중복 제거 및 순서 유지
        
        // 최대 제안 개수
        int maxSuggestions = limit > 0 ? limit : 10;

        try {
            // 모든 코어에서 병렬로 제안 가져오기
            List<CompletableFuture<List<String>>> futures = new ArrayList<>();
            for (String coreName : CORE_NAMES) {
                CompletableFuture<List<String>> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        return getSuggestionsFromCore(coreName, searchKeyword, 5); // 각 코어당 5개씩
                    } catch (Exception e) {
                        System.err.println("코어 " + coreName + " 제안 가져오기 실패: " + e.getMessage());
                        return new ArrayList<String>();
                    }
                }, executorService);
                futures.add(future);
            }

            // 모든 제안 결과 합치기
            for (CompletableFuture<List<String>> future : futures) {
                try {
                    List<String> coreSuggestions = future.get();
                    if (coreSuggestions != null) {
                        for (String suggestion : coreSuggestions) {
                            if (suggestions.size() >= maxSuggestions) {
                                break;
                            }
                            // 입력한 검색어를 포함하고, 완전히 일치하지 않는 제안만 추가
                            if (suggestion != null && suggestion.length() > searchKeyword.length()) {
                                suggestions.add(suggestion);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("제안 결과 합치기 실패: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("검색어 제안 중 오류: " + e.getMessage());
            e.printStackTrace();
        }

        // 리스트로 변환 (최대 개수 제한)
        List<String> result = new ArrayList<>(suggestions);
        if (result.size() > maxSuggestions) {
            return result.subList(0, maxSuggestions);
        }
        return result;
    }

    /**
     * 특정 코어에서 검색어 제안 가져오기
     */
    private List<String> getSuggestionsFromCore(String coreName, String keyword, int limit) throws Exception {
        List<String> suggestions = new ArrayList<>();
        
        try {
            SolrQuery solrQuery = new SolrQuery();
            
            // 제목 필드에서 검색어로 시작하는 문서 검색
            String titleField = getTitleFieldName(coreName);
            solrQuery.setQuery(titleField + ":*" + keyword + "*");
            solrQuery.setRows(limit * 2); // 더 많이 가져와서 필터링
            solrQuery.setFields(titleField); // 제목 필드만 가져오기
            solrQuery.setSort("score", SolrQuery.ORDER.desc); // 관련도 순

            QueryResponse response = solrClient.query(coreName, solrQuery);
            SolrDocumentList docs = response.getResults();

            for (SolrDocument doc : docs) {
                Object titleObj = doc.getFieldValue(titleField);
                if (titleObj != null) {
                    String title = titleObj.toString().trim();
                    // 검색어로 시작하는 제목만 제안 (대소문자 무시)
                    if (title.toLowerCase().startsWith(keyword.toLowerCase()) && !suggestions.contains(title)) {
                        suggestions.add(title);
                        if (suggestions.size() >= limit) {
                            break;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("코어 " + coreName + " 제안 가져오기 실패: " + e.getMessage());
        }

        return suggestions;
    }

    /**
     * 코어별 제목 필드 이름 반환
     */
    private String getTitleFieldName(String coreName) {
        switch (coreName) {
            case "Search":
                return "title";
            case "food_core":
                return "title";
            case "stay_core":
                return "title";
            case "shopping_core":
                return "main_title";
            case "marine_core":
            case "urban_core":
            case "walk_core":
                return "title";
            case "festival_core":
                return "MAIN_TITLE_text";
            case "theme_core":
                return "title";
            default:
                return "title";
        }
    }
}

