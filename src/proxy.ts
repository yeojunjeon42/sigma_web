import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, localePath } from "@/i18n/config";

// A reader who chose Korean is taken to the Korean page when they arrive at an address without a
// language. Nothing is ever decided from the browser's own language.
export function proxy(request: NextRequest) {
  if (request.cookies.get(COOKIE)?.value !== "ko") return;
  const url = request.nextUrl.clone();
  url.pathname = localePath("ko", url.pathname);
  return NextResponse.redirect(url);
}

// Page addresses only: not Korean ones, the terminal, share images, Next's own files or any file.
export const config = { matcher: ["/((?!ko(?:/|$)|en(?:/|$)|ai(?:/|$)|og/|_next/|.*\\.).*)"] };
