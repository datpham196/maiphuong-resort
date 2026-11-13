import { createBlock } from "@/components/page-builder/registry";
import { newBlockId, type BlockNode, type PageDocument } from "@/components/page-builder/types";

export function cloneNode(node: BlockNode): BlockNode {
  return {
    ...node,
    id: newBlockId(),
    props: { ...node.props },
    children: (node.children ?? []).map(cloneNode),
  };
}

export function findNode(root: BlockNode, id: string): BlockNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function findParent(root: BlockNode, id: string): BlockNode | null {
  for (const child of root.children ?? []) {
    if (child.id === id) return root;
    const nested = findParent(child, id);
    if (nested) return nested;
  }
  return null;
}

function replaceRoot(doc: PageDocument, root: BlockNode): PageDocument {
  return { ...doc, root };
}

export function updateNodeProps(doc: PageDocument, id: string, props: Record<string, unknown>): PageDocument {
  const walk = (node: BlockNode): BlockNode => {
    if (node.id === id) {
      return { ...node, props: { ...node.props, ...props } };
    }
    return { ...node, children: (node.children ?? []).map(walk) };
  };
  return replaceRoot(doc, walk(doc.root));
}

export function deleteNode(doc: PageDocument, id: string): PageDocument {
  if (doc.root.id === id) return doc;
  const walk = (node: BlockNode): BlockNode => ({
    ...node,
    children: (node.children ?? []).filter((child) => child.id !== id).map(walk),
  });
  return replaceRoot(doc, walk(doc.root));
}

export function duplicateNode(doc: PageDocument, id: string): PageDocument {
  const walk = (node: BlockNode): BlockNode => {
    const children = node.children ?? [];
    const next: BlockNode[] = [];
    for (const child of children) {
      next.push(walk(child));
      if (child.id === id) {
        next.push(cloneNode(child));
      }
    }
    return { ...node, children: next };
  };
  return replaceRoot(doc, walk(doc.root));
}

export function appendBlock(doc: PageDocument, parentId: string, type: string): PageDocument {
  const block = createBlock(type);
  const walk = (node: BlockNode): BlockNode => {
    if (node.id === parentId) {
      if (node.type !== "root" && node.type !== "column") {
        return node;
      }
      return { ...node, children: [...(node.children ?? []), block] };
    }
    return { ...node, children: (node.children ?? []).map(walk) };
  };
  return replaceRoot(doc, walk(doc.root));
}

export function moveNode(
  doc: PageDocument,
  activeId: string,
  overId: string,
  position: "before" | "after" | "inside" = "after",
): PageDocument {
  if (activeId === overId) return doc;
  const active = findNode(doc.root, activeId);
  if (!active) return doc;

  let working = deleteNode(doc, activeId);
  const cloned = { ...active, props: { ...active.props }, children: active.children };

  if (position === "inside") {
    const target = findNode(working.root, overId);
    if (!target || (target.type !== "root" && target.type !== "column")) {
      return doc;
    }
    const walk = (node: BlockNode): BlockNode => {
      if (node.id === overId) {
        return { ...node, children: [...(node.children ?? []), cloned] };
      }
      return { ...node, children: (node.children ?? []).map(walk) };
    };
    return replaceRoot(working, walk(working.root));
  }

  const parent = findParent(working.root, overId);
  if (!parent) return doc;
  const walk = (node: BlockNode): BlockNode => {
    if (node.id !== parent.id) {
      return { ...node, children: (node.children ?? []).map(walk) };
    }
    const children = [...(node.children ?? [])];
    const index = children.findIndex((child) => child.id === overId);
    if (index < 0) return node;
    const insertAt = position === "before" ? index : index + 1;
    children.splice(insertAt, 0, cloned);
    return { ...node, children };
  };
  return replaceRoot(working, walk(working.root));
}

export function reorderRootChildren(doc: PageDocument, orderedIds: string[]): PageDocument {
  const map = new Map((doc.root.children ?? []).map((child) => [child.id, child]));
  const children = orderedIds.map((id) => map.get(id)).filter(Boolean) as BlockNode[];
  for (const child of doc.root.children ?? []) {
    if (!orderedIds.includes(child.id)) children.push(child);
  }
  return replaceRoot(doc, { ...doc.root, children });
}

export function flattenTree(root: BlockNode, depth = 0): { id: string; type: string; depth: number; label: string }[] {
  const rows: { id: string; type: string; depth: number; label: string }[] = [];
  if (root.type !== "root") {
    rows.push({
      id: root.id,
      type: root.type,
      depth,
      label: labelFor(root),
    });
  }
  for (const child of root.children ?? []) {
    rows.push(...flattenTree(child, root.type === "root" ? 0 : depth + 1));
  }
  return rows;
}

function labelFor(node: BlockNode) {
  const text = typeof node.props.text === "string" ? node.props.text : null;
  const label = typeof node.props.label === "string" ? node.props.label : null;
  const base = text || label || node.type;
  return base.length > 40 ? `${base.slice(0, 40)}…` : base;
}

/** Resolve a JSONPath-like validator path (e.g. $.root.children[0].props.src) to a block id. */
export function resolveBlockIdFromPath(doc: PageDocument, path: string): string | null {
  const matches = [...path.matchAll(/children\[(\d+)]/g)];
  if (matches.length === 0) {
    return path.includes("$.root") ? doc.root.id : null;
  }
  let node: BlockNode = doc.root;
  for (const match of matches) {
    const index = Number(match[1]);
    const children = node.children ?? [];
    const next = children[index];
    if (!next) return null;
    node = next;
  }
  return node.id;
}

export function syncColumnsCount(node: BlockNode, columns: number): BlockNode {
  if (node.type !== "columns") return node;
  const count = Math.min(3, Math.max(2, columns));
  const children = [...(node.children ?? [])];
  while (children.length < count) {
    children.push({ id: newBlockId(), type: "column", props: {}, children: [] });
  }
  while (children.length > count) {
    children.pop();
  }
  return { ...node, props: { ...node.props, columns: count }, children };
}
