import { getPublishedPostsByDestino } from "@/lib/posts";
import { PostsLibrary } from "@/components/posts-library";

/** Busca as publicações de um destino e monta a biblioteca expansível. */
export async function PostsSection({ destino }: { destino: string }) {
  const posts = await getPublishedPostsByDestino(destino);
  return <PostsLibrary posts={posts} />;
}
