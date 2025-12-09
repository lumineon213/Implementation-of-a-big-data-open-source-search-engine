package com.boot.Tour.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.Tour.dto.TourDTO;

import java.util.List;

@Mapper
public interface TourDAO {
    // 1 전체 목록 조회
    List<TourDTO> selectAllSpots();

    // 2. 검색어로 조회
    List<TourDTO> selectSpotsByKeyword(@Param("keyword") String keyword);
    
 // 인터페이스에 추가
    TourDTO selectSpotById(@Param("id") Long id);
    void updateViewCount(@Param("id") Long id);
}