"use client";

import { BLOCK_REGISTRY } from "@/components/page-builder/registry";
import { resolveMediaUrl } from "@/components/page-builder/media";
import type { BlockNode } from "@/components/page-builder/types";
import { uploadRestaurantMedia } from "@/services/admin-restaurants";

type Props = {
  node: BlockNode | null;
  restaurantId: string;
  onChange: (props: Record<string, unknown>) => void;
};

export function SettingsPanel({ node, restaurantId, onChange }: Props) {
  if (!node || node.type === "root" || node.type === "column") {
    return (
      <aside className="pb-settings">
        <h3>Settings</h3>
        <p className="admin-muted">Chọn một element trên canvas để chỉnh thuộc tính.</p>
      </aside>
    );
  }

  const def = BLOCK_REGISTRY[node.type];
  const props = node.props ?? {};

  async function onPickImage(field: string, file: File | null) {
    if (!file) return;
    const uploaded = await uploadRestaurantMedia(restaurantId, file);
    onChange({ [field]: uploaded.url });
  }

  return (
    <aside className="pb-settings">
      <h3>{def?.label ?? node.type}</h3>
      <div className="pb-settings-form">
        {"text" in props || node.type === "heading" || node.type === "text" ? (
          <label>
            Nội dung
            <textarea
              rows={4}
              value={String(props.text ?? "")}
              onChange={(e) => onChange({ text: e.target.value })}
            />
          </label>
        ) : null}

        {node.type === "heading" ? (
          <label>
            Cấp tiêu đề
            <select
              value={Number(props.level ?? 2)}
              onChange={(e) => onChange({ level: Number(e.target.value) })}
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          </label>
        ) : null}

        {node.type === "text" ? (
          <label>
            Cỡ chữ (px)
            <input
              type="number"
              value={Number(props.fontSize ?? 16)}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            />
          </label>
        ) : null}

        {"align" in props || ["heading", "text", "image", "button"].includes(node.type) ? (
          <label>
            Căn lề
            <select
              value={String(props.align ?? "left")}
              onChange={(e) => onChange({ align: e.target.value })}
            >
              <option value="left">Trái</option>
              <option value="center">Giữa</option>
              <option value="right">Phải</option>
            </select>
          </label>
        ) : null}

        {"color" in props || ["heading", "text", "divider"].includes(node.type) ? (
          <label>
            Màu
            <input
              type="color"
              value={normalizeColor(String(props.color ?? "#243b3e"))}
              onChange={(e) => onChange({ color: e.target.value })}
            />
          </label>
        ) : null}

        {node.type === "image" ? (
          <>
            <label>
              Ảnh
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => void onPickImage("src", e.target.files?.[0] ?? null)}
              />
            </label>
            <label>
              Alt
              <input value={String(props.alt ?? "")} onChange={(e) => onChange({ alt: e.target.value })} />
            </label>
            <label>
              Bo góc
              <input
                type="number"
                value={Number(props.radius ?? 12)}
                onChange={(e) => onChange({ radius: Number(e.target.value) })}
              />
            </label>
          </>
        ) : null}

        {node.type === "button" ? (
          <>
            <label>
              Nhãn
              <input value={String(props.label ?? "")} onChange={(e) => onChange({ label: e.target.value })} />
            </label>
            <label>
              Link
              <input value={String(props.href ?? "")} onChange={(e) => onChange({ href: e.target.value })} />
            </label>
            <label>
              Kiểu
              <select
                value={String(props.style ?? "primary")}
                onChange={(e) => onChange({ style: e.target.value })}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="link">Link</option>
              </select>
            </label>
            <label className="pb-check">
              <input
                type="checkbox"
                checked={Boolean(props.openInNewTab)}
                onChange={(e) => onChange({ openInNewTab: e.target.checked })}
              />
              Mở tab mới
            </label>
          </>
        ) : null}

        {node.type === "spacer" ? (
          <label>
            Chiều cao (px)
            <input
              type="number"
              value={Number(props.height ?? 24)}
              onChange={(e) => onChange({ height: Number(e.target.value) })}
            />
          </label>
        ) : null}

        {node.type === "divider" ? (
          <>
            <label>
              Kiểu đường
              <select
                value={String(props.style ?? "solid")}
                onChange={(e) => onChange({ style: e.target.value })}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
              </select>
            </label>
            <label>
              Độ dày
              <input
                type="number"
                value={Number(props.thickness ?? 1)}
                onChange={(e) => onChange({ thickness: Number(e.target.value) })}
              />
            </label>
          </>
        ) : null}

        {node.type === "video" ? (
          <>
            <label>
              Provider
              <select
                value={String(props.provider ?? "youtube")}
                onChange={(e) => onChange({ provider: e.target.value })}
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="file">File URL</option>
              </select>
            </label>
            <label>
              URL
              <input value={String(props.url ?? "")} onChange={(e) => onChange({ url: e.target.value })} />
            </label>
          </>
        ) : null}

        {node.type === "columns" ? (
          <>
            <label>
              Số cột
              <select
                value={Number(props.columns ?? 2)}
                onChange={(e) => onChange({ columns: Number(e.target.value) })}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </label>
            <label>
              Gap (px)
              <input
                type="number"
                value={Number(props.gap ?? 24)}
                onChange={(e) => onChange({ gap: Number(e.target.value) })}
              />
            </label>
            <label className="pb-check">
              <input
                type="checkbox"
                checked={props.stackOnMobile !== false}
                onChange={(e) => onChange({ stackOnMobile: e.target.checked })}
              />
              Xếp dọc trên mobile
            </label>
          </>
        ) : null}

        {node.type === "imageGallery" ? (
          <GalleryEditor
            images={(Array.isArray(props.images) ? props.images : []) as { src?: string; alt?: string }[]}
            columns={Number(props.columns ?? 3)}
            gap={Number(props.gap ?? 12)}
            restaurantId={restaurantId}
            onChange={onChange}
          />
        ) : null}

        {node.type === "slider" ? (
          <SliderEditor
            slides={
              (Array.isArray(props.slides) ? props.slides : []) as {
                src?: string;
                alt?: string;
                caption?: string;
              }[]
            }
            autoplay={props.autoplay !== false}
            intervalMs={Number(props.intervalMs ?? 3000)}
            showDots={props.showDots !== false}
            restaurantId={restaurantId}
            onChange={onChange}
          />
        ) : null}

        <SpacingEditor
          margin={(props.margin as { top?: number; bottom?: number; left?: number; right?: number }) ?? {}}
          onChange={(margin) => onChange({ margin })}
        />
      </div>
    </aside>
  );
}

function normalizeColor(value: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return "#243b3e";
}

function SpacingEditor({
  margin,
  onChange,
}: {
  margin: { top?: number; bottom?: number; left?: number; right?: number };
  onChange: (margin: { top?: number; bottom?: number; left?: number; right?: number }) => void;
}) {
  return (
    <fieldset className="pb-spacing">
      <legend>Khoảng cách (px)</legend>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <label key={side}>
          {side}
          <input
            type="number"
            value={Number(margin[side] ?? 0)}
            onChange={(e) => onChange({ ...margin, [side]: Number(e.target.value) })}
          />
        </label>
      ))}
    </fieldset>
  );
}

function GalleryEditor({
  images,
  columns,
  gap,
  restaurantId,
  onChange,
}: {
  images: { src?: string; alt?: string }[];
  columns: number;
  gap: number;
  restaurantId: string;
  onChange: (props: Record<string, unknown>) => void;
}) {
  async function addImage(file: File | null) {
    if (!file) return;
    const uploaded = await uploadRestaurantMedia(restaurantId, file);
    onChange({ images: [...images, { src: uploaded.url, alt: "" }] });
  }

  function updateImage(index: number, patch: Partial<{ src: string; alt: string }>) {
    onChange({
      images: images.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  }

  return (
    <div className="pb-setting-group">
      <p className="pb-setting-group-title">Cài đặt Image Gallery</p>

      <div className="pb-field-row">
        <label className="pb-field-block">
          <span>Số cột</span>
          <select value={columns} onChange={(e) => onChange({ columns: Number(e.target.value) })}>
            <option value={2}>2 cột</option>
            <option value={3}>3 cột</option>
            <option value={4}>4 cột</option>
          </select>
        </label>
        <label className="pb-field-block">
          <span>Khoảng cách (px)</span>
          <input
            type="number"
            min={0}
            step={4}
            value={gap}
            onChange={(e) => onChange({ gap: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="pb-slide-panel">
        <div className="pb-slide-panel-head">
          <strong>Danh sách ảnh</strong>
          <span>{images.length} ảnh</span>
        </div>

        {images.length === 0 ? (
          <p className="pb-slide-empty">Chưa có ảnh. Thêm ảnh để dựng gallery trên canvas.</p>
        ) : (
          <ul className="pb-slide-list">
            {images.map((image, index) => {
              const src = resolveMediaUrl(image.src);
              return (
                <li key={`${image.src}-${index}`} className="pb-slide-card">
                  <div className="pb-slide-thumb">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={image.alt || `Ảnh ${index + 1}`} />
                    ) : (
                      <span>Trống</span>
                    )}
                  </div>
                  <div className="pb-slide-fields">
                    <label>
                      <span>Alt</span>
                      <input
                        placeholder="Mô tả ảnh"
                        value={image.alt ?? ""}
                        onChange={(e) => updateImage(index, { alt: e.target.value })}
                      />
                    </label>
                    <p className="pb-slide-meta">Ảnh {index + 1}</p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn is-danger"
                    onClick={() => onChange({ images: images.filter((_, i) => i !== index) })}
                  >
                    Xóa
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <label className="pb-file-button">
          <span>+ Thêm ảnh</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              void addImage(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

function SliderEditor({
  slides,
  autoplay,
  intervalMs,
  showDots,
  restaurantId,
  onChange,
}: {
  slides: { src?: string; alt?: string; caption?: string }[];
  autoplay: boolean;
  intervalMs: number;
  showDots: boolean;
  restaurantId: string;
  onChange: (props: Record<string, unknown>) => void;
}) {
  async function addSlide(file: File | null) {
    if (!file) return;
    const uploaded = await uploadRestaurantMedia(restaurantId, file);
    onChange({ slides: [...slides, { src: uploaded.url, alt: "", caption: "" }] });
  }

  function updateSlide(index: number, patch: Partial<{ src: string; alt: string; caption: string }>) {
    onChange({
      slides: slides.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  }

  return (
    <div className="pb-setting-group">
      <p className="pb-setting-group-title">Cài đặt Slider</p>

      <div className="pb-switch-list">
        <label className="pb-switch-row">
          <span>
            <strong>Tự chạy</strong>
            <small>Tự chuyển slide</small>
          </span>
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => onChange({ autoplay: e.target.checked })}
          />
        </label>
        <label className="pb-switch-row">
          <span>
            <strong>Hiện dots</strong>
            <small>Chấm điều hướng</small>
          </span>
          <input
            type="checkbox"
            checked={showDots}
            onChange={(e) => onChange({ showDots: e.target.checked })}
          />
        </label>
      </div>

      <label className="pb-field-block">
        <span>Thời gian chuyển (ms)</span>
        <input
          type="number"
          min={1000}
          step={500}
          value={intervalMs}
          disabled={!autoplay}
          onChange={(e) => onChange({ intervalMs: Number(e.target.value) })}
        />
      </label>

      <div className="pb-slide-panel">
        <div className="pb-slide-panel-head">
          <strong>Danh sách slide</strong>
          <span>{slides.length} ảnh</span>
        </div>

        {slides.length === 0 ? (
          <p className="pb-slide-empty">Chưa có slide. Thêm ảnh để hiển thị trên canvas.</p>
        ) : (
          <ul className="pb-slide-list">
            {slides.map((slide, index) => {
              const src = resolveMediaUrl(slide.src);
              return (
                <li key={`${slide.src}-${index}`} className="pb-slide-card">
                  <div className="pb-slide-thumb">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={slide.alt || `Slide ${index + 1}`} />
                    ) : (
                      <span>Trống</span>
                    )}
                  </div>
                  <div className="pb-slide-fields">
                    <label>
                      <span>Chú thích</span>
                      <input
                        placeholder="Caption…"
                        value={slide.caption ?? ""}
                        onChange={(e) => updateSlide(index, { caption: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Alt</span>
                      <input
                        placeholder="Mô tả ảnh"
                        value={slide.alt ?? ""}
                        onChange={(e) => updateSlide(index, { alt: e.target.value })}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="admin-btn is-danger"
                    onClick={() => onChange({ slides: slides.filter((_, i) => i !== index) })}
                  >
                    Xóa
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <label className="pb-file-button">
          <span>+ Thêm slide</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              void addSlide(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
