interface TProps {
  en: string;
  /** Kept with the English so the copy stays paired; the site prints English. */
  ko?: string;
}

export function T({ en }: TProps) {
  return <>{en}</>;
}
