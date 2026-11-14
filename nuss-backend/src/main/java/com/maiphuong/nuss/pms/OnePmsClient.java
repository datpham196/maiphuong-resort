package com.maiphuong.nuss.pms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.pms.dto.OnePmsAvailabilityItem;
import com.maiphuong.nuss.pms.dto.OnePmsBookingDetails;
import com.maiphuong.nuss.pms.dto.OnePmsBookingResult;
import com.maiphuong.nuss.pms.dto.OnePmsEnvelope;
import com.maiphuong.nuss.pms.dto.OnePmsRoomTypeDto;
import com.maiphuong.nuss.shared.api.ApiException;
import com.maiphuong.nuss.shared.config.NussProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class OnePmsClient {

	private final RestClient restClient;
	private final OnePmsAuthService authService;
	private final ObjectMapper objectMapper;

	public OnePmsClient(NussProperties properties, OnePmsAuthService authService, ObjectMapper objectMapper) {
		this.authService = authService;
		this.objectMapper = objectMapper;
		HttpClient httpClient = HttpClient.newBuilder()
				.connectTimeout(Duration.ofMillis(properties.onepms().connectTimeoutMs()))
				.build();
		JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
		requestFactory.setReadTimeout(Duration.ofMillis(properties.onepms().readTimeoutMs()));
		this.restClient = RestClient.builder()
				.baseUrl(properties.onepms().baseUrl())
				.requestFactory(requestFactory)
				.build();
	}

	public List<OnePmsRoomTypeDto> getRoomTypes(String hotelId) {
		OnePmsEnvelope envelope = post("/api-getRoomTypes", Map.of("hotelID", hotelId));
		if (!envelope.isSuccess()) {
			throw new ApiException(
					HttpStatus.BAD_GATEWAY,
					"ONEPMS_" + envelope.result(),
					envelope.message() == null || envelope.message().isBlank()
							? "OnePMS getRoomTypes failed"
							: envelope.message()
			);
		}
		JsonNode data = envelope.data();
		if (data == null || !data.isArray()) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_SCHEMA", "OnePMS room types payload is invalid");
		}

		List<OnePmsRoomTypeDto> rooms = new ArrayList<>();
		for (JsonNode node : data) {
			String roomTypeId = text(node, "roomTypeID");
			if (roomTypeId == null || roomTypeId.isBlank()) {
				throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_SCHEMA", "Room type missing roomTypeID");
			}
			rooms.add(new OnePmsRoomTypeDto(
					roomTypeId,
					text(node, "name") != null ? text(node, "name") : roomTypeId,
					intValue(node, "guest"),
					node.get("beds"),
					decimal(node, "price"),
					intValue(node, "num"),
					node
			));
		}
		return rooms;
	}

	public List<OnePmsAvailabilityItem> checkAvailabilityAndRate(
			String hotelId,
			List<String> roomTypeIds,
			String arrivalDateDdMmYyyy,
			String departureDateDdMmYyyy
	) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("hotelID", hotelId);
		body.put("arrivalDate", arrivalDateDdMmYyyy);
		body.put("departureDate", departureDateDdMmYyyy);
		if (roomTypeIds != null && !roomTypeIds.isEmpty()) {
			body.put("roomTypeIDs", roomTypeIds);
		}

		OnePmsEnvelope envelope = post("/api-checkAvailabilityAndRate", body);
		if (!envelope.isSuccess()) {
			throw new ApiException(
					HttpStatus.BAD_GATEWAY,
					"ONEPMS_" + envelope.result(),
					envelope.message() == null || envelope.message().isBlank()
							? "OnePMS availability check failed"
							: envelope.message()
			);
		}

		JsonNode data = envelope.data();
		if (data == null || !data.isArray()) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_SCHEMA", "OnePMS availability payload is invalid");
		}

		List<OnePmsAvailabilityItem> items = new ArrayList<>();
		for (JsonNode node : data) {
			String roomTypeId = text(node, "roomTypeID");
			if (roomTypeId == null || roomTypeId.isBlank()) {
				continue;
			}
			List<OnePmsAvailabilityItem.DailyRate> dailyRates = new ArrayList<>();
			JsonNode ratesNode = node.get("dailyRates");
			if (ratesNode != null && ratesNode.isArray()) {
				for (JsonNode rateNode : ratesNode) {
					BigDecimal rate = decimal(rateNode, "rate");
					String date = text(rateNode, "date");
					if (date != null && rate != null) {
						dailyRates.add(new OnePmsAvailabilityItem.DailyRate(date, rate));
					}
				}
			}
			Integer amount = intValue(node, "amount");
			items.add(new OnePmsAvailabilityItem(
					roomTypeId,
					text(node, "name") != null ? text(node, "name") : roomTypeId,
					amount == null ? 0 : amount,
					dailyRates
			));
		}
		return items;
	}

	public OnePmsBookingResult addBooking(Map<String, Object> body) {
		OnePmsEnvelope envelope = post("/api-addBooking", body);
		if (!envelope.isSuccess()) {
			throw new ApiException(
					HttpStatus.BAD_GATEWAY,
					"ONEPMS_" + envelope.result(),
					envelope.message() == null || envelope.message().isBlank()
							? "OnePMS addBooking failed"
							: envelope.message()
			);
		}

		JsonNode data = envelope.data();
		if (data == null || !data.isArray() || data.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_SCHEMA", "OnePMS booking payload is invalid");
		}

		JsonNode first = data.get(0);
		String bookingReference = text(first, "bookingReference");
		if (bookingReference == null || bookingReference.isBlank()) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_SCHEMA", "OnePMS bookingReference missing");
		}

		List<String> bookingIds = new ArrayList<>();
		JsonNode idsNode = first.get("bookingIDs");
		if (idsNode != null && idsNode.isArray()) {
			for (JsonNode idNode : idsNode) {
				if (idNode != null && !idNode.isNull()) {
					bookingIds.add(idNode.asText());
				}
			}
		}
		return new OnePmsBookingResult(bookingReference, bookingIds);
	}

	public OnePmsBookingDetails getBookingDetails(String hotelId, String bookingReference) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("hotelID", hotelId);
		body.put("bookingReference", bookingReference);

		OnePmsEnvelope envelope = post("/api-getBookingDetails", body);
		if (!envelope.isSuccess()) {
			throw new ApiException(
					HttpStatus.BAD_GATEWAY,
					"ONEPMS_" + envelope.result(),
					envelope.message() == null || envelope.message().isBlank()
							? "OnePMS getBookingDetails failed"
							: envelope.message()
			);
		}

		JsonNode data = envelope.data();
		if (data == null || !data.isArray() || data.isEmpty()) {
			return null;
		}

		List<String> bookingIds = new ArrayList<>();
		for (JsonNode item : data) {
			String id = text(item, "bookingID");
			if (id != null && !id.isBlank() && !bookingIds.contains(id)) {
				bookingIds.add(id);
			}
		}

		OnePmsBookingDetails parsed = parseBookingDetails(data.get(0), bookingIds);
		if (parsed.bookingIds().isEmpty() && parsed.bookingId() != null && !parsed.bookingId().isBlank()) {
			return new OnePmsBookingDetails(
					parsed.bookingId(),
					parsed.bookingReference(),
					List.of(parsed.bookingId()),
					parsed.hotelId(),
					parsed.name(),
					parsed.email(),
					parsed.phone(),
					parsed.arrivalDate(),
					parsed.departureDate(),
					parsed.bookingStatus(),
					parsed.idNumber(),
					parsed.idType(),
					parsed.address(),
					parsed.totalAmount(),
					parsed.totalPaid(),
					parsed.totalRemaining(),
					parsed.paymentStatus(),
					parsed.rooms(),
					parsed.services(),
					parsed.payments(),
					parsed.created(),
					parsed.updated(),
					parsed.checkInTime(),
					parsed.checkOutTime(),
					parsed.notes()
			);
		}
		return parsed;
	}

	public void cancelBooking(String hotelId, String bookingReference, List<String> bookingIds) {
		if (bookingIds == null || bookingIds.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "bookingIDs are required to cancel");
		}

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("hotelID", hotelId);
		body.put("bookingReference", bookingReference);
		body.put("bookingIDs", bookingIds);

		OnePmsEnvelope envelope = post("/api-cancelBooking", body);
		if (envelope.isSuccess()) {
			return;
		}

		String result = envelope.result() == null ? "" : envelope.result();
		String message = envelope.message() == null || envelope.message().isBlank()
				? "OnePMS cancelBooking failed"
				: envelope.message();

		HttpStatus status = switch (result) {
			case "009" -> HttpStatus.NOT_FOUND;
			case "010", "011", "012", "013", "014", "015", "021" -> HttpStatus.CONFLICT;
			default -> HttpStatus.BAD_GATEWAY;
		};
		throw new ApiException(status, "ONEPMS_" + result, message);
	}

	private OnePmsBookingDetails parseBookingDetails(JsonNode node, List<String> bookingIds) {
		List<OnePmsBookingDetails.Room> rooms = new ArrayList<>();
		JsonNode roomsNode = node.get("rooms");
		if (roomsNode != null && roomsNode.isArray()) {
			for (JsonNode roomNode : roomsNode) {
				List<BigDecimal> rates = new ArrayList<>();
				JsonNode ratesNode = roomNode.get("rates");
				if (ratesNode != null && ratesNode.isArray()) {
					for (JsonNode rateNode : ratesNode) {
						if (rateNode == null || rateNode.isNull()) {
							continue;
						}
						if (rateNode.isNumber()) {
							rates.add(rateNode.decimalValue());
						} else {
							BigDecimal parsed = decimal(rateNode, "rate");
							if (parsed == null) {
								try {
									rates.add(new BigDecimal(rateNode.asText()));
								} catch (NumberFormatException ignored) {
									// Skip invalid rate entries.
								}
							} else {
								rates.add(parsed);
							}
						}
					}
				}
				rooms.add(new OnePmsBookingDetails.Room(
						text(roomNode, "roomTypeID"),
						text(roomNode, "roomNumber"),
						intValue(roomNode, "adult"),
						intValue(roomNode, "child"),
						boolValue(roomNode, "breakfast"),
						boolValue(roomNode, "lunch"),
						boolValue(roomNode, "dinner"),
						rates
				));
			}
		}

		List<OnePmsBookingDetails.ServiceLine> services = new ArrayList<>();
		JsonNode servicesNode = node.get("services");
		if (servicesNode != null && servicesNode.isArray()) {
			for (JsonNode serviceNode : servicesNode) {
				services.add(new OnePmsBookingDetails.ServiceLine(
						text(serviceNode, "serviceID"),
						text(serviceNode, "serviceName"),
						text(serviceNode, "serviceType"),
						intValue(serviceNode, "quantity"),
						decimal(serviceNode, "unitPrice"),
						decimal(serviceNode, "totalPrice")
				));
			}
		}

		List<OnePmsBookingDetails.Payment> payments = new ArrayList<>();
		JsonNode paymentsNode = node.get("payments");
		if (paymentsNode != null && paymentsNode.isArray()) {
			for (JsonNode paymentNode : paymentsNode) {
				payments.add(new OnePmsBookingDetails.Payment(
						text(paymentNode, "paymentDate"),
						text(paymentNode, "paymentMethodID"),
						text(paymentNode, "paymentMethodName"),
						decimal(paymentNode, "amount"),
						text(paymentNode, "paymentStatus"),
						text(paymentNode, "transactionID")
				));
			}
		}

		return new OnePmsBookingDetails(
				text(node, "bookingID"),
				text(node, "bookingReference"),
				bookingIds == null ? List.of() : List.copyOf(bookingIds),
				text(node, "hotelID"),
				text(node, "name"),
				text(node, "email"),
				text(node, "phone"),
				text(node, "arrivalDate"),
				text(node, "departureDate"),
				text(node, "bookingStatus"),
				text(node, "idNumber"),
				text(node, "idType"),
				text(node, "address"),
				decimal(node, "totalAmount"),
				decimal(node, "totalPaid"),
				decimal(node, "totalRemaining"),
				text(node, "paymentStatus"),
				rooms,
				services,
				payments,
				text(node, "created"),
				text(node, "updated"),
				text(node, "checkInTime"),
				text(node, "checkOutTime"),
				text(node, "notes")
		);
	}

	private OnePmsEnvelope post(String path, Object body) {
		try {
			String response = restClient.post()
					.uri(path)
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_JSON)
					.header("Authentication", authService.createAuthenticationHeader())
					.header("Accept-Language", "vi")
					.body(body)
					.retrieve()
					.onStatus(HttpStatusCode::isError, (request, clientResponse) -> {
						String responseBody = readBody(clientResponse.getBody());
						if (clientResponse.getStatusCode().value() == 429 || isRateLimitedBody(responseBody)) {
							throw rateLimitedException(responseBody);
						}
						throw new ApiException(
								HttpStatus.BAD_GATEWAY,
								"ONEPMS_HTTP",
								"Failed to call OnePMS: " + clientResponse.getStatusCode().value()
										+ (responseBody.isBlank() ? "" : " " + responseBody)
						);
					})
					.body(String.class);

			OnePmsEnvelope envelope = objectMapper.readValue(response, OnePmsEnvelope.class);
			if (isRateLimitedEnvelope(envelope)) {
				throw rateLimitedException(response);
			}
			return envelope;
		} catch (ApiException ex) {
			throw ex;
		} catch (RestClientException | IOException ex) {
			if (looksLikeRateLimit(ex.getMessage())) {
				throw rateLimitedException(ex.getMessage());
			}
			throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_HTTP", "Failed to call OnePMS: " + ex.getMessage());
		}
	}

	private ApiException rateLimitedException(String rawBody) {
		int retryAfterSeconds = 30;
		String message = "Quá nhiều yêu cầu, vui lòng thử lại sau";
		try {
			JsonNode node = objectMapper.readTree(rawBody == null ? "" : rawBody);
			if (node != null) {
				JsonNode retryNode = node.get("retryAfterSeconds");
				if (retryNode != null && retryNode.isNumber()) {
					retryAfterSeconds = Math.max(1, retryNode.asInt());
				}
				String pmsMessage = text(node, "message");
				if (pmsMessage != null && !pmsMessage.isBlank()) {
					message = pmsMessage;
				}
			}
		} catch (Exception ignored) {
			// Keep defaults when the body is not JSON.
		}
		return new ApiException(
				HttpStatus.TOO_MANY_REQUESTS,
				"ONEPMS_RATE_LIMITED",
				message + " (khoảng " + retryAfterSeconds + " giây)"
		);
	}

	private boolean isRateLimitedEnvelope(OnePmsEnvelope envelope) {
		if (envelope == null) {
			return false;
		}
		String result = envelope.result();
		return result != null && ("029".equals(result) || "429".equals(result));
	}

	private boolean isRateLimitedBody(String body) {
		if (body == null || body.isBlank()) {
			return false;
		}
		try {
			JsonNode node = objectMapper.readTree(body);
			String result = text(node, "result");
			return "029".equals(result) || "429".equals(result);
		} catch (Exception ex) {
			return looksLikeRateLimit(body);
		}
	}

	private static boolean looksLikeRateLimit(String message) {
		if (message == null || message.isBlank()) {
			return false;
		}
		String lower = message.toLowerCase();
		return lower.contains("429") || lower.contains("too many requests") || lower.contains("retryafterseconds");
	}

	private static String readBody(java.io.InputStream body) {
		if (body == null) {
			return "";
		}
		try {
			return new String(body.readAllBytes(), StandardCharsets.UTF_8);
		} catch (IOException ex) {
			return "";
		}
	}

	private static String text(JsonNode node, String field) {
		JsonNode value = node.get(field);
		return value == null || value.isNull() ? null : value.asText();
	}

	private static Integer intValue(JsonNode node, String field) {
		JsonNode value = node.get(field);
		if (value == null || value.isNull()) {
			return null;
		}
		if (value.isNumber()) {
			return value.intValue();
		}
		try {
			return Integer.parseInt(value.asText().trim());
		} catch (NumberFormatException ex) {
			return null;
		}
	}

	private static Boolean boolValue(JsonNode node, String field) {
		JsonNode value = node.get(field);
		if (value == null || value.isNull()) {
			return null;
		}
		if (value.isBoolean()) {
			return value.booleanValue();
		}
		String text = value.asText();
		if ("true".equalsIgnoreCase(text) || "1".equals(text)) {
			return true;
		}
		if ("false".equalsIgnoreCase(text) || "0".equals(text)) {
			return false;
		}
		return null;
	}

	private static BigDecimal decimal(JsonNode node, String field) {
		JsonNode value = node.get(field);
		if (value == null || value.isNull()) {
			return null;
		}
		if (value.isNumber()) {
			return value.decimalValue();
		}
		try {
			return new BigDecimal(value.asText());
		} catch (NumberFormatException ex) {
			return null;
		}
	}
}
