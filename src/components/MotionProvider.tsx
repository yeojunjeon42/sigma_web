"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initMotion, refreshPageMotion, destroyMotion } from "@/lib/motion";

export default function MotionProvider() {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    initMotion();
    mounted.current = true;
    return destroyMotion;
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    const raf = requestAnimationFrame(() => {
      refreshPageMotion();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
