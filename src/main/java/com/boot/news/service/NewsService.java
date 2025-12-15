package com.boot.news.service;

import com.boot.news.dto.NewsResponseDTO;

public interface NewsService {
	NewsResponseDTO searchNews(String query, int display, int page, String sort);
}
