import { T } from "@/components/T";
import type { Activity } from "../types";
import ActivityCard from "./ActivityCard";

interface ActivitiesGalleryProps {
  activities: Activity[];
}

export default function ActivitiesGallery({ activities }: ActivitiesGalleryProps) {
  if (activities.length === 0) {
    return (
      <p>
        <T en="No activities listed yet." ko="등록된 활동이 아직 없습니다." />
      </p>
    );
  }

  return (
    <ul>
      {activities.map((activity) => (
        <li key={activity._id}>
          <ActivityCard activity={activity} />
        </li>
      ))}
    </ul>
  );
}
