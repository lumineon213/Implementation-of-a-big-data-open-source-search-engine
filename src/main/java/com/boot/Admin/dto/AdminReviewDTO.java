package com.boot.Admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

/**
 * 관리자 - 리뷰 관리용 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReviewDTO {
    private Long reviewId;
    private String accountId;
    private String accountName;
    private String placeId;
    private String placeType;
    private String placeName;
    private String content;
    private List<String> images;
    private Date createdAt;
    private Date updatedAt;
    private String status; // ACTIVE, BLINDED, DELETED
    private Integer reportCount; // 신고 횟수
}



