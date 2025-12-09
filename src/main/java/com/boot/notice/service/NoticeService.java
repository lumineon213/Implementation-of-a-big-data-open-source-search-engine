package com.boot.notice.service;

import java.util.List;

import com.boot.notice.dto.NoticeDTO;

public interface NoticeService {

    List<NoticeDTO> getAllNotices();

    NoticeDTO getNotice(Long noticeId);

    void saveNotice(NoticeDTO notice);

    void deleteNotice(Long noticeId);
}
