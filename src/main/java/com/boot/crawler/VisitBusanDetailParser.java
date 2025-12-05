package com.boot.crawler;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * VisitBusan 상세 페이지 파서 (여러 HTML 버전 방어 + TourAPI 이미지 연동)
 */
public class VisitBusanDetailParser {

    // TODO: 실제 서비스키로 교체
    private static final String TOUR_API_KEY = "여기에_서비스키_입력";

    // 필요하면 VisitBusan 로컬 이미지까지 fallback으로 쓸지 여부
    private static final boolean USE_VISITBUSAN_IMAGES_FALLBACK = false;

    public static void main(String[] args) throws Exception {
        String url = "https://www.visitbusan.net/index.do?menuCd=DOM_000000201001001000&uc_seq=364&lang_cd=ko";
        JSONObject obj = parse(url);

        // ★ JSON 출력 시 유니코드 escape → 실제 글자로 되돌리기
        String pretty = unescapeUnicode(obj.toString(4));
        System.out.println(pretty);
    }

    // =========================================================================
    // 메인 파서
    // =========================================================================
    public static JSONObject parse(String url) throws Exception {

        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0")
                .timeout(15000)
                .get();

        JSONObject json = new JSONObject();

        // ------------------------------------------------------------
        // 1) 기본 정보
        // ------------------------------------------------------------
        String ucSeq = extractUcSeq(url);
        json.put("uc_seq", ucSeq);

        String title = extractTitle(doc);
        json.put("title", title != null ? title : "");

        String subtitle = extractSubtitle(doc);
        json.put("subtitle", subtitle != null ? subtitle : "");

        // ------------------------------------------------------------
        // 2) 본문 내용
        // ------------------------------------------------------------
        JSONArray contentArr = extractContents(doc);
        json.put("content", contentArr);

        // ------------------------------------------------------------
        // 3) 이미지 처리
        // ------------------------------------------------------------
        JSONArray imageArr = new JSONArray();

        // 3-1. TourAPI 이미지 우선
        if (title != null && !title.isBlank() &&
                TOUR_API_KEY != null && !TOUR_API_KEY.startsWith("여기에_")) {

            List<String> tourImgs = fetchImagesFromTourAPI(normalize(title));
            for (String img : tourImgs) imageArr.put(img);
        }

        // 3-2. 필요 시 VisitBusan 이미지도 fallback
        if (USE_VISITBUSAN_IMAGES_FALLBACK && imageArr.isEmpty()) {
            List<String> vbImgs = extractVisitBusanImages(doc);
            for (String img : vbImgs) imageArr.put(img);
        }

        json.put("images", imageArr);

        // ------------------------------------------------------------
        // 4) 정보 박스
        // ------------------------------------------------------------
        JSONArray infoArr = extractInfo(doc);
        json.put("info", infoArr);

        // ------------------------------------------------------------
        // 5) 태그
        // ------------------------------------------------------------
        JSONArray tagsArr = extractTags(doc);
        json.put("tags", tagsArr);

        json.put("url", url);
        json.put("source", "visitbusan");

        return json;
    }

    // =========================================================================
    // uc_seq 추출
    // =========================================================================
    private static String extractUcSeq(String url) {
        String seq = url.replaceAll(".*uc_seq=([0-9]+).*", "$1");
        if (seq.equals(url)) return "";
        return seq;
    }

    // =========================================================================
    // 제목 추출
    // =========================================================================
    private static String extractTitle(Document doc) {
        Element e1 = doc.selectFirst("section#title h4.tit");
        Element e2 = doc.selectFirst(".viewArea h4.tit, .view_title h4.tit");
        Element e3 = doc.selectFirst("h2.tit, h1.tit");
        Element og = doc.selectFirst("meta[property=og:title]");
        String ogTitle = og != null ? og.attr("content") : null;

        String docTitle = doc.title();

        return firstNonEmpty(
                text(e1),
                text(e2),
                text(e3),
                ogTitle,
                docTitle
        );
    }

    // =========================================================================
    // 부제목 추출
    // =========================================================================
    private static String extractSubtitle(Document doc) {
        Element e1 = doc.selectFirst("section#title p.tit_sub");
        Element e2 = doc.selectFirst(".viewArea p.tit_sub, .view_title p.tit_sub");
        Element e3 = doc.selectFirst(".sub_txt, .tit_desc, .tit-sub");

        return firstNonEmpty(
                text(e1),
                text(e2),
                text(e3)
        );
    }

    // =========================================================================
    // 본문 추출
    // =========================================================================
    private static JSONArray extractContents(Document doc) {
        JSONArray arr = new JSONArray();

        Elements blocks = doc.select("div.vTab01 .cont");

        for (Element block : blocks) {
            String html = block.html();
            String[] parts = html.split("(<br>|<br/>|<br />)");

            for (String part : parts) {
                String text = Jsoup.parse(part).text().trim();
                
                text = normalizeFancyQuotes(text);
                
                if (text.length() > 5) arr.put(text);
            }
        }
        return arr;
    }


    // =========================================================================
    // VisitBusan 이미지 추출 (fallback)
    // =========================================================================
    private static List<String> extractVisitBusanImages(Document doc) {
        List<String> list = new ArrayList<>();

        Elements imgs = doc.select(
                ".poto_img img," +
                ".photo img," +
                ".slideArea img," +
                ".viewArea img," +
                ".galleryArea img," +
                "div.img_wrap img"
        );

        for (Element img : imgs) {
            String src = img.hasAttr("data-src") ? img.attr("data-src") : img.attr("src");
            if (src == null || src.trim().isEmpty()) continue;
            list.add(src.trim());
        }

        return list;
    }

    // =========================================================================
    // 정보 리스트 추출
    // =========================================================================
    private static JSONArray extractInfo(Document doc) {
        JSONArray arr = new JSONArray();

        Elements infoLis = doc.select(".cntInfoDetails ul.InfoD-List li");

        if (infoLis.isEmpty()) {
            infoLis = doc.select(
                    ".infoArea ul li," +
                    ".info_list li," +
                    ".tel_info li," +
                    "#detailInfo ul li"
            );
        }

        for (Element li : infoLis) {
            JSONObject row = new JSONObject();

            String label = firstNonEmpty(
                    text(li.selectFirst("strong")),
                    text(li.selectFirst("dt")),
                    text(li.selectFirst(".tit")),
                    text(li.selectFirst(".dTit")),
                    text(li.selectFirst("p"))
            );

            String value = firstNonEmpty(
                    text(li.selectFirst("span")),
                    text(li.selectFirst("dd")),
                    text(li.selectFirst(".txt")),
                    text(li.selectFirst(".dTxt")),
                    li.ownText().trim()
            );

            if (label == null && value == null) continue;

            row.put("label", label != null ? label : "");
            row.put("value", value != null ? value : "");
            arr.put(row);
        }

        return arr;
    }

    // =========================================================================
    // 태그 추출
    // =========================================================================
    private static JSONArray extractTags(Document doc) {
        JSONArray arr = new JSONArray();

        Elements tagEls = doc.select(
                ".taglist li a," +
                ".tag_list a," +
                ".hashTag a," +
                ".tag a"
        );

        for (Element t : tagEls) {
            String txt = t.text().replace("#", "").trim();
            if (!txt.isEmpty()) arr.put(txt);
        }

        return arr;
    }

    // =========================================================================
    // TourAPI 이미지 검색
    // =========================================================================
    private static List<String> fetchImagesFromTourAPI(String keyword) {
        List<String> list = new ArrayList<>();

        try {
            String encoded = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
            String apiUrl =
                    "https://apis.data.go.kr/B551011/KorService1/searchKeyword1"
                            + "?serviceKey=" + TOUR_API_KEY
                            + "&numOfRows=10&pageNo=1"
                            + "&MobileOS=ETC&MobileApp=AppTest&_type=json"
                            + "&keyword=" + encoded;

            String json = fetch(apiUrl);
            JSONObject obj = new JSONObject(json);

            JSONArray items = obj
                    .getJSONObject("response")
                    .getJSONObject("body")
                    .getJSONObject("items")
                    .optJSONArray("item");

            if (items == null) return list;

            for (int i = 0; i < items.length(); i++) {
                JSONObject it = items.getJSONObject(i);

                if (it.has("firstimage")) {
                    String img = it.optString("firstimage", "").trim();
                    if (!img.isEmpty()) list.add(img);
                }
                if (it.has("firstimage2")) {
                    String img = it.optString("firstimage2", "").trim();
                    if (!img.isEmpty()) list.add(img);
                }
            }

        } catch (Exception e) {
            System.out.println("TourAPI 이미지 검색 실패: " + e.getMessage());
        }

        return list;
    }

    // =========================================================================
    // 검색어 정규화
    // =========================================================================
    private static String normalize(String s) {
        if (s == null) return "";
        return s.replaceAll("\\(.*?\\)", "")
                .replaceAll("[^가-힣a-zA-Z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    // =========================================================================
    // HTTP GET
    // =========================================================================
    private static String fetch(String url) throws IOException {
        return Jsoup.connect(url)
                .ignoreContentType(true)
                .userAgent("Mozilla/5.0")
                .timeout(10000)
                .execute()
                .body()
                .trim();
    }

    // =========================================================================
    // util
    // =========================================================================
    private static String text(Element e) {
        if (e == null) return null;
        String t = e.text();
        if (t == null) return null;
        t = t.trim();
        return t.isEmpty() ? null : t;
    }

    private static String firstNonEmpty(String... vals) {
        if (vals == null) return null;
        for (String v : vals) {
            if (v != null) {
                String t = v.trim();
                if (!t.isEmpty()) return t;
            }
        }
        return null;
    }

    // =========================================================================
    // ★ JSON 유니코드 디코더
    // =========================================================================
    private static String unescapeUnicode(String s) {
        StringBuilder sb = new StringBuilder();
        char[] arr = s.toCharArray();
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == '\\' && i + 5 < arr.length && arr[i+1] == 'u') {
                String hex = new String(arr, i+2, 4);
                try {
                    int code = Integer.parseInt(hex, 16);
                    sb.append((char) code);
                    i += 5;
                    continue;
                } catch (Exception ignored) {}
            }
            sb.append(arr[i]);
        }
        return sb.toString();
    }
    
    private static String normalizeFancyQuotes(String s) {
        if (s == null) return null;
        return s
                .replace("\u2018", "'")
                .replace("\u2019", "'")
                .replace("\u201C", "\"")
                .replace("\u201D", "\"");
    }

}
