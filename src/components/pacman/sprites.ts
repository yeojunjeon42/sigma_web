// The club's mark as Pac-Man and the ghosts of our own drawing, printed as dots on the paper.
// Shared by /contact's rule-track game and the 404 / error arcade.

const CX = 119.69;
const CY = 137;
const R_OUT = 137;
const R_IN = 111;
const BACK = Math.atan2(78.59, 112.22);
const LIP = Math.atan2(67.94, CX);
const LIP_IN = Math.atan2(73.87, 82.84);
const APEX_OUT = -22.66;
const APEX_IN = 22.67;
const SHUT = (5 / 2) * (Math.PI / 180);
const WIDE = (76 / 2) * (Math.PI / 180);
const CHEW = 310;
const EYE = { x: 119.69, y: 69.88, r: 15.18 };
const PIVOT = { x: 142.36, y: 137 };
const TWITCH = (12 * Math.PI) / 180;
const SUB = 4;
const MARK =
  "M231.98 181.85C231.49 183.06 230.99 184.26 230.47 185.45L241.56 190.31C242.14 189 242.7 187.68 243.23 186.36ZM236.35 168.83C236 170.09 235.65 171.34 235.27 172.58L246.83 176.13C247.25 174.77 247.66 173.39 248.04 172.01ZM240.5 141.71C240.45 143.01 240.37 144.31 240.28 145.6L252.35 146.45C252.45 145.03 252.54 143.6 252.59 142.16ZM240.48 131.86L252.56 131.35C252.5 129.92 252.43 128.5 252.32 127.07L240.26 127.97C240.35 129.26 240.42 130.55 240.48 131.86M236.23 104.76L247.91 101.54C247.53 100.16 247.13 98.79 246.7 97.42L235.13 101.03C235.52 102.26 235.88 103.51 236.23 104.76M231.83 91.76L243.06 87.22C242.53 85.89 241.96 84.58 241.39 83.27L230.31 88.17C230.83 89.36 231.34 90.55 231.83 91.76M236.82 200.05L220.97 191.51C220.09 193.13 219.17 194.74 218.2 196.33L233.61 205.63C234.73 203.79 235.8 201.93 236.82 200.05M220.88 82.31L236.71 73.73C235.69 71.85 234.6 70 233.49 68.17L218.09 77.49C219.06 79.08 220 80.69 220.88 82.31M232.45 114.35C232.82 116.17 233.14 117.99 233.41 119.83L251.21 117.16C250.9 115.04 250.52 112.93 250.11 110.82ZM233.44 153.94C233.17 155.78 232.86 157.61 232.5 159.43L250.16 162.92C250.58 160.82 250.94 158.7 251.25 156.58Z";
const WEDGE = "M142.36 137L211.46 88.62L119.69 121.54Z";

export type Ink = { paper: string; ink: string; muted: string; accent: string };

export function readInk(): Ink {
  const css = (n: string, f: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
  return {
    paper: css("--color-canvas", "#dfe1dc"),
    ink: css("--color-ink", "#0f110d"),
    muted: css("--color-ink-muted", "#4d514a"),
    accent: css("--color-accent", "#ed2024"),
  };
}

/** The face's small life: chewing while it moves, a blink now and then, a twitching red wedge. */
export type Face = { open: number; lid: number; tongue: number };

export function createFace() {
  let chew = 0;
  let blinkAt = 0;
  let blinks: number[] = [];
  let tongue = 0;
  let tongueTo = 0;
  let twitchAt = 0;
  const face: Face = { open: 0.5, lid: 1, tongue: 0 };
  return {
    face,
    step(now: number, dt: number, moving: boolean) {
      if (moving) chew += dt * 1000;
      face.open = 0.5 - 0.5 * Math.cos((chew / CHEW) * Math.PI * 2);
      if (now >= blinkAt) {
        blinks = [now];
        if (Math.random() < 0.25) blinks.push(now + 200);
        blinkAt = now + 2500 + Math.random() * 3500;
      }
      face.lid = 1;
      for (const b of blinks)
        if (now >= b && now < b + 120) face.lid = Math.max(0.06, Math.abs(Math.cos(((now - b) / 120) * Math.PI)));
      if (now >= twitchAt) {
        tongueTo = (Math.random() * 2 - 1) * TWITCH;
        twitchAt = now + 600 + Math.random() * 1200;
      }
      tongue += (tongueTo - tongue) * Math.min(1, dt * 7);
      face.tongue = tongue;
    },
  };
}

/**
 * Prints sprites as dots: each shape is drawn in flat key colours into an offscreen canvas at
 * four samples per dot, then every dot is sized by coverage and toned by `tone`.
 */
export function createPrinter(ink: Ink) {
  const off = document.createElement("canvas");
  const og = off.getContext("2d", { willReadFrequently: true });
  const dashes = new Path2D(MARK);
  const wedge = new Path2D(WEDGE);

  const print = (
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    d: number,
    fine: number,
    paint: (g: CanvasRenderingContext2D) => void,
    tone: (r: number, g: number, b: number) => string | null,
    knock = true,
  ) => {
    if (!og) return;
    const f = fine;
    const n = Math.ceil(d / f) + 2;
    off.width = n * SUB;
    off.height = n * SUB;
    og.setTransform(SUB / f, 0, 0, SUB / f, (n * SUB) / 2, (n * SUB) / 2);
    paint(og);
    const data = og.getImageData(0, 0, off.width, off.height).data;
    const x0 = ox - (n * f) / 2;
    const y0 = oy - (n * f) / 2;
    const q = SUB * SUB * 255;
    for (let r = 0; r < n; r++) {
      for (let cc = 0; cc < n; cc++) {
        let a = 0;
        let rr = 0;
        let gg = 0;
        let bb = 0;
        for (let yy = 0; yy < SUB; yy++) {
          let k = ((r * SUB + yy) * off.width + cc * SUB) * 4;
          for (let xx = 0; xx < SUB; xx++, k += 4) {
            const al = data[k + 3];
            a += al;
            rr += data[k] * al;
            gg += data[k + 1] * al;
            bb += data[k + 2] * al;
          }
        }
        if (a < q * 0.12) continue;
        const x = x0 + (cc + 0.5) * f;
        const y = y0 + (r + 0.5) * f;
        if (knock) {
          ctx.fillStyle = ink.paper;
          ctx.fillRect(x - f / 2 - 0.1, y - f / 2 - 0.1, f + 0.2, f + 0.2);
        }
        const colour = tone(rr / a / 255, gg / a / 255, bb / a / 255);
        if (!colour) continue;
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(x, y, f * 0.5 * Math.sqrt(Math.min(1, a / q)), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const markTone = (r: number, g: number) => (g > 0.5 ? null : r > 0.5 ? ink.accent : ink.ink);
  const ghostTone = (r: number, g: number, b: number) =>
    g > 0.5 ? null : b > 0.5 && r < 0.5 ? ink.ink : ink.muted;
  const frightTone = (r: number, g: number, b: number) =>
    g > 0.5 ? null : b > 0.5 && r < 0.5 ? ink.muted : ink.accent;

  const jaw = (g: CanvasRenderingContext2D, m: number, down: boolean) => {
    const f = down ? -1 : 1;
    const d = m - LIP;
    const rot = (x: number, y: number): [number, number] => {
      const a = d * f;
      return [CX + x * Math.cos(a) - y * Math.sin(a), CY + x * Math.sin(a) + y * Math.cos(a)];
    };
    const end = Math.PI - m;
    g.beginPath();
    g.arc(CX, CY, R_OUT, -BACK * f, -end * f, !down);
    g.lineTo(...rot(APEX_OUT, 0));
    g.lineTo(...rot(APEX_IN, 0));
    g.arc(CX, CY, R_IN, -(Math.PI - LIP_IN - d) * f, -BACK * f, down);
    g.closePath();
    g.fill();
  };

  /** The mark, facing (dx, dy), centred at (x, y) and `d` across. */
  const pac = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    d: number,
    fine: number,
    dx: number,
    dy: number,
    face: Face,
    still: boolean,
    knock = true,
  ) => {
    const s = d / (2 * R_OUT);
    const m = still ? LIP : SHUT + (WIDE - SHUT) * face.open;
    const lid = still ? 1 : face.lid;
    print(ctx, x, y, d, fine, (g) => {
      g.scale(s, s);
      if (dx > 0) g.scale(-1, 1);
      else if (dy < 0) g.rotate(Math.PI / 2);
      else if (dy > 0) g.rotate(-Math.PI / 2);
      g.translate(-CX, -CY);
      g.fillStyle = "#00f";
      jaw(g, m, false);
      jaw(g, m, true);
      g.fill(dashes);
      g.beginPath();
      g.ellipse(EYE.x, EYE.y, EYE.r, EYE.r * lid, 0, 0, Math.PI * 2);
      g.fill();
      g.save();
      g.translate(PIVOT.x, PIVOT.y);
      g.rotate(still ? 0 : face.tongue);
      g.translate(-PIVOT.x, -PIVOT.y);
      g.fillStyle = "#f00";
      g.fill(wedge);
      g.restore();
    }, markTone, knock);
  };

  /** A ghost looking along (dx, dy); `fright` prints it in the accent, eyes dimmed. */
  const ghost = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    d: number,
    fine: number,
    dx: number,
    dy: number,
    now: number,
    fright = false,
    knock = true,
  ) => {
    const phase = now / 90;
    print(ctx, x, y, d, fine, (g) => {
      const r = d / 2;
      const foot = r * 0.9;
      g.fillStyle = "#f0f";
      g.beginPath();
      g.moveTo(-r * 0.92, foot * 0.7);
      g.lineTo(-r * 0.92, -r * 0.1);
      g.bezierCurveTo(-r * 0.92, -r * 1.02, r * 0.92, -r * 1.02, r * 0.92, -r * 0.1);
      g.lineTo(r * 0.92, foot * 0.7);
      for (let k = 0; k <= 24; k++) {
        const u = k / 24;
        const wave = 0.5 + 0.5 * Math.sin(u * Math.PI * 6 + phase);
        g.lineTo(r * 0.92 - u * r * 1.84, foot * 0.7 + wave * r * 0.28);
      }
      g.closePath();
      g.fill();
      const lx = Math.sign(dx) * r * 0.13;
      const ly = Math.sign(dy) * r * 0.13;
      for (const side of [-1, 1]) {
        const ex = side * r * 0.36 + lx * 0.4;
        const ey = -r * 0.22 + ly * 0.4;
        g.fillStyle = "#0f0";
        g.beginPath();
        g.ellipse(ex, ey, r * 0.27, r * 0.33, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#00f";
        g.beginPath();
        g.arc(ex + lx, ey + ly + r * 0.04, r * 0.15, 0, Math.PI * 2);
        g.fill();
      }
    }, fright ? frightTone : ghostTone, knock);
  };

  return { pac, ghost };
}
