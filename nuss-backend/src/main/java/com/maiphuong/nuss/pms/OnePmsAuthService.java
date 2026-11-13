package com.maiphuong.nuss.pms;

import com.maiphuong.nuss.pms.crypto.CryptoJsAesEncryptor;
import com.maiphuong.nuss.shared.api.ApiException;
import com.maiphuong.nuss.shared.config.NussProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class OnePmsAuthService {

	private final NussProperties properties;

	public OnePmsAuthService(NussProperties properties) {
		this.properties = properties;
	}

	public String createAuthenticationHeader() {
		String secretKey = properties.onepms().secretKey();
		String account = properties.onepms().account();
		if (secretKey == null || secretKey.isBlank() || account == null || account.isBlank()) {
			throw new ApiException(
					HttpStatus.SERVICE_UNAVAILABLE,
					"ONEPMS_CONFIG_MISSING",
					"OnePMS secretKey or account is not configured"
			);
		}
		return CryptoJsAesEncryptor.encrypt(account, secretKey);
	}
}
