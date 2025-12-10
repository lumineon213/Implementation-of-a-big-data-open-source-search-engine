package com.boot.Review.service;



import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.boot.Review.dao.ReviewDAO;
import com.boot.Review.dto.ReviewDTO;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewDAO dao;

    @Value("${file.upload.path:C:/uploads/reviews}")
    private String uploadPath;

    @Value("${file.upload.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    @Transactional
    public ReviewDTO createReview(String placeId, String placeType, String content, 
                                 List<MultipartFile> images, String accountId) {
        log.info("리뷰 작성 시작 - accountId: {}, placeId: {}", accountId, placeId);

        // 1. 리뷰 저장
        ReviewDTO review = ReviewDTO.builder()
                .accountId(accountId)
                .placeId(placeId)
                .placeType(placeType)
                .content(content)
                .build();

        int result = dao.insertReview(review);
        if (result == 0) {
            throw new RuntimeException("리뷰 작성에 실패했습니다.");
        }

        Long reviewId = review.getReviewId();
        if (reviewId == null) {
            throw new RuntimeException("리뷰 ID 생성에 실패했습니다.");
        }
        log.info("리뷰 작성 완료 - reviewId: {}, accountId: {}, placeId: {}", reviewId, accountId, placeId);

        // 2. 이미지 업로드 및 저장
        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            imageUrls = uploadImages(images);
            
            for (int i = 0; i < imageUrls.size(); i++) {
                dao.insertReviewImage(reviewId, imageUrls.get(i), i);
            }
            log.info("이미지 {}개 업로드 완료", imageUrls.size());
        }

        // 3. 작성된 리뷰 정보 조회 (accountName 포함)
        ReviewDTO savedReview = getReviewById(reviewId, accountId);
        savedReview.setImages(imageUrls);
        savedReview.setIsOwner(true); // Boolean 필드이므로 setIsOwner 사용
        
        log.info("리뷰 작성 완료 및 반환 - reviewId: {}, accountName: {}, isOwner: {}", 
                reviewId, savedReview.getAccountName(), savedReview.getIsOwner());
        
        return savedReview;
    }

    @Override
    @Transactional
    public ReviewDTO updateReview(Long reviewId, String content, String accountId) {
        log.info("리뷰 수정 시작 - reviewId: {}, accountId: {}", reviewId, accountId);

        // 1. 리뷰 존재 여부 확인
        ReviewDTO existingReview = dao.selectReviewById(reviewId);
        if (existingReview == null) {
            throw new RuntimeException("존재하지 않는 리뷰입니다.");
        }

        // 2. 작성자 권한 확인
        if (!existingReview.getAccountId().equals(accountId)) {
            throw new RuntimeException("리뷰를 수정할 권한이 없습니다.");
        }

        // 3. 리뷰 수정
        ReviewDTO updateReview = ReviewDTO.builder()
                .reviewId(reviewId)
                .content(content)
                .build();

        int result = dao.updateReview(updateReview);
        if (result == 0) {
            throw new RuntimeException("리뷰 수정에 실패했습니다.");
        }

        log.info("리뷰 수정 완료 - reviewId: {}", reviewId);

        // 4. 수정된 리뷰 조회 및 반환
        return getReviewById(reviewId, accountId);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String accountId) {
        log.info("리뷰 삭제 시작 - reviewId: {}, accountId: {}", reviewId, accountId);

        // 1. 리뷰 존재 여부 확인
        String owner = dao.selectReviewOwner(reviewId);
        if (owner == null) {
            throw new RuntimeException("존재하지 않는 리뷰입니다.");
        }

        // 2. 작성자 권한 확인
        if (!owner.equals(accountId)) {
            throw new RuntimeException("리뷰를 삭제할 권한이 없습니다.");
        }

        // 3. 이미지 파일 삭제
        List<String> images = dao.selectReviewImagesByReviewId(reviewId);
        for (String imageUrl : images) {
            deleteImageFile(imageUrl);
        }

        // 4. 리뷰 삭제 (이미지는 CASCADE로 자동 삭제됨)
        int result = dao.deleteReview(reviewId);
        if (result == 0) {
            throw new RuntimeException("리뷰 삭제에 실패했습니다.");
        }

        log.info("리뷰 삭제 완료 - reviewId: {}", reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewDTO getReviewById(Long reviewId, String currentAccountId) {
        ReviewDTO review = dao.selectReviewById(reviewId);
        if (review == null) {
            throw new RuntimeException("존재하지 않는 리뷰입니다.");
        }

        List<String> images = dao.selectReviewImagesByReviewId(reviewId);
        review.setImages(images);
        
        boolean isOwner = currentAccountId != null && currentAccountId.equals(review.getAccountId());
        review.setIsOwner(isOwner);

        return review;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByPlaceId(String placeId, String currentAccountId) {
        log.info("장소 리뷰 조회 - placeId: {}", placeId);
        
        List<ReviewDTO> reviews = dao.selectReviewsByPlaceId(placeId);
        
        for (ReviewDTO review : reviews) {
            List<String> images = dao.selectReviewImagesByReviewId(review.getReviewId());
            review.setImages(images);
            
            // 현재 사용자가 작성자인지 확인
            Boolean isOwner = (currentAccountId != null && currentAccountId.equals(review.getAccountId()));
            review.setIsOwner(isOwner);
            log.debug("리뷰 {} - accountId: {}, currentAccountId: {}, isOwner: {}", 
                     review.getReviewId(), review.getAccountId(), currentAccountId, isOwner);
        }
        
        return reviews;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByAccountId(String accountId, String currentAccountId) {
        log.info("사용자 리뷰 조회 - accountId: {}", accountId);
        
        List<ReviewDTO> reviews = dao.selectReviewsByAccountId(accountId);
        
        for (ReviewDTO review : reviews) {
            List<String> images = dao.selectReviewImagesByReviewId(review.getReviewId());
            review.setImages(images);
            
            boolean isOwner = currentAccountId != null && currentAccountId.equals(review.getAccountId());
            review.setIsOwner(isOwner);
        }
        
        return reviews;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> searchReviews(String placeId, String accountId, String placeType,
                                        Integer page, Integer size, String sortBy, String sortOrder,
                                        String currentAccountId) {
        log.info("리뷰 검색 - placeId: {}, page: {}, size: {}", placeId, page, size);
        
        Map<String, Object> params = new HashMap<>();
        params.put("placeId", placeId);
        params.put("accountId", accountId);
        params.put("placeType", placeType);
        params.put("page", page != null ? page : 0);
        params.put("size", size != null ? size : 10);
        params.put("sortBy", sortBy != null ? sortBy : "createdAt");
        params.put("sortOrder", sortOrder != null ? sortOrder : "DESC");
        
        List<ReviewDTO> reviews = dao.selectReviewsWithPaging(params);
        
        for (ReviewDTO review : reviews) {
            List<String> images = dao.selectReviewImagesByReviewId(review.getReviewId());
            review.setImages(images);
            
            boolean isOwner = currentAccountId != null && currentAccountId.equals(review.getAccountId());
            review.setIsOwner(isOwner);
        }
        
        return reviews;
    }

    @Override
    @Transactional(readOnly = true)
    public int getReviewCountByPlaceId(String placeId) {
        return dao.countReviewsByPlaceId(placeId);
    }

    /**
     * 이미지 업로드
     */
    private List<String> uploadImages(List<MultipartFile> files) {
        List<String> uploadedUrls = new ArrayList<>();

        // 업로드 디렉토리 생성
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            try {
                // 파일명 생성 (UUID + 원본 파일명)
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String savedFilename = UUID.randomUUID().toString() + extension;

                // 파일 저장
                Path filePath = Paths.get(uploadPath, savedFilename);
                Files.write(filePath, file.getBytes());

                // URL 생성
                String fileUrl = baseUrl + "/uploads/reviews/" + savedFilename;
                uploadedUrls.add(fileUrl);

                log.info("이미지 업로드 성공 - {}", savedFilename);

            } catch (IOException e) {
                log.error("이미지 업로드 실패", e);
                throw new RuntimeException("이미지 업로드에 실패했습니다: " + e.getMessage());
            }
        }

        return uploadedUrls;
    }

    /**
     * 이미지 파일 삭제
     */
    private void deleteImageFile(String imageUrl) {
        try {
            // URL에서 파일명 추출
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadPath, filename);
            
            // 파일 존재 여부 확인 후 삭제
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("이미지 파일 삭제 완료 - {}", filename);
            }
        } catch (IOException e) {
            log.error("이미지 파일 삭제 실패 - {}", imageUrl, e);
        }
    }
}