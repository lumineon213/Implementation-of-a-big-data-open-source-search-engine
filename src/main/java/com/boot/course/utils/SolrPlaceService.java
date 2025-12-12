package com.boot.course.utils;

import java.util.Map;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SolrPlaceService {

    private final SolrClient solrClient;

    /**
     * placeType → solr coreName 매핑
     * 코어 추가되면 Map.entry 한 줄만 추가하면 끝
     */
    private static final Map<String, String> CORE_MAP = Map.ofEntries(
            Map.entry("walk", "walk_core"),
            Map.entry("theme", "theme_core"),
            Map.entry("marine", "marine_core"),
            Map.entry("urban", "urban_core"),
            Map.entry("food", "food_core")
            // TODO: 코어 추가 시 여기에만 한 줄 추가
    );

    /**
     * placeType으로 Solr CoreName 반환
     */
    private String resolveCoreName(String placeType) {
        if (placeType == null) {
            throw new IllegalArgumentException("placeType is null");
        }

        String core = CORE_MAP.get(placeType.toLowerCase());

        if (core == null) {
            throw new IllegalArgumentException("Unknown placeType: " + placeType);
        }

        return core;
    }

    /**
     * Solr 문서 한 개 조회 (placeId 기반)
     */
    public Map<String, Object> getPlaceById(String placeId, String placeType) {

        String coreName = resolveCoreName(placeType);

        try {
            SolrQuery query = new SolrQuery();
            query.set("q", "id:" + placeId);
            query.set("rows", 1);

            QueryResponse response = solrClient.query(coreName, query);

            if (response.getResults().isEmpty()) {
                return null;
            }

            // 결과 문서의 모든 필드를 Map 형태로 반환
            return response.getResults().get(0).getFieldValueMap();

        } catch (Exception e) {
            throw new RuntimeException("Solr 조회 실패: " + e.getMessage());
        }
    }
}
