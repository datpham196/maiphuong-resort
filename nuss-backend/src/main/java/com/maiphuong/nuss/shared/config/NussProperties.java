package com.maiphuong.nuss.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nuss")
public record NussProperties(
		Cors cors,
		Upload upload,
		Jwt jwt,
		Admin admin,
		Onepms onepms,
		Mail mail
) {
	public record Cors(String allowedOrigins) {
	}

	public record Upload(String dir) {
	}

	public record Jwt(String secret, long expirationMs) {
	}

	public record Admin(String bootstrapUsername, String bootstrapPassword) {
	}

	public record Onepms(
			String baseUrl,
			String secretKey,
			String account,
			String hotelId,
			int connectTimeoutMs,
			int readTimeoutMs
	) {
	}

	public record Mail(
			String from,
			String fromName,
			String resortTo
	) {
	}
}
