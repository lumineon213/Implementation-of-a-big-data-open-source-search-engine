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
                
                // 4. 요청별 권한 설정 (★ 여기가 수정되었습니다!)
                .authorizeHttpRequests(auth -> auth
                        // (1) Preflight 요청 허용
                        .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                        
                        // (2) 로그인, 회원가입 허용
                        .requestMatchers("/api/login/**", "/api/join/**").permitAll()

                        // (3) 검색 기능 허용
                        .requestMatchers(HttpMethod.GET, "/api/search").permitAll()

                        // (4) ★ 테마 상세 페이지 및 조회수 기능 허용 (위치 중요!)
                        .requestMatchers("/api/theme/**").permitAll()

                        // (5) 마이페이지는 로그인 필요
                        .requestMatchers("/api/mypage/**").authenticated() 

                        // (6) ★ [핵심 수정] '나머지 모든 요청'은 무조건 맨 마지막에 딱 한 번만!
                        .anyRequest().authenticated()
                )
                
                // 5. JWT 필터 추가
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS 설정.
    @Bean
    public CorsConfigurationSource corsConfig() {
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowedOriginPatterns(List.of("http://localhost:5173")); 
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}