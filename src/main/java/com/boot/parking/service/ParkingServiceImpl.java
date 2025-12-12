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
import org.springframework.web.util.UriComponentsBuilder;

import com.boot.parking.dto.ParkingDTO;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class ParkingServiceImpl implements ParkingService {

    @Autowired
    private SolrClient solrClient;

    // secret.properties에 있는 키 (Decoding된 키를 권장하지만, Encoding된 키라면 아래 주석 참고)
    @Value("${busan.parking.api.key}") 
    private String serviceKey;

    private final String API_URL = "http://apis.data.go.kr/6260000/BusanPblcPrkngInfoService/getPblcPrkngInfo";
    private final String CORE_NAME = "parking_core"; // Solr 코어 이름 상수화

    // 1. 데이터 가져와서 Solr에 저장
    @Override
    public String saveParkingDataToSolr() {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // [핵심 1] URI 생성 (공공데이터 포털 인코딩 문제 해결)
            // numOfRows를 크게(3000) 설정하여 한 번에 모든 데이터를 가져옵니다.
            URI uri = UriComponentsBuilder.fromHttpUrl(API_URL)
                    .queryParam("serviceKey", serviceKey) 
                    .queryParam("numOfRows", "3000") // 10개 대신 전체 데이터를 위해 3000개 요청
                    .queryParam("pageNo", "1")
                    .queryParam("resultType", "json") // JSON 요청 필수
                    .build(true) // true: 인코딩 된 상태로 빌드 (키가 이미 인코딩된 경우 이중 인코딩 방지)
                    .toUri();

            System.out.println("🚗 데이터 요청 URL: " + uri.toString());

            ParkingDTO response = restTemplate.getForObject(uri, ParkingDTO.class);

            if (response == null || response.getResponse() == null || 
                response.getResponse().getBody() == null || 
                response.getResponse().getBody().getItems() == null) {
                return "실패: 데이터를 가져오지 못했습니다. (API 키 혹은 URL 확인 필요)";
            }

            List<ParkingDTO.Item> items = response.getResponse().getBody().getItems().getItem();
            
            // 데이터가 없거나 null인 경우 방지
            if (items == null) {
                return "실패: 가져온 데이터 목록이 비어있습니다.";
            }
            
            int successCount = 0;

            for (ParkingDTO.Item item : items) {
                
                // [핵심 2] 좌표 유효성 검사
                if (!isValidCoordinate(item.getLatitude()) || !isValidCoordinate(item.getLongitude())) {
                    continue; 
                }

                SolrInputDocument doc = new SolrInputDocument();

                // [핵심 3] 주소 보정
                String realAddress = item.getAddress();
                if (realAddress == null || realAddress.equals("-") || realAddress.trim().isEmpty()) {
                    realAddress = item.getJibunAddress();
                }

                // [핵심 4] 요금 보정
                String realFee = item.getBasicFee();
                if (realFee == null || realFee.equals("-") || realFee.trim().isEmpty()) {
                    realFee = "0";
                }

                // Solr 필드 매핑
                doc.addField("id", "parking_" + item.getMgntNum());
                doc.addField("title", item.getName());
                doc.addField("address", realAddress); 
                doc.addField("tel", getSafeString(item.getTel()));   
                doc.addField("fee_basic", realFee);   
                doc.addField("type", item.getType());
                doc.addField("lat", item.getLatitude());  
                doc.addField("lng", item.getLongitude());
                doc.addField("category", "parking"); 

                // 명시적으로 코어 이름 지정하여 추가
                solrClient.add(CORE_NAME, doc);
                successCount++;
            }

            // [오타 수정] parking_cor -> parking_core
            solrClient.commit(CORE_NAME);
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
                query.setQuery("*:*"); // 전체 검색
                query.addFilterQuery("category:parking");
            } else {
                // 제목이나 주소에 키워드가 포함된 경우
                query.setQuery("(title:*" + keyword + "* OR address:*" + keyword + "*) AND category:parking");
            }
            query.setRows(100);

            // [수정] "Search" -> CORE_NAME ("parking_core")
            QueryResponse response = solrClient.query(CORE_NAME, query);
            SolrDocumentList results = response.getResults();

            for (SolrDocument doc : results) {
                ParkingDTO.Item item = new ParkingDTO.Item();
                
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

    private String getSafeString(Object obj) {
        if (obj == null) return "-";
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            return list.isEmpty() ? "-" : list.get(0).toString();
        }
        return obj.toString();
    }
}