// src/main/java/com/boot/payment/controller/PaymentController.java

package com.boot.payment.controller;

import com.boot.payment.service.paymentService; 
import com.boot.reservation.dto.ReservationDTO;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/api/payment")
public class paymentController {

    @Autowired
    private paymentService tossPaymentService; 

    private static final String FRONTEND_BASE_URL = "http://localhost:5173"; 

    private String encodeParam(String value) {
        if (value == null) return "";
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            System.err.println("URL 인코딩 오류: " + e.getMessage());
            return value;
        }
    }

    @GetMapping("/toss/success")
    public RedirectView tossPaymentSuccess(
        @ModelAttribute ReservationDTO requestDTO
    ) {
        try {
            tossPaymentService.confirmPayment(requestDTO);

            String orderId = requestDTO.getOrderId();
            String contentId = requestDTO.getContentId();

            // 💡 Service에서 조회한 숙소 이름을 가져옵니다. (title 값)
            String rawTitle = tossPaymentService.getPlaceNameByContentId(contentId); 
            
            // 쿼리 파라미터 인코딩
            String encodedTitle = encodeParam(rawTitle); // title 값 인코딩
            String encodedCheckIn = encodeParam(requestDTO.getCheckInDate().toString()); 
            String encodedCheckOut = encodeParam(requestDTO.getCheckOutDate().toString());
            String encodedAmount = encodeParam(requestDTO.getAmount().toPlainString());
            String encodedContentId = encodeParam(contentId);

            // 리다이렉트 URL 경로 생성
            String successPath = "/reservation/success"
                + "?orderId=" + orderId 
                + "&amount=" + encodedAmount 
                + "&title=" + encodedTitle // 💡 title 쿼리 파라미터로 전달
                + "&checkIn=" + encodedCheckIn
                + "&checkOut=" + encodedCheckOut
                + "&contentId=" + encodedContentId; 

            String finalRedirectUrl = FRONTEND_BASE_URL + successPath;
            
            return new RedirectView(finalRedirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            String failUrl = FRONTEND_BASE_URL + "/reservation/fail" 
                + "?code=" + encodeParam("PAYMENT_ERROR")
                + "&message=" + encodeParam(e.getMessage());
            return new RedirectView(failUrl);
        }
    }

    @GetMapping("/toss/fail")
    public RedirectView tossPaymentFail(
        @RequestParam String code, 
        @RequestParam String message
    ) {
        String failUrl = FRONTEND_BASE_URL + "/reservation/fail" 
            + "?code=" + encodeParam(code)
            + "&message=" + encodeParam(message);
        
        return new RedirectView(failUrl);
    }
}