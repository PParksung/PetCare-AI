package com.petcare.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Component
public class FileDataManager {
    private final String dataDirectory;
    private final ObjectMapper objectMapper;

    public FileDataManager(@Value("${app.data.directory:./data}") String dataDirectory) {
        this.dataDirectory = dataDirectory;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        
        // data 디렉토리 생성
        try {
            Path path = Paths.get(dataDirectory);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("데이터 디렉토리 생성 실패", e);
        }
    }

    public <T> void saveToFile(String filename, T data) throws IOException {
        File file = new File(dataDirectory, filename);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, data);
    }

    public <T> T loadFromFile(String filename, Class<T> clazz) throws IOException {
        File file = new File(dataDirectory, filename);
        if (!file.exists() || file.length() == 0) {
            return null;
        }
        try {
            return objectMapper.readValue(file, clazz);
        } catch (Exception e) {
            // JSON 파싱 오류 시 null 반환
            System.err.println("파일 읽기 오류: " + filename + " - " + e.getMessage());
            return null;
        }
    }

    public <T> List<T> loadListFromFile(String filename, Class<T> clazz) throws IOException {
        File file = new File(dataDirectory, filename);
        if (!file.exists() || file.length() == 0) {
            return new ArrayList<>();
        }
        try {
            CollectionType listType = objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, clazz);
            return objectMapper.readValue(file, listType);
        } catch (Exception e) {
            // JSON 파싱 오류 시 빈 리스트 반환
            System.err.println("파일 읽기 오류: " + filename + " - " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public <T> void saveListToFile(String filename, List<T> data) throws IOException {
        File file = new File(dataDirectory, filename);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, data);
    }
}

