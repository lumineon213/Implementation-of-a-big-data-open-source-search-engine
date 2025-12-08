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
}