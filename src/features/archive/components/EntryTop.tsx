"use client";

import { useEffect } from "react";

export default function EntryTop() {
  useEffect(() => {
    const top = () => window.scrollTo({ top: 0, behavior: "instant" });
    top();
    const frame = requestAnimationFrame(top);
    return () => cancelAnimationFrame(frame);
  }, []);
  return null;
}
