# PROMPT_UPDATE.md

Instructions for an AI (or human) maintaining the chat knowledge base in
`public/data/`. Read this before editing `faq.json`, `me.json`, or
`website.json`.

The chat UI is `src/components/Chat.astro`. The in-browser embedding
classifier lives under `public/js/distilltiny/`. Self-referential bot-stat
answers in `faq.json` are auto-rewritten by
`scripts/refresh-chat-stats.mjs`, which runs as a prestep of `pnpm dev`,
`pnpm start`, and `pnpm build`.

## Source of truth for facts

Facts about the author and the site come from this repo. When extending
`me.json` or `website.json`, draw from these files rather than inventing:

- `src/config.ts` — site title, tagline, social handles, email, timezone
- `src/pages/aboutme.astro` — bio framing
- `src/components/Introduction.astro` — long-form bio (canonical source for
  stack, HFT history, MSc, freelance stance, etc.)
- `src/pages/projects.astro` — open-source project list with one-line
  descriptions
- `src/pages/speaking.astro` — talks list with events, titles, dates
- `src/pages/ppm.astro` — PPM password manager details
- `src/components/htop.astro` — birth date constant and popular-post URLs
- `EASTER.md` — every easter egg, fully spoiled (so we can write **hints**,
  not spoilers, in `website.json`)
- `src/lib/llms.ts` — `buildLlmsSecretTxt` includes the cooperation token
  and crawler-only context

## What each file is for

- **`public/data/faq.json`** — generic chatbot FAQ (greetings, smalltalk,
  capabilities, tools, sentiment, privacy, and questions about the bot
  itself).
- **`public/data/me.json`** — facts about the author (Pascal van Kooten):
  identity, background, stack, projects, speaking, contact.
- **`public/data/website.json`** — facts about the site (vks.ai): structure,
  theme, design touches, **easter eggs**.

Entry IDs are namespaced internally as `faq:<id>`, `me:<id>`, `website:<id>`,
so the same `id` may appear across files. Within a single file, `id` must
be unique.

## Schema

Every entry is:

```json
{
  "id": "snake_case_unique_within_file",
  "category": "freeform_label",
  "questions": ["paraphrase 1", "paraphrase 2", "..."],
  "answer": "What the bot replies."
}
```

- `questions` should hold **3–6 paraphrases** per entry. More phrasings ⇒
  more robust matching. Stop adding once the variants start sounding
  redundant.
- `answer` is short and self-contained. The bot does not generate text; the
  string is returned verbatim.

## Formatting conventions (preserve these)

- **`faq.json`** uses a **one-line-per-entry** layout (inline arrays of
  strings). Don't reformat it to multiline.
- **`me.json` and `website.json`** use **standard pretty-printed JSON**
  (2-space indent, one item per line). Don't compact them.
- Encoding: UTF-8. Smart punctuation (em-dashes, curly quotes) is fine.
- Don't reorder existing entries unnecessarily; append new ones to the end
  of their semantic group.

## Tone and voice

- The bot is named **Tini** (short for tiny; the underlying classifier
  project is `distilltiny`). When introducing itself, the bot says "I'm
  Tini — Pascal's tiny in-browser assistant."
- Tini is the **narrator** — first-person ("I"), warm, concise, a little
  nerdy. Refer to the author as **Pascal** (or "he"/"him") in the third
  person. The bot speaks *about* Pascal; it is not Pascal.
- Keep answers short (one or two sentences is ideal). The UI is a small
  chat bubble; long paragraphs feel wrong.
- Match register to the file: `faq.json` is friendly and a bit playful;
  `me.json` is factual third-person about Pascal; `website.json` is curious
  and inviting (and never spoils easter eggs).

## Distinguishing bot questions from author questions

Visitors will use both **second-person** ("who are you", "where do you
live") and **third-person** ("who is Pascal", "where does Pascal live")
phrasings. The split:

- **Second-person "you" → `faq.json` (about Tini).** "Who are you", "where
  are you from", "how old are you", "what do you do" all resolve to the
  bot. The bot may briefly redirect to Pascal where helpful (e.g. *"I live
  in your browser tab. Pascal lives in the Netherlands."*).
- **Explicit Pascal/he/his/the-author → `me.json`.** Every `me.json`
  question variant must name Pascal (or use "he"/"his"/"the author").
  **No bare "you" or "your" forms** — those collide with the bot.
- **`me.json` answers are third person.** *"Pascal holds an MSc..."*, not
  *"I hold an MSc..."*. The narrator is Tini.

If you find yourself adding "what do you do" to `me.json`, stop — that
variant belongs in `faq.json` answering as Tini, with a hand-off line if
needed.

## website.json — hints, never spoilers

Easter-egg entries must **point at how to find** something, not reveal it.

- Don't quote `easter.txt` contents.
- Don't print the secret number (8978).
- Don't list the four light-mode click messages.
- Don't enumerate the shell skins or the windows desktop file by name.
- Do encourage exploration ("Try /cli", "Stay still on the home page for a
  few seconds", "Switch the skin and look around the Desktop").

If in doubt, ask: *would reading this answer ruin the surprise?* If yes,
rewrite it as a nudge.

## Avoiding mismatches

Vector similarity sometimes pulls a query into the wrong class because of
a **single overlapping word**.

- Example: "who is pascal" once matched the PPM entry because one of its
  question variants was "what is pascal password manager". The fix was to
  drop the literal "Pascal" from the PPM variants and add "who is pascal"
  / "who is the author" to the identity entry.
- When adding an entry that shares a salient word with an existing one,
  check the existing entry's variants and tighten them if needed.
- Prefer **rephrasing or splitting** entries over raising the confidence
  threshold (currently `0.45`, set in `public/js/distilltiny/index.js`).

## Self-referential stats entries

Four entries in `faq.json` describe the bot's own size and class count:

- `model_size`
- `bot_data_size`
- `bot_total_footprint`
- `bot_classes_count`

**Do not edit their `answer` fields by hand.** They are rewritten by
`scripts/refresh-chat-stats.mjs` so the numbers stay correct after every
data edit.

## Running the stats script

After editing any data file:

```bash
pnpm chat-stats
```

(Equivalent: `node scripts/refresh-chat-stats.mjs`.)

What it does:

1. Reads `public/data/{faq,me,website}.json`, computes class / variant /
   byte totals and the estimated embedded-index size in RAM.
2. Surgically rewrites the four stats-bearing entries in `faq.json` —
   only the `"answer": "..."` field changes; the rest of the file
   (formatting, ordering, other entries) is untouched.
3. Logs a one-line summary, e.g.
   `chat-stats: 330 classes, 1210 variants, 76KB JSON, ~1.8MB embedded (already up to date)`.

The script also runs automatically as a prestep of `pnpm dev`, `pnpm
start`, and `pnpm build`, so what ships under `dist/data/` is always in
sync.

## After editing — testing

1. `pnpm dev` (auto-runs the stats refresh, then serves the site at
   <http://localhost:4321/>).
2. Open the chat (corner launcher), solve the egg-count puzzle
   (answer: 99), accept the LLM offer.
3. **Hard-refresh** the tab if you've already loaded the chat in this
   session — embeddings are computed once per page load, and the chat
   logic lives in `<script is:inline>` which Astro doesn't HMR.

If you need to debug score bleed, log `res.top` from `ask()` in
`public/js/distilltiny/index.js` to see the runner-up classes and scores.

## Don'ts

- Don't introduce a build step for the classifier itself. The chat code is
  intentionally pure ESM + jsdelivr CDN (see
  `public/js/distilltiny/classifier.js`).
- Don't add runtime dependencies to the files under
  `public/js/distilltiny/`.
- Don't store conversation context, user data, or anything else in
  `localStorage` beyond what `Chat.astro` already does
  (`easter-eggs-found`, `llm-accepted`). Privacy is a feature.
- Don't rename `id` fields once an entry is shipped — debug references
  break silently.

## Quick checklist before commit

- [ ] All entries have `id`, `category`, `questions` (array, ≥1), `answer`.
- [ ] No `id` collisions within a file.
- [ ] Tone matches the file (assistant voice; hints not spoilers in
      `website.json`).
- [ ] `pnpm chat-stats` runs cleanly (either reports "already up to date"
      or stages the four updated lines in `faq.json`).
- [ ] Manually tested a couple of queries in the browser, including a
      likely near-miss to confirm the 0.45 threshold still behaves.
