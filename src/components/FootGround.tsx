"use client";

import { useEffect } from "react";

export default function FootGround() {
  useEffect(() => {
    const foot = document.querySelector("footer[data-band]");
    if (!foot) return;
    const root = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const paper = meta?.content;
    const band = getComputedStyle(root).getPropertyValue("--color-band").trim();
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) root.dataset.foot = "";
      else delete root.dataset.foot;
      if (meta && paper && band) meta.content = e.isIntersecting ? band : paper;
    });
    io.observe(foot);
    return () => {
      io.disconnect();
      delete root.dataset.foot;
      if (meta && paper) meta.content = paper;
    };
  }, []);

  return null;
}
