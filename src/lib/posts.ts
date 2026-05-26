import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

function existsInHead(filePath: string): boolean {
  const r = spawnSync("git", ["ls-tree", "HEAD", "--", filePath], { encoding: "utf8" });
  return r.status === 0 && r.stdout.trim() !== "";
}

export function lastModified(filePath: string | undefined): Date | null {
  if (!filePath) return null;
  const r = spawnSync("git", ["log", "-1", "--format=%cI", "--", filePath], {
    encoding: "utf8",
  });
  const iso = (r.stdout || "").trim();
  if (r.status === 0 && iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  // No git log entry. Either:
  //  - file is in HEAD but the relevant commit is unreachable (shallow CI clone) → null
  //  - file isn't in HEAD (uncommitted, staged or untracked) → fs mtime
  if (existsInHead(filePath)) return null;
  try {
    return statSync(filePath).mtime;
  } catch {
    return null;
  }
}

export function postUpdatedAt(entry: Post): Date | null {
  if (entry.data.updated) return entry.data.updated;
  return lastModified(entry.filePath);
}

// Always returns a Date — used by RSS/sitemap so every post has a value.
// Falls back to the publish date when no later update is known.
export function postLastModified(entry: Post): Date {
  const u = postUpdatedAt(entry);
  return u && u > entry.data.date ? u : entry.data.date;
}

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
