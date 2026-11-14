import { apiFetch } from "@/services/api";
import type { PageDocument } from "@/components/page-builder/types";
import type { CmsPageKey } from "@/services/admin-cms-pages";

export type PublicCmsPage = {
  id: string;
  pageKey: CmsPageKey;
  slug: string | null;
  title: string;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  document: PageDocument;
};

export function fetchPublicCmsPage(pageKey: CmsPageKey, locale: string) {
  return apiFetch<PublicCmsPage>(
    `/api/cms-pages/${encodeURIComponent(pageKey)}?locale=${encodeURIComponent(locale)}`,
  );
}

export function fetchCmsPagePreview(pageKey: CmsPageKey, token: string) {
  return apiFetch<PublicCmsPage>(
    `/api/cms-pages/${encodeURIComponent(pageKey)}/preview?token=${encodeURIComponent(token)}`,
  );
}
