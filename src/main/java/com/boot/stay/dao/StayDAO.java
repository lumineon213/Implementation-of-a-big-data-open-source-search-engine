package com.boot.stay.dao;

import org.apache.ibatis.annotations.Mapper;
import java.util.Map;

@Mapper
public interface StayDAO {
	Map<String, Object> selectStayDetailById(String id);
	
	int increaseDbViewCount(String id);
}
