import { NextRequest, NextResponse } from "next/server";

const PHP_BASE_URL =
  "https://web120.ir/apartment/app_ver1";

type RouteContext = {
  params: Promise<{
    php: string[];
  }>;
};

async function proxyRequest(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { php } = await context.params;

    const phpPath = php.join("/");

    const targetUrl =
      `${PHP_BASE_URL}/${phpPath}` +
      request.nextUrl.search;

    const body =
      request.method === "GET" ||
      request.method === "HEAD"
        ? undefined
        : await request.text();

    const headers = new Headers();

    const contentType =
      request.headers.get("content-type");

    const accept =
      request.headers.get("accept");

    if (contentType) {
      headers.set(
        "Content-Type",
        contentType
      );
    }

    if (accept) {
      headers.set("Accept", accept);
    }

    console.log(
      "========== PHP PROXY =========="
    );

    console.log("METHOD:", request.method);
    console.log("TARGET:", targetUrl);
    console.log("BODY:", body);

    const response = await fetch(
      targetUrl,
      {
        method: request.method,
        headers,
        body,
      }
    );

    const data = await response.text();

    console.log(
      "PHP STATUS:",
      response.status
    );

    console.log(
      "PHP RESPONSE:",
      data
    );

    console.log(
      "==============================="
    );

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get(
            "content-type"
          ) ||
          "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error(
      "PHP Proxy Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to connect to PHP API",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 502,
      }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}