package com.boot.course.dao;

import com.boot.course.entity.Course;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CourseDAO {

    int insertCourse(Course course);

    Course selectCourseById(Long courseId);

    List<Course> selectCoursesByAccountId(String accountId);

    int deleteCourse(Long courseId);
    
    int updateCourse(Course course);

}
