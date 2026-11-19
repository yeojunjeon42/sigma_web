// How the words sit on a cover, shared by the card and its share image so both set them alike.

// A capital with a diagonal left side (A, V, W, Y) reaches the margin only at one end, so a line
// that starts with one looks set in beside a line that starts with a straight-sided letter. Such a
// line starts this far to the left, as a first-line indent, so the edges read as one.
export const HANG = -0.04;
export const leans = (text: string | undefined) => !!text && /^[AVWY]/.test(text);
export const hang = (text: string | undefined) => (leans(text) ? `${HANG}em` : undefined);
