package com.maiphuong.nuss.inquiries.service;

import com.maiphuong.nuss.inquiries.entity.GuestInquiry;
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

import java.nio.charset.StandardCharsets;

@Service
public class InquiryMailService {

	private static final Logger log = LoggerFactory.getLogger(InquiryMailService.class);

	private final JavaMailSender mailSender;
	private final NussProperties properties;
	private final String mailUsername;
	private final String mailPassword;

	public InquiryMailService(
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
	public void sendNewInquiryToResort(GuestInquiry inquiry) {
		String resortTo = properties.mail().resortTo();
		if (!StringUtils.hasText(resortTo)) {
			log.warn("Skip inquiry email: mail.resortTo is empty ({})", inquiry.getId());
			return;
		}
		if (!isMailConfigured()) {
			log.warn("Skip inquiry email: MAIL_USERNAME/MAIL_PASSWORD are not configured ({})", inquiry.getId());
			return;
		}

		String name = blankToDash(inquiry.getGuestName());
		String subject = "New guest question — " + name;
		sendOne(resortTo.trim(), subject, buildNewInquiryHtml(inquiry));
	}

	@Async
	public void sendAnswerToGuest(GuestInquiry inquiry) {
		String guestEmail = inquiry.getGuestEmail();
		if (!StringUtils.hasText(guestEmail)) {
			log.warn("Skip answer email: guest email is empty ({})", inquiry.getId());
			return;
		}
		if (!StringUtils.hasText(inquiry.getStaffAnswer())) {
			log.warn("Skip answer email: staff answer is empty ({})", inquiry.getId());
			return;
		}
		if (!isMailConfigured()) {
			log.warn("Skip answer email: MAIL_USERNAME/MAIL_PASSWORD are not configured ({})", inquiry.getId());
			return;
		}

		String subject = "Mai Phuong Resort — reply to your question";
		sendOne(guestEmail.trim(), subject, buildAnswerHtml(inquiry));
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
			log.info("Inquiry email sent to {} ({})", to, subject);
		} catch (Exception ex) {
			log.error("Failed to send inquiry email to {}: {}", to, ex.getMessage());
		}
	}

	private boolean isMailConfigured() {
		return StringUtils.hasText(properties.mail().from())
				&& StringUtils.hasText(mailUsername)
				&& StringUtils.hasText(mailPassword);
	}

	private static String buildNewInquiryHtml(GuestInquiry inquiry) {
		return """
				<!DOCTYPE html>
				<html>
				<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
				<body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#1f2a2e;">
				  <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e6e1d6;overflow:hidden;">
				    <div style="background:#164e63;padding:22px 28px;">
				      <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.78);">Mai Phuong Resort</div>
				      <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;">New guest question</h1>
				    </div>
				    <div style="padding:28px;">
				      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.55;">
				        A guest submitted a private question from the website.
				      </p>
				      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
				        <tr>
				          <td style="padding:8px 0;color:#6b7280;width:120px;vertical-align:top;">Name</td>
				          <td style="padding:8px 0;font-weight:700;">%s</td>
				        </tr>
				        <tr>
				          <td style="padding:8px 0;color:#6b7280;vertical-align:top;">Email</td>
				          <td style="padding:8px 0;font-weight:700;color:#1c4b7a;">%s</td>
				        </tr>
				        <tr>
				          <td style="padding:8px 0;color:#6b7280;vertical-align:top;">Phone</td>
				          <td style="padding:8px 0;font-weight:700;">%s</td>
				        </tr>
				      </table>
				      <div style="margin:20px 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Question</div>
				      <div style="padding:14px 16px;background:#f7f4ec;border:1px solid #e6e1d6;border-radius:10px;white-space:pre-wrap;line-height:1.55;font-size:14px;">%s</div>
				    </div>
				  </div>
				</body>
				</html>
				""".formatted(
				escape(blankToDash(inquiry.getGuestName())),
				escape(blankToDash(inquiry.getGuestEmail())),
				escape(blankToDash(inquiry.getGuestPhone())),
				escape(blankToDash(inquiry.getQuestion()))
		);
	}

	private static String buildAnswerHtml(GuestInquiry inquiry) {
		return """
				<!DOCTYPE html>
				<html>
				<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
				<body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#1f2a2e;">
				  <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e6e1d6;overflow:hidden;">
				    <div style="background:#164e63;padding:22px 28px;">
				      <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.78);">Mai Phuong Resort</div>
				      <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;">Reply to your question</h1>
				    </div>
				    <div style="padding:28px;">
				      <p style="margin:0 0 20px;font-size:15px;line-height:1.55;">
				        Hello <strong>%s</strong>,
				      </p>
				      <p style="margin:0 0 22px;color:#6b7280;font-size:14px;line-height:1.55;">
				        Thank you for contacting Mai Phuong Resort Phu Quoc. Here is our reply to your question.
				      </p>

				      <div style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Your question</div>
				      <div style="margin:0 0 20px;padding:14px 16px;background:#f7f4ec;border:1px solid #e6e1d6;border-radius:10px;white-space:pre-wrap;line-height:1.55;font-size:14px;">%s</div>

				      <div style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Our reply</div>
				      <div style="margin:0 0 24px;padding:16px;background:#eef6f8;border:1px solid #cfe0e6;border-left:4px solid #164e63;border-radius:10px;white-space:pre-wrap;line-height:1.6;font-size:15px;color:#1f2a2e;">%s</div>

				      <p style="margin:0;padding-top:18px;border-top:1px solid #e6e1d6;color:#6b7280;font-size:13px;line-height:1.55;">
				        Mai Phuong Resort Phu Quoc<br>
				        We look forward to welcoming you.
				      </p>
				    </div>
				  </div>
				</body>
				</html>
				""".formatted(
				escape(blankToDash(inquiry.getGuestName())),
				escape(blankToDash(inquiry.getQuestion())),
				escape(blankToDash(inquiry.getStaffAnswer()))
		);
	}

	private static String escape(String value) {
		return HtmlUtils.htmlEscape(value == null ? "" : value);
	}

	private static String blankToDash(String value) {
		return StringUtils.hasText(value) ? value.trim() : "—";
	}
}
