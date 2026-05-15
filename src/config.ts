export type ThemeName = "clean" | "terminal" | "modern" | "tron-ares";

export interface SocialLinks {
  email: string;
  github: string;
  linkedin: string;
  stackoverflow: string;
  twitter: string;
  facebook?: string;
}

export interface FooterToggles {
  email: boolean;
  github: boolean;
  linkedin: boolean;
  stackoverflow: boolean;
  twitter: boolean;
  facebook: boolean;
}

export interface NavLink {
  label: string;
  href: string;
}

const avatarProgressValues = [0, 25, 50, 75, 100] as const;
export type AvatarProgress = (typeof avatarProgressValues)[number];

function normalizeAvatarProgress(value: unknown): AvatarProgress {
  const numeric = Number(value);
  return avatarProgressValues.includes(numeric as AvatarProgress)
    ? numeric as AvatarProgress
    : 0;
}

function getAvatarProgress(): AvatarProgress {
  const explicitProgress = process.env.AVATAR_PROGRESS_PERCENT;
  if (explicitProgress !== undefined) return normalizeAvatarProgress(explicitProgress);

  const runNumber = Number(process.env.GITHUB_RUN_NUMBER ?? 0);
  if (!Number.isFinite(runNumber) || runNumber <= 0) return 0;

  return normalizeAvatarProgress((runNumber % 5) * 25);
}

function getAvatarFrameUrl(): string {
  const buildId =
    process.env.GITHUB_RUN_NUMBER ??
    process.env.AVATAR_PROGRESS_PERCENT ??
    "local";

  return `/avatar-frame.png?v=${encodeURIComponent(buildId)}`;
}

export const SITE = {
  url: "https://vks.ai",
  title: "Pascal van Kooten",
  tagline: "Software enthusiast",
  description: "Software enthusiast",
  author: "Pascal van Kooten",
  avatar: "/img/avatar-icon.png",
  avatarFrame: getAvatarFrameUrl(),
  avatarProgress: getAvatarProgress(),
  timezone: "Europe/Amsterdam",
  locale: "en",
  postsPerPage: 5,
} as const;

export const THEME: ThemeName = "tron-ares";

export const NAV: NavLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
  { label: "About Me", href: "/aboutme" },
  { label: "Speaking", href: "/speaking" },
  { label: "CLI", href: "/cli" },
  { label: "PPM", href: "/ppm" },
  { label: "Mix", href: "/mix" },
  { label: "<!Challenge!>", href: "/challenge" },
];

export const SOCIAL: SocialLinks = {
  email: "kootenpv@gm**l.c*m",
  github: "kootenpv",
  linkedin: "in/pascalvkooten",
  stackoverflow: "users/1575066/pascalvkooten",
  twitter: "kootenpv",
};

export const FOOTER_LINKS: FooterToggles = {
  email: true,
  github: true,
  linkedin: true,
  stackoverflow: true,
  twitter: false,
  facebook: false,
};

export const ANALYTICS = {
  goatcounter: {
    enabled: true,
    code: "kootenpv",
    src: "https://gc.zgo.at/count.js",
  },
} as const;

export const COMMENTS = {
  giscus: {
    enabled: true,
    repo: "kootenpv/kootenpv.github.io",
    repoId: "MDEwOlJlcG9zaXRvcnk0MjM3MjkxMA==",
    category: "General",
    categoryId: "DIC_kwDOAoaPLs4C8brw",
    mapping: "pathname",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "bottom",
    theme: "https://vks.ai/giscus/kootenpv_theme.css",
    lang: "en",
    loading: "lazy",
  },
} as const;
