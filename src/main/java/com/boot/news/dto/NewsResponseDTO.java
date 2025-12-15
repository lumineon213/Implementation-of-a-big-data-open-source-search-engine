package com.boot.news.dto;

import lombok.Data;
import java.util.List;

@Data
public class NewsResponseDTO {
	private String lastBuildDate;
    private int total;
    private int start;
    private int display;
    private List<NewsDTO> items; // 뉴스 아이템 목록
}
