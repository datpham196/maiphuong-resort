package com.maiphuong.nuss.shared.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads `.env` into the Spring Environment early, so ${ONEPMS_*} placeholders resolve.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

	@Override
	public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
		Path envFile = resolveEnvFile(Path.of("").toAbsolutePath().normalize());
		if (envFile == null) {
			return;
		}

		Dotenv dotenv = Dotenv.configure()
				.directory(envFile.getParent().toString())
				.filename(envFile.getFileName().toString())
				.ignoreIfMalformed()
				.load();

		Map<String, Object> values = new HashMap<>();
		for (DotenvEntry entry : dotenv.entries()) {
			if (entry.getKey() == null || entry.getValue() == null) {
				continue;
			}
			String key = entry.getKey().trim();
			String value = entry.getValue().trim();
			if (key.isEmpty()) {
				continue;
			}
			values.put(key, value);
		}

		if (!values.isEmpty()) {
			environment.getPropertySources().addFirst(new MapPropertySource("nussDotenv", values));
		}
	}

	private static Path resolveEnvFile(Path cwd) {
		Path direct = cwd.resolve(".env");
		if (Files.isRegularFile(direct)) {
			return direct;
		}
		Path nested = cwd.resolve("nuss-backend").resolve(".env");
		if (Files.isRegularFile(nested)) {
			return nested;
		}
		return null;
	}

	@Override
	public int getOrder() {
		return Ordered.HIGHEST_PRECEDENCE;
	}
}
