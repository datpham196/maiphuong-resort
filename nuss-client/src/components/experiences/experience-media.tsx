import { getApiBase } from "@/services/api";
import type { PublicExperience } from "@/services/experiences";

export function mediaUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

export function formatExperiencePrice(item: PublicExperience, locale: string) {
  if (item.priceAmount == null) return null;
  return `${item.priceAmount.toLocaleString(locale === "en" ? "en-US" : "vi-VN")} ${item.priceCurrency ?? "VND"}`;
}

export function splitContentLines(text: string | null | undefined) {
  if (!text?.trim()) return [];
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

type Props = {
  url: string | null | undefined;
  alt: string;
  className?: string;
};

export function ExperienceImg({ url, alt, className }: Props) {
  const src = mediaUrl(url);
  if (!src) {
    return <div className={className} aria-hidden="true" />;
  }
  return <img className={className} src={src} alt={alt} />;
}
