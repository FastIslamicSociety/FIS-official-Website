import Link from "next/link";

export type BlogCardProps = {
  slug: string;
  title: string;
  excerpt: string | null;
  author: string;
  date: string;
  coverUrl: string | null;
  coverAlt: string | null;
};

// One post on the blog list page. Restyle this file to change how cards look.
export default function BlogCard({
  slug,
  title,
  excerpt,
  author,
  date,
  coverUrl,
  coverAlt,
}: BlogCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#d8c9a3] bg-[#fbf5e6] shadow-sm transition hover:shadow-md">
      <Link href={`/blogs/${slug}`} className="block">
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={coverAlt ?? ""}
            loading="lazy"
            className="h-48 w-full object-cover"
          />
        )}
        <div className="p-5">
          <h2 className="font-display text-2xl font-bold leading-snug text-[#2d7550]">
            {title}
          </h2>
          {excerpt && <p className="mt-2 line-clamp-3 text-sm">{excerpt}</p>}
          <p className="mt-4 text-xs text-[#6b5b45]">
            By {author}
            {date && <> · {date}</>}
          </p>
        </div>
      </Link>
    </article>
  );
}