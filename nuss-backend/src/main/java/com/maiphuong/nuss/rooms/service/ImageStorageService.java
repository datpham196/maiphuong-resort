package com.maiphuong.nuss.rooms.service;

import com.maiphuong.nuss.shared.api.ApiException;
import com.maiphuong.nuss.shared.config.NussProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {

	private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");

	private final Path root;

	public ImageStorageService(NussProperties properties) throws IOException {
		this.root = Path.of(properties.upload().dir()).toAbsolutePath().normalize();
		Files.createDirectories(root);
	}

	public StoredFile store(UUID roomTypeId, MultipartFile file) {
		return store("rooms", roomTypeId, file);
	}

	public StoredFile store(String folder, UUID ownerId, MultipartFile file) {
		if (folder == null || folder.isBlank() || !folder.matches("[a-z0-9-]+")) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_PATH", "Invalid upload folder");
		}
		if (file == null || file.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_REQUIRED", "Image file is required");
		}
		String contentType = resolveContentType(file);
		if (!ALLOWED.contains(contentType)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_TYPE", "Only JPEG, PNG and WebP images are allowed");
		}
		String ext = switch (contentType) {
			case "image/png" -> ".png";
			case "image/webp" -> ".webp";
			default -> ".jpg";
		};
		String storageKey = folder + "/" + ownerId + "/" + UUID.randomUUID() + ext;
		Path target = root.resolve(storageKey).normalize();
		if (!target.startsWith(root)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_PATH", "Invalid upload path");
		}
		try {
			Files.createDirectories(target.getParent());
			try (InputStream in = file.getInputStream()) {
				Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException ex) {
			throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED", "Failed to store image");
		}
		return new StoredFile(storageKey, "/uploads/" + storageKey.replace('\\', '/'));
	}

	public void delete(String storageKey) {
		try {
			Files.deleteIfExists(root.resolve(storageKey).normalize());
		} catch (IOException ignored) {
			// best-effort cleanup
		}
	}

	private String resolveContentType(MultipartFile file) {
		String contentType = file.getContentType();
		if (contentType != null && ALLOWED.contains(contentType)) {
			return contentType;
		}
		String name = file.getOriginalFilename();
		if (name == null) {
			return contentType == null ? "" : contentType;
		}
		String lower = name.toLowerCase(Locale.ROOT);
		if (lower.endsWith(".png")) {
			return "image/png";
		}
		if (lower.endsWith(".webp")) {
			return "image/webp";
		}
		if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
			return "image/jpeg";
		}
		return contentType == null ? "" : contentType;
	}

	public record StoredFile(String storageKey, String publicUrl) {
	}
}
