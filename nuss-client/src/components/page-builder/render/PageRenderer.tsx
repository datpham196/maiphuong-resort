import type { ReactNode } from "react";
import { BlockSlider } from "@/components/page-builder/blocks/block-slider";
import { resolveMediaUrl, vimeoEmbedUrl, youtubeEmbedUrl } from "@/components/page-builder/media";
import {
  marginStyle,
  type BlockMargin,
  type BlockNode,
  type PageDocument,
  type RenderMode,
} from "@/components/page-builder/types";
import { Link } from "@/i18n/navigation";

type Props = {
  document: PageDocument | null | undefined;
  mode?: RenderMode;
  selectedId?: string | null;
  errorIds?: string[];
  onSelect?: (id: string) => void;
};

function asMargin(value: unknown): BlockMargin | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as BlockMargin;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBool(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function PageRenderer({
  document,
  mode = "live",
  selectedId = null,
  errorIds = [],
  onSelect,
}: Props) {
  if (!document?.root) {
    return <p className="pb-empty">Chưa có nội dung.</p>;
  }
  return (
    <div className={`pb-page is-${mode}`}>
      {(document.root.children ?? []).map((child) => (
        <BlockView
          key={child.id}
          node={child}
          mode={mode}
          selectedId={selectedId}
          errorIds={errorIds}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function BlockView({
  node,
  mode,
  selectedId,
  errorIds,
  onSelect,
}: {
  node: BlockNode;
  mode: RenderMode;
  selectedId: string | null;
  errorIds: string[];
  onSelect?: (id: string) => void;
}) {
  const editable = mode === "edit";
  const selected = selectedId === node.id;
  const hasError = errorIds.includes(node.id);
  const wrap = (content: ReactNode) => {
    if (!editable) return content;
    return (
      <div
        className={`pb-block-frame${selected ? " is-selected" : ""}${hasError ? " is-error" : ""}`}
        data-block-id={node.id}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(node.id);
        }}
      >
        {content}
      </div>
    );
  };

  const props = node.props ?? {};
  const margin = asMargin(props.margin);

  switch (node.type) {
    case "heading": {
      const level = Math.min(3, Math.max(1, asNumber(props.level, 2)));
      const Tag = (`h${level}` as "h1" | "h2" | "h3");
      return wrap(
        <Tag
          className="pb-heading"
          style={{
            ...marginStyle(margin),
            textAlign: asString(props.align, "left") as "left" | "center" | "right",
            color: asString(props.color, undefined as unknown as string) || undefined,
          }}
        >
          {asString(props.text, "Tiêu đề")}
        </Tag>,
      );
    }
    case "text":
      return wrap(
        <p
          className="pb-text"
          style={{
            ...marginStyle(margin),
            textAlign: asString(props.align, "left") as "left" | "center" | "right",
            color: asString(props.color, undefined as unknown as string) || undefined,
            fontSize: asNumber(props.fontSize, 16),
            whiteSpace: "pre-wrap",
          }}
        >
          {asString(props.text)}
        </p>,
      );
    case "image": {
      const src = resolveMediaUrl(asString(props.src));
      return wrap(
        <figure
          className="pb-image"
          style={{
            ...marginStyle(margin),
            textAlign: asString(props.align, "center") as "left" | "center" | "right",
          }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={asString(props.alt)}
              style={{
                width: asString(props.width, "full") === "full" ? "100%" : asString(props.width),
                borderRadius: asNumber(props.radius, 12),
              }}
            />
          ) : (
            <div className="pb-placeholder">Chưa có ảnh</div>
          )}
        </figure>,
      );
    }
    case "mediaText": {
      const src = resolveMediaUrl(asString(props.src));
      const imagePosition = asString(props.imagePosition, "left") === "right" ? "right" : "left";
      const stackOnMobile = asBool(props.stackOnMobile, true);
      const gap = asNumber(props.gap, 24);
      const radius = asNumber(props.radius, 12);
      return wrap(
        <div
          className={`pb-media-text is-image-${imagePosition}${stackOnMobile ? " is-stack-mobile" : ""}`}
          style={{ ...marginStyle(margin), gap }}
        >
          <figure className="pb-media-text-media">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={asString(props.alt) || asString(props.text).slice(0, 80)}
                style={{ borderRadius: radius }}
              />
            ) : (
              <div className="pb-placeholder">Chưa có ảnh</div>
            )}
          </figure>
          <div className="pb-media-text-body">
            <p
              className="pb-media-text-copy"
              style={{
                color: asString(props.color, undefined as unknown as string) || undefined,
                fontSize: asNumber(props.fontSize, 16),
                whiteSpace: "pre-wrap",
              }}
            >
              {asString(props.text)}
            </p>
          </div>
        </div>,
      );
    }
    case "imageGallery": {
      const images = Array.isArray(props.images) ? (props.images as { src?: string; alt?: string }[]) : [];
      const columns = asNumber(props.columns, 3);
      const gap = asNumber(props.gap, 12);
      return wrap(
        <div
          className="pb-gallery"
          style={{
            ...marginStyle(margin),
            gridTemplateColumns: `repeat(${Math.min(4, Math.max(2, columns))}, minmax(0, 1fr))`,
            gap,
          }}
        >
          {images.length === 0 ? <div className="pb-placeholder">Chưa có ảnh gallery</div> : null}
          {images.map((image, index) => {
            const src = resolveMediaUrl(image.src);
            return (
              <figure key={`${image.src}-${index}`}>
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={image.alt ?? ""} />
                ) : null}
              </figure>
            );
          })}
        </div>,
      );
    }
    case "slider": {
      const slides = Array.isArray(props.slides) ? (props.slides as { src?: string; alt?: string; caption?: string }[]) : [];
      return wrap(
        <div style={marginStyle(margin)}>
          <BlockSlider
            slides={slides}
            autoplay={asBool(props.autoplay, true)}
            intervalMs={asNumber(props.intervalMs, 3000)}
            showDots={asBool(props.showDots, true)}
          />
        </div>,
      );
    }
    case "video": {
      const url = asString(props.url);
      const provider = asString(props.provider, "youtube");
      const embed =
        provider === "vimeo" ? vimeoEmbedUrl(url) : provider === "youtube" ? youtubeEmbedUrl(url) : null;
      return wrap(
        <div className="pb-video" style={marginStyle(margin)}>
          {embed ? (
            <iframe src={embed} title="Video" allowFullScreen loading="lazy" />
          ) : url ? (
            <video src={resolveMediaUrl(url) ?? url} controls />
          ) : (
            <div className="pb-placeholder">Chưa có video</div>
          )}
        </div>,
      );
    }
    case "button": {
      const href = asString(props.href, "#");
      const label = asString(props.label, "Button");
      const styleName = asString(props.style, "primary");
      const align = asString(props.align, "left");
      const openInNewTab = asBool(props.openInNewTab, false);
      const className = `pb-button is-${styleName}`;
      // Admin builder has no next-intl provider — avoid Link in edit mode.
      const buttonEl =
        mode === "edit" ? (
          <span className={className}>{label}</span>
        ) : href.startsWith("http") || openInNewTab ? (
          <a className={className} href={href} target={openInNewTab ? "_blank" : undefined} rel="noreferrer">
            {label}
          </a>
        ) : (
          <Link className={className} href={href}>
            {label}
          </Link>
        );
      return wrap(
        <div className="pb-button-wrap" style={{ ...marginStyle(margin), textAlign: align as "left" | "center" | "right" }}>
          {buttonEl}
        </div>,
      );
    }
    case "divider":
      return wrap(
        <hr
          className="pb-divider"
          style={{
            ...marginStyle(margin),
            borderTopStyle: asString(props.style, "solid") as "solid" | "dashed",
            borderTopColor: asString(props.color, "rgba(36,59,62,0.18)"),
            borderTopWidth: asNumber(props.thickness, 1),
          }}
        />,
      );
    case "spacer":
      return wrap(<div className="pb-spacer" style={{ height: asNumber(props.height, 24) }} aria-hidden="true" />);
    case "columns": {
      const gap = asNumber(props.gap, 24);
      const count = asNumber(props.columns, 2);
      const stack = asBool(props.stackOnMobile, true);
      return wrap(
        <div
          className={`pb-columns${stack ? " is-stack-mobile" : ""}`}
          style={{
            ...marginStyle(margin),
            gap,
            gridTemplateColumns: `repeat(${Math.min(3, Math.max(2, count))}, minmax(0, 1fr))`,
          }}
        >
          {(node.children ?? []).map((child) => (
            <BlockView
              key={child.id}
              node={child}
              mode={mode}
              selectedId={selectedId}
              errorIds={errorIds}
              onSelect={onSelect}
            />
          ))}
        </div>,
      );
    }
    case "column":
      return wrap(
        <div className="pb-column">
          {(node.children ?? []).map((child) => (
            <BlockView
              key={child.id}
              node={child}
              mode={mode}
              selectedId={selectedId}
              errorIds={errorIds}
              onSelect={onSelect}
            />
          ))}
          {editable && (node.children ?? []).length === 0 ? (
            <div className="pb-placeholder">Cột trống</div>
          ) : null}
        </div>,
      );
    default:
      return null;
  }
}
