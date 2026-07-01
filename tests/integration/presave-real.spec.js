'use strict';

/**
 * TrueFalse integration tier — exercise the SHIPPED `presave.js` against the REAL
 * `H5PEditor.Presave` (not the harness mock).
 *
 * Category: **content-type-specific integration** — it validates TrueFalse's OWN module
 * against a real dependency. This is NOT a generic mock↔real parity check: whether the
 * `EventDispatcher`/`Presave` MOCKS faithfully mirror the real core is verified once, in the
 * shared `h5p-js-testing-shared` package's parity job, and every content type inherits that
 * guarantee by consuming the mocks via semver. Content types do not re-run the generic parity
 * suite (see `prompts/shared_test_harness.md` §D, "Where parity lives").
 *
 * Value beyond the transitive guarantee: the unit twin (`tests/unit/presave.spec.js`)
 * runs this same logic against the mock Presave, which hardcodes the exception `.name`;
 * the real `InvalidContentSemanticsException` instead derives `.name` from its first
 * argument and carries `.code === 'H5P-P500'`. That real-world shape is outside the
 * shared contract, so we pin it here by asserting `.code`.
 *
 * Binds to: TF-DATA-01 (maxScore:1), TF-DATA-02 (throws on missing/blank question).
 * Presence-gated: soft-skip locally, hard-fail in CI.
 */

const { expect } = require('chai');
const { resetGlobals, loadScript } = require('../setup/h5p-globals');
const { loadRealCore } = require('h5p-js-testing-shared');
const fixtures = require('../fixtures/params');

const real = loadRealCore({ eventDispatcher: false, presave: true });
const mustHaveReal = !!process.env.CI;

describe('presave.js against REAL H5PEditor.Presave (integration)', function () {
  let presave;

  before(function () {
    if (!real.found.presave) {
      if (mustHaveReal) {
        throw new Error(
          'Real Presave did not resolve but CI requires it. ' +
          'Install the pinned h5p-editor-php-library package. ' +
          'found=' + JSON.stringify(real.found)
        );
      }
      this.skip();
    }
  });

  beforeEach(function () {
    resetGlobals();
    // Swap the harness mock for the REAL Presave, then load the shipped script.
    global.H5PEditor.Presave = real.Presave;
    loadScript('presave.js');
    presave = global.H5PPresave['H5P.TrueFalse'];
  });

  it('yields {maxScore: 1} for valid content (TF-DATA-01, real core)', function () {
    const content = fixtures.content.withRetryShow();
    let result;

    presave(content, function (data) {
      result = data;
    });

    expect(result).to.deep.equal({ maxScore: 1 });
  });

  it('throws the real InvalidContentSemanticsException (code H5P-P500) when question is missing (TF-DATA-02)', function () {
    expect(function () {
      presave({ correct: 'true' }, function () {});
    }).to.throw().with.property('code', 'H5P-P500');
  });

  it('throws the real InvalidContentSemanticsException (code H5P-P500) when question is blank (TF-DATA-02)', function () {
    expect(function () {
      presave({ question: '   ' }, function () {});
    }).to.throw().with.property('code', 'H5P-P500');
  });
});

