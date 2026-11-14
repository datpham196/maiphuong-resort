package com.maiphuong.nuss.cmspages.service;

import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CmsPagePreviewTokenService {

	public static final long TTL_SECONDS = 1800;

	private record Entry(UUID pageId, String locale, Instant expiresAt) {
	}

	private final Map<String, Entry> tokens = new ConcurrentHashMap<>();

	public String issue(UUID pageId, String locale) {
		purgeExpired();
		String token = UUID.randomUUID().toString().replace("-", "");
		tokens.put(token, new Entry(pageId, locale, Instant.now().plusSeconds(TTL_SECONDS)));
		return token;
	}

	public PreviewRef resolve(String token) {
		purgeExpired();
		Entry entry = tokens.get(token);
		if (entry == null || entry.expiresAt().isBefore(Instant.now())) {
			tokens.remove(token);
			throw new ApiException(HttpStatus.UNAUTHORIZED, "PREVIEW_TOKEN_INVALID", "Preview token is invalid or expired");
		}
		return new PreviewRef(entry.pageId(), entry.locale());
	}

	public record PreviewRef(UUID pageId, String locale) {
	}

	private void purgeExpired() {
		Instant now = Instant.now();
		tokens.entrySet().removeIf(e -> e.getValue().expiresAt().isBefore(now));
	}
}
