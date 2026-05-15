import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export function postSlug(entry: Post): string {
  const d = entry.data.date;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const titleSlug = entry.id.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.(md|mdx)$/, "");
  return `${yyyy}-${mm}-${dd}-${titleSlug}`;
}

export function postUrl(entry: Post): string {
  return `/${postSlug(entry)}`;
}

export async function getPublishedPosts(): Promise<Post[]> {
  const isProd = import.meta.env.PROD;
  const all = await getCollection("posts", ({ data }) => (isProd ? !data.draft : true));
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getPublishedPosts();
  const tags = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.tags) {
      tags.set(t, (tags.get(t) ?? 0) + 1);
    }
  }
  return tags;
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
