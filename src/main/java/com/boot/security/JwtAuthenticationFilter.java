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
        
        
        if (isPublicPath(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String header = request.getHeader("Authorization");

   
        log.debug("Authorization Header: {}", header);
        
      
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

         
                log.info("JWT 인증 - accountId: {}, role: {}, otpVerified: {}", 
                         accountId, role, otpVerified);

         
             

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(accountId);
                
       
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                token,  
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
        // Solr 통합 검색 및 제안 API는 공개 경로
        if (path.startsWith("/api/solr")) {
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