package com.boot.Review.controller;


import com.boot.Review.dto.ReviewDTO;
import com.boot.Review.service.ReviewService;
import com.boot.security.JwtUtil;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService service;
    private final JwtUtil jwtUtil;

    /**
     * 리뷰 작성
     * POST /api/reviews
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createReview(
            @RequestParam("placeId") String placeId,
            @RequestParam(value = "placeType", defaultValue = "FOOD") String placeType,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // 토큰 검증
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "msg", "로그인이 필요합니다."
                ));
            }
            
            String accountId = extractAccountIdFromToken(token);
            
            // 입력값 검증
            if (placeId == null || placeId.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "장소 ID가 필요합니다."
                ));
            }
            
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "후기 내용을 입력해주세요."
                ));
            }
            
            ReviewDTO review = service.createReview(placeId, placeType, content, images, accountId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "review", review
            ));
            
        } catch (RuntimeException e) {
            log.error("리뷰 작성 실패: {}", e.getMessage());
            if (e.getMessage().contains("토큰") || e.getMessage().contains("인증")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "msg", e.getMessage()
                ));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("리뷰 작성 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 작성에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 리뷰 수정
     * PUT /api/reviews/{reviewId}
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable("reviewId") Long reviewId,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // 토큰 검증
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "msg", "로그인이 필요합니다."
                ));
            }
            
            String accountId = extractAccountIdFromToken(token);
            String content = payload.get("content");
            
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "msg", "후기 내용을 입력해주세요."
                ));
            }
            
            ReviewDTO review = service.updateReview(reviewId, content, accountId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "review", review
            ));
            
        } catch (RuntimeException e) {
            log.error("리뷰 수정 실패: {}", e.getMessage());
            if (e.getMessage().contains("토큰") || e.getMessage().contains("인증")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "msg", e.getMessage()
                ));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("리뷰 수정 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 수정에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 리뷰 삭제
     * DELETE /api/reviews/{reviewId}
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable("reviewId") Long reviewId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // 토큰 검증
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "msg", "로그인이 필요합니다."
                ));
            }
            
            String accountId = extractAccountIdFromToken(token);
            
            service.deleteReview(reviewId, accountId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "msg", "리뷰가 삭제되었습니다."
            ));
            
        } catch (RuntimeException e) {
            log.error("리뷰 삭제 실패: {}", e.getMessage());
            if (e.getMessage().contains("토큰") || e.getMessage().contains("인증")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "msg", e.getMessage()
                ));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("리뷰 삭제 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 삭제에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 리뷰 단건 조회
     * GET /api/reviews/{reviewId}
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReview(
            @PathVariable("reviewId") Long reviewId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = token != null ? extractAccountIdFromToken(token) : null;
            
            ReviewDTO review = service.getReviewById(reviewId, accountId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "review", review
            ));
            
        } catch (RuntimeException e) {
            log.error("리뷰 조회 실패", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "msg", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("리뷰 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 특정 장소의 리뷰 목록 조회
     * GET /api/reviews/place/{placeId}
     */
    @GetMapping("/place/{placeId}")
    public ResponseEntity<?> getReviewsByPlace(
            @PathVariable("placeId") String placeId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String accountId = null;
            
            // 토큰이 있으면 추출 시도 (실패해도 계속 진행)
            if (token != null && !token.trim().isEmpty()) {
                try {
                    accountId = extractAccountIdFromToken(token);
                    log.debug("토큰에서 accountId 추출 성공: {}", accountId);
                } catch (Exception e) {
                    // 토큰이 유효하지 않아도 조회는 계속 진행
                    log.debug("토큰 추출 실패 (무시): {}", e.getMessage());
                }
            }
            
            List<ReviewDTO> reviews = service.getReviewsByPlaceId(placeId, accountId);
            
            log.debug("리뷰 조회 완료 - placeId: {}, accountId: {}, 리뷰 개수: {}", 
                     placeId, accountId, reviews.size());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "reviews", reviews,
                "count", reviews.size()
            ));
            
        } catch (Exception e) {
            log.error("장소 리뷰 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 특정 사용자의 리뷰 목록 조회
     * GET /api/reviews/user/{accountId}
     */
    @GetMapping("/user/{accountId}")
    public ResponseEntity<?> getReviewsByUser(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String currentAccountId = token != null ? extractAccountIdFromToken(token) : null;
            
            List<ReviewDTO> reviews = service.getReviewsByAccountId(accountId, currentAccountId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "reviews", reviews,
                "count", reviews.size()
            ));
            
        } catch (Exception e) {
            log.error("사용자 리뷰 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 리뷰 검색 (페이징)
     * GET /api/reviews/search
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchReviews(
            @RequestParam(required = false) String placeId,
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) String placeType,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortOrder,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            String currentAccountId = token != null ? extractAccountIdFromToken(token) : null;
            
            List<ReviewDTO> reviews = service.searchReviews(
                placeId, accountId, placeType, page, size, sortBy, sortOrder, currentAccountId
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "reviews", reviews,
                "page", page,
                "size", size,
                "count", reviews.size()
            ));
            
        } catch (Exception e) {
            log.error("리뷰 검색 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 검색에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 특정 장소의 리뷰 개수 조회
     * GET /api/reviews/place/{placeId}/count
     */
    @GetMapping("/place/{placeId}/count")
    public ResponseEntity<?> getReviewCount(@PathVariable("placeId") String placeId) {
        try {
            int count = service.getReviewCountByPlaceId(placeId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "placeId", placeId,
                "count", count
            ));
            
        } catch (Exception e) {
            log.error("리뷰 개수 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "msg", "리뷰 개수 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 토큰에서 accountId 추출
     */
    private String extractAccountIdFromToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                throw new RuntimeException("토큰이 제공되지 않았습니다.");
            }
            
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            if (token.trim().isEmpty()) {
                throw new RuntimeException("토큰이 비어있습니다.");
            }
            
            if (!jwtUtil.validate(token)) {
                throw new RuntimeException("유효하지 않거나 만료된 토큰입니다. 다시 로그인해주세요.");
            }
            
            return jwtUtil.getAccountId(token);
        } catch (RuntimeException e) {
            // RuntimeException은 그대로 전달
            throw e;
        } catch (Exception e) {
            log.error("토큰 검증 실패", e);
            throw new RuntimeException("토큰 검증 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}