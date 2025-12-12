package com.boot.Admin.dao;

import com.boot.Admin.dto.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminDAO {
    // ============== 회원 관리 ==============
    List<AdminUserDTO> selectAllUsers(@Param("page") int page, @Param("size") int size, @Param("search") String search);
    AdminUserDTO selectUserById(@Param("accountId") String accountId);
    int updateUserRole(@Param("accountId") String accountId, @Param("role") String role);
    int deleteUser(@Param("accountId") String accountId);
    int countUsers(@Param("search") String search);
    
    // ============== 리뷰 관리 ==============
    List<AdminReviewDTO> selectAllReviews(@Param("page") int page, @Param("size") int size, @Param("search") String search);
    AdminReviewDTO selectReviewById(@Param("reviewId") Long reviewId);
    int updateReviewStatus(@Param("reviewId") Long reviewId, @Param("status") String status);
    int deleteReview(@Param("reviewId") Long reviewId);
    int countReviews(@Param("search") String search);
    
    // ============== 통계 ==============
    Map<String, Object> selectStatistics();
    List<Map<String, Object>> selectDailyStatistics(@Param("days") int days);
    List<Map<String, Object>> selectTopPlaces(@Param("limit") int limit);
    List<Map<String, Object>> selectTopUsers(@Param("limit") int limit);
    
    // ============== 신고 관리 ==============
    List<AdminReportDTO> selectAllReports(@Param("page") int page, @Param("size") int size, @Param("status") String status);
    AdminReportDTO selectReportById(@Param("reportId") Long reportId);
    int updateReportStatus(@Param("reportId") Long reportId, @Param("status") String status, 
                          @Param("processorId") String processorId, @Param("processNote") String processNote);
    int countReports(@Param("status") String status);
    
    // ============== 문의 관리 ==============
    List<AdminInquiryDTO> selectAllInquiries(@Param("page") int page, @Param("size") int size, @Param("status") String status);
    AdminInquiryDTO selectInquiryById(@Param("inquiryId") Long inquiryId);
    List<AdminInquiryDTO> selectInquiriesByWriter(@Param("writerId") String writerId);
    int updateInquiryAnswer(@Param("inquiryId") Long inquiryId, @Param("answerContent") String answerContent, 
                           @Param("answererId") String answererId);
    int countInquiries(@Param("status") String status);
    int insertInquiry(@Param("writerId") String writerId,
                      @Param("title") String title,
                      @Param("content") String content);
    
    // ============== 로그 관리 ==============
    List<AdminLogDTO> selectAllLogs(@Param("page") int page, @Param("size") int size, 
                                    @Param("accountId") String accountId, @Param("actionType") String actionType);
    int insertLog(AdminLogDTO log);
    int countLogs(@Param("accountId") String accountId, @Param("actionType") String actionType);
}



