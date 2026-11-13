package com.maiphuong.nuss.pms.dto;

import java.math.BigDecimal;
import java.util.List;

public record OnePmsAvailabilityItem(
		String roomTypeId,
		String name,
		int amount,
		List<DailyRate> dailyRates
) {
	public record DailyRate(String date, BigDecimal rate) {
	}
}
