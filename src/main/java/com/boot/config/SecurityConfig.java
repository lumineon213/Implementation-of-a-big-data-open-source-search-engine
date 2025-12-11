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
import org.springframework.web.cors.CorsUtils; // 이 임포트가 필수입니다!

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
                
                // 2. CORS 설정 적용 (아래 corsConfig 메서드 연결)
                .cors(cors -> cors.configurationSource(corsConfig())) 
                
                // 3. 세션 관리 상태 없음으로 설정 (JWT 사용 시 필수)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // 4. 요청별 권한 설정 (순서 중요: 위에서 아래로 체크함)
                .authorizeHttpRequests(auth -> auth
                        // (1) ★ 중요: Preflight(OPTIONS) 요청은 무조건 허용 (CORS 해결의 핵심)
                        .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                		
                        // (2) 로그인, 회원가입은 누구나 접근 가능
                        .requestMatchers("/api/login/**", "/api/join/**").permitAll()

                        // (3) ★ 핵심: 검색 기능 (GET 방식) 누구나 접근 가능하도록 명시적 허용
                        .requestMatchers(HttpMethod.GET, "/api/search").permitAll()
                        // 만약 검색이 POST 방식이라면 아래 주석을 풀어서 사용하세요
                        .requestMatchers(HttpMethod.POST, "/api/search").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/stay/search","/api/stay/view/**").permitAll()

                        // (4) 마이페이지 등 회원 전용 기능은 인증(토큰) 필요
                        .requestMatchers("/api/mypage/**").authenticated() 
                        
                        .requestMatchers("/api/theme/**").permitAll()

                        // (5) 그 외 나머지 모든 요청은 허용 (개발 중 편의를 위해)
                        // 배포 시에는 .authenticated()로 변경하는 것을 권장
                        .anyRequest().permitAll()
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