package com.boot.Review.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

/**
 * Review DTO
 * Controller ↔ Service 간 데이터 전달용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    
    // 기본 정보
    private Long reviewId;
    private String accountId;
    private String accountName;
    private String placeId;
    private String placeName; // 장소 이름 (조회용)
    private String placeType;
    private String content;
    private Date createdAt;
    private Date updatedAt;
    
    // 이미지 관련
    private List<String> images;
    
    // 추가 정보
    private Boolean isOwner; // 현재 사용자가 작성자인지 (Boolean으로 변경하여 null 허용)
    
    // 페이징/검색용
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortOrder;
}
