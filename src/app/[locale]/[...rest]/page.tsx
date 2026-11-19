import { notFound } from "next/navigation";

// An address no page answers still belongs to a language, so it gets that language's 404.
export default function Unmatched() {
  notFound();
}
