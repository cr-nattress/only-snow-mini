/**
 * Catch-all API proxy route handler.
 *
 * Purpose: Forwards client requests from /backend/* to the external
 * OnlySnow API, avoiding CORS issues since the browser only makes
 * same-origin requests.
 *
 * Inputs: Any HTTP request to /backend/<path>
 * Outputs: Proxied response from the external API
 * Side effects: None (stateless proxy)
 * Error behavior: Returns the upstream status code and body as-is
 */

import { type NextRequest, NextResponse } from "next/server";

const API_BACKEND =
  process.env.NEXT_PUBLIC_ONLYSNOW_API_URL ??
  "https://ski-ai-mu.vercel.app/api";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  const upstream = `${API_BACKEND}/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  // Forward auth and content-type from the client
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  const res = await fetch(upstream, {
    method: req.method,
    headers,
    body: hasBody ? await req.text() : undefined,
  });

  const body = await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx);
}
