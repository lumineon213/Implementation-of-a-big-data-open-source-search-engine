package com.boot.marineApi.service;

import java.util.Map;

public interface MarineService {
    String syncMarineData() throws Exception;
    Map<String, Object> searchMarine(String keyword, int page, int size) throws Exception;
}
