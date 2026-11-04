import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackToTop } from "@/components/back-to-top";
import { getPostBySlug } from "@/lib/posts";
import { renderRichContent } from "@/lib/rich-text";
import { formatDate } from "@/lib/post";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Publicação não encontrada" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = renderRichContent(post.content);
  const date = formatDate(post.publishedAt);

  return (
    <>
      <SiteHeader />

      <main className="bg-cream">
        <article className="relative mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          <Image
            aria-hidden
            alt=""
            src="/brand/compass-rose.webp"
            width={608}
            height={608}
            className="pointer-events-none absolute -top-10 right-0 hidden w-[260px] opacity-[0.05] brightness-0 select-none lg:block"
          />

          <Link
            href="/"
            className="relative inline-flex items-center gap-2 font-display text-sm font-medium text-glaucous transition duration-200 hover:text-dark-green active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Home
          </Link>

          <header className="relative mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-dark-green px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-vanilla">
                {post.category}
              </span>
              {post.isFeatured && (
                <span className="rounded-full bg-vanilla px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-dark-green">
                  Destaque
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-dark-green sm:text-4xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 font-body text-base leading-relaxed text-ink/75 sm:text-lg">
                {post.excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-dark-green/10 py-3 font-body text-sm text-ink/60">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4 text-moss" />
                <span>
                  {post.authorName}
                  {post.authorRole && (
                    <span className="text-ink/45"> · {post.authorRole}</span>
                  )}
                </span>
              </span>
              {date && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-moss" />
                  {date}
                </span>
              )}
            </div>
          </header>

          {post.coverImage && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card bg-powder/40 shadow-sm ring-1 ring-black/5">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {post.videoUrl && (
            <video
              src={post.videoUrl}
              controls
              playsInline
              preload="metadata"
              className="mt-8 w-full rounded-card bg-black/90 shadow-sm"
            />
          )}

          {html ? (
            <div
              className="rich-content mt-8 text-[1.02rem]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            !post.videoUrl && (
              <p className="mt-8 font-body text-sm italic text-ink/50">
                Esta publicação ainda não tem conteúdo escrito.
              </p>
            )
          )}
        </article>
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}
