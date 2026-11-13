import type { CSSProperties } from "react";

export type BlockMargin = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type BlockNode = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: BlockNode[];
};

export type PageDocument = {
  version: number;
  root: BlockNode;
};

export type RenderMode = "live" | "preview" | "edit";

export type BlockDefinition = {
  type: string;
  label: string;
  category: "content" | "media" | "layout" | "action";
  canHaveChildren?: boolean;
  defaultProps: Record<string, unknown>;
  create?: () => BlockNode;
};

export function emptyDocument(): PageDocument {
  return {
    version: 1,
    root: {
      id: "root",
      type: "root",
      props: {},
      children: [],
    },
  };
}

export function marginStyle(margin: BlockMargin | undefined): CSSProperties {
  if (!margin) return {};
  return {
    marginTop: margin.top ?? undefined,
    marginRight: margin.right ?? undefined,
    marginBottom: margin.bottom ?? undefined,
    marginLeft: margin.left ?? undefined,
  };
}

export function newBlockId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `blk_${crypto.randomUUID()}`;
  }
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
