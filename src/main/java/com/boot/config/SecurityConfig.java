package com.boot.config;

import com.boot.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsUtils;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter; 

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // 1. 기본 보안 설정 해제 (API 서버 설정)
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                
                // 2. CORS 설정 적용
                .cors(cors -> cors.configurationSource(corsConfig())) 
                
                // 3. 세션 관리 상태 없음으로 설정 (JWT 사용 시 필수)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // ✅ 4. 인증 실패 시 처리 (401 에러 시 JSON 응답, 로그인 창 방지)
                .exceptionHandling(exception -> exception
                    .authenticationEntryPoint((request, response, authException) -> {
                        // WWW-Authenticate 헤더를 제거하여 브라우저 기본 인증 다이얼로그 방지
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json;charset=UTF-8");
                        // WWW-Authenticate 헤더를 명시적으로 제거 (브라우저 기본 인증 다이얼로그 방지)
                        response.setHeader("WWW-Authenticate", "");
                        // 캐시 방지 헤더 추가
                        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                        response.setHeader("Pragma", "no-cache");
                        response.setHeader("Expires", "0");
                        
                        try {
                            response.getWriter().write(
                                "{\"success\":false,\"error\":\"Unauthorized\",\"message\":\"로그인이 필요합니다.\"}"
                            );
                            response.getWriter().flush();
                        } catch (Exception e) {
                            // Writer 오류 무시
                        }
                    })
                )
                
                // 5. 요청별 권한 설정 (순서 중요: 위에서 아래로 체크함)
                .authorizeHttpRequests(auth -> auth
                        // (1) Preflight(OPTIONS) 요청은 무조건 허용
                        .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                		
                        // (2) 로그인, 회원가입은 누구나 접근 가능
                        .requestMatchers("/api/login/**", "/api/join/**").permitAll()
                        
                        // (3) 검색 기능 (GET, POST 모두 허용)
                        .requestMatchers(HttpMethod.GET, "/api/search").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/search").permitAll()
                        
                        // ✅ (4) 검색 로그 저장 (인증 없이 허용)
                        .requestMatchers("/api/search-log/**").permitAll()
                        
                        // ✅ (5) 리뷰 조회는 인증 없이 가능
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        
                        // ✅ (6) 리뷰 작성/수정/삭제는 인증 필요
                        .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()
                        
                        // ✅ (7) 음식점, 여행 데이터 조회 API 허용
                        .requestMatchers("/api/food/**", "/api/walk/**", "/api/theme/**", 
                                       "/api/marine/**", "/api/urban/**").permitAll()
                        
                        // ✅ (8) 이벤트 API는 인증 필요
                        .requestMatchers("/api/events/**").authenticated()
                        
                        // (9) 마이페이지 등 회원 전용 기능은 인증(토큰) 필요
                        .requestMatchers("/api/mypage/**").authenticated()
                        
                        // (10) 관리자 API는 인증 필요 (권한 체크는 컨트롤러에서)
                        .requestMatchers("/api/admin/**").authenticated()
                        
                        // (11) 그 외 나머지 모든 요청은 허용 (개발 중 편의를 위해)
                        .anyRequest().permitAll()
                )
                
                // 6. JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS 설정 (리액트 포트 5173 허용)
    @Bean
    public CorsConfigurationSource corsConfig() {
        CorsConfiguration config = new CorsConfiguration();

        // 허용할 출처
        config.setAllowedOriginPatterns(List.of("http://localhost:5173")); 

        // 허용할 HTTP 메서드
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 허용할 헤더
        config.setAllowedHeaders(List.of("*"));
        
        // 리액트에서 응답 헤더의 토큰을 읽을 수 있도록 허용
        config.setExposedHeaders(List.of("Authorization"));
        
        // 쿠키 및 인증 정보 포함 허용
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // 비밀번호 암호화 빈 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}