import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "~/config";
import { getPublishedPosts, postLastModified, postUrl } from "~/lib/posts";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  const latest = posts.reduce<Date>(
    (acc, p) => {
      const lm = postLastModified(p);
      return lm > acc ? lm : acc;
    },
    new Date(0),
  );
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.description ?? p.data.subtitle ?? "",
      link: postUrl(p),
      customData: `<atom:updated>${postLastModified(p).toISOString()}</atom:updated>`,
    })),
    customData:
      `<language>${SITE.locale}</language>` +
      `<lastBuildDate>${latest.toUTCString()}</lastBuildDate>`,
  });
}
