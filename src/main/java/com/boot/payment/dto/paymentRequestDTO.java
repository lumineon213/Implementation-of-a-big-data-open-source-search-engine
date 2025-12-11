package com.boot.payment.dto;

import lombok.Data;

@Data
public class paymentRequestDTO {
	private String contentId;    // 숙소 ID (어떤 상품인지)
    private String userId;       // 사용자 ID (누가 결제하는지)
    private int amount;          // 결제 금액 (시뮬레이션용)
    private String paymentToken; // QR 스캔 시 받는 가상의 결제 토큰
}
