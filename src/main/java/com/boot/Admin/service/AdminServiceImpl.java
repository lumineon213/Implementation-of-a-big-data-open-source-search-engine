package com.boot.Admin.service;

import com.boot.Admin.dao.AdminDAO;
import com.boot.Admin.dto.*;
import com.boot.Review.dao.ReviewDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final AdminDAO adminDAO;
    private final ReviewDAO reviewDAO;

    // ============== 회원 관리 ==============
    @Override
    @Transactional(readOnly = true)
    public List<AdminUserDTO> getAllUsers(int page, int size, String search) {
        return adminDAO.selectAllUsers(page, size, search);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDTO getUserById(String accountId) {
        return adminDAO.selectUserById(accountId);
    }

    @Override
    @Transactional
    public void updateUserRole(String accountId, String role) {
        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("유효하지 않은 역할입니다: " + role);
        }
        adminDAO.updateUserRole(accountId, role);
        log.info("회원 권한 변경: accountId={}, role={}", accountId, role);
    }

    @Override
    @Transactional
    public void deleteUser(String accountId) {
        adminDAO.deleteUser(accountId);
        log.info("회원 강제 탈퇴: accountId={}", accountId);
    }

    @Override
    @Transactional(readOnly = true)
    public int countUsers(String search) {
        return adminDAO.countUsers(search);
    }

    // ============== 리뷰 관리 ==============
    @Override
    @Transactional(readOnly = true)
    public List<AdminReviewDTO> getAllReviews(int page, int size, String search) {
        List<AdminReviewDTO> reviews = adminDAO.selectAllReviews(page, size, search);
        // 각 리뷰의 이미지 목록 추가
        for (AdminReviewDTO review : reviews) {
            List<String> images = reviewDAO.selectReviewImagesByReviewId(review.getReviewId());
            review.setImages(images);
        }
        return reviews;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminReviewDTO getReviewById(Long reviewId) {
        AdminReviewDTO review = adminDAO.selectReviewById(reviewId);
        if (review != null) {
            List<String> images = reviewDAO.selectReviewImagesByReviewId(reviewId);
            review.setImages(images);
        }
        return review;
    }

    @Override
    @Transactional
    public void updateReviewStatus(Long reviewId, String status) {
        adminDAO.updateReviewStatus(reviewId, status);
        log.info("리뷰 상태 변경: reviewId={}, status={}", reviewId, status);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        adminDAO.deleteReview(reviewId);
        log.info("리뷰 삭제: reviewId={}", reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public int countReviews(String search) {
        return adminDAO.countReviews(search);
    }

    // ============== 통계 ==============
    @Override
    @Transactional(readOnly = true)
    public AdminStatisticsDTO getStatistics() {
        Map<String, Object> stats = adminDAO.selectStatistics();
        
        return AdminStatisticsDTO.builder()
                .totalUsers(((Number) stats.get("TOTAL_USERS")).longValue())
                .totalReviews(((Number) stats.get("TOTAL_REVIEWS")).longValue())
                .totalEvents(((Number) stats.get("TOTAL_EVENTS")).longValue())
                .todayNewUsers(((Number) stats.get("TODAY_NEW_USERS")).longValue())
                .todayNewReviews(((Number) stats.get("TODAY_NEW_REVIEWS")).longValue())
                .activeUsers(((Number) stats.get("ACTIVE_USERS")).longValue())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDailyStatistics(int days) {
        return adminDAO.selectDailyStatistics(days);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopPlaces(int limit) {
        return adminDAO.selectTopPlaces(limit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopUsers(int limit) {
        return adminDAO.selectTopUsers(limit);
    }

    // ============== 신고 관리 ==============
    @Override
    @Transactional(readOnly = true)
    public List<AdminReportDTO> getAllReports(int page, int size, String status) {
        return adminDAO.selectAllReports(page, size, status);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminReportDTO getReportById(Long reportId) {
        return adminDAO.selectReportById(reportId);
    }

    @Override
    @Transactional
    public void processReport(Long reportId, String status, String processorId, String processNote) {
        adminDAO.updateReportStatus(reportId, status, processorId, processNote);
        log.info("신고 처리: reportId={}, status={}, processorId={}", reportId, status, processorId);
    }

    @Override
    @Transactional(readOnly = true)
    public int countReports(String status) {
        return adminDAO.countReports(status);
    }

    // ============== 문의 관리 ==============
    @Override
    @Transactional(readOnly = true)
    public List<AdminInquiryDTO> getAllInquiries(int page, int size, String status) {
        return adminDAO.selectAllInquiries(page, size, status);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminInquiryDTO getInquiryById(Long inquiryId) {
        return adminDAO.selectInquiryById(inquiryId);
    }

    @Override
    @Transactional
    public void answerInquiry(Long inquiryId, String answerContent, String answererId) {
        adminDAO.updateInquiryAnswer(inquiryId, answerContent, answererId);
        log.info("문의 답변: inquiryId={}, answererId={}", inquiryId, answererId);
    }

    @Override
    @Transactional(readOnly = true)
    public int countInquiries(String status) {
        return adminDAO.countInquiries(status);
    }

    // ============== 로그 관리 ==============
    @Override
    @Transactional(readOnly = true)
    public List<AdminLogDTO> getAllLogs(int page, int size, String accountId, String actionType) {
        return adminDAO.selectAllLogs(page, size, accountId, actionType);
    }

    @Override
    @Transactional
    public void insertLog(AdminLogDTO log) {
        adminDAO.insertLog(log);
    }

    @Override
    @Transactional(readOnly = true)
    public int countLogs(String accountId, String actionType) {
        return adminDAO.countLogs(accountId, actionType);
    }
}

