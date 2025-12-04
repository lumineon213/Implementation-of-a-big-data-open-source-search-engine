package com.boot.foodApi.service;

import java.util.List;
import java.util.Map;

public interface foodService {
    public String syncFoodData() throws Exception;
    
    List<Map<String, Object>> searchFood(String keyword) throws Exception;
}
