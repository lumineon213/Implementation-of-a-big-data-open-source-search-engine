package com.boot.Tour.dto;

import lombok.Data;
import java.util.Date;

@Data
public class TourDTO {
    private Long spotId;
    private String title;
    private String address;
    private String description;
    private String imageUrl;
    private int viewCount;
    private Date createdAt;
    private int themeId;

    private String latitude;   // 위도
    private String longitude;  // 경도
    private String tel;        // 전화번호
    private String homepage;   // 홈페이지
}