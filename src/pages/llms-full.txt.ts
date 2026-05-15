import type { APIContext } from "astro";
import { buildLlmsFullTxt } from "~/lib/llms";
import { getPublishedPosts, postUrl } from "~/lib/posts";

// Pull raw markdown bodies (with frontmatter) via Vite's ?raw query so the
// "full corpus" reflects the original sources, not Astro's HTML render.
const rawPosts = import.meta.glob("../content/posts/*.{md,mdx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export async function GET(_context: APIContext) {
  const published = await getPublishedPosts();
  const urlById = new Map(published.map((p) => [p.id, postUrl(p)]));

  const bodies = Object.entries(rawPosts)
    .map(([path, content]) => {
      const filename = path.split("/").pop() as string;
      const idKey = filename.replace(/\.(md|mdx)$/, "");
      const url = urlById.get(idKey) || urlById.get(filename);
      if (!url) return null;
      return { name: filename, content, url };
    })
    .filter((p): p is { name: string; content: string; url: string } => p !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const body = await buildLlmsFullTxt(bodies);
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
