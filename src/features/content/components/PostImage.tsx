import Image from "next/image";

const STRONG = ["#ed2024", "#ee7f6a", "#8e1316"];
const SOFT = ["#f3c1b5", "#f0d8d1"];
const COOL = ["#b9c0b3", "#dfe1dc"];
const BASE = ["#f3c1b5", "#ee7f6a", "#f0d8d1"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function field(seed: string) {
  let n = hash(seed);
  const next = () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  };
  const of = (list: string[]) => list[Math.floor(next() * list.length)];
  const base = of(BASE);
  const blobs = [of(STRONG), of(STRONG), of(SOFT), of(COOL)].map((c) => {
    const x = Math.round(next() * 100);
    const y = Math.round(next() * 100);
    const r = Math.round(40 + next() * 40);
    return `radial-gradient(circle at ${x}% ${y}%, ${c} 0%, transparent ${r}%)`;
  });
  return { backgroundColor: base, backgroundImage: blobs.join(",") };
}

export default function PostImage({
  src,
  seed,
  ratio = "4 / 3",
  sizes,
  eager = false,
  className = "",
}: {
  src?: string;
  seed?: string;
  ratio?: string;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <div style={{ aspectRatio: ratio }} className={`relative overflow-hidden bg-ink/5 ${className}`}>
        <Image src={src} alt="" fill sizes={sizes} priority={eager} className="object-cover" />
      </div>
    );
  }
  return (
    <div aria-hidden="true" style={{ aspectRatio: ratio }} className={`relative overflow-hidden bg-ink/5 ${className}`}>
      {seed ? (
        <>
          <div className="absolute -inset-[15%] blur-2xl" style={field(seed)} />
          <svg className="absolute inset-0 size-full opacity-[0.14] mix-blend-multiply">
            <filter id={`grain-${hash(seed)}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#grain-${hash(seed)})`} />
          </svg>
        </>
      ) : null}
    </div>
  );
}
