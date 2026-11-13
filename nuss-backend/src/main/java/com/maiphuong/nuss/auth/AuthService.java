package com.maiphuong.nuss.auth;

import com.maiphuong.nuss.auth.dto.LoginRequest;
import com.maiphuong.nuss.auth.dto.LoginResponse;
import com.maiphuong.nuss.auth.entity.StaffUser;
import com.maiphuong.nuss.auth.repository.StaffUserRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

	private final StaffUserRepository staffUserRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(
			StaffUserRepository staffUserRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService
	) {
		this.staffUserRepository = staffUserRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public LoginResponse login(LoginRequest request) {
		StaffUser user = staffUserRepository.findByUsername(request.username())
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_INVALID", "Invalid username or password"));
		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_INVALID", "Invalid username or password");
		}
		String token = jwtService.createToken(user.getId(), user.getUsername(), user.getRole());
		return new LoginResponse(token, user.getUsername(), user.getRole());
	}
}
