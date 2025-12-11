package com.boot.reservation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import lombok.Data;

@Data
public class ReservationDTO {
	// 예약 상세 정보 (프론트엔드/세션에서 전달)
    private String accountId;   // 예약자 ID (로그인된 사용자)
    private String contentId;   // 숙소 ID (예약하려는 숙소)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkInDate;   // 체크인 날짜
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkOutDate;  // 체크아웃 날짜
    private BigDecimal amount;  // 최종 결제 금액

    // 토스 서버로부터 콜백으로 받는 데이터
    private String paymentKey;
    private String orderId;
}
