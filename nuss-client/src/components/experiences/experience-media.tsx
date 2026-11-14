import { getApiBase } from "@/services/api";

export function mediaUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
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
