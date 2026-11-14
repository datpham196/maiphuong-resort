package com.maiphuong.nuss.bookings.dto;

import java.math.BigDecimal;
import java.util.List;

public record BookingLookupResponse(
		String bookingId,
		String bookingReference,
		List<String> bookingIds,
		boolean cancellable,
		String name,
		String email,
		String phone,
		String arrivalDate,
		String departureDate,
		String bookingStatus,
		String idNumber,
		String idType,
		String address,
		BigDecimal totalAmount,
		BigDecimal totalPaid,
		BigDecimal totalRemaining,
		String paymentStatus,
		String currency,
		List<Room> rooms,
		List<ServiceLine> services,
		List<Payment> payments,
		String created,
		String updated,
		String checkInTime,
		String checkOutTime,
		String notes
) {
	public record Room(
			String roomTypeId,
			String roomTitle,
			String roomNumber,
			Integer adult,
			Integer child,
			Boolean breakfast,
			Boolean lunch,
			Boolean dinner,
			List<BigDecimal> rates
	) {
	}

	public record ServiceLine(
			String serviceId,
			String serviceName,
			String serviceType,
			Integer quantity,
			BigDecimal unitPrice,
			BigDecimal totalPrice
	) {
	}

	public record Payment(
			String paymentDate,
			String paymentMethodId,
			String paymentMethodName,
			BigDecimal amount,
			String paymentStatus,
			String transactionId
	) {
	}
}
