import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";

import { SITE } from "./src/config";

// Build a path → lastmod map for posts so the sitemap can emit <lastmod>.
// Mirrors the logic in src/lib/posts.ts (postSlug + lastModified) but reads
// frontmatter directly since content collections aren't available at config load.
const POSTS_DIR = "src/content/posts";

function gitLastCommitIso(filePath) {
  const r = spawnSync("git", ["log", "-1", "--format=%cI", "--", filePath], {
    encoding: "utf8",
  });
  return r.status === 0 ? (r.stdout || "").trim() : "";
}
function gitExistsInHead(filePath) {
  const r = spawnSync("git", ["ls-tree", "HEAD", "--", filePath], { encoding: "utf8" });
  return r.status === 0 && (r.stdout || "").trim() !== "";
}
function fileLastModified(filePath) {
  const iso = gitLastCommitIso(filePath);
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (gitExistsInHead(filePath)) return null;
  try { return statSync(filePath).mtime; } catch { return null; }
}
function readFrontmatterField(content, field) {
  const m = content.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const postLastmodByPath = new Map();
try {
  for (const f of readdirSync(POSTS_DIR)) {
    if (!/\.(md|mdx)$/.test(f)) continue;
    const filePath = join(POSTS_DIR, f);
    const head = readFileSync(filePath, "utf8").slice(0, 2000);
    const fmBlock = head.match(/^---\n([\s\S]+?)\n---/);
    if (!fmBlock) continue;
    const block = fmBlock[1];
    const dateStr = readFrontmatterField(block, "date");
    if (!dateStr) continue;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) continue;

    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const titleSlug = f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.(md|mdx)$/, "");
    const path = `/${yyyy}-${mm}-${dd}-${titleSlug}`.toLowerCase();

    let updated = null;
    const updatedStr = readFrontmatterField(block, "updated");
    if (updatedStr) {
      const u = new Date(updatedStr);
      if (!Number.isNaN(u.getTime())) updated = u;
    }
    if (!updated) updated = fileLastModified(filePath);
    const lastmod = updated && updated > date ? updated : date;
    postLastmodByPath.set(path, lastmod.toISOString());
  }
} catch {
  // Posts directory missing or unreadable — sitemap just won't have per-post lastmod.
}

export default defineConfig({
  site: SITE.url,
  trailingSlash: "ignore",
  devToolbar: {
    enabled: false,
  },
  build: {
    format: "directory",
  },
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        try {
          const path = new URL(item.url).pathname.replace(/\/$/, "").toLowerCase();
          const lm = postLastmodByPath.get(path);
          if (lm) item.lastmod = lm;
        } catch {}
        return item;
      },
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: { class: "heading-anchor", ariaHidden: "true", tabIndex: -1 },
          content: { type: "text", value: " #" },
        },
      ],
    ],
  },
});
