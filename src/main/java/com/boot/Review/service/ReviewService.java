package com.boot.Review.service;

import org.springframework.web.multipart.MultipartFile;

import com.boot.Review.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {
    
    /**
     * 리뷰 작성
     */
    ReviewDTO createReview(String placeId, String placeType, String content, 
                          List<MultipartFile> images, String accountId);
    
    /**
     * 리뷰 수정
     */
    ReviewDTO updateReview(Long reviewId, String content, String accountId);
    
    /**
     * 리뷰 삭제
     */
    void deleteReview(Long reviewId, String accountId);
    
    /**
     * 리뷰 단건 조회
     */
    ReviewDTO getReviewById(Long reviewId, String currentAccountId);
    
    /**
     * 특정 장소의 리뷰 목록 조회
     */
    List<ReviewDTO> getReviewsByPlaceId(String placeId, String currentAccountId);
    
    /**
     * 특정 사용자의 리뷰 목록 조회
     */
    List<ReviewDTO> getReviewsByAccountId(String accountId, String currentAccountId);
    
    /**
     * 리뷰 검색 (페이징)
     */
    List<ReviewDTO> searchReviews(String placeId, String accountId, String placeType,
                                 Integer page, Integer size, String sortBy, String sortOrder,
                                 String currentAccountId);
    
    /**
     * 특정 장소의 리뷰 개수 조회
     */
    int getReviewCountByPlaceId(String placeId);
}