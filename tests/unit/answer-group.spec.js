'use strict';

const { expect } = require('chai');
const { resetGlobals, installAnswerStub, loadScript } = require('../setup/h5p-globals');
const fixtures = require('../fixtures/params');

/**
 * answer-group.js — real jQuery + stubbed EventDispatcher + stubbed Answer.
 * Binds to: TF-INV-02 (mutual exclusion), and the selection/correctness logic that
 * durably underpins TF-CON-02/03/05.
 */
describe('AnswerGroup', function () {
  const DOM_ID = 'h5p-tfq-test';
  let AnswerGroup;

  function newGroup(correct) {
    return new AnswerGroup(DOM_ID, correct, fixtures.defaultL10n());
  }

  beforeEach(function () {
    resetGlobals();
    installAnswerStub();
    loadScript('scripts/h5p-true-false-answer-group.js');
    AnswerGroup = global.H5P.TrueFalse.AnswerGroup;
  });

  it('has not been answered before any selection (TF-CON-03)', function () {
    const group = newGroup('true');
    expect(group.hasAnswered()).to.equal(false);
    expect(group.getAnswer()).to.equal(undefined);
  });

  it('check(true) selects true → isCorrect() true when correct is "true"', function () {
    const group = newGroup('true');
    group.check(true);

    expect(group.getAnswer()).to.equal(true);
    expect(group.hasAnswered()).to.equal(true);
    expect(group.isCorrect()).to.equal(true);
  });

  it('check(false) → isCorrect() false when correct is "true"', function () {
    const group = newGroup('true');
    group.check(false);

    expect(group.getAnswer()).to.equal(false);
    expect(group.isCorrect()).to.equal(false);
  });

  it('check(false) → isCorrect() true when correct is "false"', function () {
    const group = newGroup('false');
    group.check(false);

    expect(group.isCorrect()).to.equal(true);
  });

  it('selecting one option clears the other (TF-INV-02)', function () {
    const group = newGroup('true');
    group.check(true);
    expect(group.getAnswer()).to.equal(true);

    group.check(false);
    expect(group.getAnswer()).to.equal(false);
    expect(group.isCorrect()).to.equal(false);
  });

  it('reset() clears the answer back to the unanswered state (TF-CON-05)', function () {
    const group = newGroup('true');
    group.check(true);
    expect(group.hasAnswered()).to.equal(true);

    group.reset();
    expect(group.hasAnswered()).to.equal(false);
    expect(group.getAnswer()).to.equal(undefined);
  });

  it('emits "selected" when an answer is chosen', function () {
    const group = newGroup('true');
    let fired = 0;
    group.on('selected', function () { fired++; });

    group.check(true);
    expect(fired).to.equal(1);
  });
});

