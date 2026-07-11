import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, await params);
}

async function handleRequest(request: NextRequest, params: { path: string[] }) {
  const pathStr = params.path.join("/");
  const searchParams = request.nextUrl.search;
  
  // Nome do container backend do Easypanel como fallback
  const backendBase = process.env.BACKEND_URL || "http://controllo-servizi_backend:8000";
  const targetUrl = `${backendBase}/api/${pathStr}${searchParams}`;
  
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Não repassar o host original para evitar loop
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });

  const method = request.method;
  let body: any = undefined;

  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      body = await request.blob();
    } catch {
      body = undefined;
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Evitar cache no Next.js
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    const responseBody = await res.blob();
    return new NextResponse(responseBody, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("Proxy error for target:", targetUrl, err);
    return NextResponse.json(
      { error: "Internal Proxy Error", detail: err.message, target: targetUrl },
      { status: 502 }
    );
  }
}
