package com.maiphuong.nuss.auth;

import com.maiphuong.nuss.auth.entity.StaffUser;
import com.maiphuong.nuss.auth.repository.StaffUserRepository;
import com.maiphuong.nuss.shared.config.NussProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

	private final StaffUserRepository staffUserRepository;
	private final PasswordEncoder passwordEncoder;
	private final NussProperties properties;

	public AdminBootstrap(
			StaffUserRepository staffUserRepository,
			PasswordEncoder passwordEncoder,
			NussProperties properties
	) {
		this.staffUserRepository = staffUserRepository;
		this.passwordEncoder = passwordEncoder;
		this.properties = properties;
	}

	@Override
	public void run(ApplicationArguments args) {
		String username = properties.admin().bootstrapUsername();
		if (staffUserRepository.existsByUsername(username)) {
			return;
		}
		StaffUser user = new StaffUser();
		user.setUsername(username);
		user.setPasswordHash(passwordEncoder.encode(properties.admin().bootstrapPassword()));
		user.setRole("STAFF");
		staffUserRepository.save(user);
		log.info("Bootstrapped admin user '{}'", username);
	}
}
