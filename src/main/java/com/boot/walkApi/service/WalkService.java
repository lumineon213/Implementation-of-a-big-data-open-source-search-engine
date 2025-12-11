package com.boot.walkApi.service;

import java.util.Map;

public interface WalkService {
    String syncWalkData() throws Exception;
    Map<String, Object> searchWalk(String keyword, int page, int size) throws Exception;
    Map<String, Object> getById(String id) throws Exception;
}

