package com.boot.Tour.controller;

import com.boot.Tour.dto.TourDTO;
import com.boot.Tour.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // 리액트 주소 허용
public class TourController {

    @Autowired
    private TourService tourService;

    // 1. 검색 (Solr 사용)
    @GetMapping("/search")
    public List<TourDTO> search(@RequestParam(value = "keyword", required = false) String keyword) {
        System.out.println("🔍 Solr 검색 요청: " + keyword);
        return tourService.getTourSpotList(keyword);
    }

    // 2. 상세 정보 조회 (DB 사용)
    @GetMapping("/tour/{id}")
    public TourDTO getTourDetail(@PathVariable("id") Long id) {
        System.out.println("📄 상세 조회 요청 ID: " + id);
        return tourService.getTourSpotById(id);
    }

    // 3. 조회수 증가 (DB 사용)
    @GetMapping("/tour/view/{id}")
    public void increaseViewCount(@PathVariable("id") Long id) {
        System.out.println("👀 조회수 증가 요청 ID: " + id);
        tourService.increaseViewCount(id);
    }
}