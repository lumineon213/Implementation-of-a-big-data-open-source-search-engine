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
     *
     * 요청 JSON: CourseCreateRequestDto
     * 응답: 생성된 courseId
     */
    @PostMapping
    public ResponseEntity<Long> createCourse(
            @RequestBody CourseCreateRequestDto request,
            @RequestParam("accountId") String accountId
    ) {
        Long id = courseService.createCourse(request, accountId);
        return ResponseEntity.ok(id);
    }


    /**
     * 2) 코스 상세 조회
     * GET /api/course/{courseId}
     *
     * 응답 JSON: CourseDetailResponseDto (Solr 데이터 포함)
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetailResponseDto> getCourseDetail(
            @PathVariable Long courseId
    ) {
        CourseDetailResponseDto dto = courseService.getCourseDetail(courseId);
        return ResponseEntity.ok(dto);
    }


    /**
     * 3) 특정 유저의 코스 목록 조회
     * GET /api/course/user/{accountId}
     *
     * 응답 JSON: [CourseDetailResponseDto, ...]
     * (목록이지만 스팟 Solr 데이터도 포함)
     */
    @GetMapping("/user/{accountId}")
    public ResponseEntity<List<CourseDetailResponseDto>> getUserCourses(
            @PathVariable String accountId
    ) {
        List<CourseDetailResponseDto> list = courseService.getUserCourseList(accountId);
        return ResponseEntity.ok(list);
    }


    /**
     * 4) 코스 삭제
     * DELETE /api/course/{courseId}
     *
     * 응답: 204 No Content
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long courseId
    ) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

}
