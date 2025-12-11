package com.boot.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
	@Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 주소에 대해서
                .allowedOrigins("http://localhost:3000", "http://localhost:5173") // 리액트 서버(3000, 5173) 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true) // 쿠키/인증 정보 포함 허용
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/C:/Users/KH/Desktop/solr/Implementation-of-a-big-data-open-source-search-engine/uploads/");
    }
}
