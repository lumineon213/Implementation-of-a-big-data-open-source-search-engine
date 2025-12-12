package com.boot.parking.service;



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

import com.boot.parking.dto.ParkingDTO;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class ParkingServiceImpl implements ParkingService {

    @Autowired
    private SolrClient solrClient;

    @Value("${busan.parking.api.key}") 
    private String serviceKey;

    private final String API_URL = "http://apis.data.go.kr/6260000/BusanPblcPrkngInfoService/getPblcPrkngInfo";

    // 1. 데이터 가져와서 Solr에 저장
    @Override
    public String saveParkingDataToSolr() {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // [핵심 1] 401 오류 방지: URL 문자열 직접 조립
            String urlString = API_URL + "?serviceKey=" + serviceKey 
                             + "&numOfRows=3000&pageNo=1&resultType=json";
            
            URI uri = new URI(urlString);
            System.out.println("🚗 데이터 요청 URL: " + uri.toString());

            ParkingDTO response = restTemplate.getForObject(uri, ParkingDTO.class);

            if (response == null || response.getResponse() == null || 
                response.getResponse().getBody() == null || 
                response.getResponse().getBody().getItems() == null) {
                return "실패: 데이터를 가져오지 못했습니다.";
            }

            List<ParkingDTO.Item> items = response.getResponse().getBody().getItems().getItem();
            int successCount = 0;

            for (ParkingDTO.Item item : items) {
                
                // [핵심 2] 좌표가 이상하면(- 또는 빈값) 저장하지 않고 건너뜀
                if (!isValidCoordinate(item.getLatitude()) || !isValidCoordinate(item.getLongitude())) {
                    continue; 
                }

                SolrInputDocument doc = new SolrInputDocument();

                // [핵심 3] 주소 보정: 도로명주소가 '-'면 지번주소 사용
                String realAddress = item.getAddress();
                if (realAddress == null || realAddress.equals("-") || realAddress.trim().isEmpty()) {
                    realAddress = item.getJibunAddress();
                }

                // [핵심 4] 요금 보정: 요금이 '-'면 '0'으로 변경 (숫자 에러 방지)
                String realFee = item.getBasicFee();
                if (realFee == null || realFee.equals("-") || realFee.trim().isEmpty()) {
                    realFee = "0";
                }

                // Solr 필드 매핑
                doc.addField("id", "parking_" + item.getMgntNum());
                doc.addField("title", item.getName());
                doc.addField("address", realAddress); // 보정된 주소
                
                // 전화번호가 '-'여도 string 필드라면 그대로 넣어도 무방 (필요시 빈값 처리 가능)
                doc.addField("tel", item.getTel());   
                
                doc.addField("fee_basic", realFee);   // 보정된 요금 ("0")
                doc.addField("type", item.getType());
                doc.addField("lat", item.getLatitude());  
                doc.addField("lng", item.getLongitude());
                doc.addField("category", "parking"); 

                solrClient.add("parking_core", doc);
                successCount++;
            }

            solrClient.commit("parking_cor");
            return "성공! 총 " + successCount + "건의 주차장 데이터가 저장되었습니다.";

        } catch (Exception e) {
            e.printStackTrace();
            return "실패: " + e.getMessage();
        }
    }

    // 2. 검색
    @Override
    public List<ParkingDTO.Item> searchParkingFromSolr(String keyword) {
        List<ParkingDTO.Item> list = new ArrayList<>();
        try {
            SolrQuery query = new SolrQuery();

            if (keyword == null || keyword.trim().isEmpty()) {
                query.setQuery("category:parking");
            } else {
                query.setQuery("(title:*" + keyword + "* OR address:*" + keyword + "*) AND category:parking");
            }
            query.setRows(100);

            QueryResponse response = solrClient.query("Search", query);
            SolrDocumentList results = response.getResults();

            for (SolrDocument doc : results) {
                ParkingDTO.Item item = new ParkingDTO.Item();
                
                // 안전하게 꺼내기 헬퍼 사용
                item.setMgntNum(getSafeString(doc.getFieldValue("id")).replace("parking_", ""));
                item.setName(getSafeString(doc.getFieldValue("title")));
                item.setAddress(getSafeString(doc.getFieldValue("address")));
                item.setTel(getSafeString(doc.getFieldValue("tel")));
                item.setBasicFee(getSafeString(doc.getFieldValue("fee_basic")));
                item.setLatitude(getSafeString(doc.getFieldValue("lat")));
                item.setLongitude(getSafeString(doc.getFieldValue("lng")));
                item.setType(getSafeString(doc.getFieldValue("type")));
                
                list.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    // --- 헬퍼 메소드 ---

    // 좌표 유효성 검사
    private boolean isValidCoordinate(String coord) {
        if (coord == null || coord.trim().isEmpty() || coord.equals("-")) {
            return false;
        }
        try {
            double d = Double.parseDouble(coord);
            return d != 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    // Solr 데이터 안전 변환
    private String getSafeString(Object obj) {
        if (obj == null) return "-";
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            return list.isEmpty() ? "-" : list.get(0).toString();
        }
        return obj.toString();
    }
}