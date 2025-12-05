package com.boot.login.controller;

import com.boot.login.service.NaverLoginService;
import com.boot.login.service.loginService;
import com.boot.login.dto.loginDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpSession;
import java.net.URLEncoder; // URL 인코딩을 위해 추가
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/naver")
public class NaverLoginController {

    private static final Logger logger = LoggerFactory.getLogger(NaverLoginController.class);

    // ${...} 값에 'localhost' 대신 '127.0.0.1'로 통일하여 설정되었는지 확인하세요.
    @Value("${naver.client.id}")
    private String naverClientId;

    @Value("${naver.client.redirect-uri}")
    private String naverRedirectUri;
    
    // 프론트엔드 성공/실패 리다이렉트 URI (임의로 설정)
    private final String FRONTEND_SUCCESS_URI = "http://localhost:5173/login/oauth";
    private final String FRONTEND_FAILURE_URI = "http://localhost:5173/login";

    @Autowired
    private NaverLoginService naverLoginService;

    @Autowired
    private loginService loginService;

    // --- 1. 네이버 로그인 요청 ---

    @GetMapping("/login")
    public RedirectView naverLogin(HttpSession session) {
        logger.info("Naver login requested");
        String state = UUID.randomUUID().toString();
        session.setAttribute("state", state);
        
        // **필수: redirect_uri를 URL 인코딩해야 합니다.**
        String encodedRedirectUri = URLEncoder.encode(naverRedirectUri, StandardCharsets.UTF_8);

        String url = "https://nid.naver.com/oauth2.0/authorize" +
                "?response_type=code" +
                "&client_id=" + naverClientId +
                "&redirect_uri=" + encodedRedirectUri + // 인코딩된 URI 사용
                "&state=" + state;
        logger.info("Redirecting to: {}", url);
        return new RedirectView(url);
    }

    // --- 2. 네이버 콜백 처리 ---

    @GetMapping("/callback")
    public RedirectView naverCallback(
    		// 네이버가 error를 보낼 경우 code가 누락되므로, 모두 필수가 아님(false)으로 처리합니다.
    		@RequestParam(value = "code", required = false) String code, 
    		@RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error, // 네이버 에러 파라미터 추가
            @RequestParam(value = "error_description", required = false) String errorDescription, // 에러 상세 추가
            HttpSession session) {
        
        // 1. 네이버에서 error 파라미터를 보낸 경우 (인증 실패)
        if (error != null) {
            logger.error("Naver authentication failed. Error: {}, Description: {}", error, errorDescription);
            // 에러를 프론트엔드로 전달
            return new RedirectView(FRONTEND_FAILURE_URI + "?error_reason=" + error);
        }

        // 2. code가 누락되었을 경우 (정상적인 콜백이 아닌 경우)
        if (code == null) {
            logger.error("Callback received but 'code' parameter is missing (not an error from Naver)");
            return new RedirectView(FRONTEND_FAILURE_URI + "?error_reason=missing_code");
        }
        
        // 3. state 검증
        String storedState = (String) session.getAttribute("state");
        if (storedState == null || !state.equals(storedState)) {
            session.removeAttribute("state"); // 상태값 제거
            logger.error("State parameter mismatch or session state is missing. Incoming: {}, Stored: {}", state, storedState);
            throw new RuntimeException("Invalid state parameter"); // 보안 오류
        }
        session.removeAttribute("state");

        // --- 성공 로직 ---
        
        try {
            logger.info("Naver callback received with code: {}", code);

            String accessToken = naverLoginService.getAccessToken(code, state);
            Map<String, Object> userInfo = naverLoginService.getUserInfo(accessToken);
            
            logger.info("Successfully retrieved user info: {}", userInfo);
            
            // 실제 사용자 처리 로직
            loginDTO user = loginService.processNaverLogin(userInfo);
            session.setAttribute("loginuser", user);
            logger.info("User logged in successfully: {}", user.getEmail());
            
            // 성공 후 프론트엔드로 리다이렉트
            return new RedirectView(FRONTEND_SUCCESS_URI);
            
        } catch (Exception e) {
            logger.error("Error during Naver callback processing", e);
            return new RedirectView(FRONTEND_FAILURE_URI + "?error_reason=login_process_failed");
        }
    }
}