import { mdPage, textResponse } from "@/app/ai/corpus";

export const revalidate = 3600;

export async function GET() {
  return textResponse(await mdPage("members"));
}
