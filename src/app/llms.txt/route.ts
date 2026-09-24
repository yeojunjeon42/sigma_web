import { llmsTxt, textResponse } from "@/app/ai/corpus";

export const revalidate = 3600;

export function GET() {
  return textResponse(llmsTxt());
}
