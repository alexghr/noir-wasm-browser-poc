import { NextRequest, NextResponse } from "next/server";

/* Mirror github archive requests in order to bypass CORS */
/* This is an open redirect. This is unsafe, but fine for PoC */

export async function GET(request: NextRequest) {
  const reqUrl = new URL(request.url);
  const archive = reqUrl.searchParams.get('archive');
  const resp = await fetch(archive!, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/zip',
    },
    redirect: 'follow',
  });

  return new Response(resp.body, {
    status: resp.status
  })
};
