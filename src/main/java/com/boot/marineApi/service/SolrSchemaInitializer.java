package com.boot.marineApi.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class SolrSchemaInitializer {

    private static final String CORE_NAME = "marine_core";
    private final RestTemplate rest = new RestTemplate();

    @PostConstruct
    public void init() {
        try {
            ensureField("tel", "string");
            log.info("Solr schema 초기화 완료");
        } catch (Exception e) {
            log.error("Solr schema 초기화 실패: {}", e.getMessage());
        }
    }

    private void ensureField(String name, String type) throws Exception {
        String base = "http://localhost:8983/solr/" + CORE_NAME + "/schema";

        // 현재 필드 조회
        try {
            Map res = rest.getForObject(base + "/fields/" + name + "?wt=json", Map.class);

            if (res != null && res.containsKey("field")) {
                Map field = (Map) res.get("field");
                String existingType = (String) field.get("type");

                // 타입이 다르면 삭제 후 재생성
                if (!existingType.equals(type)) {
                    log.warn("필드 '{}' 타입이 잘못됨 ({} → {}), 수정 시작", name, existingType, type);
                    deleteField(name);
                    addField(name, type);
                }
                return;
            }
        } catch (Exception ignore) {
            // 필드가 아예 없으면 그냥 생성
        }

        addField(name, type);
    }

    private void addField(String name, String type) {
        String json = String.format("""
        {
          "add-field": {
            "name": "%s",
            "type": "%s",
            "stored": true,
            "indexed": true
          }
        }
        """, name, type);

        rest.postForObject(
                "http://localhost:8983/solr/" + CORE_NAME + "/schema",
                json,
                String.class
        );
    }

    private void deleteField(String name) {
        String json = String.format("""
        {
          "delete-field": {
            "name": "%s"
          }
        }
        """, name);

        rest.postForObject(
                "http://localhost:8983/solr/" + CORE_NAME + "/schema",
                json,
                String.class
        );
    }
}
