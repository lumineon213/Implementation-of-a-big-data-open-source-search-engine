package com.boot.Tour.dto;

import lombok.Data;
import java.util.Date;

@Data
public class TourDTO {
    private Long spotId;        // spot_id (PK)
    private String title;       // title
    private String address;     // address
    private String description; // description
    private String imageUrl;    // image_url
    private int viewCount;      // view_count
    private Date createdAt;     // created_at
    private int themeId;        // theme_id
}