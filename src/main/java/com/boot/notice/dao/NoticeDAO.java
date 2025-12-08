package com.boot.notice.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.notice.dto.NoticeDTO;



@Mapper
public interface NoticeDAO {

    List<NoticeDTO> findAllNotices();

    NoticeDTO findById(@Param("noticeId") Long noticeId);

    void insertNotice(NoticeDTO notice);

    void deleteNotice(@Param("noticeId") Long noticeId);
}
