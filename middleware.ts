// Removed route protection — this MVP exposes /oracle publicly.
// If you later add auth, reintroduce protection here.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}