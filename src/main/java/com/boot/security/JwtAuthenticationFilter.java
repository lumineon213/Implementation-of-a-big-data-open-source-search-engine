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
        
        // ✅ 인증이 필요 없는 공개 경로는 JWT 체크 건너뛰기
        if (isPublicPath(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String header = request.getHeader("Authorization");
        
        // ✅ 토큰이 없어도 에러를 발생시키지 않고 그냥 통과
        // (Security 설정에서 인증 필요 여부를 판단함)
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = header.substring(7);
        
        // ✅ 토큰 검증 실패해도 예외를 던지지 않음
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
            // 토큰 검증 실패해도 로그만 출력하고 계속 진행
            log.warn("JWT 검증 실패: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * 인증이 필요 없는 공개 경로인지 확인
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
        
        return false;
    }
}