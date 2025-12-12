package com.boot.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    // 관리자는 otp를 통과하지 못하면 못씀
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // ✅ 1. 공개 경로는 JWT 체크 건너뛰기
        if (isPublicPath(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String header = request.getHeader("Authorization");

        // 📌 [DEBUG 추가] 헤더 수신 여부 로그 (paymentStay의 디버그 유지)
        System.out.println("DEBUG: Authorization Header Received: " + header);
        
        // ✅ 2. 토큰이 없거나 "Bearer "로 시작하지 않으면 즉시 통과
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = header.substring(7);
        
        // ✅ 3. 토큰 검증 및 인증
        try {
            if (jwtUtil.validate(token)) {

                String accountId = jwtUtil.getAccountId(token);
                String role = jwtUtil.getRole(token);
                boolean otpVerified = jwtUtil.isOtpVerified(token);

                // 🔐 ADMIN + OTP 미완료 차단
                if ("ADMIN".equals(role) && !otpVerified) {
                    log.warn("ADMIN OTP 미완료 접근 차단: {}", accountId);

                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                    response.setHeader("Pragma", "no-cache");
                    response.setHeader("Expires", "0");

                    response.getWriter().write(
                        "{\"success\":false,\"msg\":\"관리자 OTP 인증이 필요합니다.\"}"
                    );
                    response.getWriter().flush();
                    return;
                }

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(accountId);
                
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("JWT 인증 성공: {}", accountId);
            }
        } catch (Exception e) {
            log.warn("JWT 검증 실패: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * 인증이 필요 없는 공개 경로인지 확인 (기존 로직 유지)
     */
    private boolean isPublicPath(String path, String method) {
        if (path.startsWith("/api/login") || path.startsWith("/api/join")) {
            return true;
        }
        if (path.startsWith("/api/reviews") && "GET".equals(method)) {
            return true;
        }
        if (path.startsWith("/api/search-log") || path.startsWith("/api/search")) {
            return true;
        }
        if (path.startsWith("/api/food") || path.startsWith("/api/walk") || 
            path.startsWith("/api/theme") || path.startsWith("/api/marine") || 
            path.startsWith("/api/urban")) {
            return true;
        }
        if (path.startsWith("/api/stay/view") && "GET".equals(method)) {
            return true;
        }
        if (path.startsWith("/api/payment/toss/success") ||
            path.startsWith("/api/payment/toss/fail")) {
             return true;
        }
        return false;
    }
}
