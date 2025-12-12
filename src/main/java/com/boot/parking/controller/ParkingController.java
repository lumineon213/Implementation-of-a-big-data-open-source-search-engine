package com.boot.parking.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.boot.parking.dto.ParkingDTO;
import com.boot.parking.service.ParkingService;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "http://localhost:5173")
public class ParkingController {

    @Autowired
    private ParkingService parkingService;

    // 1. [관리자용] 데이터 저장 실행 (DB/API -> Solr)
    // 브라우저에서: http://localhost:8484/api/parking/save-data
    @GetMapping("/save-data")
    public String saveToSolr() {
        return parkingService.saveParkingDataToSolr();
    }

    // 2. [사용자용] 주차장 검색 (Solr -> React)
    // 리액트에서: axios.get('http://localhost:8484/api/parking/search')
    @GetMapping("/search")
    public List<ParkingDTO.Item> searchParking(@RequestParam(value = "keyword", required = false) String keyword) {
        System.out.println("🚗 Solr 주차장 검색 요청: " + keyword);
        return parkingService.searchParkingFromSolr(keyword);
    }
}