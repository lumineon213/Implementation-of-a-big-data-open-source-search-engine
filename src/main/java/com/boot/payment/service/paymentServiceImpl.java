
package com.boot.payment.service;

import com.boot.reservation.dto.ReservationDTO;
import com.boot.reservation.dao.ReservationDAO; 
import com.boot.stay.dao.stayDAO; 
import com.boot.stay.dto.stayDTO; 

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Base64;
import java.util.Map;
import java.nio.charset.StandardCharsets;

@Service
public class paymentServiceImpl implements paymentService { 
    // application.properties 또는 yml에 정의된 토스 시크릿 키
    @Value("${toss.secret.key}")
    private String tossSecretKey;
    
    // ReservationDAO 주입 (예약 기록용)
    private final ReservationDAO reservationDAO;
    
    // 💡 stayDAO 주입 (숙소 이름 조회용)
    private final stayDAO stayDAO;
    
    // 💡 생성자 주입 (두 개의 DAO를 모두 주입받도록 수정)
    public paymentServiceImpl(ReservationDAO reservationDAO, stayDAO stayDAO) {
        this.reservationDAO = reservationDAO;
        this.stayDAO = stayDAO; // stayDAO 초기화
    }
    
    @Transactional
    @Override
    public Map<String, Object> confirmPayment(ReservationDTO reservationDTO) {
        System.out.println(">>> [DB INSERT] 수신된 AccountId: " + reservationDTO.getAccountId());
        // 1. [디버그] 토스 API 호출에 필요한 Base64 인코딩
        String plainCredentials = tossSecretKey + ":";
        String encodedAuth = Base64.getEncoder().encodeToString(plainCredentials.getBytes(StandardCharsets.UTF_8));
        System.out.println(">>> [Toss Key Debug] Base64 Key: " + encodedAuth);
        
        // 2. [실제 로직] 토스 API에 최종 승인 요청 (현재는 시뮬레이션)
        
        // 3. 결제 승인 성공 후 DB 저장 (핵심)
        try {
            reservationDAO.insertReservation(reservationDTO); 
            
            System.out.println("✅ [Reservation DB] 결제 기록이 RESERVATION_TBL에 저장되었습니다. AccountId: " + reservationDTO.getAccountId());
            
        } catch (Exception e) {
            System.err.println("❌ 예약 기록 DB 저장 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("예약 데이터 저장 실패: 트랜잭션 롤백", e); 
        }

        // 4. [시뮬레이션] 토스 서버 응답 형식에 맞춰 성공 응답 반환
        return Map.of(
            "status", "DONE", 
            "orderId", reservationDTO.getOrderId(),
            "totalAmount", reservationDTO.getAmount()
        );
    }
    

    @Override
    public String getPlaceNameByContentId(String contentId) {
        if (contentId == null || contentId.isEmpty()) {
            return "숙소 정보 누락";
        }
        
        try {
            System.out.println("DEBUG SERVICE: Content ID로 숙소 상세 정보 조회 시작: " + contentId); // ✅ 디버그 1
            
            // 🚨 stayDAO의 selectStayDetailById 호출 (XML ID가 정확한지 확인)
            stayDTO stayDetail = stayDAO.selectStayDetailById(contentId); 
            
            if (stayDetail == null) {
                System.out.println("DEBUG SERVICE: DB 조회 결과 NULL. Content ID: " + contentId); // ✅ 디버그 2
                return "조회 불가 숙소 (ID: " + contentId + ")";
            }
            
            String title = stayDetail.getTitle();
            System.out.println("DEBUG SERVICE: DB에서 조회된 TITLE: " + title); // ✅ 디버그 3
            
            if (title == null || title.isEmpty()) {
                 return "이름 누락 숙소 (ID: " + contentId + ")";
            }
            return title;
            
        } catch (Exception e) {
            System.err.println("❌ ERROR: DB에서 숙소 이름 조회 중 치명적인 오류 발생: " + e.getMessage()); // 🚨 디버그 4 (치명적 오류)
            e.printStackTrace(); // 스택 트레이스 출력
            return "조회 오류 숙소 (ID: " + contentId + ")";
        }
    }
}