import type { APIContext } from "astro";
import { buildLlmsSecretTxt } from "~/lib/llms";

export async function GET(_context: APIContext) {
  const body = buildLlmsSecretTxt();
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "x-robots-tag": "noindex",
    },
  });
}
