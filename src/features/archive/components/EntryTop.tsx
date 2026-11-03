"use client";

import { scrollPage } from "@/lib/pageScroll";

import { useEffect } from "react";

export default function EntryTop() {
  useEffect(() => {
    const top = () => scrollPage({ top: 0, behavior: "instant" });
    top();
    const frame = requestAnimationFrame(top);
    return () => cancelAnimationFrame(frame);
  }, []);
  return null;
}
