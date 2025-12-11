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

        // 📌 [DEBUG 추가] 헤더 수신 여부 로그 (paymentStay의 디버그 유지)
        System.out.println("DEBUG: Authorization Header Received: " + header);
        
        // ✅ 2. 토큰이 없거나 "Bearer "로 시작하지 않으면 즉시 통과 (develop의 로직 채택)
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = header.substring(7);
        
        // ✅ 3. 토큰 검증 및 인증 (develop의 try-catch 블록 채택)
        try {
            if (jwtUtil.validate(token)) {
                String accountId = jwtUtil.getAccountId(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(accountId);
                
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
            // 토큰 검증 실패 시 예외를 던지지 않고 경고 로그만 남김
            log.warn("JWT 검증 실패: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * 인증이 필요 없는 공개 경로인지 확인 (기존 로직 유지)
     */
    private boolean isPublicPath(String path, String method) {
        // 로그인, 회원가입
        if (path.startsWith("/api/login") || path.startsWith("/api/join")) {
            return true;
        }
        
        // GET 방식의 리뷰 조회
        if (path.startsWith("/api/reviews") && "GET".equals(method)) {
            return true;
        }
        
        // 검색 관련
        if (path.startsWith("/api/search-log") || path.startsWith("/api/search")) {
            return true;
        }
        
        // 음식점, 여행 데이터 조회
        if (path.startsWith("/api/food") || path.startsWith("/api/walk") || 
            path.startsWith("/api/theme") || path.startsWith("/api/marine") || 
            path.startsWith("/api/urban")) {
            return true;
        }
        
        // 📌 추가: 숙소 조회 경로는 보통 공개되어야 합니다.
        if (path.startsWith("/api/stay/view") && "GET".equals(method)) {
            return true;
        }
        
        // 📌 추가: 토스 결제 콜백 경로는 SecurityConfig에서 permitAll() 처리되지만, 필터에서도 통과되어야 합니다.
        if (path.startsWith("/api/payment/toss/success") || path.startsWith("/api/payment/toss/fail")) {
             return true;
        }
        
        return false;
    }
}