const MOBILE = "(max-width: 63.999rem), (pointer: coarse)";
const DESKTOP = "(min-width: 64rem) and (pointer: fine)";

export function browserTheme(paper: string) {
  return [
    { media: MOBILE, color: "#000000" },
    { media: DESKTOP, color: paper },
  ];
}

// Mobile chrome stays black, including while the menu or footer is on screen.
export function pageThemeMeta() {
  if (window.matchMedia(MOBILE).matches) return null;
  return [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')]
    .find((meta) => !meta.media || window.matchMedia(meta.media).matches) ?? null;
}
