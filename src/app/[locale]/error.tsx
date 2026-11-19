"use client";

import LostPage from "@/components/pacman/LostPage";
import { useLocale } from "@/i18n/LocaleProvider";
import { SHELL } from "@/i18n/dict/shell";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const say = SHELL[useLocale()].lost;
  return (
    <LostPage
      word="Error"
      extra={
        <button
          type="button"
          onClick={reset}
          className="flex h-11 items-center rounded-pill bg-ink px-md text-caption text-canvas"
        >
          {say.retry}
        </button>
      }
    />
  );
}
