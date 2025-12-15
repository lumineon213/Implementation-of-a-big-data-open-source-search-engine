package com.boot.course.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class CourseDetailResponseDto {
    private Long courseId;
    private String accountId;
    private String title;
    private String description;
    private String isPublic;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<CourseSpotDto> spots;
}
