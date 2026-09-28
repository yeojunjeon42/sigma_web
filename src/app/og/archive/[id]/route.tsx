import { ARCHIVE } from "@/features/archive/data/projects";
import { splitTitle } from "@/features/archive/components/splitTitle";
import { titleCard } from "../../card";

export const dynamic = "force-static";

export function generateStaticParams() {
  return ARCHIVE.map((p) => ({ id: p.id }));
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const build = ARCHIVE.find((p) => p.id === id);
  if (!build) return new Response("Not found", { status: 404 });
  return titleCard(splitTitle(build.title).en);
}
