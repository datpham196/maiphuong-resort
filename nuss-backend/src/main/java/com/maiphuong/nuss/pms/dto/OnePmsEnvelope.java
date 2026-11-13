package com.maiphuong.nuss.pms.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record OnePmsEnvelope(
		String result,
		String message,
		JsonNode data
) {
	public boolean isSuccess() {
		return "00".equals(result);
	}
}
