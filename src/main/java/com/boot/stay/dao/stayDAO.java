package com.boot.stay.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.stay.dto.stayDTO;


@Mapper
public interface stayDAO {
	stayDTO selectStayDetailById(@Param("id") String id);	
	
	int increaseDbViewCount(String id);
	
	List<stayDTO> selectAllStayDataForSync();
}
