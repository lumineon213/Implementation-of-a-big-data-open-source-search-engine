package com.boot.Admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 관리자 - 문의 관리용 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminInquiryDTO {
    private Long inquiryId;
    private String writerId;
    private String writerName;
    private String title;
    private String content;
    private String answerContent;
    private String answererId;
    private String answererName;
    private String status; // PENDING, ANSWERED
    private Date createdDate;
    private Date answeredDate;
}



