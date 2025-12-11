package com.boot.Tour.service;

import com.boot.Tour.dto.TourDTO;
import java.util.List;

public interface TourService {
    List<TourDTO> getTourSpotList(String keyword); // 목록/검색
    TourDTO getTourSpotById(Long id);              // 상세 조회
    void increaseViewCount(Long id);               // 조회수
}