import Link from "next/link";
import { BlogPost, getBlogCategoryBySlug } from "@/data/blogs";
import { getSafeImageSrc } from "@/lib/utils/mediaUrl";
import CmsImage from "@/components/common/CmsImage";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const detailUrl = `/blog/${post.slug}`;
  const category = getBlogCategoryBySlug(post.category);
  const safeImage = getSafeImageSrc(
    post.featuredImage || post.image,
    post.slug?.includes('ai') || post.slug?.includes('warehouse')
      ? '/images/blog/ai-smart-warehouse.jpg'
      : '/images/blog/blog-default.jpg'
  );

  return (
    <article className="group flex flex-col rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-sky-300">
      {/* 16:9 Image with Category Badge */}
      <Link href={detailUrl} className="relative block aspect-[16/9] w-full overflow-hidden bg-slate-800">
        <CmsImage
          src={safeImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3.5 left-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-950/85 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-sky-300 border border-sky-700/60 shadow-sm">
            <span>{category?.icon || "🏷️"}</span>
            <span>{category?.title || post.category}</span>
          </span>
        </div>

        {/* Reading Time Pill */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-white/10">
            ⏱ {post.readingTime}
          </span>
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-6">
        {/* Date & Author */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
          <span>📅 {post.publishedDate}</span>
          <span>•</span>
          <span className="font-medium text-slate-700">{post.author}</span>
        </div>

        {/* Title */}
        <Link href={detailUrl} className="group-hover:text-sky-700 transition-colors">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
          {post.excerpt}
        </p>

        {/* Card Footer Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-amber-600 transition-colors group-hover:translate-x-0.5 duration-200"
          >
            <span>Read Article</span>
            <span>→</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400 uppercase">
            {post.tags[0]}
          </span>
        </div>
      </div>
    </article>
  );
}
