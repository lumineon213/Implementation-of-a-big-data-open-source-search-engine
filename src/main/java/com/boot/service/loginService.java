package com.boot.service;

import com.boot.dto.loginDTO;

public interface loginService {

    int signup(loginDTO dto);

    boolean emailCheck(String email);

    boolean phoneCheck(String phoneNumber);
    
    // 아이디 중복 체크 (신규 추가)
    boolean accountIdCheck(String accountId);

    loginDTO login(String accountId, String accountPw);

    loginDTO findOrCreateSocialUser(String type, String socialId, String email, String name);


    // 아이디 비밀번호 찾기

    // 아이디 찾기
    String findId(String email, String phoneNumber);

    // 유저 존재 여부 (비밀번호 찾기 시 사용)
    boolean existUser(String accountId, String email);

    // 임시 비밀번호 생성
    String createTempPw();

    // 비밀번호 변경
    void updatePassword(String accountId, String tempPw);

    // 임시 비밀번호 이메일 발송
    void sendTempPasswordMail(String email, String tempPw);



    //  Token 기반 비밀번호 변경
    String generateResetToken(String accountId);

    loginDTO getUserByResetToken(String token);

    boolean updatePasswordUsingToken(String token, String newPw);

    void sendPasswordResetMail(String email, String link);


    // 이메일 인증 번호 생성
    String generateEmailVerifyCode(String email);

    // 인증번호 이메일 발송
    void sendEmailVerifyMail(String email, String code);

    // 인증번호 검증
    boolean verifyEmailCode(String email, String code);


}