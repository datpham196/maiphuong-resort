package com.maiphuong.nuss.pms.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;

public record OnePmsRoomTypeDto(
		String roomTypeId,
		String name,
		Integer guest,
		JsonNode beds,
		BigDecimal price,
		Integer num,
		JsonNode raw
) {
}
