package com.boot.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.dao.NoticeDAO;
import com.boot.dto.NoticeDTO;

@Service
public class NoticeServiceImpl implements NoticeService {

    @Autowired
    private NoticeDAO noticeDAO;

    @Override
    public List<NoticeDTO> getAllNotices() {
        return noticeDAO.findAllNotices();
    }

    @Override
    public NoticeDTO getNotice(Long noticeId) {
        return noticeDAO.findById(noticeId);
    }

    @Override
    public void saveNotice(NoticeDTO notice) {
        noticeDAO.insertNotice(notice);
    }

    @Override
    public void deleteNotice(Long noticeId) {
        noticeDAO.deleteNotice(noticeId);
    }
}
