import type { BlockDefinition, BlockNode } from "@/components/page-builder/types";
import { newBlockId } from "@/components/page-builder/types";

function leaf(type: string, props: Record<string, unknown>): BlockNode {
  return { id: newBlockId(), type, props, children: [] };
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "heading",
    label: "Heading",
    category: "content",
    defaultProps: {
      text: "Tiêu đề",
      level: 2,
      align: "left",
      color: "#243b3e",
      margin: { top: 0, bottom: 16 },
    },
  },
  {
    type: "text",
    label: "Text",
    category: "content",
    defaultProps: {
      text: "Đoạn giới thiệu…",
      align: "left",
      color: "#5c6b6e",
      fontSize: 16,
      margin: { top: 0, bottom: 16 },
    },
  },
  {
    type: "image",
    label: "Image",
    category: "media",
    defaultProps: {
      src: "",
      alt: "",
      width: "full",
      align: "center",
      radius: 12,
      margin: { top: 0, bottom: 16 },
    },
  },
  {
    type: "mediaText",
    label: "Ảnh + Text",
    category: "media",
    defaultProps: {
      text: "Đoạn giới thiệu bên cạnh ảnh…",
      src: "",
      alt: "",
      imagePosition: "left",
      gap: 24,
      radius: 12,
      fontSize: 16,
      color: "#5c6b6e",
      stackOnMobile: true,
      margin: { top: 0, bottom: 16 },
    },
  },
  {
    type: "imageGallery",
    label: "Image Gallery",
    category: "media",
    defaultProps: {
      images: [],
      columns: 3,
      gap: 12,
      margin: { top: 0, bottom: 16 },
    },
  },
  {
    type: "slider",
    label: "Slider",
    category: "media",
    defaultProps: {
      slides: [],
      autoplay: true,
      intervalMs: 3000,
      showDots: true,
      margin: { top: 0, bottom: 16 },
    },
  },
  {
    type: "video",
    label: "Video",
    category: "media",
    defaultProps: {
      provider: "youtube",
      url: "",
      aspect: "16/9",
      margin: { top: 0, bottom: 16 },
    },
  },
  {
    type: "button",
    label: "Button",
    category: "action",
    defaultProps: {
      label: "Xem thêm",
      href: "/restaurants",
      style: "primary",
      align: "left",
      openInNewTab: false,
      margin: { top: 8, bottom: 16 },
    },
  },
  {
    type: "divider",
    label: "Divider",
    category: "layout",
    defaultProps: {
      style: "solid",
      color: "rgba(36,59,62,0.18)",
      thickness: 1,
      margin: { top: 16, bottom: 16 },
    },
  },
  {
    type: "spacer",
    label: "Spacer",
    category: "layout",
    defaultProps: { height: 24 },
  },
  {
    type: "columns",
    label: "Columns",
    category: "layout",
    canHaveChildren: true,
    defaultProps: {
      columns: 2,
      gap: 24,
      stackOnMobile: true,
    },
  },
];

export const BLOCK_REGISTRY = Object.fromEntries(
  BLOCK_DEFINITIONS.map((def) => [def.type, def]),
) as Record<string, BlockDefinition>;

export function createBlock(type: string): BlockNode {
  const def = BLOCK_REGISTRY[type];
  if (!def) {
    return leaf("text", { text: "" });
  }
  if (type === "columns") {
    const count = Number(def.defaultProps.columns ?? 2);
    return {
      id: newBlockId(),
      type: "columns",
      props: { ...def.defaultProps },
      children: Array.from({ length: count }, () => ({
        id: newBlockId(),
        type: "column",
        props: {},
        children: [],
      })),
    };
  }
  return leaf(type, { ...def.defaultProps });
}

export const PALETTE_TYPES = BLOCK_DEFINITIONS.map((d) => d.type);
