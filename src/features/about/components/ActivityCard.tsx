import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Activity } from "../types";

const cardClasses =
  "group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-white/20";

export default function ActivityCard({ activity }: { activity: Activity }) {
  const imageUrl = activity.image
    ? urlFor(activity.image).width(800).height(450).fit("crop").url()
    : null;

  const cardContent = (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={activity.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-lg font-bold leading-tight text-white">
          {activity.title}
        </h3>
        {activity.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-400">
            {activity.description}
          </p>
        )}
      </div>
    </>
  );

  if (activity.link) {
    const isExternal =
      activity.link.startsWith("http://") ||
      activity.link.startsWith("https://");
    return (
      <a
        href={activity.link}
        className={cardClasses}
        {...(isExternal && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
      >
        {cardContent}
      </a>
    );
  }

  return <article className={cardClasses}>{cardContent}</article>;
}
