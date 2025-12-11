package com.boot.Tour.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.boot.Tour.dto.TourDTO;
import java.util.List;

@Mapper
public interface TourDAO {
    // 1. 전체 데이터 가져오기 (Solr 데이터 이관용 등으로 사용)
    List<TourDTO> selectAllSpots();

    // 2. 상세 정보 조회 (상세 페이지용 - DB에서 가져옴)
    TourDTO selectSpotById(@Param("id") Long id);

    // 3. 조회수 증가
    void updateViewCount(@Param("id") Long id);
}