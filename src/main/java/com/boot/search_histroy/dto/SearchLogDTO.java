package com.boot.search_histroy.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class SearchLogDTO {
	private Long logId;
    private String accountId;
    private String keyword;
    private Date searchDate;
}
