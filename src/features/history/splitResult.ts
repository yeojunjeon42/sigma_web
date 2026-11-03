// An award's title reads "event \u2014 result"; the two are set on their own lines instead of a dash.
export function splitResult(title: string): [string, string | undefined] {
  const at = title.indexOf(" \u2014 ");
  return at < 0 ? [title, undefined] : [title.slice(0, at), title.slice(at + 3)];
}
