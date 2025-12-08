package com.boot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.boot.dao.loginDAO;
import com.boot.dto.loginDTO;

@Service
public class loginSerivceImpl implements loginService {

    @Autowired
    private loginDAO dao;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public int signup(loginDTO dto) {
        dto.setAccountPw(passwordEncoder.encode(dto.getAccountPw())); // 암호화 저장
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

    @Override
    public loginDTO login(String accountId, String accountPw) {

        loginDTO user = dao.findById(accountId);

        if (user == null) return null;

        if (!passwordEncoder.matches(accountPw, user.getAccountPw())) {
            return null;
        }

        return user;
    }


    // ⭐ 소셜 로그인 시 실행되는 핵심 로직 메서드
    @Override
    public loginDTO findOrCreateSocialUser(String type, String socialId, String email, String name) {

        // ① 이미 존재하는지 검사
        loginDTO user = dao.findSocialUser(type, socialId);
        if (user != null) {
            return user;
        }

        // ② 신규 생성
        loginDTO dto = new loginDTO();

        // ⭐ login 계정 ID 규칙
        dto.setAccountId(type + "_" + socialId); // ex) google_129987312

        // ⭐ 이름값 비어있을 때 대비
        if (name == null || name.isBlank()) {
            if (email != null && !email.isBlank()) {
                name = email.split("@")[0];
            } else {
                name = type + "_user"; // fallback
            }
        }
        dto.setAccountName(name);

        // ⭐ 이메일 nullable 허용
        dto.setEmail(email);

        // ⭐ 소셜 회원은 비번 없음
        dto.setAccountPw(null);

        // 소셜 타입 저장 (google / kakao / naver)
        dto.setSocialType(type);

        // 소셜 ID 저장 (원시값 사용)
        dto.setSocialId(socialId);

        // 전화번호 없음
        dto.setPhoneNumber(null);

        dao.insertSocial(dto);

        return dto;
    }

}
