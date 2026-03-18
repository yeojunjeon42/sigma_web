import { T } from "@/components/T";
import type { Activity } from "../types";
import ActivityCard from "./ActivityCard";

interface ActivitiesGalleryProps {
  activities: Activity[];
}

export default function ActivitiesGallery({ activities }: ActivitiesGalleryProps) {
  if (activities.length === 0) {
    return (
      <section
        data-anim="reveal-group"
        className="py-16 text-center text-neutral-400"
      >
        <svg
          data-anim="reveal-item"
          className="mx-auto mb-6 h-14 w-14 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p data-anim="reveal-item" className="text-lg">
          <T
            en="No activities listed yet."
            ko="등록된 활동이 아직 없습니다."
          />
        </p>
      </section>
    );
  }

  return (
    <section data-anim="reveal-group">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {activities.map((activity) => (
          <div key={activity._id} data-anim="reveal-item" className="flex">
            <ActivityCard activity={activity} />
          </div>
        ))}
      </div>
    </section>
  );
}
