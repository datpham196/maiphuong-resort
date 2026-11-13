package com.maiphuong.nuss;

import com.maiphuong.nuss.shared.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@ConfigurationPropertiesScan
public class NussBackendApplication {

	public static void main(String[] args) {
		DotenvLoader.load();
		SpringApplication.run(NussBackendApplication.class, args);
	}
}
