package com.boot.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
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
    
    
    
    /** 아이디 찾기 */
    @PostMapping("/findId")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String phoneNumber = payload.get("phoneNumber");

        String accountId = service.findId(email, phoneNumber);

        if (accountId != null) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "accountId", accountId
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "msg", "일치하는 회원이 없습니다."
            ));
        }
    }


    @PostMapping("/findPw")
    public ResponseEntity<?> findPw(@RequestBody Map<String, String> payload) {
        String accountId = payload.get("accountId");
        String email = payload.get("email");

        boolean exists = service.existUser(accountId, email);

        if (!exists) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "msg", "회원 정보가 일치하지 않습니다."
            ));
        }

        // 토큰 생성
        String token = service.generateResetToken(accountId);

        // 이메일 링크 구성
        String link = "http://localhost:5173/reset-password?token=" + token;

        // 이메일 발송
        service.sendPasswordResetMail(email, link);

        return ResponseEntity.ok(Map.of("success", true));
    }



    @GetMapping("/verifyResetToken")
    public ResponseEntity<?> verifyResetToken(@RequestParam("token") String token) {

        loginDTO user = service.getUserByResetToken(token);

        if (user == null) {
            return ResponseEntity.ok(Map.of("valid", false));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "accountId", user.getAccountId()
        ));
    }



    /**  비밀번호 재설정 */
    @PostMapping("/updatePw")
    public ResponseEntity<?> updatePw(@RequestBody Map<String, String> payload) {

        String token = payload.get("token");
        String newPw = payload.get("newPw");

        boolean updated = service.updatePasswordUsingToken(token, newPw);

        return ResponseEntity.ok(Map.of("success", updated));
    }
    
    
    

    // ============ 이메일 인증 컨트롤러 ============
    
    /** 이메일 인증번호 발송 */
    @PostMapping("/sendEmailCode")
    public ResponseEntity<?> sendEmailCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        
        try {
            System.out.println("=== 이메일 인증 요청 ===");
            System.out.println("이메일: " + email);
            
            // 인증번호 생성 및 저장
            String code = service.generateEmailVerifyCode(email);
            System.out.println("인증번호 생성 완료: " + code);

            // 이메일 발송
            service.sendEmailVerifyMail(email, code);
            System.out.println("이메일 발송 완료");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "msg", "인증번호가 이메일로 발송되었습니다."
            ));
            
        } catch (Exception e) {
            System.err.println("=== 이메일 발송 실패 ===");
            e.printStackTrace();
            
            return ResponseEntity.ok(Map.of(
                "success", false,
                "msg", "메일 발송 중 오류: " + e.getMessage()
            ));
        }
    }


    /** 이메일 인증번호 검증 */
    @PostMapping("/verifyEmailCode")
    public ResponseEntity<?> verifyEmailCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");

        System.out.println("=== 인증번호 검증 요청 ===");
        System.out.println("이메일: " + email);
        System.out.println("코드: " + code);

        boolean result = service.verifyEmailCode(email, code);

        if (result) {
            System.out.println("✅ 인증 성공");
        } else {
            System.out.println("❌ 인증 실패");
        }

        return ResponseEntity.ok(Map.of("success", result));
    }
    
    

    // ============ 아이디 중복 체크 (신규 추가) ============
    @GetMapping("/checkId")
    public ResponseEntity<?> checkAccountId(@RequestParam("accountId") String accountId) {
        // account_tbl에서 아이디 존재 여부 확인
        boolean exists = service.accountIdCheck(accountId);
        
        return ResponseEntity.ok(Map.of(
            "available", !exists  // 존재하지 않으면 사용 가능
        ));
    }


    // 회원가입
    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody loginDTO dto) {

        if(service.emailCheck(dto.getEmail())) {
            return Map.of("success", false, "msg", "이미 존재하는 이메일입니다.");
        }
        if(service.phoneCheck(dto.getPhoneNumber())) {
            return Map.of("success", false, "msg", "이미 존재하는 전화번호입니다.");
        }

        int result = service.signup(dto);
        return Map.of("success", result > 0);
    }
}
