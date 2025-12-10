package com.boot.dao;

import java.time.LocalDateTime;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.dto.loginDTO;

@Mapper
public interface loginDAO {

    int signup(loginDTO dto);

    int emailCheck(@Param("email") String email);

    int phoneCheck(@Param("phoneNumber") String phoneNumber);

    loginDTO findById(@Param("accountId") String accountId);

    loginDTO findSocialUser(@Param("socialType") String socialType,
                            @Param("socialId") String socialId);

    int insertSocial(loginDTO dto);

    

    // 아이디 찾기
    String findAccountId(@Param("email") String email,
                         @Param("phoneNumber") String phoneNumber);

    int existUser(@Param("accountId") String accountId,
                  @Param("email") String email);

    int updatePassword(@Param("accountId") String accountId,
                       @Param("password") String password);


    //  비밀번호 Reset Token
    void saveResetToken(@Param("accountId") String accountId,
                        @Param("token") String token,
                        @Param("expireTime") LocalDateTime expireTime);

    loginDTO findUserByToken(String token);

    void clearToken(String accountId);



    //  이메일 인증번호 방식
    void saveEmailVerifyCode(@Param("email") String email,
                             @Param("code") String code,
                             @Param("expireTime") LocalDateTime expireTime);

    Integer checkEmailCode(@Param("email") String email,
                           @Param("code") String code);


    void clearEmailVerifyCode(String email);

    void verifyEmailRecord(String email);
}