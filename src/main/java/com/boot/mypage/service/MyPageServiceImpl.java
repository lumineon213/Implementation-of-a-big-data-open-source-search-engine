package com.boot.mypage.service;

import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.boot.mypage.dao.MyPageDAO;
import com.boot.mypage.dto.MyPageDTO;
import com.boot.reservation.dao.ReservationDAO;
import com.boot.reservation.dto.ReservationHistoryDTO;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class MyPageServiceImpl implements MyPageService {

    @Autowired
    private MyPageDAO dao;
    
    @Autowired
    private ReservationDAO reservationDAO;

    @Value("${file.upload.path}")
    private String uploadPath;

    @Value("${file.upload.base-url}")
    private String baseUrl;

    @Override
    public MyPageDTO getMyInfo(String accountId) {
        return dao.getMyInfo(accountId);
    }

    @Override
    @Transactional
    public int updateMyInfo(MyPageDTO dto, MultipartFile profileImage) {
        log.info("========== 회원정보 수정 시작 ==========");
        log.info("accountId: {}", dto.getAccountId());

        // 1. 기존 프로필 이미지 조회
        MyPageDTO existingInfo = dao.getMyInfo(dto.getAccountId());
        String oldProfileImage = existingInfo != null ? existingInfo.getProfileImage() : null;
        log.info("기존 profileImage: {}", oldProfileImage);

        // 2. 새로운 이미지 업로드
        String newImageUrl = null;
        boolean imageUploaded = false;
        
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                newImageUrl = uploadProfileImage(profileImage);
                imageUploaded = true;
                log.info("✅ NEW 이미지 업로드 성공: {}", newImageUrl);
                
                dto.setProfileImage(newImageUrl);
                log.info("✅ DTO에 새 이미지 URL 설정 완료");
            } catch (Exception e) {
                log.error("❌ 프로필 이미지 업로드 실패 - accountId: {}", dto.getAccountId(), e);
                throw new RuntimeException("프로필 이미지 업로드에 실패했습니다: " + e.getMessage());
            }
        } else {
            // 이미지가 업로드되지 않으면 기존 이미지 유지
            if (existingInfo != null) {
                dto.setProfileImage(existingInfo.getProfileImage());
                log.info("이미지 미업로드 - 기존 이미지 유지: {}", dto.getProfileImage());
            }
        }

        // 3. DB 업데이트
        log.info("💾 DB 업데이트 실행:");
        log.info("  - accountName: {}", dto.getAccountName());
        log.info("  - email: {}", dto.getEmail());
        log.info("  - phoneNumber: {}", dto.getPhoneNumber());
        log.info("  - profileImage: {}", dto.getProfileImage());
        
        int result = dao.updateMyInfo(dto);
        
        log.info("💾 DB 업데이트 완료 - 영향받은 행 수: {}", result);
        
        // 4. DB 실패 시 새 이미지 삭제
        if (result == 0) {
            log.error("❌ DB 업데이트 실패!");
            if (imageUploaded && newImageUrl != null) {
                log.info("⚠️ 새로 업로드한 이미지 삭제 (DB 실패): {}", newImageUrl);
                deleteImageFile(newImageUrl);
            }
            return result;
        }

        // 5. 성공한 경우만 기존 이미지 삭제 (새 이미지와 다를 때만)
        if (imageUploaded && oldProfileImage != null && !oldProfileImage.equals(newImageUrl)) {
            log.info("🗑️ OLD 이미지 파일 삭제: {}", oldProfileImage);
            deleteImageFile(oldProfileImage);
        }

        log.info("========== 회원정보 수정 완료 ==========");
        log.info("✅ 최종 상태 - accountId: {}, newProfileImage: {}", dto.getAccountId(), newImageUrl);
        return result;
    }

    /**
     * 프로필 이미지 업로드
     */
    private String uploadProfileImage(MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        java.io.File uploadDir = new java.io.File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
            log.info("업로드 디렉토리 생성 - {}", uploadPath);
        }

        // 파일명 생성 (UUID + 원본 확장자)
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String savedFilename = UUID.randomUUID().toString() + extension;

        // 파일 저장
        Path filePath = Paths.get(uploadPath, savedFilename);
        Files.write(filePath, file.getBytes());

        // URL 생성
        String fileUrl = baseUrl + "/uploads/profiles/" + savedFilename;
        log.info("프로필 이미지 업로드 성공 - {}", savedFilename);

        return fileUrl;
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
                log.info("프로필 이미지 파일 삭제 완료 - {}", filename);
            }
        } catch (IOException e) {
            log.error("프로필 이미지 파일 삭제 실패 - {}", imageUrl, e);
        }
    }

	@Override
	public List<ReservationHistoryDTO> getReservationHistory(String accountId) {
		return reservationDAO.selectReservationHistoryByAccountId(accountId);	
	}
}
