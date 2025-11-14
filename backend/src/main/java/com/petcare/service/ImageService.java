package com.petcare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageService {
    
    private final String uploadDirectory;
    
    public ImageService(@Value("${app.upload.directory:./uploads/images}") String uploadDirectory) {
        this.uploadDirectory = uploadDirectory;
        try {
            Path path = Paths.get(uploadDirectory);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("이미지 업로드 디렉토리 생성 실패", e);
        }
    }
    
    public String saveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }
        
        // 파일 확장자 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("파일명이 없습니다.");
        }
        
        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFilename.substring(lastDotIndex);
        }
        
        // 허용된 이미지 확장자
        if (!extension.matches("\\.(jpg|jpeg|png|gif|webp)$")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다. (jpg, jpeg, png, gif, webp)");
        }
        
        // 고유한 파일명 생성
        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = Paths.get(uploadDirectory, filename);
        
        // 파일 저장
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // 상대 경로 반환 (프론트엔드에서 접근 가능하도록)
        return "/uploads/images/" + filename;
    }
    
    public void deleteImage(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return;
        }
        
        try {
            // /uploads/images/ 제거하고 실제 파일명만 추출
            String filename = imagePath.replace("/uploads/images/", "");
            Path filePath = Paths.get(uploadDirectory, filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            // 삭제 실패는 로그만 남기고 계속 진행
            System.err.println("이미지 삭제 실패: " + imagePath);
        }
    }
}

