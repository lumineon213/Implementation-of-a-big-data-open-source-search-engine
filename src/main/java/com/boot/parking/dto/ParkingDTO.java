package com.boot.parking.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) // 매핑되지 않은 불필요한 필드는 무시
public class ParkingDTO {

    // 1. 최상위 껍데기
    private Response response;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {
        private Body body;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Body {
        private Items items;
        private int totalCount; // 총 데이터 개수
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Items {
        private List<Item> item; // 실제 주차장 리스트
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item {
        
        // ★ Solr ID로 사용할 고유번호
        @JsonAlias("mgntNum") 
        private String mgntNum;

        // 주차장명
        @JsonAlias("pkNam")       
        private String name;

        // 도로명 주소
        @JsonAlias("doroAddr")    
        private String address;

        // 지번 주소 (도로명 주소가 없을 경우 대비)
        @JsonAlias("jibunAddr")   
        private String jibunAddress;

        // 전화번호
        @JsonAlias("tponNum")     
        private String tel;

        // 주차장 유형 (노상/노외)
        @JsonAlias("pkFm")        
        private String type;

        // 주차 구획수 (전체 주차면수)
        @JsonAlias("pkCnt")       
        private int capacity;

        // 주차 기본 요금 (10분 기준 등)
        @JsonAlias("tenMin")      
        private String basicFee;

        // 1일 주차권 요금
        @JsonAlias("ftDay")
        private String dayFee;

        // 월 정기권 요금
        @JsonAlias("ftMon")
        private String monthFee;

        // 운영 시작 시간
        @JsonAlias("svcSrtTe")    
        private String openTime;

        // 운영 종료 시간
        @JsonAlias("svcEndTe")    
        private String closeTime;

        // 토요일 운영 시작 시간
        @JsonAlias("satSrtTe")
        private String satOpenTime;

        // 토요일 운영 종료 시간
        @JsonAlias("satEndTe")
        private String satCloseTime;

        // 공휴일 운영 시작 시간
        @JsonAlias("hldSrtTe")
        private String holidayOpenTime;

        // 공휴일 운영 종료 시간
        @JsonAlias("hldEndTe")
        private String holidayCloseTime;

        // ★ 위도 (제공된 데이터 기준 35.xxx)
        // 만약 지도 위치가 이상하면 yCdnt와 바꿔야 함
        @JsonAlias("xCdnt") 
        private String latitude;  

        // ★ 경도 (제공된 데이터 기준 128.xxx)
        @JsonAlias("yCdnt")
        private String longitude; 

        // 결제 방법 (현금/카드 등)
        @JsonAlias("payMtd")
        private String payMethod;

        // 특기사항 (할인 정보 등)
        @JsonAlias("spclNote")
        private String specialNote;

        // 실시간 주차 가능한 면수 (API가 제공할 경우)
        @JsonAlias("currava")     
        private String currentParking;
    }
}