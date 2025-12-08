package com.boot.service;

import java.util.List;

import com.boot.dto.NoticeDTO;

public interface NoticeService {

    List<NoticeDTO> getAllNotices();

    NoticeDTO getNotice(Long noticeId);

    void saveNotice(NoticeDTO notice);

    void deleteNotice(Long noticeId);
}
