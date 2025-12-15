package com.boot.news.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.boot.news.dto.NewsDTO;
import com.boot.news.dto.NewsResponseDTO;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class NewsServiceImpl implements NewsService {
	@Value("${naver.news.client-id}")
    private String clientId;

    @Value("${naver.news.client-secret}")
    private String clientSecret;

    @Value("${naver.news.api-url}")
    private String apiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();


    // [PRIVATE] callNaverApi 메서드 (sort 파라미터만 유지)
    private NewsResponseDTO callNaverApi(String query, int display, int start, String sort) {
        if (query == null || query.trim().isEmpty() || start > 1000 || start < 1) {
            NewsResponseDTO empty = new NewsResponseDTO();
            empty.setItems(Collections.emptyList());
            empty.setTotal(0);
            return empty;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", clientId);
        headers.set("X-Naver-Client-Secret", clientSecret);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        String uri = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("query", query)
                .queryParam("display", display > 0 ? display : 10)
                .queryParam("start", start)
                .queryParam("sort", sort)
                .build()
                .toUriString();
        
        System.out.println(">>> [DEBUG] 최종 Naver API URL: " + uri);

        try {
            ResponseEntity<NewsResponseDTO> response = restTemplate.exchange(
                uri, HttpMethod.GET, entity, NewsResponseDTO.class
            );
            return response.getBody();

        } catch (Exception e) {
            System.err.println("❌ Naver API 호출 실패: " + e.getMessage());
            NewsResponseDTO errorResponse = new NewsResponseDTO();
            errorResponse.setItems(Collections.emptyList());
            errorResponse.setTotal(0);
            return errorResponse;
        }
    }


    // 💡 최종 searchNews 구현체 (날짜 필터링 완전 해제)
    @Override
    public NewsResponseDTO searchNews(String query, int display, int page, String sort) { // 🚨 dateFilter 제거
        
        // 1. 검색어 유효성 검사 및 빈 응답 처리
        if (query == null || query.trim().isEmpty()) {
            NewsResponseDTO empty = new NewsResponseDTO();
            empty.setItems(Collections.emptyList());
            empty.setTotal(0);
            return empty; 
        }
        
        // 2. 쿼리 보정 로직 (여행 관련 노이즈 제외만 적용)
        String originalQuery = query.trim();
        String excludedKeywords = "";

        // 여행 관련 키워드 검색 시에만 노이즈 제외 키워드를 추가합니다.
        if (originalQuery.contains("여행") || originalQuery.contains("숙소") || originalQuery.contains("코스") || originalQuery.contains("명소")) {
            // 🚨 마지막 시도에서 결과 0건의 원인이었던 mandatoryTerms는 제거, 안전한 노이즈 제외 키워드 유지
            excludedKeywords = " -주가 -증시 -기업 -매출 -실적 -업계 -전망 -호텔신라"; 
        }
        
        String finalQuery = originalQuery + excludedKeywords; 
        System.out.println(">>> [DEBUG] API에 전달할 최종 쿼리: " + finalQuery);

        // 3. 페이징 시작 인덱스 계산
        int start = (page - 1) * display + 1;
        
        // 4. Naver API 호출 (finalQuery, sort 파라미터 전달)
        NewsResponseDTO response = callNaverApi(finalQuery, display, start, sort); // 🚨 sort 파라미터 전달

        // 🚨 5. 날짜 필터링 로직 전체 제거
        
        // 6. API 응답 그대로 반환
        return response;
    }
}
