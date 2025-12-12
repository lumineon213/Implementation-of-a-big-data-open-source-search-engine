package com.boot.parking.service;


import java.util.List;

import com.boot.parking.dto.ParkingDTO;

public interface ParkingService {
    // 1. 공공데이터 API를 호출해서 Solr에 저장하는 기능
    String saveParkingDataToSolr();

    // 2. Solr에 저장된 데이터를 검색/조회하는 기능
    List<ParkingDTO.Item> searchParkingFromSolr(String keyword);
}