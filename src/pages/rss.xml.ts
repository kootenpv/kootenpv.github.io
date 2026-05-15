import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "~/config";
import { getPublishedPosts, postUrl } from "~/lib/posts";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.description ?? p.data.subtitle ?? "",
      link: postUrl(p),
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
