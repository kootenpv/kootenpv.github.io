import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      typography: () => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": "rgb(var(--c-fg))",
            "--tw-prose-headings": "rgb(var(--c-fg))",
            "--tw-prose-links": "rgb(var(--c-accent))",
            "--tw-prose-bold": "rgb(var(--c-fg))",
            "--tw-prose-quotes": "rgb(var(--c-muted))",
            "--tw-prose-code": "rgb(var(--c-fg))",
            "--tw-prose-borders": "rgb(var(--c-border))",
          },
        },
      }),
    },
  },
  plugins: [typography],
};
