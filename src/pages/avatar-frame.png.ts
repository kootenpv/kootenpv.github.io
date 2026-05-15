import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { SITE } from "~/config";

export const prerender = true;

const SIZE = 512;
const BORDER = 48;
const INNER_SIZE = SIZE - BORDER * 2;
const ACCENT = "#ff4b23";
const TRACK = "#46160c";
const FILL = "#120a0a";

function frameSvg(progress: number) {
  const inner = BORDER / 2;
  const outer = SIZE - inner;
  const mid = SIZE / 2;
  const path = `M ${mid} ${inner} H ${outer} V ${outer} H ${inner} V ${inner} H ${mid}`;

  return Buffer.from(`
    <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${SIZE}" height="${SIZE}" rx="56" fill="${FILL}" />
      <path d="${path}" fill="none" stroke="${TRACK}" stroke-width="${BORDER}" stroke-linejoin="round" />
      <path d="${path}" fill="none" stroke="${ACCENT}" stroke-width="${BORDER}" stroke-linejoin="round" pathLength="100" stroke-dasharray="${progress} ${100 - progress}" />
    </svg>
  `);
}

export const GET: APIRoute = async () => {
  const avatarPath = join(process.cwd(), "public", SITE.avatar.replace(/^\//, ""));
  const avatar = await sharp(await readFile(avatarPath))
    .resize(INNER_SIZE, INNER_SIZE, { fit: "cover" })
    .png()
    .toBuffer();

  const image = await sharp(frameSvg(SITE.avatarProgress))
    .composite([{ input: avatar, left: BORDER, top: BORDER }])
    .png()
    .toBuffer();

  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
