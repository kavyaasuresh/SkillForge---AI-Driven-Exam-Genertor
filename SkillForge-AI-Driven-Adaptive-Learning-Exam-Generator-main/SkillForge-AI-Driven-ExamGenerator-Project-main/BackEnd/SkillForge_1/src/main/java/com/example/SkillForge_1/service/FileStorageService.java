package com.example.SkillForge_1.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class FileStorageService {

    private static final String BASE_DIR = "uploads";

    public String storeFile(MultipartFile file, String folder) throws IOException {

        Path uploadDir = Paths.get(BASE_DIR, folder);

        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadDir.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/" + BASE_DIR + "/" + folder + "/" + fileName;
    }
}
