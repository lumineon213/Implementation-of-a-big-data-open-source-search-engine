package com.boot.course.service;

import com.boot.course.dao.CourseDAO;
import com.boot.course.dao.CourseSpotDAO;
import com.boot.course.dto.*;
import com.boot.course.entity.Course;
import com.boot.course.entity.CourseSpot;
import com.boot.course.utils.SolrPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseDAO courseDAO;
    private final CourseSpotDAO courseSpotDAO;
    private final SolrPlaceService solrPlaceService; // ★ Solr 연동 유틸

    /**
     * 코스 생성
     * 1) COURSE_TBL에 코스 기본 정보 저장
     * 2) 생성된 COURSE_ID로 COURSE_SPOTS_TBL에 장소 목록 저장
     * 3) 둘 중 하나라도 실패하면 전체 rollback (Transactional)
     */
    @Transactional
    @Override
    public Long createCourse(CourseCreateRequestDto request, String accountId) {

        // ------------------------------
        // 1) 코스 메타 정보 DB 저장
        // ------------------------------
        Course course = new Course();
        course.setAccountId(accountId);
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setIsPublic(request.getIsPublic());
        course.setTags(request.getTags());
        course.setCreatedAt(LocalDateTime.now());

        courseDAO.insertCourse(course);

        // ※ MyBatis에서 keyProperty="courseId" 설정 시 자동으로 PK가 바인딩됨
        Long courseId = course.getCourseId();
        
        // ------------------------------
        // 2) 스팟 목록 저장 (코스 상세 장소)
        // ------------------------------
        for (CourseSpotRequestDto s : request.getSpots()) {

            CourseSpot spot = new CourseSpot();
            spot.setCourseId(courseId);
            spot.setOrderIndex(s.getOrderIndex());
            spot.setPlaceId(s.getPlaceId());
            spot.setPlaceType(s.getPlaceType());
            spot.setCreatedAt(LocalDateTime.now());

            courseSpotDAO.insertCourseSpot(spot);
        }

        
        return courseId; // 프론트에서 "코스 상세로 이동" 시 필요
    }


    /**
     * 코스 상세 조회
     * ★ 중요: DB 정보 + Solr 정보 → 하나의 DTO로 합치는 작업
     */
    @Override
    public CourseDetailResponseDto getCourseDetail(Long courseId) {

        // ------------------------------
        // 1) 코스 메타 정보 조회 (DB)
        // ------------------------------
        Course course = courseDAO.selectCourseById(courseId);

        // ------------------------------
        // 2) 코스에 포함된 장소 리스트 조회 (DB)
        // ------------------------------
        List<CourseSpot> spots = courseSpotDAO.selectSpotsByCourseId(courseId);

        // ------------------------------
        // 3) 응답 DTO 생성
        // ------------------------------
        CourseDetailResponseDto dto = new CourseDetailResponseDto();
        dto.setCourseId(course.getCourseId());
        dto.setAccountId(course.getAccountId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setIsPublic(course.getIsPublic());
        dto.setTags(course.getTags());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setUpdatedAt(course.getUpdatedAt());

        List<CourseSpotDto> spotDtoList = new ArrayList<>();

        // ------------------------------
        // 4) 각 스팟의 Solr 문서 조회 + DTO 조합
        // ------------------------------
        for (CourseSpot spot : spots) {

            CourseSpotDto csd = new CourseSpotDto();
            csd.setOrderIndex(spot.getOrderIndex());
            csd.setPlaceId(spot.getPlaceId());
            csd.setPlaceType(spot.getPlaceType());

            // ★ Solr 조회: DB에는 PLACE_ID만 저장되어 있으므로
            //    Solr에서 title/lat/lng/thumbnail 등을 가져와 합쳐서 반환해야 한다.
            var place = solrPlaceService.getPlaceById(
                    spot.getPlaceId(),
                    spot.getPlaceType()
            );
            
         // ✅ 디버그 로그 추가 (명소만 터지는지 확인)
            if ("(정보 없음)".equals(place.get("title"))) {
                System.out.println("[SOLR FAIL] courseId=" + courseId
                    + " type=" + spot.getPlaceType()
                    + " id=" + spot.getPlaceId()
                    + " reason=" + place.get("_reason"));
            } else {
                // 필요하면 성공 케이스도 한 번 찍기
                System.out.println("[SOLR OK] type=" + spot.getPlaceType()
                    + " id=" + spot.getPlaceId()
                    + " title=" + place.get("title"));
            }

            // Solr 필드 매핑
            csd.setTitle((String) place.get("title"));
            csd.setAddress((String) place.get("address"));
            csd.setLatitude((Double) place.get("latitude"));
            csd.setLongitude((Double) place.get("longitude"));
            csd.setThumbnail((String) place.get("thumbnail"));
            csd.setCategory((String) place.get("category"));

            spotDtoList.add(csd);
        }

        dto.setSpots(spotDtoList);
        return dto;
    }


    /**
     * 특정 유저가 만든 코스 목록 조회
     * 목록용이므로 Solr 조회는 하지 않음 (상세에서만 필요)
     */
    @Override
    public List<CourseDetailResponseDto> getUserCourseList(String accountId) {

        List<Course> courseList = courseDAO.selectCoursesByAccountId(accountId);
        List<CourseDetailResponseDto> dtoList = new ArrayList<>();

        for (Course c : courseList) {
            // 목록에서는 Solr까지 조합하면 비용 증가 → 상세 조회에서만 Solr 통합
            dtoList.add(getCourseDetail(c.getCourseId()));
        }

        return dtoList;
    }


    /**
     * 코스 삭제
     * 코스 → 스팟 순으로 삭제
     * ※ 스팟은 FK CASCADE 걸려 있어 자동 삭제 가능하나,
     *   DAO로 명시적으로 삭제해주는 방식도 유지보수상 안정적
     */
    @Transactional
    @Override
    public void deleteCourse(Long courseId) {
        courseSpotDAO.deleteSpotsByCourseId(courseId);
        courseDAO.deleteCourse(courseId);
    }
    
    @Transactional
    @Override
    public void updateCourse(Long courseId, CourseCreateRequestDto request, String accountId) {

        Course existing = courseDAO.selectCourseById(courseId);
        if (existing == null) throw new RuntimeException("코스가 존재하지 않습니다.");
        if (!existing.getAccountId().equals(accountId)) throw new RuntimeException("수정 권한이 없습니다.");

        // 1) COURSE_TBL 업데이트
        Course toUpdate = new Course();
        toUpdate.setCourseId(courseId);
        toUpdate.setTitle(request.getTitle());
        toUpdate.setDescription(request.getDescription());
        toUpdate.setIsPublic(request.getIsPublic());
        toUpdate.setTags(request.getTags());
        courseDAO.updateCourse(toUpdate);

        // ✅ 여기: spots null 방어 (for문 돌리기 전에)
        List<CourseSpotRequestDto> spots = request.getSpots();
        if (spots == null) spots = java.util.Collections.emptyList();

        // 2) 스팟은 단순하게: 전부 삭제 후 다시 insert
        courseSpotDAO.deleteSpotsByCourseId(courseId);

        for (CourseSpotRequestDto s : spots) {
            CourseSpot spot = new CourseSpot();
            spot.setCourseId(courseId);
            spot.setOrderIndex(s.getOrderIndex());
            spot.setPlaceId(s.getPlaceId());
            spot.setPlaceType(s.getPlaceType());
            courseSpotDAO.insertCourseSpot(spot);
        }
    }

}
