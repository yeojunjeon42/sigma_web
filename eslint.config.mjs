import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The hand layer (DESIGN.md): its font, ink and filter reach only the components listed here.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/features/hand/**",
      "src/features/content/components/PostCover.tsx",
      "src/features/history/components/Collage.tsx",
      "src/features/history/components/Deco.tsx",
      "src/features/members/components/MemberCrew.tsx",
      "src/app/og/**",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["**/hand/HandLayer", "**/hand/stroke", "@/features/hand/*"], message: "The hand layer is for hand-layer components only (DESIGN.md)." }] }],
    },
  },
  globalIgnores([
    ".next/**",
    ".next-prof/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
