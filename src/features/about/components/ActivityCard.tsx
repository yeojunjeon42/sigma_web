import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Activity } from "../types";

export default function ActivityCard({ activity }: { activity: Activity }) {
  const imageUrl = activity.image
    ? urlFor(activity.image).width(800).height(450).fit("crop").url()
    : null;

  const cardContent = (
    <>
      {imageUrl && (
        <Image src={imageUrl} alt={activity.title} width={800} height={450} />
      )}
      <h3>{activity.title}</h3>
      {activity.description && <p>{activity.description}</p>}
    </>
  );

  if (activity.link) {
    const isExternal =
      activity.link.startsWith("http://") ||
      activity.link.startsWith("https://");
    return (
      <a
        href={activity.link}
        {...(isExternal && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
      >
        {cardContent}
      </a>
    );
  }

  return <article>{cardContent}</article>;
}
