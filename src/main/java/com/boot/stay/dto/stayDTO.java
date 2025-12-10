package com.boot.stay.dto;

import lombok.Data;

@Data
public class stayDTO {
	private String content_id;   
    private String title;         
    private String address;       
    private String firstimage;    
    private String overview;      
    private Double longitude;     
    private Double latitude;      
    private Integer view_count;   
}
