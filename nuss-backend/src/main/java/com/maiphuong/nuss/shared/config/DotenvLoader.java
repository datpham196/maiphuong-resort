package com.maiphuong.nuss.shared.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Loads local `.env` into system properties so Spring can resolve ${...} placeholders
 * without exporting variables in the shell.
 */
public final class DotenvLoader {

	private DotenvLoader() {
	}

	public static void load() {
		Path cwd = Path.of("").toAbsolutePath().normalize();
		Path envFile = resolveEnvFile(cwd);
		if (envFile == null) {
			return;
		}

		Dotenv dotenv = Dotenv.configure()
				.directory(envFile.getParent().toString())
				.filename(envFile.getFileName().toString())
				.ignoreIfMalformed()
				.load();

		for (DotenvEntry entry : dotenv.entries()) {
			String key = entry.getKey();
			String value = entry.getValue();
			if (key == null || key.isBlank() || value == null) {
				continue;
			}
			if (System.getenv(key) == null && System.getProperty(key) == null) {
				System.setProperty(key, value);
			}
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
}
