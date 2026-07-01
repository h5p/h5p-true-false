'use strict';

/**
 * Fixture accessors for TrueFalse unit specs.
 *
 * Naming note: on disk these live under `tests/fixtures/content/` and
 * `tests/fixtures/versions/` because a shipped H5P package stores params as
 * `content/content.json` — the vocabulary developers author in. In code we call the
 * same objects "params" (the `options` argument a content-type constructor receives).
 *
 * Two kinds of inputs:
 *   - Extracted content fixtures (real, complete param shapes) — reused from the
 *     unpacked .h5p packages; the durable bridge to the e2e fixtures.
 *   - On-the-fly factories — minimal, intention-revealing inputs and edge cases the
 *     shipped fixtures don't contain (blank question, correct:'false', etc.).
 */

const withRetryShow = require('./content/with-retry-show.json');
const noRetryShow = require('./content/no-retry-show.json');
const version1_5 = require('./versions/1_5.json');
const version1_6 = require('./versions/1_6.json');

/** Deep clone so specs can mutate a fixture without leaking into other tests. */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function defaultL10n() {
  return {
    trueText: 'True',
    falseText: 'False',
    correctAnswerMessage: 'Correct answer',
    wrongAnswerMessage: 'Wrong answer',
    score: 'You got @score of @total points',
    scoreBarLabel: 'You got :num out of :total points'
  };
}

/**
 * Minimal, declarative params for a single behaviour under test.
 * @param {object} [overrides]
 */
function makeParams(overrides) {
  return Object.assign({
    question: '<p>Is this a unit test?</p>',
    correct: 'true',
    l10n: defaultL10n()
  }, overrides || {});
}

module.exports = {
  clone,
  defaultL10n,
  makeParams,

  // Real, complete content fixtures (extracted from the .h5p packages).
  content: {
    withRetryShow: function () { return clone(withRetryShow); },
    noRetryShow: function () { return clone(noRetryShow); }
  },

  // Canonical, frozen per-version inputs for the upgrade scripts.
  versions: {
    v1_5: function () { return clone(version1_5); },
    v1_6: function () { return clone(version1_6); }
  },

  /**
   * Canonical fixtures referenced by durable invariant/contract expectations in
   * behavior_spec.md. Named so every test tier can bind to identical data.
   */
  canonical: {
    correctTrue: function () { return makeParams({ correct: 'true' }); },
    correctFalse: function () { return makeParams({ correct: 'false' }); }
  }
};

