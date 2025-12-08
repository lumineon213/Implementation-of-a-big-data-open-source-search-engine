package com.boot.festivalApi.service;

import java.util.Map;

public interface FestivalService {
    String syncFestivalData() throws Exception;

    Map<String, Object> searchFestival(String keyword, int page, int size) throws Exception;

    Map<String, Object> getFestivalDetail(String id) throws Exception;
}
