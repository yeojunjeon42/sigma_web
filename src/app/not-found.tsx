import type { Metadata } from "next";
import LostPage from "@/components/pacman/LostPage";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return <LostPage word="404" heading="Page not found" />;
}
