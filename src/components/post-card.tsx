import Image from "next/image";
import { formatTimeAgo, type Post } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PostCard({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-card bg-dark-green shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-powder/40">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 78vw, 300px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {post.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-vanilla px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-dark-green shadow">
            Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-white/10 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wider text-vanilla">
          {post.category}
        </span>
        <h3 className="font-body text-base font-semibold leading-snug text-white group-hover:text-vanilla">
          {post.title}
        </h3>
        <p className="mt-auto pt-2 text-xs text-white/60">
          postado: {formatTimeAgo(post.minutesAgo)}
        </p>
      </div>
    </article>
  );
}
