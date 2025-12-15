package com.boot.course.dto;

import lombok.Data;
import java.util.List;

@Data
public class CourseCreateRequestDto {
    private String title;
    private String description;
    private String isPublic;
    private String tags;

    private List<CourseSpotRequestDto> spots;
}
