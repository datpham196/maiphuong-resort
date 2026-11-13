package com.maiphuong.nuss.pms.crypto;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

/**
 * Produces ciphertext compatible with CryptoJS.AES.encrypt(message, passphrase).toString().
 */
public final class CryptoJsAesEncryptor {

	private static final byte[] SALTED_PREFIX = "Salted__".getBytes(StandardCharsets.US_ASCII);

	private CryptoJsAesEncryptor() {
	}

	public static String encrypt(String plaintext, String passphrase) {
		try {
			byte[] salt = new byte[8];
			new SecureRandom().nextBytes(salt);

			byte[] keyAndIv = evpBytesToKey(passphrase.getBytes(StandardCharsets.UTF_8), salt, 32, 16);
			byte[] key = Arrays.copyOfRange(keyAndIv, 0, 32);
			byte[] iv = Arrays.copyOfRange(keyAndIv, 32, 48);

			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
			cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new IvParameterSpec(iv));
			byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

			byte[] result = new byte[SALTED_PREFIX.length + salt.length + encrypted.length];
			System.arraycopy(SALTED_PREFIX, 0, result, 0, SALTED_PREFIX.length);
			System.arraycopy(salt, 0, result, SALTED_PREFIX.length, salt.length);
			System.arraycopy(encrypted, 0, result, SALTED_PREFIX.length + salt.length, encrypted.length);

			return Base64.getEncoder().encodeToString(result);
		} catch (Exception ex) {
			throw new IllegalStateException("Failed to create OnePMS authentication token", ex);
		}
	}

	private static byte[] evpBytesToKey(byte[] password, byte[] salt, int keyLen, int ivLen) throws Exception {
		MessageDigest md5 = MessageDigest.getInstance("MD5");
		byte[] keyIv = new byte[keyLen + ivLen];
		byte[] previous = new byte[0];
		int offset = 0;

		while (offset < keyIv.length) {
			md5.reset();
			md5.update(previous);
			md5.update(password);
			md5.update(salt);
			previous = md5.digest();
			int copy = Math.min(previous.length, keyIv.length - offset);
			System.arraycopy(previous, 0, keyIv, offset, copy);
			offset += copy;
		}
		return keyIv;
	}
}
