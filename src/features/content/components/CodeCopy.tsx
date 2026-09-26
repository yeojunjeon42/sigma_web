"use client";

import { useEffect } from "react";

const ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5"/></svg>';
const DONE =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';

export default function CodeCopy() {
  useEffect(() => {
    for (const pre of document.querySelectorAll<HTMLPreElement>(".article-prose pre")) {
      if (pre.parentElement?.classList.contains("code-block")) continue;
      const block = document.createElement("div");
      block.className = "code-block";
      pre.replaceWith(block);
      block.append(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.setAttribute("aria-label", "Copy code");
      button.innerHTML = ICON;
      let timer = 0;
      button.addEventListener("click", async () => {
        const code = pre.querySelector("code") ?? pre;
        try {
          await navigator.clipboard.writeText(code.textContent ?? "");
          button.setAttribute("aria-label", "Copied");
        } catch {
          const range = document.createRange();
          range.selectNodeContents(code);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          button.setAttribute("aria-label", "Selected; press Ctrl+C or ⌘C to copy");
        }
        button.innerHTML = DONE;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          button.innerHTML = ICON;
          button.setAttribute("aria-label", "Copy code");
        }, 1600);
      });
      block.append(button);
    }
  }, []);
  return null;
}
