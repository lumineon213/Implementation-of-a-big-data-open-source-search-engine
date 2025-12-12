package com.boot.course.service;

import com.boot.course.dto.CourseCreateRequestDto;
import com.boot.course.dto.CourseDetailResponseDto;

import java.util.List;

public interface CourseService {

    Long createCourse(CourseCreateRequestDto request, String accountId);

    CourseDetailResponseDto getCourseDetail(Long courseId);

    List<CourseDetailResponseDto> getUserCourseList(String accountId);

    void deleteCourse(Long courseId);
}
