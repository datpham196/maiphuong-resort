"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState, type ReactNode } from "react";
import { SettingsPanel } from "@/components/page-builder/SettingsPanel";
import { BLOCK_DEFINITIONS, BLOCK_REGISTRY } from "@/components/page-builder/registry";
import { PageRenderer } from "@/components/page-builder/render/PageRenderer";
import {
  appendBlock,
  deleteNode,
  duplicateNode,
  findNode,
  flattenTree,
  reorderRootChildren,
  resolveBlockIdFromPath,
  syncColumnsCount,
  updateNodeProps,
} from "@/components/page-builder/document-utils";
import type { BlockNode, PageDocument } from "@/components/page-builder/types";
import { ApiError } from "@/services/api";
import {
  createRestaurantPreviewToken,
  publishRestaurantContent,
  saveRestaurantContent,
} from "@/services/admin-restaurants";
import { useAdminToast } from "@/components/admin-toast";

type Device = "desktop" | "tablet" | "mobile";

type Props = {
  restaurantId: string;
  locale: string;
  title: string;
  slug: string;
  shortDescription: string;
  initialDocument: PageDocument;
  onMetaChange?: (meta: { title: string; slug: string; shortDescription: string }) => void;
  onSaved?: () => void;
};

export function PageBuilderShell({
  restaurantId,
  locale,
  title: initialTitle,
  slug: initialSlug,
  shortDescription: initialShort,
  initialDocument,
  onMetaChange,
  onSaved,
}: Props) {
  const toast = useAdminToast();
  const [document, setDocument] = useState<PageDocument>(initialDocument);
  const [history, setHistory] = useState<PageDocument[]>([initialDocument]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [device, setDevice] = useState<Device>("desktop");
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [shortDescription, setShortDescription] = useState(initialShort);
  const [activeDragLabel, setActiveDragLabel] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"palette" | "settings" | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const selected = selectedId ? findNode(document.root, selectedId) : null;
  const tree = useMemo(() => flattenTree(document.root), [document]);
  const rootIds = (document.root.children ?? []).map((child) => child.id);

  function pushDocument(next: PageDocument) {
    setDocument(next);
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const stacked = [...trimmed, next];
      return stacked.length > 40 ? stacked.slice(stacked.length - 40) : stacked;
    });
    setHistoryIndex((index) => {
      const nextIndex = index + 1;
      return nextIndex > 39 ? 39 : nextIndex;
    });
  }

  function undo() {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setDocument(history[nextIndex]);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setDocument(history[nextIndex]);
  }

  function dropTargetParentId() {
    if (!selectedId) return document.root.id;
    const node = findNode(document.root, selectedId);
    if (!node) return document.root.id;
    if (node.type === "root" || node.type === "column") return node.id;
    // Prefer adding into selected column parent when a leaf is selected inside columns
    const parentWalk = (current: BlockNode, targetId: string): BlockNode | null => {
      for (const child of current.children ?? []) {
        if (child.id === targetId) return current;
        const nested = parentWalk(child, targetId);
        if (nested) return nested;
      }
      return null;
    };
    const parent = parentWalk(document.root, selectedId);
    if (parent && (parent.type === "column" || parent.type === "root")) return parent.id;
    return document.root.id;
  }

  function addBlock(type: string) {
    const parentId = dropTargetParentId();
    pushDocument(appendBlock(document, parentId, type));
  }

  function onPropsChange(props: Record<string, unknown>) {
    if (!selectedId) return;
    let next = updateNodeProps(document, selectedId, props);
    if (typeof props.columns === "number") {
      const node = findNode(next.root, selectedId);
      if (node?.type === "columns") {
        const synced = syncColumnsCount(node, props.columns);
        const walk = (current: BlockNode): BlockNode => {
          if (current.id === selectedId) return synced;
          return { ...current, children: (current.children ?? []).map(walk) };
        };
        next = { ...next, root: walk(next.root) };
      }
    }
    pushDocument(next);
  }

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { label?: string; type?: string } | undefined;
    setActiveDragLabel(data?.label ?? data?.type ?? "Block");
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveDragLabel(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { fromPalette?: boolean; type?: string } | undefined;
    if (activeData?.fromPalette && activeData.type) {
      addBlock(activeData.type);
      return;
    }

    if (active.id === over.id) return;
    const oldIndex = rootIds.indexOf(String(active.id));
    const newIndex = rootIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const ordered = arrayMove(rootIds, oldIndex, newIndex);
    pushDocument(reorderRootChildren(document, ordered));
  }

  async function saveDraft() {
    setSaving(true);
    setErrorIds([]);
    setErrorMessages([]);
    try {
      await saveRestaurantContent(restaurantId, locale, {
        title,
        slug,
        shortDescription,
        documentDraft: document,
      });
      onMetaChange?.({ title, slug, shortDescription });
      onSaved?.();
      toast.success("Đã lưu nháp");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lưu thất bại";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setSaving(true);
    setErrorIds([]);
    setErrorMessages([]);
    try {
      await saveRestaurantContent(restaurantId, locale, {
        title,
        slug,
        shortDescription,
        documentDraft: document,
      });
      await publishRestaurantContent(restaurantId, locale);
      onMetaChange?.({ title, slug, shortDescription });
      onSaved?.();
      toast.success("Đã publish");
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        const ids = err.errors
          .map((item) => resolveBlockIdFromPath(document, item.path))
          .filter((id): id is string => Boolean(id));
        setErrorIds([...new Set(ids)]);
        setErrorMessages(err.errors.map((item) => item.message));
        toast.error(err.errors[0]?.message ?? err.message);
      } else {
        const message = err instanceof Error ? err.message : "Publish thất bại";
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function openPreview() {
    try {
      await saveRestaurantContent(restaurantId, locale, {
        title,
        slug,
        shortDescription,
        documentDraft: document,
      });
      const preview = await createRestaurantPreviewToken(restaurantId, locale);
      window.open(`/${locale}/restaurants/preview?token=${encodeURIComponent(preview.token)}`, "_blank");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không tạo được preview";
      toast.error(message);
    }
  }

  const deviceLabel: Record<Device, string> = {
    desktop: "Desktop",
    tablet: "Tablet",
    mobile: "Mobile",
  };

  return (
    <div className="pb-shell">
      <header className="pb-toolbar">
        <div className="pb-toolbar-meta">
          <label className="pb-field">
            <span>Tiêu đề</span>
            <input
              aria-label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề trang"
            />
          </label>
          <label className="pb-field">
            <span>Slug</span>
            <input aria-label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-url" />
          </label>
        </div>
        <div className="pb-device-switch" role="group" aria-label="Device preview">
          {(["desktop", "tablet", "mobile"] as Device[]).map((item) => (
            <button
              key={item}
              type="button"
              className={device === item ? "is-active" : undefined}
              onClick={() => setDevice(item)}
            >
              {deviceLabel[item]}
            </button>
          ))}
        </div>
        <div className="pb-toolbar-actions">
          <button type="button" className="admin-btn is-ghost" onClick={undo} disabled={historyIndex <= 0}>
            Hoàn tác
          </button>
          <button
            type="button"
            className="admin-btn is-ghost"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            Làm lại
          </button>
          <button type="button" className="admin-btn is-secondary" onClick={() => void openPreview()}>
            Xem trước
          </button>
          <button type="button" className="admin-btn" disabled={saving} onClick={() => void saveDraft()}>
            {saving ? "Đang lưu…" : "Lưu nháp"}
          </button>
          <button type="button" className="admin-btn is-primary" disabled={saving} onClick={() => void publish()}>
            Xuất bản
          </button>
        </div>
      </header>

      {errorMessages.length > 0 ? (
        <div className="pb-errors" role="alert">
          {errorMessages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <div className="pb-mobile-tabs">
        <button
          type="button"
          className={mobilePanel === "palette" ? "is-active" : undefined}
          onClick={() => setMobilePanel(mobilePanel === "palette" ? null : "palette")}
        >
          Khối
        </button>
        <button
          type="button"
          className={mobilePanel === "settings" ? "is-active" : undefined}
          onClick={() => setMobilePanel(mobilePanel === "settings" ? null : "settings")}
        >
          Thuộc tính
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className={`pb-layout${mobilePanel ? ` is-${mobilePanel}` : ""}`}>
          <aside className={`pb-sidebar${mobilePanel === "palette" ? " is-open" : ""}`}>
            <h3>Thành phần</h3>
            <div className="pb-palette">
              {BLOCK_DEFINITIONS.map((def) => (
                <PaletteItem key={def.type} type={def.type} label={def.label} onAdd={() => addBlock(def.type)} />
              ))}
            </div>
            <h3>Cấu trúc</h3>
            <ul className="pb-tree">
              {tree.length === 0 ? <li className="admin-muted">Chưa có block</li> : null}
              {tree.map((row) => (
                <li key={row.id} style={{ paddingLeft: `${row.depth * 12}px` }}>
                  <button
                    type="button"
                    className={selectedId === row.id ? "is-active" : undefined}
                    onClick={() => setSelectedId(row.id)}
                  >
                    {BLOCK_REGISTRY[row.type]?.label ?? row.type}: {row.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main
            className={`pb-canvas is-${device}`}
            onClick={() => setSelectedId(null)}
          >
            <div className="pb-canvas-frame">
              {(document.root.children ?? []).length === 0 ? (
                <div className="pb-canvas-empty">
                  <p>Kéo element từ palette hoặc bấm + để bắt đầu dựng trang.</p>
                </div>
              ) : null}
              <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
                <div className="pb-sortable-root">
                  {(document.root.children ?? []).map((child) => (
                    <SortableBlock
                      key={child.id}
                      id={child.id}
                      selected={selectedId === child.id}
                      onSelect={() => setSelectedId(child.id)}
                      onDelete={() => {
                        pushDocument(deleteNode(document, child.id));
                        if (selectedId === child.id) setSelectedId(null);
                      }}
                      onDuplicate={() => pushDocument(duplicateNode(document, child.id))}
                    >
                      <PageRenderer
                        document={{ version: document.version, root: { ...document.root, children: [child] } }}
                        mode="edit"
                        selectedId={selectedId}
                        errorIds={errorIds}
                        onSelect={setSelectedId}
                      />
                    </SortableBlock>
                  ))}
                </div>
              </SortableContext>
            </div>
          </main>

          <div className={`pb-settings-wrap${mobilePanel === "settings" ? " is-open" : ""}`}>
            <label className="pb-short-desc">
              <span>Mô tả ngắn</span>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </label>
            <div className="pb-selected-actions">
              {selected && selected.type !== "root" ? (
                <>
                  <button
                    type="button"
                    className="admin-btn is-secondary"
                    onClick={() => {
                      pushDocument(duplicateNode(document, selected.id));
                    }}
                  >
                    Nhân bản
                  </button>
                  <button
                    type="button"
                    className="admin-btn is-danger"
                    onClick={() => {
                      if (!window.confirm("Xóa element này?")) return;
                      pushDocument(deleteNode(document, selected.id));
                      setSelectedId(null);
                    }}
                  >
                    Xóa khối
                  </button>
                </>
              ) : null}
            </div>
            <SettingsPanel node={selected} restaurantId={restaurantId} onChange={onPropsChange} />
          </div>
        </div>
        <DragOverlay>{activeDragLabel ? <div className="pb-drag-ghost">{activeDragLabel}</div> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

function PaletteItem({ type, label, onAdd }: { type: string; label: string; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { fromPalette: true, type, label },
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`pb-palette-item${isDragging ? " is-dragging" : ""}`}
      onClick={onAdd}
      {...attributes}
      {...listeners}
    >
      <span>{label}</span>
      <span className="pb-palette-add" aria-hidden="true">
        +
      </span>
    </button>
  );
}

function SortableBlock({
  id,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  children,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pb-sortable-item${selected ? " is-selected" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <div className="pb-sortable-handle" title="Kéo để sắp xếp" {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <div className="pb-sortable-body">{children}</div>
      <div className="pb-sortable-actions">
        <button type="button" title="Nhân bản" aria-label="Nhân bản" onClick={onDuplicate}>
          ⧉
        </button>
        <button
          type="button"
          className="is-danger"
          title="Xóa"
          aria-label="Xóa"
          onClick={() => {
            if (!window.confirm("Xóa element này?")) return;
            onDelete();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
