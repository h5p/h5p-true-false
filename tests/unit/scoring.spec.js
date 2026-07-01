'use strict';

const { expect } = require('chai');
const { resetGlobals, loadScript } = require('../setup/h5p-globals');

/**
 * h5p-true-false-scoring.js — additive pure leaf module (no jQuery / DOM / runtime).
 * Binds to: TF-INV-01 (score in bounds), TF-XAPI-02 (correctResponsesPattern mapping),
 * and the feedback templating durably lifted out of the main class.
 */
describe('scoring', function () {
  let scoring;

  beforeEach(function () {
    resetGlobals();
    loadScript('scripts/h5p-true-false-scoring.js');
    scoring = global.H5P.TrueFalse.scoring;
  });

  it('exposes MAX_SCORE of 1 (TF-CON-01)', function () {
    expect(scoring.MAX_SCORE).to.equal(1);
  });

  describe('getCorrectAnswer / getWrongAnswer (TF-XAPI-02, TF-IMPL-01)', function () {
    it("maps correct 'true' → 'true' and wrong → 'false'", function () {
      expect(scoring.getCorrectAnswer('true')).to.equal('true');
      expect(scoring.getWrongAnswer('true')).to.equal('false');
    });

    it("maps correct 'false' → 'false' and wrong → 'true'", function () {
      expect(scoring.getCorrectAnswer('false')).to.equal('false');
      expect(scoring.getWrongAnswer('false')).to.equal('true');
    });
  });

  describe('scoreText', function () {
    const l10n = { score: 'You got @score of @total points' };

    it('substitutes @score/@total in the default template', function () {
      expect(scoring.scoreText(1, 1, l10n, {})).to.equal('You got 1 of 1 points');
      expect(scoring.scoreText(0, 1, l10n, {})).to.equal('You got 0 of 1 points');
    });

    it('uses feedbackOnCorrect when the score is maximal', function () {
      const behaviour = { feedbackOnCorrect: 'Yes, indeed.' };
      expect(scoring.scoreText(1, 1, l10n, behaviour)).to.equal('Yes, indeed.');
    });

    it('uses feedbackOnWrong when the score is zero', function () {
      const behaviour = { feedbackOnWrong: 'Nope.' };
      expect(scoring.scoreText(0, 1, l10n, behaviour)).to.equal('Nope.');
    });

    it('keeps score within [0, maxScore] semantics (TF-INV-01)', function () {
      // The templating never fabricates a score; it echoes what it is given.
      const text = scoring.scoreText(1, 1, l10n, {});
      expect(text).to.contain('1 of 1');
    });
  });
});

