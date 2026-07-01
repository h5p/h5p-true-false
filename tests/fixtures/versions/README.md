# Versioned upgrade fixtures

Each `1_<minor>.json` is a **canonical, frozen example of content in the shape that the
matching upgrade function consumes** — i.e. `1_5.json` is the legacy input fed to
`H5PUpgrades['H5P.TrueFalse'][1][5]`, `1_6.json` is fed to `[1][6]`, and so on.

Why keep them as separate, versioned files:

- Upgrade functions transform *old* param shapes. Once the library moves on, no live
  `content.json` is authored in the old schema anymore, so the only durable way to keep
  exercising an upgrade is to **leave behind a snapshot of the pre-upgrade shape**.
- These files must stay **byte-stable**: they are the fixed input half of a
  golden-master pair. Do not "modernize" them — that would defeat the test.

## Adding a new version

When the library gains a new upgrade (e.g. a future `1.9`):

1. Author `1_9.json` containing a representative piece of content **in the shape that
   existed just before 1.9** (i.e. the input the `[1][9]` upgrade receives).
2. Add a spec case in `tests/unit/upgrades.spec.js` that runs the `[1][9]` upgrade on it
   and asserts the migration.
3. Never edit older `1_5.json` / `1_6.json` — each is the frozen contract for its own
   upgrade step.

## Current examples (inferred from `upgrades.js`)

| File | Consumed by | Migration it proves |
|---|---|---|
| `1_5.json` | `[1][5]` | Derives `metadata.title` from `question` (HTML tags stripped). Pre-1.5 content has no metadata title. |
| `1_6.json` | `[1][6]` | Moves `disableImageZooming` out of `behaviour` and wraps top-level `media` as `{ type, disableImageZooming }`. Pre-1.6 content stores `media` as the bare library value. |

