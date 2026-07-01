'use strict';

/**
 * TrueFalse Tier-2 test setup.
 *
 * The generic ~80% of this harness now lives in the shared `h5p-js-testing-shared`
 * package and is consumed from its root export (jsdom registration, real-jQuery wiring,
 * `resetGlobals()` namespace scaffold, `loadScript()`, and the generic
 * `EventDispatcher`/`Presave` mocks). See `prompts/shared_test_harness.md`.
 *
 * What stays here is ONLY the type-specific collaborator stub — `H5P.TrueFalse.Answer`
 * — layered on top of the shared core. This file is required once by .mocharc.json
 * (side effect: jsdom + base globals) and also `require`d by specs to reach the helpers.
 */

const path = require('path');
const { createHarness } = require('h5p-js-testing-shared');

// libraries/H5P.TrueFalse-1.8 — the root `loadScript` resolves relative paths against.
const LIB_ROOT = path.resolve(__dirname, '..', '..');

// Bind the shared harness to this library. This registers jsdom, wires real jQuery, and
// provides `resetGlobals` (mock EventDispatcher/Presave) + `loadScript`.
const harness = createHarness(LIB_ROOT);
const { jQuery, resetGlobals, loadScript } = harness;

/**
 * Stateful stub for H5P.TrueFalse.Answer.
 * Records checked state and re-emits the 'checked' event so AnswerGroup's
 * mutual-exclusion / correctness logic runs against a faithful collaborator,
 * without any real Answer DOM behaviour.
 */
function makeAnswerStub($) {
  return function Answer(text /*, correctMessage, wrongMessage */) {
    const self = this;
    const handlers = {};
    let checked = false;
    const $el = $('<div>', { 'class': 'h5p-true-false-answer', text: text || '' });

    self.on = function (event, cb) {
      (handlers[event] = handlers[event] || []).push(cb);
    };
    self.trigger = function (event) {
      (handlers[event] || []).slice().forEach(function (cb) { cb(); });
    };
    self.check = function () { checked = true; self.trigger('checked'); return self; };
    self.uncheck = function () { checked = false; return self; };
    self.isChecked = function () { return checked; };
    self.getDomElement = function () { return $el; };
    self.tabable = function () { return self; };
    self.enable = function () { return self; };
    self.disable = function () { return self; };
    self.reset = function () { checked = false; return self; };
    self.markCorrect = function () { return self; };
    self.markWrong = function () { return self; };
    self.unmark = function () { return self; };
  };
}

/**
 * Install a stateful H5P.TrueFalse.Answer stub (real jQuery for its element).
 * Must be called before loading answer-group.js.
 */
function installAnswerStub() {
  global.H5P.TrueFalse = global.H5P.TrueFalse || {};
  global.H5P.TrueFalse.Answer = makeAnswerStub(jQuery);
  return global.H5P.TrueFalse.Answer;
}


// Establish base globals immediately so simply requiring the setup is enough.
resetGlobals();

module.exports = {
  jQuery,
  LIB_ROOT,
  resetGlobals,
  installAnswerStub,
  loadScript
};

