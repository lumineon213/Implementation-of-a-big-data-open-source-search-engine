package com.boot.Tour.service;

import com.boot.Tour.dto.TourDTO;
import java.util.List;

public interface TourService {
	//
    List<TourDTO> getTourSpotList(String keyword);
    TourDTO getTourSpotById(Long id);
    void increaseViewCount(Long id);
}