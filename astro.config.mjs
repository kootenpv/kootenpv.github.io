import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";

import { SITE } from "./src/config";

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
    sitemap(),
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
