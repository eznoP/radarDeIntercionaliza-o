"use client";

import { useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Editor de texto rico (Tiptap). Serializa o conteúdo como JSON do ProseMirror
 * num input oculto chamado `name`.
 */
export function RichTextEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: unknown;
}) {
  const initial = defaultValue ?? "";
  const [json, setJson] = useState(() => JSON.stringify(initial));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({
        placeholder: "Escreva o conteúdo da publicação…",
      }),
    ],
    content: typeof initial === "string" ? initial : (initial as object),
    editorProps: {
      attributes: {
        class: "rich-content focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setJson(JSON.stringify(editor.getJSON())),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-dark-green/15 bg-white">
      <input type="hidden" name={name} value={json} />
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="max-h-[28rem] overflow-y-auto" />
    </div>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return <div className="h-11 border-b border-dark-green/10 bg-cream/60" />;
  }

  const btn = (active: boolean) =>
    cn(
      "grid h-8 w-8 place-items-center rounded-lg transition",
      active
        ? "bg-dark-green text-white"
        : "text-ink/70 hover:bg-dark-green/10 hover:text-dark-green",
    );

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-dark-green/10 bg-cream/60 px-2 py-1.5">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
        aria-label="Negrito"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
        aria-label="Itálico"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btn(editor.isActive("underline"))}
        aria-label="Sublinhado"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive("strike"))}
        aria-label="Tachado"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-dark-green/15" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
        aria-label="Título 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive("heading", { level: 3 }))}
        aria-label="Título 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-dark-green/15" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
        aria-label="Lista com marcadores"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
        aria-label="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
        aria-label="Citação"
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          const previous = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Endereço do link:", previous ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        className={btn(editor.isActive("link"))}
        aria-label="Inserir link"
      >
        <Link2 className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-dark-green/15" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={cn(btn(false), "disabled:opacity-30")}
        aria-label="Desfazer"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={cn(btn(false), "disabled:opacity-30")}
        aria-label="Refazer"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
}
