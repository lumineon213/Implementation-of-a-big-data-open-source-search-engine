package com.boot.shoppingApi.service;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ShoppingServiceImpl implements ShoppingService {

    @Value("${shopping.api.key}")
    private String apiKey;

    @Autowired
    private SolrClient solrClient;

    private static final String CORE_NAME = "shopping_core";
    private static final String API_URL = "http://apis.data.go.kr/6260000/ShoppingService/getShoppingKr";

    @Override
    public String syncShoppingData() throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        
        int pageNo = 1;
        int numOfRows = 100;
        int totalSaved = 0;

        while (true) {
            // XML 응답으로 요청 (resultType 파라미터 제거 또는 xml로 변경)
            String url = String.format(
                "%s?serviceKey=%s&pageNo=%d&numOfRows=%d",
                API_URL, apiKey, pageNo, numOfRows
            );

            System.out.println(" 쇼핑 API 호출 (페이지 " + pageNo + "): " + url);

            try {
                String response = restTemplate.getForObject(url, String.class);
                
                if (response == null) {
                    System.out.println(" 응답이 null입니다.");
                    break;
                }
                
                System.out.println(" 응답 길이: " + response.length());
                System.out.println(" 응답 시작 500자: " + response.substring(0, Math.min(500, response.length())));
                
                // resultCode 확인
                if (response.contains("<resultCode>")) {
                    String resultCode = extractXmlValue(response, "resultCode");
                    String resultMsg = extractXmlValue(response, "resultMsg");
                    System.out.println(" resultCode: " + resultCode + ", resultMsg: " + resultMsg);
                }
                
                // XML 파싱 - item 태그 찾기
                if (!response.contains("<item>")) {
                    System.out.println(" <item> 태그를 찾을 수 없음. 페이지 " + pageNo + " 종료.");
                    System.out.println("전체 응답:\n" + response);
                    break;
                }
                
                // 간단한 XML 파싱 (item 태그들 추출)
                List<SolrInputDocument> docs = new ArrayList<>();
                String[] items = response.split("<item>");
                
                System.out.println(" 발견된 item 개수: " + (items.length - 1));
                
                for (int i = 1; i < items.length; i++) {
                    String itemXml = items[i];
                    if (!itemXml.contains("</item>")) continue;
                    
                    itemXml = itemXml.substring(0, itemXml.indexOf("</item>"));
                    
                    SolrInputDocument doc = new SolrInputDocument();
                    
                    String ucSeq = extractXmlValue(itemXml, "UC_SEQ");
                    doc.addField("id", "SHOPPING_" + ucSeq);
                    doc.addField("uc_seq", ucSeq);
                    doc.addField("main_title", extractXmlValue(itemXml, "MAIN_TITLE"));
                    doc.addField("gugun_nm", extractXmlValue(itemXml, "GUGUN_NM"));
                    doc.addField("lat", extractXmlValue(itemXml, "LAT"));
                    doc.addField("lng", extractXmlValue(itemXml, "LNG"));
                    doc.addField("place", extractXmlValue(itemXml, "PLACE"));
                    doc.addField("title", extractXmlValue(itemXml, "TITLE"));
                    doc.addField("subtitle", extractXmlValue(itemXml, "SUBTITLE"));
                    doc.addField("addr1", extractXmlValue(itemXml, "ADDR1"));
                    doc.addField("addr2", extractXmlValue(itemXml, "ADDR2"));
                    doc.addField("cntct_tel_s", extractXmlValue(itemXml, "CNTCT_TEL")); // _s로 문자열 타입 명시
                    doc.addField("homepage_url", extractXmlValue(itemXml, "HOMEPAGE_URL"));
                    doc.addField("usage_day_week_and_time", extractXmlValue(itemXml, "USAGE_DAY_WEEK_AND_TIME"));
                    doc.addField("main_img_normal", extractXmlValue(itemXml, "MAIN_IMG_NORMAL"));
                    doc.addField("main_img_thumb", extractXmlValue(itemXml, "MAIN_IMG_THUMB"));
                    doc.addField("itemcntnts", extractXmlValue(itemXml, "ITEMCNTNTS"));
                    
                    docs.add(doc);
                }

                if (!docs.isEmpty()) {
                    solrClient.add(CORE_NAME, docs);
                    solrClient.commit(CORE_NAME);
                    totalSaved += docs.size();
                    System.out.println(" 페이지 " + pageNo + " 저장 완료: " + docs.size() + "개 (총 " + totalSaved + "개)");
                } else {
                    System.out.println(" 페이지 " + pageNo + "에 저장할 데이터가 없습니다. 종료.");
                    break;
                }
                
                // 응답에서 totalCount 확인
                String totalCount = extractXmlValue(response, "totalCount");
                if (!totalCount.isEmpty()) {
                    System.out.println(" API 전체 데이터 개수: " + totalCount);
                }

                // 100개씩 가져왔는데 100개보다 적으면 마지막 페이지
                if (docs.size() < numOfRows) {
                    System.out.println(" 마지막 페이지입니다. 종료.");
                    break;
                }

                pageNo++;
                
            } catch (Exception e) {
                System.err.println("❌ API 호출 오류: " + e.getMessage());
                e.printStackTrace();
                throw new Exception("쇼핑 데이터 가져오기 실패: " + e.getMessage(), e);
            }
        }

        return "쇼핑 데이터 총 " + totalSaved + "개 저장 완료!";
    }
    
    // XML 태그에서 값 추출하는 헬퍼 메서드
    private String extractXmlValue(String xml, String tagName) {
        String openTag = "<" + tagName + ">";
        String closeTag = "</" + tagName + ">";
        
        int startIdx = xml.indexOf(openTag);
        if (startIdx == -1) return "";
        
        startIdx += openTag.length();
        int endIdx = xml.indexOf(closeTag, startIdx);
        if (endIdx == -1) return "";
        
        return xml.substring(startIdx, endIdx).trim();
    }

    @Override
    public Map<String, Object> searchShopping(String keyword, int page, int size) throws Exception {
        SolrQuery query = new SolrQuery();
        
        if (keyword != null && !keyword.isEmpty()) {
            query.setQuery("main_title:*" + keyword + "* OR title:*" + keyword + "* OR place:*" + keyword + "* OR gugun_nm:*" + keyword + "* OR cntct_tel_s:*" + keyword + "*");
        } else {
            query.setQuery("*:*");
        }
        
        query.setStart((page - 1) * size);
        query.setRows(size);
        query.addSort("uc_seq", SolrQuery.ORDER.asc);

        QueryResponse response = solrClient.query(CORE_NAME, query);
        SolrDocumentList results = response.getResults();

        List<Map<String, Object>> items = new ArrayList<>();
        for (SolrDocument doc : results) {
            Map<String, Object> item = new HashMap<>();
            doc.forEach((key, value) -> item.put(key, value));
            items.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", results.getNumFound());
        result.put("page", page);
        result.put("size", size);

        return result;
    }
}
