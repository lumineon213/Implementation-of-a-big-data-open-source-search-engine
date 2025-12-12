package com.boot.course.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseSpot {

    private Long spotId;
    private Long courseId;

    private int orderIndex;
    private String placeId;
    private String placeType;

    private LocalDateTime createdAt;
}
