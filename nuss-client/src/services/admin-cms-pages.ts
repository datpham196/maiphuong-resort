import type { PageDocument } from "@/components/page-builder/types";
import { apiFetch } from "@/services/api";
import { getAdminToken } from "@/services/admin-rooms";

export type CmsPageKey = "spa" | "offers";

export type AdminCmsPageContent = {
  locale: string;
  slug: string | null;
  title: string | null;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  documentDraft: PageDocument;
  documentPublished: PageDocument | null;
  published: boolean;
  cmsStatus: string;
};

export type AdminCmsPage = {
  id: string;
  pageKey: CmsPageKey;
  active: boolean;
  contents: AdminCmsPageContent[];
};

export type CmsPageContentPayload = {
  slug?: string;
  title?: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  documentDraft?: PageDocument;
};

export function getAdminCmsPage(pageKey: CmsPageKey) {
  return apiFetch<AdminCmsPage>(`/api/admin/cms-pages/${encodeURIComponent(pageKey)}`, {
    token: getAdminToken(),
  });
}

export function updateAdminCmsPage(pageKey: CmsPageKey, payload: { active?: boolean }) {
  return apiFetch<AdminCmsPage>(`/api/admin/cms-pages/${encodeURIComponent(pageKey)}`, {
    method: "PUT",
    token: getAdminToken(),
    body: payload,
  });
}

export function deactivateAdminCmsPage(pageKey: CmsPageKey) {
  return apiFetch<void>(`/api/admin/cms-pages/${encodeURIComponent(pageKey)}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}

export function saveCmsPageContent(pageKey: CmsPageKey, locale: string, payload: CmsPageContentPayload) {
  return apiFetch<AdminCmsPage>(
    `/api/admin/cms-pages/${encodeURIComponent(pageKey)}/contents/${encodeURIComponent(locale)}`,
    {
      method: "PUT",
      token: getAdminToken(),
      body: payload,
    },
  );
}

export function publishCmsPageContent(pageKey: CmsPageKey, locale: string) {
  return apiFetch<AdminCmsPage>(
    `/api/admin/cms-pages/${encodeURIComponent(pageKey)}/contents/${encodeURIComponent(locale)}/publish`,
    {
      method: "POST",
      token: getAdminToken(),
    },
  );
}

export function unpublishCmsPageContent(pageKey: CmsPageKey, locale: string) {
  return apiFetch<AdminCmsPage>(
    `/api/admin/cms-pages/${encodeURIComponent(pageKey)}/contents/${encodeURIComponent(locale)}/unpublish`,
    {
      method: "POST",
      token: getAdminToken(),
    },
  );
}

export function uploadCmsPageMedia(pageKey: CmsPageKey, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ url: string; storageKey: string }>(
    `/api/admin/cms-pages/${encodeURIComponent(pageKey)}/media`,
    {
      method: "POST",
      token: getAdminToken(),
      formData,
    },
  );
}

export function createCmsPagePreviewToken(pageKey: CmsPageKey, locale: string) {
  return apiFetch<{ token: string; expiresInSeconds: number }>(
    `/api/admin/cms-pages/${encodeURIComponent(pageKey)}/preview-token?locale=${encodeURIComponent(locale)}`,
    {
      method: "POST",
      token: getAdminToken(),
    },
  );
}
