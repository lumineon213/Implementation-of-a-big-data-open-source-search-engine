package com.boot.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.dao.loginDAO;
import com.boot.dto.loginDTO;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class loginSerivceImpl implements loginService {

    private final loginDAO dao;
    
    @Autowired
    private JavaMailSender mailSender;
    
    private final PasswordEncoder passwordEncoder;


    /** ================= 회원가입 ================= */
    @Override
    public int signup(loginDTO dto) {
        dto.setAccountPw(passwordEncoder.encode(dto.getAccountPw()));
        return dao.signup(dto);
    }

    @Override
    public boolean emailCheck(String email) {
        return dao.emailCheck(email) > 0;
    }

    @Override
    public boolean phoneCheck(String phoneNumber) {
        return dao.phoneCheck(phoneNumber) > 0;
    }


    /** ================= 인증번호 저장 ================= */
    @Override
    public String generateEmailVerifyCode(String email) {
        String code = String.valueOf((int)((Math.random() * 900000) + 100000));
        
        System.out.println("=== 인증번호 생성 ===");
        System.out.println("이메일: " + email);
        System.out.println("인증번호: " + code);
        System.out.println("만료시간: " + LocalDateTime.now().plusMinutes(5));
        
        dao.saveEmailVerifyCode(email, code, LocalDateTime.now().plusMinutes(5));
        
        System.out.println("DB 저장 완료");
        
        return code;
    }


    /** ================= 인증번호 메일 발송 ================= */
    @Override
    public void sendEmailVerifyMail(String email, String code) {
        try {
            System.out.println("=== 이메일 발송 시작 ===");
            System.out.println("수신자: " + email);
            System.out.println("인증번호: " + code);
            
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("[우리 부산GO?] 이메일 인증 안내");

            String html = """
                <div style="font-family:Arial; padding:20px; border:1px solid #ddd; border-radius:8px;">
                    <h2 style="color:#2c7be5;">우리 부산GO? 이메일 인증번호 안내</h2>
                    <p>아래 인증번호를 입력하세요.</p>

                    <div style="font-size:30px; font-weight:bold; margin:20px 0; color:#28a745;">
                        %s
                    </div>

                    <p style="color:#888;">유효시간: 5분</p>
                    <p>감사합니다.<br/>우리 부산GO? 드림</p>
                </div>
            """.formatted(code);

            helper.setText(html, true);
            helper.setFrom("skrk3042@naver.com");

            mailSender.send(mime);
            
            System.out.println("이메일 발송 완료");

        } catch (Exception e) {
            System.err.println("메일 발송 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("메일 발송 실패");
        }
    }


    /** ================= 인증번호 확인 ================= */
    @Override
    @Transactional
    public boolean verifyEmailCode(String email, String code) {
        
        System.out.println("=== 인증번호 검증 시작 ===");
        System.out.println("이메일: " + email);
        System.out.println("입력 코드: " + code);

        Integer cnt = dao.checkEmailCode(email, code);
        
        System.out.println("DB 조회 결과 cnt: " + cnt);

        if (cnt == null || cnt == 0) {
            System.out.println("인증 실패: 인증번호 불일치");
            return false;
        }

        System.out.println("인증번호 일치 - 인증 처리 시작");
        
        dao.verifyEmailRecord(email);
        System.out.println("인증 레코드 업데이트 완료");
        
        dao.clearEmailVerifyCode(email);
        System.out.println("인증번호 삭제 완료");

        return true;
    }


    /** ================= 로그인 ================= */
    @Override
    public loginDTO login(String accountId, String accountPw) {
        loginDTO user = dao.findById(accountId);

        if (user == null) return null;

        if (!passwordEncoder.matches(accountPw, user.getAccountPw())) {
            return null;
        }

        return user;
    }

    @Override
    public loginDTO findById(String accountId) {
        return dao.findById(accountId);
    }
    // OTP

    @Override
    public void saveOtpSecret(String accountId, String secret) {
        dao.saveOtpSecret(accountId, secret);
    }

    @Override
    public void enableOtp(String accountId) {
        dao.enableOtp(accountId);
    }
    

    /** ================= 아이디 찾기 ================= */
    @Override
    public String findId(String email, String phoneNumber) {
        return dao.findAccountId(email, phoneNumber);
    }


    /** ================= 임시 PW 생성 ================= */
    @Override
    public boolean existUser(String accountId, String email) {
        return dao.existUser(accountId, email) > 0;
    }

    @Override
    public String createTempPw() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    @Override
    public void updatePassword(String accountId, String tempPw) {
        dao.updatePassword(accountId, passwordEncoder.encode(tempPw));
    }

    @Override
    public void sendTempPasswordMail(String email, String tempPw) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("[우리 부산GO?] 임시 비밀번호 안내");
        msg.setText("임시 비밀번호 : " + tempPw + "\n로그인 후 반드시 변경해주세요.");
        msg.setFrom("skrk3042@naver.com");
        mailSender.send(msg);
    }


    /** ================= 비밀번호 변경 링크 메일 ================= */
    @Override
    public void sendPasswordResetMail(String email, String link) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("우리 부산GO? 비밀번호 재설정 안내");

            String htmlMsg =
                    "<div style='font-family:Arial; padding:20px;'>"
                            + "<h2>비밀번호 재설정</h2>"
                            + "<p>아래 버튼을 눌러 비밀번호를 변경하세요.</p>"
                            + "<div style='margin:25px 0;'>"
                            + "<a href='" + link + "' style='background:#27ae60; padding:15px 30px; color:white; border-radius:8px; font-weight:bold; text-decoration:none;'>"
                            + "비밀번호 변경하기</a>"
                            + "</div>"
                            + "<p>링크가 안될 경우 아래 주소 복사→붙여넣기</p>"
                            + "<p>" + link + "</p>"
                            + "</div>";

            helper.setText(htmlMsg, true);
            helper.setFrom("skrk3042@naver.com");
            mailSender.send(message);

        } catch (Exception e) {
            System.out.println("메일 전송 오류 : " + e.getMessage());
        }
    }


    /** ================= 토큰 방식 처리 ================= */
    @Override
    public String generateResetToken(String accountId) {
        String token = UUID.randomUUID().toString();
        dao.saveResetToken(accountId, token, LocalDateTime.now().plusMinutes(30));
        return token;
    }

    @Override
    public loginDTO getUserByResetToken(String token) {
        return dao.findUserByToken(token);
    }

    @Override
    @Transactional
    public boolean updatePasswordUsingToken(String token, String newPw) {
        loginDTO user = dao.findUserByToken(token);
        if (user == null) return false;

        dao.updatePassword(user.getAccountId(), passwordEncoder.encode(newPw));
        dao.clearToken(user.getAccountId());

        return true;
    }


    /** ================= 소셜 로그인 ================= */
    @Override
    public loginDTO findOrCreateSocialUser(String type, String socialId, String email, String name) {
        loginDTO user = dao.findSocialUser(type, socialId);
        if (user != null) return user;

        loginDTO dto = new loginDTO();
        dto.setAccountId(type + "_" + socialId);
        dto.setAccountName(name == null ? "SNS사용자" : name);
        dto.setEmail(email);
        dto.setSocialType(type);
        dto.setSocialId(socialId);

        dao.insertSocial(dto);
        return dto;
    }

    @Override
    public boolean accountIdCheck(String accountId) {
        loginDTO user = dao.findById(accountId);
        return user != null;
    }
}