package com.boot.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String secret = "THIS_IS_MY_SUPER_SECRET_KEY_CHANGE_THIS_1234567890";
    private Key key;

    private final long expireMs = 1000L * 60 * 60; // 1시간
    private final long otpExpireMs = 1000L * 60 * 5; // OTP 토큰 5분

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    /* ================= 일반 JWT ================= */
    public String createToken(String accountId, String role, boolean otpVerified) {
        return Jwts.builder()
                .setSubject(accountId)
                .claim("role", role)          // USER / ADMIN
                .claim("otp", otpVerified)    // OTP 완료 여부
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expireMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /* ================= OTP 전용 임시 토큰 ================= */
    public String createOtpTempToken(String accountId) {
        return Jwts.builder()
                .setSubject(accountId)
                .claim("type", "OTP")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + otpExpireMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /* ================= 파싱 ================= */
    private Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validate(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getAccountId(String token) {
        return parse(token).getSubject();
    }

    public String getRole(String token) {
        return parse(token).get("role", String.class);
    }

    public boolean isOtpVerified(String token) {
        Boolean otp = parse(token).get("otp", Boolean.class);
        return otp != null && otp;
    }

    public String getTokenType(String token) {
        return parse(token).get("type", String.class);
    }
}
