package com.boot.walkApi.service;

import java.util.List;
import java.util.Map;

public interface WalkService {
    String syncWalkData() throws Exception;
    List<Map<String, Object>> searchWalk(String keyword) throws Exception;
}
