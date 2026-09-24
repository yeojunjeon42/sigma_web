import { llmsFull, textResponse } from "@/app/ai/corpus";

export const revalidate = 3600;

export async function GET() {
  return textResponse(await llmsFull());
}
