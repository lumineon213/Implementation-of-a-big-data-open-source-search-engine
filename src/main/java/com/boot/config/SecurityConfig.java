package com.boot.config;

import com.boot.security.JwtAuthenticationFilter;
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
                // 1. 기본 보안 설정 해제
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                
                // 2. CORS 설정 적용
                .cors(cors -> cors.configurationSource(corsConfig())) 
                
                // 3. 세션 관리 상태 없음 (JWT 필수)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // 4. 요청별 권한 설정 (순서 중요: 가장 구체적인 것부터 위로)
                .authorizeHttpRequests(auth -> auth
                        // (1) ★ 중요: Preflight(OPTIONS) 요청은 무조건 허용 (CORS 해결의 핵심)
                        .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                		
                        // (2) 로그인, 회원가입은 누구나 접근 가능
                        .requestMatchers("/api/login/**", "/api/join/**").permitAll()

                        // (3) ★ 검색 기능 허용 (GET /api/search)
                        .requestMatchers(HttpMethod.GET, "/api/search").permitAll()
                        
                        // (4) 축제/테마 관련 API는 누구나 접근 가능하도록 허용 (GET 요청에 대해서)
                        // 참고: /api/festival이나 /api/food처럼 /api/search 외의 모든 GET 요청을 허용합니다.
                        // /api/search 외의 일반적인 GET API는 모두 허용 (URL 패턴은 프로젝트에 따라 수정 필요)
                        .requestMatchers(HttpMethod.GET, "/api/**").permitAll()

                        // (5) ★ 마이페이지 등 회원 전용 기능은 인증(토큰) 필요
                        .requestMatchers("/api/mypage/**").authenticated() 
                        
                        // (6) [핵심 수정] 그 외 나머지 모든 요청은 인증 필요 (로그인해야 접근 가능)
                        // 개발 편의를 위한 .anyRequest().permitAll() 대신 보안을 위해 authenticated()를 사용합니다.
                        .anyRequest().authenticated()
                )
                
                // 5. JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS 설정 (리액트 포트 5173 허용)
    @Bean
    public CorsConfigurationSource corsConfig() {
        CorsConfiguration config = new CorsConfiguration();

        // setAllowedOriginPatterns를 사용하여 패턴 매칭으로 허용 (Credentials true일 때 에러 방지)
        // 두 코드 모두 5173을 사용하고 있었으므로 5173을 최종 사용합니다.
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