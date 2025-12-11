package com.boot.payment.service;

import com.boot.reservation.dto.ReservationDTO;
import com.boot.reservation.dao.ReservationDAO; // 예약 DB 처리를 위한 DAO 주입
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 트랜잭션 처리를 위해 추가
import java.util.Base64;
import java.util.Map;
import java.nio.charset.StandardCharsets;

@Service
public class paymentServiceImpl implements paymentService {

    // application.properties 또는 yml에 정의된 토스 시크릿 키
    @Value("${toss.secret.key}")
    private String tossSecretKey;
    
    // ReservationDAO 주입 (MyBatis 기반)
    private final ReservationDAO reservationDAO;
    
    // 생성자 주입
    public paymentServiceImpl(ReservationDAO reservationDAO) {
        this.reservationDAO = reservationDAO;
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
        // 이 부분에 RestTemplate/WebClient를 사용한 실제 토스 API 통신 코드가 위치합니다.
        // 통신이 성공했다고 가정합니다.
        
        // 3. 결제 승인 성공 후 DB 저장 (핵심)
        try {
            // ReservationDAO를 사용하여 예약 정보를 DB에 삽입 (Mapper.xml의 SQL 실행)
            reservationDAO.insertReservation(reservationDTO); 
            
            System.out.println("✅ [Reservation DB] 결제 기록이 RESERVATION_TBL에 저장되었습니다. AccountId: " + reservationDTO.getAccountId());
            
        } catch (Exception e) {
            System.err.println("❌ 예약 기록 DB 저장 중 오류 발생: " + e.getMessage());
            // @Transactional 덕분에 DB 저장 실패 시 이전 작업(토스 결제 승인)이 롤백되어야 하지만,
            // 실제 구현에서는 토스 API 통신 성공 후 DB 실패 시, 토스 환불 API를 호출해야 합니다.
            throw new RuntimeException("예약 데이터 저장 실패: 트랜잭션 롤백", e); 
        }

        // 4. [시뮬레이션] 토스 서버 응답 형식에 맞춰 성공 응답 반환
        return Map.of(
            "status", "DONE", 
            "orderId", reservationDTO.getOrderId(),
            "totalAmount", reservationDTO.getAmount()
        );
    }
}