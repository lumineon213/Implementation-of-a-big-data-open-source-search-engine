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

        // 📌 [DEBUG] 헤더 수신 여부 로그
        log.debug("Authorization Header: {}", header);
        
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

                // ✅ 로그 추가: OTP 상태 확인
                log.info("JWT 인증 - accountId: {}, role: {}, otpVerified: {}", 
                         accountId, role, otpVerified);

                // 🔥 [수정] ADMIN OTP 차단 로직 제거
                // SecurityConfig에서 처리하도록 변경
                // 여기서는 인증 정보만 설정하고, 권한 검증은 SecurityConfig가 담당

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(accountId);
                
                // 🔥 [중요] credentials에 token을 저장해야 SecurityConfig에서 검증 가능
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                token,  // ✅ credentials에 token 저장 (SecurityConfig에서 사용)
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
     * 인증이 필요 없는 공개 경로인지 확인
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