package com.maiphuong.nuss.pms.dto;

import java.math.BigDecimal;
import java.util.List;

public record OnePmsBookingDetails(
		String bookingId,
		String bookingReference,
		List<String> bookingIds,
		String hotelId,
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
