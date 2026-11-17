package com.maiphuong.nuss.restaurants.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record MenuItemResponse(
		UUID id,
		UUID categoryId,
		String categoryCode,
		BigDecimal priceAmount,
		String priceCurrency,
		String priceLabel,
		int displayOrder,
		boolean active,
		List<LocaleContent> contents
) {
	public record LocaleContent(String locale, String name, String description) {
	}
}
