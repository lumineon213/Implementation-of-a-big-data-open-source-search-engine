package com.boot.course.utils;

import lombok.extern.slf4j.Slf4j;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class SolrPlaceService {

    private final SolrClient solrClient;

    public SolrPlaceService(SolrClient solrClient) {
        this.solrClient = solrClient;
    }

    /**
     * placeType = DB에 저장된 타입(코어명/표준타입)
     * placeId   = DB에 저장된 ID(코어에 따라 규칙이 다를 수 있음)
     *
     * 절대 예외 던지지 않음(서비스 안정성 우선).
     */
    public Map<String, Object> getPlaceById(String placeId, String placeType) {
        placeId = placeId == null ? null : placeId.trim();
        placeType = placeType == null ? null : placeType.trim();

        if (isBlank(placeId) || isBlank(placeType)) {
            return placeholder(placeId, placeType, "잘못된 요청(빈 ID/Type)");
        }

        // ✅ 1) coreName 정규화 (ex: search -> Search)
        String core = normalizeCoreName(placeType);

        // ✅ 2) 문서 id 정규화 (ex: parking_core + 2009... -> parking_2009...)
        String docId = normalizeDocId(placeId, placeType);

        try {
            SolrQuery q = new SolrQuery();
            q.setQuery("id:\"" + ClientUtils.escapeQueryChars(docId) + "\"");
            q.setRows(1);

            QueryResponse response = solrClient.query(core, q);
            SolrDocumentList docs = response.getResults();

            if (docs == null || docs.isEmpty()) {
                log.warn("[SOLR EMPTY] core={}, rawType={}, rawId={}, normalizedId={}", core, placeType, placeId, docId);
                return placeholder(placeId, placeType, "문서 없음(core=" + core + ", id=" + docId + ")");
            }

            SolrDocument doc = docs.get(0);

            // ✅ switch는 "실제 조회한 core" 기준으로 통일
            UnifiedPlace up = mapToUnifiedPlace(doc, core);

            // 응답에는 "원래 placeType"을 유지(프론트 표시/DB 추적용)
            up.placeType = placeType;

            return toMap(up);

        } catch (Exception e) {
            // SolrServerException/RuntimeException 전부 흡수
            log.warn("[SOLR FAIL] core={}, rawType={}, rawId={}, normalizedId={}, msg={}",
                    core, placeType, placeId, docId, e.getMessage());
            return placeholder(placeId, placeType, "Solr 조회 실패(core=" + core + ", id=" + docId + ")");
        }
    }

    /* ------------------------------
       정규화 로직
    ------------------------------ */

    /**
     * DB에 저장된 placeType을 Solr의 실제 coreName으로 정규화
     * - 너 케이스: Solr 코어는 "Search" 인데 DB는 "search"
     */
    private String normalizeCoreName(String placeType) {
        if (placeType == null) return null;
        String t = placeType.trim();

        // ✅ 딱 너 문제 해결 포인트
        if ("search".equals(t)) return "Search";

        // 혹시 DB에 "Search"로 들어와도 그대로
        return t;
    }

    /**
     * 코어별로 Solr 문서 id 규칙이 다르면 여기서 보정
     */
    private String normalizeDocId(String placeId, String placeType) {
        if (placeId == null) return null;
        if (placeType == null) return placeId.trim();

        String id = placeId.trim();
        String t = placeType.trim();

        // ✅ parking_core: Solr id는 "parking_숫자"
        if ("parking_core".equals(t)) {
            if (id.startsWith("parking_")) return id;
            return "parking_" + id;
        }

        // ✅ search(Search): Solr id는 그냥 "100" 같은 문자열 -> 그대로
        return id;
    }

    /* ------------------------------
       Core별 매핑 로직
    ------------------------------ */
    private UnifiedPlace mapToUnifiedPlace(SolrDocument doc, String coreName) {

        UnifiedPlace up = new UnifiedPlace();
        up.placeId = safeString(doc.getFieldValue("id"));
        up.placeType = coreName; // 일단 coreName으로 채우고, 호출부에서 원래 placeType으로 덮어씀

        switch (coreName) {

            // 1) 명소(POI) - Solr 코어명: "Search"
            case "Search" -> {
                up.title = firstString(doc, "title");
                up.address = firstString(doc, "address");
                up.thumbnail = firstString(doc, "image_url");
                up.category = firstString(doc, "theme_id"); // 숫자여도 문자열화됨
                up.latitude = firstDouble(doc, "latitude");
                up.longitude = firstDouble(doc, "longitude");
            }

            // 2) 축제
            case "festival_core" -> {
                up.title = firstString(doc, "MAIN_TITLE_text", "TITLE_text");
                up.address = firstString(doc, "ADDR1_s");
                up.thumbnail = safeString(doc.getFieldValue("MAIN_IMG_NORMAL_s"));
                up.category = "festival";
                up.latitude = firstDouble(doc, "LAT_d");
                up.longitude = firstDouble(doc, "LNG_d");
            }

            // 3) 음식
            case "food_core" -> {
                up.title = firstString(doc, "title");
                up.address = firstString(doc, "address");
                up.thumbnail = firstString(doc, "image_url");
                up.category = firstString(doc, "type"); // FOOD
                up.latitude = firstDouble(doc, "latitude");
                up.longitude = firstDouble(doc, "longitude");
            }

            // 4) 해양
            case "marine_core" -> {
                up.title = firstString(doc, "main_title", "title");
                up.address = firstString(doc, "address");
                up.thumbnail = firstString(doc, "thumbnail", "image_url");
                up.category = firstString(doc, "type"); // MARINE_TOURISM
                up.latitude = firstDouble(doc, "latitude");
                up.longitude = firstDouble(doc, "longitude");
            }

            // 5) 주차
            case "parking_core" -> {
                up.title = firstString(doc, "title");
                up.address = firstString(doc, "address");
                up.thumbnail = null;
                up.category = firstString(doc, "category"); // parking

                // 네 데이터: lat=128.x, lng=35.x → 스왑 보정
                Double rawLat = firstDouble(doc, "lat");
                Double rawLng = firstDouble(doc, "lng");

                Double lat = rawLng;
                Double lng = rawLat;

                // 방어: lat가 90 넘어가면 다시 원복
                if (lat != null && (lat > 90 || lat < -90)) {
                    lat = rawLat;
                    lng = rawLng;
                }

                up.latitude = lat;
                up.longitude = lng;
            }

            // 6) 쇼핑
            case "shopping_core" -> {
                up.title = firstString(doc, "main_title", "title");
                up.address = firstString(doc, "addr1");
                up.thumbnail = firstString(doc, "main_img_thumb", "main_img_normal");
                up.category = "shopping";
                up.latitude = firstDouble(doc, "lat");
                up.longitude = firstDouble(doc, "lng");
            }

            // 7) 숙박
            case "stay_core" -> {
                up.title = firstString(doc, "title");
                up.address = firstString(doc, "road_address");
                up.thumbnail = firstString(doc, "image_url");
                up.category = "stay";
                up.latitude = firstDouble(doc, "latitude");
                up.longitude = firstDouble(doc, "longitude");
            }

            // 8) 테마
            case "theme_core" -> {
                up.title = firstString(doc, "main_title", "title");
                up.address = firstString(doc, "address");
                up.thumbnail = firstString(doc, "thumbnail", "image_url");
                up.category = firstString(doc, "category");
                up.latitude = firstDouble(doc, "latitude");
                up.longitude = firstDouble(doc, "longitude");
            }

            // 9) 도시
            case "urban_core" -> {
                up.title = firstString(doc, "main_title", "title");
                up.address = firstString(doc, "address");
                up.thumbnail = firstString(doc, "thumbnail", "image_url");
                up.category = firstString(doc, "type"); // URBAN_TOURISM
                up.latitude = firstDouble(doc, "latitude");
                up.longitude = firstDouble(doc, "longitude");
            }

            // 10) 도보
            case "walk_core" -> {
                up.title = firstString(doc, "main_title", "title");
                up.address = firstString(doc, "address");
                up.thumbnail = firstString(doc, "thumbnail", "image_url");
                up.category = firstString(doc, "category");
                up.latitude = firstDouble(doc, "latitude");
                up.longitude = firstDouble(doc, "longitude");
            }

            // 알 수 없는 코어
            default -> {
                up.title = firstString(doc, "main_title", "title");
                up.address = firstString(doc, "address", "road_address", "addr1", "ADDR1_s");
                up.thumbnail = firstString(doc, "thumbnail", "image_url", "MAIN_IMG_NORMAL_s", "main_img_thumb", "main_img_normal");
                up.category = coreName;
                up.latitude = firstDouble(doc, "latitude", "LAT_d", "lat");
                up.longitude = firstDouble(doc, "longitude", "LNG_d", "lng");
            }
        }

        // 제목 방어
        if (isBlank(up.title)) {
            up.title = isBlank(up.placeId) ? "(정보 없음)" : up.placeId;
        }

        return up;
    }

    /* ------------------------------
       안전 추출 유틸
    ------------------------------ */

    private static String firstString(SolrDocument doc, String... fields) {
        for (String f : fields) {
            Object v = doc.getFieldValue(f);
            String s = safeString(v);
            if (!isBlank(s)) return s;
        }
        return null;
    }

    private static Double firstDouble(SolrDocument doc, String... fields) {
        for (String f : fields) {
            Object v = doc.getFieldValue(f);
            Double d = safeDouble(v);
            if (d != null) return d;
        }
        return null;
    }

    private static String safeString(Object v) {
        if (v == null) return null;

        if (v instanceof Collection<?> c) {
            for (Object o : c) {
                String s = safeString(o);
                if (!isBlank(s)) return s;
            }
            return null;
        }

        return String.valueOf(v).trim();
    }

    private static Double safeDouble(Object v) {
        if (v == null) return null;

        if (v instanceof Collection<?> c) {
            for (Object o : c) {
                Double d = safeDouble(o);
                if (d != null) return d;
            }
            return null;
        }

        if (v instanceof Number n) return n.doubleValue();

        if (v instanceof String s) {
            String t = s.trim();
            if (t.isEmpty()) return null;
            try {
                return Double.parseDouble(t);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        return null;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    /* ------------------------------
       반환 포맷(Map) + placeholder
    ------------------------------ */

    private static Map<String, Object> toMap(UnifiedPlace up) {
        Map<String, Object> m = new HashMap<>();
        m.put("placeId", up.placeId);
        m.put("placeType", up.placeType);
        m.put("title", up.title);
        m.put("address", up.address);
        m.put("latitude", up.latitude);
        m.put("longitude", up.longitude);
        m.put("thumbnail", up.thumbnail);
        m.put("category", up.category);
        return m;
    }

    private static Map<String, Object> placeholder(String placeId, String placeType, String reason) {
        Map<String, Object> m = new HashMap<>();
        m.put("placeId", placeId);
        m.put("placeType", placeType);
        m.put("title", "(정보 없음)");
        m.put("address", null);
        m.put("latitude", null);
        m.put("longitude", null);
        m.put("thumbnail", null);
        m.put("category", placeType);
        m.put("_reason", reason);
        return m;
    }

    private static class UnifiedPlace {
        String placeId;
        String placeType;
        String title;
        String address;
        Double latitude;
        Double longitude;
        String thumbnail;
        String category;
    }
}
