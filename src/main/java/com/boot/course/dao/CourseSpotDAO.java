package com.boot.course.dao;

import com.boot.course.entity.CourseSpot;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CourseSpotDAO {

    int insertCourseSpot(CourseSpot spot);

    List<CourseSpot> selectSpotsByCourseId(Long courseId);

    int deleteSpotsByCourseId(Long courseId);
}
