package com.boot.course.dto;

import lombok.Data;

@Data
public class CourseSpotRequestDto {
    private Integer orderIndex;
    private String placeId;
    private String placeType;
}
