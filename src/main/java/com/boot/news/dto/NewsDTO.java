package com.boot.news.dto;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import lombok.Data;

@Data
public class NewsDTO {
	private String title;       
    private String originallink; 
    private String link;        
    private String description; 
    private String pubDate;
    
    public Date getParsedDate() {
        if (this.pubDate == null || this.pubDate.isEmpty()) {
            return null;
        }
        try {
            // Naver API 날짜 형식 (RFC 822): "EEE, dd MMM yyyy HH:mm:ss Z"
            SimpleDateFormat format = 
                new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss Z", Locale.ENGLISH);
            return format.parse(this.pubDate);
        } catch (Exception e) {
            // 파싱 오류 발생 시 null 반환
            System.err.println("날짜 파싱 오류 발생: " + this.pubDate);
            return null;
        }
    }
}
