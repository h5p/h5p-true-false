import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('H5P.TrueFalse.Answer', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('supports mouse and keyboard selection', () => {
    const answer = new H5P.TrueFalse.Answer('True', 'Correct', 'Wrong');
    const checked = vi.fn();
    const inverted = vi.fn();
    answer.on('checked', checked);
    answer.on('invert', inverted);

    answer.getDomElement().trigger(H5P.jQuery.Event('click', { which: 1 }));
    answer.getDomElement().trigger(H5P.jQuery.Event('keydown', { keyCode: 39 }));

    expect(checked).toHaveBeenCalledOnce();
    expect(inverted).toHaveBeenCalledOnce();
    expect(answer.isChecked()).toBe(false);
  });

  it('marks, disables, and resets an answer', () => {
    const answer = new H5P.TrueFalse.Answer('True', 'Correct', 'Wrong');

    answer.markWrong().disable();
    vi.runAllTimers();
    expect(answer.getDomElement().hasClass('wrong')).toBe(true);
    expect(answer.getDomElement().attr('aria-disabled')).toBe('true');

    answer.reset();
    vi.runAllTimers();
    expect(answer.getDomElement().hasClass('wrong')).toBe(false);
    expect(answer.getDomElement().attr('tabindex')).toBe('0');
  });
});

describe('H5P.TrueFalse.AnswerGroup', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const createGroup = () => new H5P.TrueFalse.AnswerGroup('question', 'true', {
    correctAnswerMessage: 'Correct',
    falseText: 'False',
    trueText: 'True',
    wrongAnswerMessage: 'Wrong'
  });

  it('tracks correctness and reveals feedback', () => {
    const group = createGroup();
    group.check(true);

    expect(group.hasAnswered()).toBe(true);
    expect(group.getAnswer()).toBe(true);
    expect(group.isCorrect()).toBe(true);

    group.reveal();
    vi.runAllTimers();
    expect(group.getDomElement().find('.correct')).toHaveLength(1);
    expect(group.getDomElement().find('[aria-disabled="true"]')).toHaveLength(2);
  });

  it('shows the solution and can reset', () => {
    const group = createGroup();
    group.check(false);
    group.showSolution();
    vi.runAllTimers();
    expect(group.getDomElement().find('.correct')).toHaveLength(1);

    group.reset();
    vi.runAllTimers();
    expect(group.hasAnswered()).toBe(false);
    expect(group.getDomElement().find('.correct, .wrong')).toHaveLength(0);
  });
});