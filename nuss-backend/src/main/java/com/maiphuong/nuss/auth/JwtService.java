package com.maiphuong.nuss.auth;

import com.maiphuong.nuss.shared.config.NussProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

	private final NussProperties properties;
	private final SecretKey key;

	public JwtService(NussProperties properties) {
		this.properties = properties;
		byte[] secretBytes = properties.jwt().secret().getBytes(StandardCharsets.UTF_8);
		if (secretBytes.length < 32) {
			byte[] padded = new byte[32];
			System.arraycopy(secretBytes, 0, padded, 0, secretBytes.length);
			this.key = Keys.hmacShaKeyFor(padded);
		} else {
			this.key = Keys.hmacShaKeyFor(secretBytes);
		}
	}

	public String createToken(UUID userId, String username, String role) {
		Instant now = Instant.now();
		Instant exp = now.plusMillis(properties.jwt().expirationMs());
		return Jwts.builder()
				.subject(userId.toString())
				.claim("username", username)
				.claim("role", role)
				.issuedAt(Date.from(now))
				.expiration(Date.from(exp))
				.signWith(key)
				.compact();
	}

	public Claims parse(String token) {
		return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}
}
