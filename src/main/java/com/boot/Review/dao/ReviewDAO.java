package com.boot.Review.dao;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.Review.dto.ReviewDTO;

import java.util.List;
import java.util.Map;

@Mapper
public interface ReviewDAO {
    
    
    /**
     * 리뷰 작성
     */
    int insertReview(ReviewDTO review);
    
    /**
     * 리뷰 수정
     */
    int updateReview(ReviewDTO review);
    
    /**
     * 리뷰 삭제
     */
    int deleteReview(@Param("reviewId") Long reviewId);
    
    /**
     * 리뷰 단건 조회
     */
    ReviewDTO selectReviewById(@Param("reviewId") Long reviewId);
    
    /**
     * 리뷰 작성자 확인
     */
    String selectReviewOwner(@Param("reviewId") Long reviewId);
    
    // ===== 리뷰 목록 조회 =====
    
    /**
     * 특정 장소의 리뷰 목록 조회 (이미지 포함)
     */
    List<ReviewDTO> selectReviewsByPlaceId(@Param("placeId") String placeId);
    
    /**
     * 특정 사용자의 리뷰 목록 조회 (이미지 포함)
     */
    List<ReviewDTO> selectReviewsByAccountId(@Param("accountId") String accountId);
    
    /**
     * 리뷰 검색 (페이징, 정렬)
     */
    List<ReviewDTO> selectReviewsWithPaging(@Param("params") Map<String, Object> params);
    
    /**
     * 리뷰 총 개수 (검색 조건 포함)
     */
    int countReviews(@Param("params") Map<String, Object> params);
    
    /**
     * 특정 장소의 리뷰 개수
     */
    int countReviewsByPlaceId(@Param("placeId") String placeId);
    
    // ===== 리뷰 이미지 =====
    
    /**
     * 리뷰 이미지 추가
     */
    int insertReviewImage(@Param("reviewId") Long reviewId, 
                          @Param("imageUrl") String imageUrl, 
                          @Param("imageOrder") Integer imageOrder);
    
    /**
     * 리뷰 이미지 목록 조회
     */
    List<String> selectReviewImagesByReviewId(@Param("reviewId") Long reviewId);
    
    /**
     * 리뷰 이미지 삭제 (리뷰 삭제 시 CASCADE로 자동 삭제되므로 필요시에만)
     */
    int deleteReviewImagesByReviewId(@Param("reviewId") Long reviewId);
}