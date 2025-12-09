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

    @GetMapping("/search")
    public List<TourDTO> search(@RequestParam(value = "keyword", required = false) String keyword) {
        System.out.println("요청 받은 검색어: " + keyword);
        return tourService.getTourSpotList(keyword);
    }
 // 1 상세 정보 조회
    @GetMapping("/theme/{id}")
    public TourDTO getTourDetail(@PathVariable("id") Long id) {
        System.out.println("상세 조회 요청 ID: " + id);
        return tourService.getTourSpotById(id);
    }

    // 2. 조회수 증가
    @GetMapping("/theme/view/{id}")
    public void increaseViewCount(@PathVariable("id") Long id) {
        System.out.println("조회수 증가 요청 ID: " + id);
        tourService.increaseViewCount(id);
    }
}
