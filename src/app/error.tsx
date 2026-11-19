"use client";

import LostPage from "@/components/pacman/LostPage";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <LostPage
      word="Error"
      heading="Error"
      extra={
        <button
          type="button"
          onClick={reset}
          className="flex h-11 items-center rounded-pill bg-ink px-md text-caption text-canvas"
        >
          Try again
        </button>
      }
    />
  );
}
