package com.boot.payment.controller;

import com.boot.payment.service.paymentService;
import com.boot.reservation.dto.ReservationDTO;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
public class paymentController {

	@Autowired
    private paymentService tossPaymentService; 


    // =======================================================
    // 1. 💰 토스 결제 Success 콜백 처리 (최종 승인)
    //    - 토스 결제창에서 결제 성공 시 호출되는 엔드포인트
    // =======================================================
    @GetMapping("/toss/success")
    public ResponseEntity<?> tossPaymentSuccess(
		@ModelAttribute ReservationDTO requestDTO // DTO 객체가 생성됨
    ) {
        try {
            // 1. Service를 호출하여 토스 서버에 최종 결제 승인 요청을 보냅니다.
            Map<String, Object> tossResult = tossPaymentService.confirmPayment(requestDTO);

            // 2. 실제 결제 후 DB 기록 저장 로직이 여기에 들어갑니다.
            System.out.println("✅ 토스 결제 승인 완료: " + tossResult.get("orderId"));
            
            // 3. 프론트엔드로 성공 메시지 반환
            return ResponseEntity.ok("토스 결제가 성공적으로 완료되었습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            // 4. 오류 발생 시, 프론트엔드로 실패 메시지 반환
            return ResponseEntity.internalServerError().body("토스 결제 승인 중 오류 발생");
        }
    }

    // =======================================================
    // 2. ❌ 토스 결제 Fail 콜백 처리
    //    - 토스 결제창에서 실패/취소 시 호출되는 엔드포인트
    // =======================================================
    @GetMapping("/toss/fail")
    public ResponseEntity<String> tossPaymentFail(
        @RequestParam String code, // 실패 코드
        @RequestParam String message // 실패 메시지
    ) {
        // DB에 실패 로그를 남기는 등의 처리를 할 수 있습니다.
        return ResponseEntity.badRequest().body("토스 결제 실패: " + message + " (코드: " + code + ")");
    }
}