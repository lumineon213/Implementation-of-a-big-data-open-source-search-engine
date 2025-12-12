package com.boot.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.boot.dto.loginDTO;
import com.boot.security.JwtUtil;
import com.boot.service.loginService;
import com.warrenstrange.googleauth.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/login")
@RequiredArgsConstructor
public class loginController {

    private final loginService service;
    private final JwtUtil jwtUtil;

    // ================= 로그인 =================
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody loginDTO dto) {

        loginDTO user = service.login(dto.getAccountId(), dto.getAccountPw());
        if (user == null) {
            return Map.of("success", false, "msg", "아이디 또는 비밀번호 오류");
        }

        // 🔐 ADMIN → OTP 단계
        if ("ADMIN".equals(user.getAccountRole())) {

            String otpToken = jwtUtil.createOtpTempToken(user.getAccountId());

            if (!"Y".equals(user.getOtpEnabled())) {
                return Map.of(
                        "success", true,
                        "needOtpSetup", true,
                        "otpToken", otpToken
                );
            }

            return Map.of(
                    "success", true,
                    "needOtp", true,
                    "otpToken", otpToken
            );
        }

        // 👤 USER
        String token = jwtUtil.createToken(
                user.getAccountId(),
                "USER",
                true
        );

        return Map.of("success", true, "token", token);
    }

    // ================= OTP 최초 등록 =================
    @GetMapping("/otp/setup")
    public Map<String, Object> setupOtp(@RequestHeader("Authorization") String otpToken) {

        if (!jwtUtil.validate(otpToken)) {
            return Map.of("success", false);
        }

        if (!"OTP".equals(jwtUtil.getTokenType(otpToken))) {
            return Map.of("success", false);
        }

        String accountId = jwtUtil.getAccountId(otpToken);

        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        String secret = key.getKey();

        service.saveOtpSecret(accountId, secret);

        String otpUri =
                "otpauth://totp/BusanGO:" + accountId +
                "?secret=" + secret +
                "&issuer=BusanGO";

        return Map.of(
                "success", true,
                "otpUri", otpUri
        );
    }

    // ================= OTP 검증 =================
    @PostMapping("/otp/verify")
    public Map<String, Object> verifyOtp(@RequestBody Map<String, String> payload) {

        String otpToken = payload.get("otpToken");
        String otpCode = payload.get("otpCode");

        if (!jwtUtil.validate(otpToken)) {
            return Map.of("success", false, "msg", "OTP 토큰 만료");
        }

        if (!"OTP".equals(jwtUtil.getTokenType(otpToken))) {
            return Map.of("success", false, "msg", "잘못된 토큰");
        }

        String accountId = jwtUtil.getAccountId(otpToken);
        loginDTO user = service.findById(accountId);

        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        boolean ok = gAuth.authorize(
                user.getOtpSecret(),
                Integer.parseInt(otpCode)
        );

        if (!ok) {
            return Map.of("success", false, "msg", "OTP 인증 실패");
        }

        service.enableOtp(accountId);

        String token = jwtUtil.createToken(
                accountId,
                "ADMIN",
                true
        );

        return Map.of("success", true, "token", token);
    }
}
