package com.boot.dto;

import lombok.Data;

@Data
public class FavoriteDTO {
    private int favId;          // 즐겨찾기 고유 번호 (PK)
    private String accountId;   // 유저 아이디
    private Integer newsId;     // 뉴스 번호 (없으면 null)
    private Integer travelId;   // 관광지 번호 (없으면 null)
    private String regDate;     // 등록일
    
    private String title;       // 제목
    private String date;        // 날짜
    private String type;        // 'NEWS' 또는 'TRAVEL'
}