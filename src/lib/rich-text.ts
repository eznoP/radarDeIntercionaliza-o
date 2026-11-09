import "server-only";

import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

type Node = {
  type?: string;
  attrs?: Record<string, unknown>;
  marks?: Node[];
  content?: Node[];
  [key: string]: unknown;
};

/**
 * Só aceita URLs http(s) ou caminhos internos ("/..."). Bloqueia
 * javascript:, data:, vbscript:, protocolos obscuros e //host.
 */
function sanitizeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (raw === "") return null;
  if (/^\/(?!\/)/.test(raw)) return raw; // caminho interno
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    // URL malformada
  }
  return null;
}

/**
 * Remove href perigosos de marcas de link em todo o documento:
 * um link sem href válido vira texto simples.
 */
function sanitizeNode(node: Node): void {
  if (Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (mark.type === "link" && mark.attrs && "href" in mark.attrs) {
        const safe = sanitizeHref(mark.attrs.href);
        if (typeof safe === "string") mark.attrs.href = safe;
        else delete mark.attrs.href;
      }
    }
  }
  if (Array.isArray(node.content)) node.content.forEach(sanitizeNode);
}

/**
 * Converte o documento do ProseMirror (salvo no campo `content`) em HTML
 * para exibição pública. Usa as mesmas extensões do editor (StarterKit)
 * e sanitiza os links antes de renderizar.
 */
export function renderRichContent(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const doc = structuredClone(content) as Node;
  sanitizeNode(doc);
  try {
    return generateHTML(
      doc as Parameters<typeof generateHTML>[0],
      [StarterKit.configure({ heading: { levels: [2, 3] } })],
    );
  } catch {
    return "";
  }
}
