# TODO

Follow-ups from the Jekyll → Astro migration.

## Comments (Giscus)

- Enable GitHub Discussions on `kootenpv/kootenpv.github.io`.
- Visit https://giscus.app and copy `data-repo-id` and `data-category-id`.
- Fill `repoId` and `categoryId` in `src/config.ts` (`COMMENTS.giscus`).
- Until configured, post pages render a small "Comments disabled: Giscus repoId/categoryId not configured" notice.
- Per-post override is already wired: set `comments: false` in a post's frontmatter to hide Giscus on that post.

## Auto-generated OG images

Deferred during initial setup — the `satori` / `satori-html` / `sharp` deps are installed but a font binary is still needed and could not be fetched automatically.

- Add a font file, e.g. `src/assets/fonts/InterDisplay-SemiBold.otf` (any OTF/TTF works).
- Add an OG endpoint at `src/pages/og/[...slug].png.ts` that uses `satori` + `satori-html` + `sharp` with `getStaticPaths()` over published posts to render per-post PNGs.
- Update `src/components/SEO.astro` to point at `/og/<slug>.png` for posts (currently falls back to the avatar / per-post `image:` frontmatter).

## Deployment

- First push to `main`/`master`: enable GitHub Pages → Source: "GitHub Actions" in the repo settings.
- Verify the custom domain (`vks.ai`) is set in Pages settings; `public/CNAME` already contains `vks.ai`.
- Confirm the first Action run on `.github/workflows/deploy.yml` succeeds and the site is live at https://vks.ai.

## GoatCounter

- `ANALYTICS.goatcounter` in `src/config.ts` is set to `code: "kootenpv"` (posts to `https://kootenpv.goatcounter.com/count`).
- The script only loads in production builds, so local `pnpm dev` won't send events.

## Out of scope (per brief, v1)

- Search.
- Newsletter.
- i18n.

## Cleanup

- Once the new site is live and verified, decide whether to delete `_jekyll_backup/` or move it out of the repo.
- Remove unused images from `public/` if any are leftover from Jekyll-only pages.
