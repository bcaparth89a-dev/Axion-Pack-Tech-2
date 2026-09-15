import { BlogPost } from "@/data/blogs";
import BlogCard from "@/components/blog/BlogCard";

interface RelatedBlogsProps {
  relatedPosts: BlogPost[];
}

export default function RelatedBlogs({ relatedPosts }: RelatedBlogsProps) {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-slate-200">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-600">
            CONTINUE READING
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Related Articles
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {relatedPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
