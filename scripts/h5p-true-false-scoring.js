/**
 * Pure scoring / feedback helpers for H5P.TrueFalse.
 *
 * Extracted so this logic is unit-testable without the H5P runtime.
 * The main content type consumes it via `H5P.TrueFalse.scoring` — this is
 * purely additive (assigns onto the existing namespace) and introduces no new required
 * load order, so H5P's concat/dependency model is unaffected.
 */
var H5P = H5P || {};
H5P.TrueFalse = H5P.TrueFalse || {};

H5P.TrueFalse.scoring = (function () {
  'use strict';

  // Maximum score for True/False is always 1.
  var MAX_SCORE = 1;

  /**
   * Map the configured correct option to its canonical response string.
   * @param {string} correct params.correct ('true' | 'false')
   * @return {string} 'true' or 'false'
   */
  function getCorrectAnswer(correct) {
    return (correct === 'true' ? 'true' : 'false');
  }

  /**
   * The response string for the wrong option (inverse of the correct one).
   * @param {string} correct params.correct ('true' | 'false')
   * @return {string} 'true' or 'false'
   */
  function getWrongAnswer(correct) {
    return (correct === 'false' ? 'true' : 'false');
  }

  /**
   * Build the feedback text for a given score, honouring per-content overrides.
   * @param {number} score current score
   * @param {number} maxScore maximum score
   * @param {object} l10n interface translations (uses `score` template)
   * @param {object} behaviour behavioural settings (feedbackOnCorrect/feedbackOnWrong)
   * @return {string} feedback string with @score/@total substituted
   */
  function scoreText(score, maxScore, l10n, behaviour) {
    l10n = l10n || {};
    behaviour = behaviour || {};

    var text;
    if (score === maxScore && behaviour.feedbackOnCorrect) {
      text = behaviour.feedbackOnCorrect;
    }
    else if (score === 0 && behaviour.feedbackOnWrong) {
      text = behaviour.feedbackOnWrong;
    }
    else {
      text = l10n.score || '';
    }

    return String(text).replace('@score', score).replace('@total', maxScore);
  }

  return {
    MAX_SCORE: MAX_SCORE,
    getCorrectAnswer: getCorrectAnswer,
    getWrongAnswer: getWrongAnswer,
    scoreText: scoreText
  };
})();

