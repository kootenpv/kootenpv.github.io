import type { APIContext, GetStaticPaths } from "astro";
import { getPublishedPosts, postSlug } from "~/lib/posts";

// Original markdown sources — frontmatter preserved.
const rawPosts = import.meta.glob("../content/posts/*.{md,mdx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function rawForId(id: string): string | null {
  for (const [path, content] of Object.entries(rawPosts)) {
    const filename = (path.split("/").pop() as string).replace(/\.(md|mdx)$/, "");
    if (filename === id) return content;
  }
  return null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((entry) => ({
    params: { slug: postSlug(entry) },
    props: { id: entry.id },
  }));
};

export async function GET({ props }: APIContext) {
  const { id } = props as { id: string };
  const body = rawForId(id);
  if (!body) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
