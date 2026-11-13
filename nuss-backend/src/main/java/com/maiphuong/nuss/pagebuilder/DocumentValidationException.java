package com.maiphuong.nuss.pagebuilder;

import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

public class DocumentValidationException extends ApiException {

	private final List<Map<String, String>> errors;

	public DocumentValidationException(List<Map<String, String>> errors) {
		super(
				HttpStatus.BAD_REQUEST,
				errors.isEmpty() ? "DOCUMENT_INVALID" : errors.getFirst().getOrDefault("code", "DOCUMENT_INVALID"),
				errors.isEmpty() ? "Document is invalid" : errors.getFirst().getOrDefault("message", "Document is invalid")
		);
		this.errors = errors;
	}

	public List<Map<String, String>> getErrors() {
		return errors;
	}
}
