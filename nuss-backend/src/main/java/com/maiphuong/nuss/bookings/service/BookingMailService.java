package com.maiphuong.nuss.bookings.service;

import com.maiphuong.nuss.bookings.dto.BookingLookupResponse;
import com.maiphuong.nuss.bookings.dto.CreateBookingResponse;
import com.maiphuong.nuss.shared.config.NussProperties;
import jakarta.mail.internet.InternetAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Service
public class BookingMailService {

	private static final Logger log = LoggerFactory.getLogger(BookingMailService.class);
	private static final DateTimeFormatter STAY_DATE = DateTimeFormatter.ofPattern("EEEE, MMMM d yyyy", Locale.ENGLISH);
	private static final NumberFormat MONEY = NumberFormat.getNumberInstance(Locale.US);

	private final JavaMailSender mailSender;
	private final NussProperties properties;
	private final String mailUsername;
	private final String mailPassword;

	public BookingMailService(
			JavaMailSender mailSender,
			NussProperties properties,
			@Value("${spring.mail.username:}") String mailUsername,
			@Value("${spring.mail.password:}") String mailPassword
	) {
		this.mailSender = mailSender;
		this.properties = properties;
		this.mailUsername = mailUsername;
		this.mailPassword = mailPassword;
	}

	@Async
	public void sendBookingEmails(CreateBookingResponse booking, String guestName, String guestEmail) {
		if (!StringUtils.hasText(guestEmail)) {
			log.warn("Skip booking emails: guest email is empty ({})", booking.requestCode());
			return;
		}
		if (!isMailConfigured()) {
			log.warn("Skip booking emails: MAIL_USERNAME/MAIL_PASSWORD are not configured ({})", booking.requestCode());
			return;
		}

		String bookingCode = resolveBookingCode(booking);
		String html = buildHtml(booking, guestName, guestEmail, false);
		String resortHtml = buildHtml(booking, guestName, guestEmail, true);

		sendOne(
				guestEmail.trim(),
				"Booking confirmation — " + bookingCode,
				html
		);

		String resortTo = properties.mail().resortTo();
		if (StringUtils.hasText(resortTo)) {
			sendOne(
					resortTo.trim(),
					"New booking received — " + bookingCode,
					resortHtml
			);
		}
	}

	@Async
	public void sendCancellationEmails(BookingLookupResponse booking) {
		String guestEmail = booking.email();
		String bookingCode = resolveLookupBookingCode(booking);
		if (!StringUtils.hasText(guestEmail)) {
			log.warn("Skip cancellation emails: guest email is empty ({})", bookingCode);
			return;
		}
		if (!isMailConfigured()) {
			log.warn("Skip cancellation emails: MAIL_USERNAME/MAIL_PASSWORD are not configured ({})", bookingCode);
			return;
		}

		String html = buildCancellationHtml(booking, false);
		String resortHtml = buildCancellationHtml(booking, true);

		sendOne(
				guestEmail.trim(),
				"Booking cancelled — " + bookingCode,
				html
		);

		String resortTo = properties.mail().resortTo();
		if (StringUtils.hasText(resortTo)) {
			sendOne(
					resortTo.trim(),
					"Booking cancelled by guest — " + bookingCode,
					resortHtml
			);
		}
	}

	private void sendOne(String to, String subject, String htmlBody) {
		try {
			var message = mailSender.createMimeMessage();
			var helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
			helper.setFrom(new InternetAddress(
					properties.mail().from(),
					properties.mail().fromName(),
					StandardCharsets.UTF_8.name()
			));
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(htmlBody, true);
			mailSender.send(message);
			log.info("Booking email sent to {} ({})", to, subject);
		} catch (Exception ex) {
			log.error("Failed to send booking email to {}: {}", to, ex.getMessage());
		}
	}

	private boolean isMailConfigured() {
		return StringUtils.hasText(properties.mail().from())
				&& StringUtils.hasText(mailUsername)
				&& StringUtils.hasText(mailPassword);
	}

	private static String resolveBookingCode(CreateBookingResponse booking) {
		if (StringUtils.hasText(booking.bookingReference())) {
			return booking.bookingReference();
		}
		return booking.requestCode();
	}

	private static String resolveLookupBookingCode(BookingLookupResponse booking) {
		if (StringUtils.hasText(booking.bookingReference())) {
			return booking.bookingReference();
		}
		if (StringUtils.hasText(booking.bookingId())) {
			return booking.bookingId();
		}
		return "-";
	}

	private static String buildCancellationHtml(BookingLookupResponse booking, boolean forResort) {
		String title = forResort
				? "A booking was cancelled for Mai Phuong Resort"
				: "Your booking at Mai Phuong Resort has been cancelled";
		String bookingCode = escape(resolveLookupBookingCode(booking));
		String name = escape(blankToDash(booking.name()));
		String email = escape(blankToDash(booking.email()));
		String phone = escape(blankToDash(booking.phone()));
		String currency = StringUtils.hasText(booking.currency()) ? booking.currency() : "VND";
		String total = formatMoney(booking.totalAmount()) + " " + escape(currency);

		StringBuilder roomRows = new StringBuilder();
		if (booking.rooms() != null && !booking.rooms().isEmpty()) {
			for (BookingLookupResponse.Room room : booking.rooms()) {
				String roomLabel = StringUtils.hasText(room.roomTitle())
						? room.roomTitle()
						: blankToDash(room.roomTypeId());
				int adults = room.adult() == null ? 0 : room.adult();
				int children = room.child() == null ? 0 : room.child();
				roomRows.append("""
						<tr>
						  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;vertical-align:top;">
						    <div style="font-weight:700;color:#1f2a2e;">%s</div>
						    <div style="margin-top:4px;color:#6b7280;font-size:13px;">Room: %s · Adults: %d, Children: %d</div>
						  </td>
						</tr>
						""".formatted(
						escape(roomLabel),
						escape(blankToDash(room.roomNumber())),
						adults,
						children
				));
			}
		} else {
			roomRows.append("""
					<tr>
					  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;color:#6b7280;">No room details</td>
					</tr>
					""");
		}

		return """
				<!DOCTYPE html>
				<html>
				<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
				<body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#1f2a2e;">
				  <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e6e1d6;padding:28px 28px 24px;">
				    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#9b2c2c;font-weight:700;">%s</h1>
				    <p style="margin:0 0 22px;color:#6b7280;font-size:14px;line-height:1.5;">
				      This reservation is no longer active. If you did not request this cancellation, please contact the resort.
				    </p>

				    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;width:180px;">Reservation Number</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">Status</td>
				        <td style="padding:6px 0;font-weight:700;color:#9b2c2c;">Cancelled</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">Check-In</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">Check-Out</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">Total (was)</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				    </table>

				    <div style="margin:18px 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Room details</div>
				    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
				      %s
				    </table>

				    <div style="margin:22px 0 8px;border-top:1px solid #e5e5e5;padding-top:16px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Customer</div>
				    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;width:180px;">Name</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">Phone</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">E-Mail</td>
				        <td style="padding:6px 0;font-weight:700;color:#1c4b7a;">%s</td>
				      </tr>
				    </table>

				    <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
				      Mai Phuong Resort Phu Quoc — thank you for letting us know. We hope to welcome you another time.
				    </p>
				  </div>
				</body>
				</html>
				""".formatted(
				escape(title),
				bookingCode,
				escape(blankToDash(booking.arrivalDate())),
				escape(blankToDash(booking.departureDate())),
				total,
				roomRows,
				name,
				phone,
				email
		);
	}

	private static String buildHtml(
			CreateBookingResponse booking,
			String guestName,
			String guestEmail,
			boolean forResort
	) {
		String title = forResort
				? "You have a new booking for Mai Phuong Resort"
				: "Your booking at Mai Phuong Resort is confirmed";
		String bookingCode = escape(resolveBookingCode(booking));
		String name = escape(blankToDash(guestName));
		String email = escape(blankToDash(guestEmail));
		String currency = StringUtils.hasText(booking.currency()) ? booking.currency() : "VND";
		String total = formatMoney(booking.totalAmount()) + " " + escape(currency);
		long nights = nightsBetween(booking.arrivalDate(), booking.departureDate());
		String guestsLabel = formatGuests(booking.adults(), booking.children());

		StringBuilder roomRows = new StringBuilder();
		if (booking.items() != null && !booking.items().isEmpty()) {
			for (CreateBookingResponse.Item item : booking.items()) {
				roomRows.append("""
						<tr>
						  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;vertical-align:top;">
						    <div style="font-weight:700;color:#1f2a2e;">%s</div>
						    <div style="margin-top:4px;color:#6b7280;font-size:13px;">Adults: %d, Children: %d · Rooms: %d</div>
						  </td>
						  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;text-align:right;white-space:nowrap;font-weight:600;color:#1f2a2e;vertical-align:top;">
						    %s %s
						  </td>
						</tr>
						""".formatted(
						escape(item.title()),
						item.adults(),
						item.children(),
						item.roomCount(),
						formatMoney(item.lineTotal()),
						escape(currency)
				));
			}
		} else {
			roomRows.append("""
					<tr>
					  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;">%s</td>
					  <td style="padding:10px 0;border-bottom:1px solid #e8e8e8;text-align:right;font-weight:600;">%s</td>
					</tr>
					""".formatted(escape(booking.roomTitle()), total));
		}

		return """
				<!DOCTYPE html>
				<html>
				<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
				<body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#1f2a2e;">
				  <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e6e1d6;padding:28px 28px 24px;">
				    <h1 style="margin:0 0 22px;font-size:26px;line-height:1.25;color:#1c4b7a;font-weight:700;">%s</h1>

				    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;width:180px;">Source / Channel</td>
				        <td style="padding:6px 0;font-weight:700;">Website</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">Reservation Number</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">Payment Collect</td>
				        <td style="padding:6px 0;font-weight:700;">Pay at hotel</td>
				      </tr>
				    </table>

				    <div style="margin:22px 0;border-top:1px solid #d9d9d9;border-bottom:1px solid #d9d9d9;">
				      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;text-align:center;">
				        <tr>
				          <td style="padding:16px 8px;width:38%%;border-right:1px solid #e5e5e5;">
				            <div style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Check-In</div>
				            <div style="margin-top:6px;font-weight:700;font-size:15px;">%s</div>
				          </td>
				          <td style="padding:16px 8px;width:24%%;border-right:1px solid #e5e5e5;">
				            <div style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Nights</div>
				            <div style="margin-top:6px;font-weight:700;font-size:28px;line-height:1;">%d</div>
				          </td>
				          <td style="padding:16px 8px;width:38%%;">
				            <div style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Check-Out</div>
				            <div style="margin-top:6px;font-weight:700;font-size:15px;">%s</div>
				          </td>
				        </tr>
				      </table>
				    </div>

				    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin-bottom:8px;">
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;width:180px;">Guests</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">Rooms Booked</td>
				        <td style="padding:6px 0;font-weight:700;">%d</td>
				      </tr>
				    </table>

				    <div style="margin:18px 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Room details</div>
				    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
				      %s
				      <tr>
				        <td style="padding:14px 0 6px;font-weight:700;font-size:16px;">Total</td>
				        <td style="padding:14px 0 6px;text-align:right;font-weight:700;font-size:16px;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0 0;color:#1c4b7a;font-weight:700;">Amount to pay at hotel</td>
				        <td style="padding:6px 0 0;text-align:right;color:#1c4b7a;font-weight:700;">%s</td>
				      </tr>
				    </table>

				    <div style="margin:22px 0 8px;border-top:1px solid #e5e5e5;padding-top:16px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Customer</div>
				    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;width:180px;">Name</td>
				        <td style="padding:6px 0;font-weight:700;">%s</td>
				      </tr>
				      <tr>
				        <td style="padding:6px 0;color:#6b7280;">E-Mail</td>
				        <td style="padding:6px 0;font-weight:700;color:#1c4b7a;">%s</td>
				      </tr>
				    </table>

				    <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
				      Payment is collected at the resort. No online charge has been made for this booking.
				    </p>
				  </div>
				</body>
				</html>
				""".formatted(
				escape(title),
				bookingCode,
				escape(formatDate(booking.arrivalDate())),
				nights,
				escape(formatDate(booking.departureDate())),
				escape(guestsLabel),
				booking.roomCount(),
				roomRows,
				total,
				total,
				name,
				email
		);
	}

	private static long nightsBetween(LocalDate arrival, LocalDate departure) {
		if (arrival == null || departure == null) {
			return 0;
		}
		return Math.max(1, ChronoUnit.DAYS.between(arrival, departure));
	}

	private static String formatGuests(int adults, int children) {
		StringBuilder sb = new StringBuilder();
		sb.append(adults).append(adults == 1 ? " adult" : " adults");
		if (children > 0) {
			sb.append(", ").append(children).append(children == 1 ? " child" : " children");
		}
		return sb.toString();
	}

	private static String formatMoney(BigDecimal amount) {
		if (amount == null) {
			return "0";
		}
		return MONEY.format(amount);
	}

	private static String formatDate(LocalDate date) {
		return date == null ? "-" : STAY_DATE.format(date);
	}

	private static String blankToDash(String value) {
		return value == null || value.isBlank() ? "-" : value.trim();
	}

	private static String escape(String value) {
		return HtmlUtils.htmlEscape(value == null ? "" : value);
	}
}
