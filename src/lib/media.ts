import { useSyncExternalStore } from "react";

const subscribers = new Map<string, (fn: () => void) => () => void>();

function subscribeTo(query: string) {
  let sub = subscribers.get(query);
  if (!sub) {
    sub = (fn) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", fn);
      return () => mql.removeEventListener("change", fn);
    };
    subscribers.set(query, sub);
  }
  return sub;
}

export function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useWide = () => useMedia("(min-width: 64rem)", true);
