package com.boot.news.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.news.dto.NewsResponseDTO;
import com.boot.news.service.NewsService;

@RestController
@RequestMapping("/api/naver/news")
public class NewsController {
	@Autowired
    private NewsService newsService; // NewsService 의존성 주입

    @GetMapping
    public NewsResponseDTO getNews(
            @RequestParam(value = "query", defaultValue = "") String query, 
            @RequestParam(value = "display", defaultValue = "10") int display,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "sort", defaultValue = "date") String sort
    ) {
        System.out.println(">>> [Controller] 요청된 검색어: " + query + ", 페이지: " + page);
        return newsService.searchNews(query, display, page, sort);
    }
}
