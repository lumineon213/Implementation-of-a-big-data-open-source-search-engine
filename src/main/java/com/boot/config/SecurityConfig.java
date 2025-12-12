package com.boot.config;

import com.boot.security.JwtAuthenticationFilter;
import com.boot.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final JwtUtil jwtUtil;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            /* ================= 기본 설정 ================= */
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)

            .cors(cors -> cors.configurationSource(corsConfig()))

            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            /* ================= 인증 실패 처리 ================= */
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.setHeader("WWW-Authenticate", "");
                    try {
                        response.getWriter().write(
                                "{\"success\":false,\"message\":\"로그인이 필요합니다.\"}"
                        );
                    } catch (Exception ignored) {}
                })
            )

            /* ================= 권한 설정 ================= */
            .authorizeHttpRequests(auth -> auth

                // Preflight
                .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()

                // 로그인 / OTP
                .requestMatchers("/api/login/**", "/api/join/**").permitAll()

                // 정적 파일
                .requestMatchers("/uploads/**").permitAll()

                // 공개 API
                .requestMatchers(HttpMethod.GET, "/api/search").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/search").permitAll()
                .requestMatchers("/api/search-log/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                .requestMatchers("/api/food/**", "/api/walk/**", "/api/theme/**",
                                 "/api/marine/**", "/api/urban/**").permitAll()

                // 사용자 기능
                .requestMatchers("/api/mypage/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/reviews/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()
                .requestMatchers("/api/events/**").authenticated()

                //  관리자 API (ADMIN + OTP 완료 필수)
                .requestMatchers("/api/admin/**")
                .access((authentication, context) -> {
                    if (authentication.get() == null) {
                        return new AuthorizationDecision(false);
                    }

                    String token = (String) authentication.get().getCredentials();

                    boolean ok =
                            jwtUtil.validate(token) &&
                            "ADMIN".equals(jwtUtil.getRole(token)) &&
                            jwtUtil.isOtpVerified(token);

                    return new AuthorizationDecision(ok);
                })

                .anyRequest().permitAll()
            )

            /* ================= JWT 필터 ================= */
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /* ================= CORS ================= */
    @Bean
    public CorsConfigurationSource corsConfig() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /* ================= PasswordEncoder ================= */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
