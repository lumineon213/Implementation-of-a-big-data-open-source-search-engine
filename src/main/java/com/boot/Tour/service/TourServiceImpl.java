package com.boot.Tour.service;

import com.boot.Tour.dao.TourDAO;
import com.boot.Tour.dto.TourDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TourServiceImpl implements TourService {

    @Autowired
    private TourDAO tourDAO;

    @Override
    public List<TourDTO> getTourSpotList(String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return tourDAO.selectSpotsByKeyword(keyword);
        } else {
            return tourDAO.selectAllSpots();
        }
    }
 // 구현체 클래스 안에 추가.
    @Override
    public TourDTO getTourSpotById(Long id) {
        return tourDAO.selectSpotById(id);
    }

    @Override
    public void increaseViewCount(Long id) {
        tourDAO.updateViewCount(id);
    }
}