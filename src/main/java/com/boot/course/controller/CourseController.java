package com.boot.course.controller;

import com.boot.course.dto.CourseCreateRequestDto;
import com.boot.course.dto.CourseDetailResponseDto;
import com.boot.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/course")
public class CourseController {

    private final CourseService courseService;

    /**
     * 1) 코스 생성
     * POST /api/course?accountId=USER123
     */
    @PostMapping
    public ResponseEntity<Long> createCourse(
            @RequestBody CourseCreateRequestDto request,
            @RequestParam(value = "accountId") String accountId
    ) {
        Long id = courseService.createCourse(request, accountId);
        return ResponseEntity.ok(id);
    }

    /**
     * 2) 코스 상세 조회
     * GET /api/course/{courseId}
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetailResponseDto> getCourseDetail(
            @PathVariable(value = "courseId") Long courseId
    ) {
        CourseDetailResponseDto dto = courseService.getCourseDetail(courseId);
        return ResponseEntity.ok(dto);
    }

    /**
     * 3) 특정 유저의 코스 목록 조회
     * GET /api/course/user/{accountId}
     */
    @GetMapping("/user/{accountId}")
    public ResponseEntity<List<CourseDetailResponseDto>> getUserCourses(
            @PathVariable(value = "accountId") String accountId
    ) {
        List<CourseDetailResponseDto> list = courseService.getUserCourseList(accountId);
        return ResponseEntity.ok(list);
    }

    /**
     * 4) 코스 삭제
     * DELETE /api/course/{courseId}
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable(value = "courseId") Long courseId
    ) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 5) 코스 수정
     * PUT /api/course/{courseId}?accountId=USER123
     */
    @PutMapping("/{courseId}")
    public ResponseEntity<Void> updateCourse(
            @PathVariable(value = "courseId") Long courseId,
            @RequestBody CourseCreateRequestDto request,
            @RequestParam(value = "accountId") String accountId
    ) {
        courseService.updateCourse(courseId, request, accountId);
        return ResponseEntity.noContent().build();
    }
}
