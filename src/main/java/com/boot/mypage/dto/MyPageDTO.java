package com.boot.mypage.dto;

import lombok.Data;

@Data
public class MyPageDTO {
    private String accountId;
    private String accountName;
    private String email;
    private String phoneNumber;
    private String accountRole;
    private String regDate;
}
