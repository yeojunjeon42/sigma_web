import ContactPill, { ContactRow } from "@/components/ContactPill";

const PILL = "Built something in the club? Add it to the archive";

export default function AddBuild() {
  return <ContactPill about="archive" pill={PILL} />;
}

export function AddBuildRow({ className = "" }: { className?: string }) {
  return <ContactRow about="archive" pill={PILL} className={className} />;
}
