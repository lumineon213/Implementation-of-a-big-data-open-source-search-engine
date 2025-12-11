package com.boot.themeApi.service;

import java.util.Map;

public interface ThemeService {
	String syncThemeData() throws Exception;
	Map<String, Object> searchTheme(String keyword, int page, int size) throws Exception;
	Map<String, Object> getById(String id) throws Exception;
}
