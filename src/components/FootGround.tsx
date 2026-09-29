"use client";

import { useEffect } from "react";

export default function FootGround() {
  useEffect(() => {
    const foot = document.querySelector("footer[data-band]");
    if (!foot) return;
    const root = document.documentElement;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) root.dataset.foot = "";
      else delete root.dataset.foot;
    });
    io.observe(foot);
    return () => {
      io.disconnect();
      delete root.dataset.foot;
    };
  }, []);

  return null;
}
