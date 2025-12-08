package com.boot.config;

import org.springframework.context.annotation.Configuration;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

@Configuration
public class SolrConfig {
	@Value("${spring.data.solr.host}")
    private String solrUrl;

    @Bean
    public SolrClient solrClient() {
        // SolrClient 객체를 생성해서 스프링 컨테이너에 등록합니다.
        return new HttpSolrClient.Builder(solrUrl).build();
    }
}
