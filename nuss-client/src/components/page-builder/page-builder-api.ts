import type { PageDocument } from "@/components/page-builder/types";

export type PageBuilderContentPayload = {
  title?: string;
  slug?: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  documentDraft?: PageDocument;
};

export type PageBuilderApi = {
  saveContent: (locale: string, payload: PageBuilderContentPayload) => Promise<unknown>;
  publishContent: (locale: string) => Promise<unknown>;
  /** Optional — hide published page from public site for this locale. */
  unpublishContent?: (locale: string) => Promise<unknown>;
  createPreviewToken: (locale: string) => Promise<{ token: string }>;
  uploadMedia: (file: File) => Promise<{ url: string }>;
  /** Build absolute path for opening preview in a new tab. */
  previewPath: (locale: string, token: string) => string;
};
