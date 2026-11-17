"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/services/api";
import { createInquiry } from "@/services/inquiries";

type FormState = "idle" | "submitting" | "success" | "error";

type FieldErrors = {
  guestName?: string;
  guestEmail?: string;
  question?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function HomeInquiryForm() {
  const t = useTranslations("Inquiry");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!guestName.trim()) {
      next.guestName = t("errorNameRequired");
    }
    if (!guestEmail.trim()) {
      next.guestEmail = t("errorEmailRequired");
    } else if (!isValidEmail(guestEmail)) {
      next.guestEmail = t("errorEmailInvalid");
    }
    if (!question.trim()) {
      next.question = t("errorQuestionRequired");
    }
    return next;
  }

  function mapServerFieldErrors(err: ApiError): FieldErrors {
    const next: FieldErrors = {};
    const message = (err.message || "").toLowerCase();
    const path = err.errors?.[0]?.path?.toLowerCase() ?? "";

    if (path.includes("guestname") || message.includes("guestname")) {
      next.guestName = t("errorNameRequired");
    } else if (path.includes("guestemail") || message.includes("guestemail") || message.includes("email")) {
      next.guestEmail = message.includes("valid") || message.includes("email")
        ? t("errorEmailInvalid")
        : t("errorEmailRequired");
    } else if (path.includes("question") || message.includes("question")) {
      next.question = t("errorQuestionRequired");
    }

    if (!next.guestName && !next.guestEmail && !next.question) {
      if (message.includes("must not be blank") || message.includes("not be empty")) {
        // Fallback when server only returns a generic blank message.
        const client = validate();
        return Object.keys(client).length ? client : next;
      }
    }
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setErrorMessage(null);
      setState("idle");
      return;
    }

    setState("submitting");
    setFieldErrors({});
    setErrorMessage(null);
    try {
      await createInquiry({
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim() || null,
        question: question.trim(),
      });
      setState("success");
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setQuestion("");
    } catch (err) {
      setState("error");
      if (err instanceof ApiError) {
        const mapped = mapServerFieldErrors(err);
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
          setErrorMessage(null);
        } else {
          setErrorMessage(err.message || t("errorGeneric"));
        }
      } else {
        setErrorMessage(err instanceof Error ? err.message : t("errorGeneric"));
      }
    }
  }

  if (state === "success") {
    return (
      <div className="inquiry-success" role="status">
        <p>{t("success")}</p>
        <button type="button" className="inquiry-again" onClick={() => setState("idle")}>
          {t("askAgain")}
        </button>
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={(event) => void onSubmit(event)} noValidate>
      <div className="inquiry-form-grid">
        <label>
          {t("name")}
          <input
            type="text"
            name="guestName"
            autoComplete="name"
            required
            maxLength={255}
            value={guestName}
            aria-invalid={Boolean(fieldErrors.guestName)}
            onChange={(event) => {
              setGuestName(event.target.value);
              if (fieldErrors.guestName) {
                setFieldErrors((current) => ({ ...current, guestName: undefined }));
              }
            }}
            disabled={state === "submitting"}
          />
          {fieldErrors.guestName ? (
            <span className="inquiry-field-error">{fieldErrors.guestName}</span>
          ) : null}
        </label>
        <label>
          {t("email")}
          <input
            type="email"
            name="guestEmail"
            autoComplete="email"
            required
            maxLength={255}
            value={guestEmail}
            aria-invalid={Boolean(fieldErrors.guestEmail)}
            onChange={(event) => {
              setGuestEmail(event.target.value);
              if (fieldErrors.guestEmail) {
                setFieldErrors((current) => ({ ...current, guestEmail: undefined }));
              }
            }}
            disabled={state === "submitting"}
          />
          {fieldErrors.guestEmail ? (
            <span className="inquiry-field-error">{fieldErrors.guestEmail}</span>
          ) : null}
        </label>
        <label className="inquiry-span-2">
          {t("phone")}
          <input
            type="tel"
            name="guestPhone"
            autoComplete="tel"
            maxLength={50}
            value={guestPhone}
            onChange={(event) => setGuestPhone(event.target.value)}
            disabled={state === "submitting"}
            placeholder={t("phoneOptional")}
          />
        </label>
        <label className="inquiry-span-2">
          {t("question")}
          <textarea
            name="question"
            required
            maxLength={4000}
            rows={5}
            value={question}
            aria-invalid={Boolean(fieldErrors.question)}
            onChange={(event) => {
              setQuestion(event.target.value);
              if (fieldErrors.question) {
                setFieldErrors((current) => ({ ...current, question: undefined }));
              }
            }}
            disabled={state === "submitting"}
          />
          {fieldErrors.question ? (
            <span className="inquiry-field-error">{fieldErrors.question}</span>
          ) : null}
        </label>
      </div>

      {state === "error" && errorMessage ? (
        <p className="inquiry-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button type="submit" className="inquiry-submit" disabled={state === "submitting"}>
        {state === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
