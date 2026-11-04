"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { AlertTriangle, Loader2, Star } from "lucide-react";
import { Field, fieldInputClass } from "@/components/admin/fields";
import { FormMessage } from "@/components/admin/form-message";
import { MediaUploader } from "@/components/admin/media-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { initialFormState } from "@/lib/admin/types";
import type { Tables } from "@/lib/database.types";
import { slugify } from "@/lib/slugify";
import { createPost, updatePost } from "./actions";

type Post = Tables<"posts">;

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function PostForm({
  post,
  categories,
  authors,
}: {
  post?: Post;
  categories: Pick<Tables<"categories">, "id" | "name">[];
  authors: Pick<Tables<"profiles">, "id" | "full_name">[];
}) {
  const action = post ? updatePost.bind(null, post.id) : createPost;
  const [state, formAction] = useActionState(action, initialFormState);

  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [featured, setFeatured] = useState(Boolean(post?.is_featured));

  const missingCategories = categories.length === 0;
  const missingAuthors = authors.length === 0;

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      {(missingCategories || missingAuthors) && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            Para publicar, você precisa de pelo menos{" "}
            {missingCategories && (
              <>
                uma{" "}
                <Link
                  href="/admin/categorias"
                  className="font-semibold underline"
                >
                  categoria
                </Link>
              </>
            )}
            {missingCategories && missingAuthors && " e "}
            {missingAuthors && (
              <>
                um{" "}
                <Link
                  href="/admin/integrantes/novo"
                  className="font-semibold underline"
                >
                  integrante autor(a)
                </Link>
              </>
            )}
            .
          </div>
        </div>
      )}

      {/* ---------- Conteúdo ---------- */}
      <section className="space-y-4 rounded-card border border-dark-green/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-lg font-semibold text-dark-green">
          Conteúdo
        </h2>

        <Field
          label="Título"
          htmlFor="title"
          required
          error={state.fieldErrors?.title}
        >
          <input
            id="title"
            name="title"
            defaultValue={post?.title ?? ""}
            placeholder="Título da publicação"
            onChange={(e) => {
              if (!slugEdited) setSlug(slugify(e.target.value));
            }}
            className={fieldInputClass(Boolean(state.fieldErrors?.title))}
          />
        </Field>

        <Field
          label="Endereço (slug)"
          htmlFor="slug"
          error={state.fieldErrors?.slug}
          hint="Usado no link da publicação. Gerado a partir do título."
        >
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-xs text-ink/40 sm:block">
              /noticia/
            </span>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              placeholder="endereco-da-publicacao"
              className={fieldInputClass(Boolean(state.fieldErrors?.slug))}
            />
          </div>
        </Field>

        <Field
          label="Resumo"
          htmlFor="excerpt"
          required
          error={state.fieldErrors?.excerpt}
          hint="Um parágrafo curto que aparece nos cards e na listagem."
        >
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt ?? ""}
            placeholder="Resumo da publicação"
            className={fieldInputClass(Boolean(state.fieldErrors?.excerpt))}
          />
        </Field>

        <Field
          label="Conteúdo"
          required
          error={state.fieldErrors?.content}
        >
          <RichTextEditor name="content" defaultValue={post?.content ?? ""} />
        </Field>
      </section>

      {/* ---------- Publicação ---------- */}
      <section className="space-y-4 rounded-card border border-dark-green/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-lg font-semibold text-dark-green">
          Publicação
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Categoria"
            htmlFor="category_id"
            required
            error={state.fieldErrors?.category_id}
          >
            <select
              id="category_id"
              name="category_id"
              defaultValue={post?.category_id ?? ""}
              className={fieldInputClass(Boolean(state.fieldErrors?.category_id))}
            >
              <option value="">Selecione a categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Autor(a)"
            htmlFor="author_id"
            required
            error={state.fieldErrors?.author_id}
          >
            <select
              id="author_id"
              name="author_id"
              defaultValue={post?.author_id ?? ""}
              className={fieldInputClass(Boolean(state.fieldErrors?.author_id))}
            >
              <option value="">Selecione o(a) autor(a)</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={post?.status ?? "draft"}
              className={fieldInputClass(false)}
            >
              <option value="draft">Rascunho (não aparece no site)</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </Field>

          <Field
            label="Data de publicação"
            htmlFor="published_at"
            hint="Deixe em branco para usar a data atual ao publicar."
          >
            <input
              id="published_at"
              name="published_at"
              type="datetime-local"
              defaultValue={toLocalInput(post?.published_at)}
              className={fieldInputClass(false)}
            />
          </Field>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-dark-green/10 bg-cream/60 p-4">
          <input
            type="checkbox"
            name="is_featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-moss"
          />
          <span className="font-body text-sm text-ink/80">
            <span className="flex items-center gap-1.5 font-display font-medium text-dark-green">
              <Star className="h-4 w-4 text-vanilla" />
              Destaque na Home
            </span>
            <br />
            A publicação marcada como destaque aparece em evidência na página
            inicial.
          </span>
        </label>
      </section>

      {/* ---------- Mídia ---------- */}
      <section className="space-y-4 rounded-card border border-dark-green/10 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-dark-green">
            Mídia
          </h2>
          <p className="mt-0.5 font-body text-xs text-ink/55">
            Imagem e vídeo são opcionais.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <MediaUploader
            name="cover_image_url"
            bucket="media"
            kind="image"
            folder="publicacoes"
            defaultValue={post?.cover_image_url}
            label="Foto de capa"
            hint="Opcional. Convertida automaticamente para .webp."
          />
          <MediaUploader
            name="video_url"
            bucket="media"
            kind="video"
            folder="publicacoes"
            defaultValue={post?.video_url}
            label="Vídeo"
            hint="Opcional. Convertido automaticamente para .webm."
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <SaveButton label={post ? "Salvar alterações" : "Criar publicação"} />
        <Link
          href="/admin/publicacoes"
          className="font-display text-sm font-medium text-ink/60 transition hover:text-dark-green"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-dark-green px-6 py-3 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-moss hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Salvando…" : label}
    </button>
  );
}
