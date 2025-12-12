package com.boot.Admin.service;

import com.boot.Admin.dto.*;

import java.util.List;
import java.util.Map;

public interface AdminService {
    // ============== 회원 관리 ==============
    List<AdminUserDTO> getAllUsers(int page, int size, String search);
    AdminUserDTO getUserById(String accountId);
    void updateUserRole(String accountId, String role);
    void deleteUser(String accountId);
    int countUsers(String search);
    
    // ============== 리뷰 관리 ==============
    List<AdminReviewDTO> getAllReviews(int page, int size, String search);
    AdminReviewDTO getReviewById(Long reviewId);
    void updateReviewStatus(Long reviewId, String status);
    void deleteReview(Long reviewId);
    int countReviews(String search);
    
    // ============== 통계 ==============
    AdminStatisticsDTO getStatistics();
    List<Map<String, Object>> getDailyStatistics(int days);
    List<Map<String, Object>> getTopPlaces(int limit);
    List<Map<String, Object>> getTopUsers(int limit);
    
    // ============== 신고 관리 ==============
    List<AdminReportDTO> getAllReports(int page, int size, String status);
    AdminReportDTO getReportById(Long reportId);
    void processReport(Long reportId, String status, String processorId, String processNote);
    int countReports(String status);
    
    // ============== 문의 관리 ==============
    List<AdminInquiryDTO> getAllInquiries(int page, int size, String status);
    AdminInquiryDTO getInquiryById(Long inquiryId);
    List<AdminInquiryDTO> getInquiriesByWriter(String writerId);
    void answerInquiry(Long inquiryId, String answerContent, String answererId);
    int countInquiries(String status);
    void createInquiry(String writerId, String title, String content);
    
    // ============== 로그 관리 ==============
    List<AdminLogDTO> getAllLogs(int page, int size, String accountId, String actionType);
    void insertLog(AdminLogDTO log);
    int countLogs(String accountId, String actionType);
}



