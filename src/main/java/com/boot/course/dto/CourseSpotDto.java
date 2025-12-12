package com.boot.course.dto;

import lombok.Data;

@Data
public class CourseSpotDto {
    private Integer orderIndex;
    private String placeId;
    private String placeType;

    // Solr 필드
    private String title;
    private String address;
    private Double latitude;
    private Double longitude;
    private String thumbnail;
    private String category;
}
