import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (Note: this only works for a single instance)
// For production serverless deployments (Vercel/Netlify), use Redis (e.g. @upstash/ratelimit)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 100; // Max requests
const WINDOW_MS = 60 * 1000; // 1 minute

export function middleware(request: NextRequest) {
  // Only rate-limit API routes to avoid blocking static assets or pages
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get IP address (request.ip is only available on Edge, fallback to headers)
    const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "unknown";
    
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    let requestData = rateLimitMap.get(ip);

    if (!requestData || requestData.lastReset < windowStart) {
      // Reset or initialize
      requestData = { count: 1, lastReset: now };
    } else {
      requestData.count++;
    }

    rateLimitMap.set(ip, requestData);

    if (requestData.count > RATE_LIMIT) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      });
    }
  }

  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
