package com.boot.dto;

import java.util.Date;

import lombok.Data;

@Data
public class NoticeDTO {
    private Long noticeId;
    private String writerId;
    private String title;
    private String content;
    private Date createdDate;
    private Integer views;
}
