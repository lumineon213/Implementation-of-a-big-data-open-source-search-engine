package com.boot.course.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Course {

    private Long courseId;
    private String accountId;

    private String title;
    private String description;
    private String isPublic;
    private String tags;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
