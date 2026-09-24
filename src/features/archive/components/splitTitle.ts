const HANGUL = /[\u3131-\u318E\uAC00-\uD7A3]/;

export function splitTitle(title: string): { en: string; ko: string } {
  const slash = title.indexOf(" / ");
  if (slash !== -1) {
    const a = title.slice(0, slash).trim();
    const b = title.slice(slash + 3).trim();
    return HANGUL.test(a) ? { ko: a, en: b } : { ko: b, en: a };
  }

  const paren = title.match(/^(.+?)\s*\((.+)\)$/);
  if (paren) {
    const [, a, b] = paren;
    const ka = HANGUL.test(a);
    const kb = HANGUL.test(b);
    if (ka !== kb) {
      return ka ? { ko: a.trim(), en: b.trim() } : { ko: b.trim(), en: a.trim() };
    }
  }

  return { en: title, ko: title };
}
