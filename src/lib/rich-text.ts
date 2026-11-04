import "server-only";

import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

/**
 * Converte o documento do ProseMirror (salvo no campo `content`) em HTML
 * para exibição pública. Usa as mesmas extensões do editor (StarterKit).
 */
export function renderRichContent(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  try {
    return generateHTML(
      content as Parameters<typeof generateHTML>[0],
      [StarterKit.configure({ heading: { levels: [2, 3] } })],
    );
  } catch {
    return "";
  }
}
