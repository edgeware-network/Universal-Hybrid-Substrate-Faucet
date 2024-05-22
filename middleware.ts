import { NextRequest, NextResponse } from "next/server";
import ratelimit from "./database/rateLimit";

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? "::1";

  const limit = await ratelimit.limit(ip);
  console.log(limit);

  if (!limit.success) {
    return NextResponse.json({message: "1 day limit exceeded. Please try later!"}, { status: 429 });
  };
  return NextResponse.next();
};


export const config = {
  matcher: ["/api/disburse"],
}