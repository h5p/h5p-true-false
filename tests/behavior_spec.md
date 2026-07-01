# Behavior Spec — H5P.TrueFalse

**Purpose.** This is the *durable* specification of what H5P.TrueFalse must do,
stated — wherever possible — at a boundary that survives reimplementation (jQuery →
web components → whatever comes next). The actual unit/integration/vdiff/e2e tests are
**disposable bindings** to these expectations. When the implementation is rewritten, keep
this file, delete the coupled tests, and regenerate tests from the still-valid entries.

This file is the single source of "what must remain true" for the library, shared
across all test types. It is not a test file and runs nothing itself.

> This TrueFalse spec doubles as the **canonical template**. Copy its structure for
> other libraries' `tests/behavior_spec.md`.

## Durability tiers (legend)

Order = most durable (survives full rewrite) → least (dies with the implementation).

| Tier | Meaning | Preferred test mechanic |
|---|---|---|
| `Invariant` | Property that holds for *any* implementation, any language. | property-based (fast-check) / assertion |
| `Contract` | Shape/behavior crossing a boundary H5P or the platform defines (H5P content-type contract, xAPI, semantics/params). | contract test / e2e |
| `Property` | Behavioral property across generated inputs (idempotence, inverse, round-trip). | property-based |
| `E2E-behavioral` | Observable output of the running content type given input. | playwright e2e / vdiff |
| `Impl-detail` | Coupled to current code structure; **expected to be discarded on rewrite.** | unit |

Each expectation records: **ID · statement · tier · current binding (test) · notes.**
`Current binding` may be `none (unverified)` until a test exists.

> **Execution context ≠ durability tier.** The tiers above rank *durability*. A test's
> **execution context** — `unit` / `integration` / `e2e` (see
> `prompts/unit_test_plan.md` → "Test types") — is a separate axis. A single durable
> expectation may carry bindings in more than one context: e.g. a `Contract` proven fast
> against a **mock** in a unit test *and* re-validated against the **real** collaborator in
> an **integration/parity** test. Where a `Current binding` runs against a mock of an
> H5P-internal collaborator (`H5PEditor.Presave`, `H5P.EventDispatcher`), the durable truth
> is only *fully* honored once an integration binding exercises the real implementation
> (see `prompts/shared_test_harness.md` / `prompts/h5p-core-npm-package.md`). Mark such rows
> so the missing integration binding is visible.

---

## Canonical fixtures (durable data)

Durable expectations (Invariant/Contract/Property) must be pinned to **stable data**, not
just to a test. These fixtures are the fixed input half of each expectation and are shared
across every test tier; a rewrite may delete the *bindings* below but must keep proving the
same expectation against the **same fixture**.

| Fixture | Purpose | Bound expectations |
|---|---|---|
| `tests/fixtures/content/with-retry-show.json` | Real, complete params (retry + solution enabled), extracted from `tf_w_retry_show.h5p`. | TF-DATA-01, TF-E2E-01 |
| `tests/fixtures/content/no-retry-show.json` | Real params with retry/solution disabled, from `tf_no_retry_show.h5p`. | TF-E2E (disabled retry/show) |
| `tests/fixtures/versions/1_5.json` | Frozen pre-1.5 content (no metadata title). Input to the `[1][5]` upgrade. | TF-UPG-01 |
| `tests/fixtures/versions/1_6.json` | Frozen pre-1.6 content (bare `media` + `behaviour.disableImageZooming`). Input to `[1][6]`. | TF-UPG-02 |
| `params.canonical.correctTrue()` / `correctFalse()` (`tests/fixtures/params.js`) | Minimal `{question, correct, l10n}` selection oracles used by invariant/contract logic. | TF-CON-02, TF-INV-01, TF-INV-02, TF-XAPI-02 |

New library versions add a new `versions/1_<minor>.json` snapshot; never edit older ones
(see `tests/fixtures/versions/README.md`).

---

## Contracts — H5P content-type contract
See h5p.org/documentation/developers/contracts. These survive any UI rewrite.

| ID | Statement | Tier | Current binding | Notes |
|---|---|---|---|---|
| TF-CON-01 | `getMaxScore()` returns 1. | Contract | `tests/unit/scoring.spec.js` (`MAX_SCORE`) | TrueFalse max is always 1; durable value now lives in the scoring leaf module. |
| TF-CON-02 | `getScore()` returns 1 when the selected answer matches `correct`, else 0. | Contract | `tests/unit/answer-group.spec.js` (`isCorrect`) | `getScore` is `isCorrect() ? 1 : 0`; the AnswerGroup binding proves the durable half. Full contract via e2e. |
| TF-CON-03 | `getAnswerGiven()` is false before any selection, true after. | Contract | `tests/unit/answer-group.spec.js` (`hasAnswered`) | `getAnswerGiven` delegates to `AnswerGroup.hasAnswered`. |
| TF-CON-04 | `getCurrentState()` returns `{answer}` reflecting the current selection; restoring it reproduces that selection. | Contract | none | Round-trip with previousState; needs main class → e2e. |
| TF-CON-05 | `resetTask()` returns the instance to the initial no-answer state (answer given = false, no feedback). | Contract | `tests/unit/answer-group.spec.js` (`reset`) | Unit covers the answer-state reset; feedback removal is e2e. |
| TF-CON-06 | `showSolutions()` marks the correct option regardless of the user's selection. | Contract | `tests/e2e/tests/trueFalse.spec.ts` | Observable via DOM/e2e. |

## Contracts — xAPI
| ID | Statement | Tier | Current binding | Notes |
|---|---|---|---|---|
| TF-XAPI-01 | An `answered` statement is produced with `interactionType: 'true-false'`. | Contract | none | Needs main class → e2e. |
| TF-XAPI-02 | `correctResponsesPattern` equals `['true']` or `['false']` matching `correct`. | Contract | `tests/unit/scoring.spec.js` (`getCorrectAnswer`) | Durable mapping now unit-tested via the extracted scoring helper. |
| TF-XAPI-03 | `result.response` is the user's chosen value; `result.score.scaled` is 1 for correct, 0 for wrong. | Contract | none | Needs main class → e2e. |

## Contracts — data (semantics / upgrades / presave)
| ID | Statement | Tier | Current binding | Notes |
|---|---|---|---|---|
| TF-DATA-01 | Presave yields `{maxScore: 1}` for valid content. | Contract | `tests/unit/presave.spec.js` (vs. **mock**) | Fixture: `content/with-retry-show.json`. Unit binding runs against the `H5PEditor.Presave` **stub**; needs an **integration** binding vs. the real Presave (parity). |
| TF-DATA-02 | Presave throws `InvalidContentSemanticsException` when `question` is missing or blank. | Contract | `tests/unit/presave.spec.js` (vs. **mock**) | On-the-fly minimal params. Same mock caveat as TF-DATA-01 → add integration binding vs. real Presave. |
| TF-UPG-01 | Upgrade 1.5 sets `metadata.title` from `question` with HTML tags stripped; falls back to existing title or `'True-False'`. | Contract | `tests/unit/upgrades.spec.js` | Fixture: `versions/1_5.json`. |
| TF-UPG-02 | Upgrade 1.6 moves `disableImageZooming` from `behaviour` into `media` and deletes the old key; lossless for unrelated params. | Contract | `tests/unit/upgrades.spec.js` | Fixture: `versions/1_6.json`. |

## Invariants
| ID | Statement | Tier | Current binding | Notes |
|---|---|---|---|---|
| TF-INV-01 | Score is always within `[0, getMaxScore()]`. | Invariant | `tests/unit/scoring.spec.js` | Templating echoes score, never fabricates out-of-range. Full invariant is a property over the main class. |
| TF-INV-02 | Exactly one of {true, false} can be selected at a time (selecting one clears the other). | Invariant | `tests/unit/answer-group.spec.js` | AnswerGroup mutual exclusion; oracle `params.canonical.correctTrue()`. |
| TF-INV-03 | `showSolutions()` never mutates the recorded user answer / `getScore()`. | Invariant | none | Revealing solution ≠ answering; needs main class → e2e. |

## Properties
| ID | Statement | Tier | Current binding | Notes |
|---|---|---|---|---|
| TF-PROP-01 | State round-trip is lossless: `restore(getCurrentState())` reproduces the same `getScore()` and `getAnswerGiven()`. | Property | none | Generate over {unanswered, true, false}; needs main class → e2e/property. |
| TF-PROP-02 | `resetTask()` is idempotent: applying it twice equals applying it once. | Property | none | AnswerGroup `reset` is idempotent today; promote to a generated property later. |

## E2E / observable behavior
| ID | Statement | Tier | Current binding | Notes |
|---|---|---|---|---|
| TF-E2E-01 | With retry+solution enabled, a wrong answer then Retry restores an answerable task. | E2E-behavioral | `tests/e2e/tests/trueFalse.spec.ts` | Existing playwright fixture `withRetryShow`. |
| TF-E2E-02 | Auto-check config checks the answer immediately on selection (no Check button). | E2E-behavioral | `tests/e2e` (`automaticallyCheckAnswer`) | |
| TF-E2E-03 | Accessibility expectations (roles, labels, keyboard) hold. | E2E-behavioral | `tests/e2e/tests/trueFalseA11y.spec.ts` | |

## Implementation details (disposable — expected to die on rewrite)
Kept only so the current coupled unit tests trace to *something*; do not promote these.

| ID | Statement | Tier | Current binding | Notes |
|---|---|---|---|---|
| TF-IMPL-01 | Private `getCorrectAnswer()` maps `params.correct` `'true'→'true'`, else `'false'`. | Impl-detail | `tests/unit/scoring.spec.js` | Promoted out of the `h5p-true-false.js` closure into the additive `H5P.TrueFalse.scoring` leaf module; still verify durably via TF-XAPI-02. |
| TF-IMPL-02 | Global-IIFE loads against `H5P.jQuery`/`H5P.Question`/`H5P.EventDispatcher`. | Impl-detail | harness `tests/setup/h5p-globals.js` | Dies when moving off globals/jQuery. |

---

## Maintenance rule
When you add or change a test, add/append the matching expectation here and set its
`Current binding`. When promoting logic to a more durable boundary (e.g. extracting
scoring, or moving to web components), re-tier the affected entries and drop the
`Impl-detail` rows that no longer apply.

When a `Contract` is proven only against a **mock** of an H5P collaborator, note the mock
in its binding and treat an **integration/parity** binding against the real
implementation as outstanding — a mock-only contract is not fully verified.

