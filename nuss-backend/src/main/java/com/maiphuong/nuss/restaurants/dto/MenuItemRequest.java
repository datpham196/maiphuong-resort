package com.maiphuong.nuss.restaurants.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MenuItemRequest(
		UUID categoryId,
		BigDecimal priceAmount,
		String priceCurrency,
		String priceLabel,
		Integer displayOrder,
		Boolean active,
		String nameVi,
		String descriptionVi,
		String nameEn,
		String descriptionEn
) {
}
