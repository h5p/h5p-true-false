import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createSubject = (options = {}, contentData = {}) => new H5P.TrueFalse(options, 42, contentData);

const selectAnswer = (subject, index) => {
  subject.$content
    .find('.h5p-true-false-answer')
    .eq(index)
    .trigger(H5P.jQuery.Event('click', { which: 1 }));
};

describe('H5P.TrueFalse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div class="h5p-container"><div class="h5p-content" data-content-id="42"></div></div>';
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('registers its content and default buttons', () => {
    const subject = createSubject({ question: 'The sky is blue.' });

    subject.registerDomElements();

    expect(subject.setIntroduction).toHaveBeenCalledWith(expect.stringContaining('The sky is blue.'));
    expect(subject.setContent).toHaveBeenCalledWith(subject.$content);
    expect([...subject.buttons.keys()]).toEqual(['show-solution', 'check-answer', 'try-again']);
    expect(subject.showButton).toHaveBeenCalledWith('check-answer');
  });

  it('tracks a selected correct answer and score', () => {
    const subject = createSubject({ correct: 'true' });
    subject.registerDomElements();

    selectAnswer(subject, 0);

    expect(subject.getCurrentState()).toEqual({ answer: true });
    expect(subject.getAnswerGiven()).toBe(true);
    expect(subject.getScore()).toBe(1);
    expect(subject.getMaxScore()).toBe(1);
    expect(subject.triggerXAPI).toHaveBeenCalledWith('interacted');
  });

  it('restores a false answer from previous state', () => {
    const subject = createSubject(
      { correct: 'false' },
      { previousState: { answer: false } }
    );

    expect(subject.getCurrentState()).toEqual({ answer: false });
    expect(subject.getScore()).toBe(1);
  });

  it('checks a wrong answer through the check button', () => {
    const subject = createSubject({ correct: 'true' });
    subject.registerDomElements();
    selectAnswer(subject, 1);

    subject.buttons.get('check-answer').callback();
    vi.runAllTimers();

    expect(subject.setFeedback).toHaveBeenCalledWith(
      'You got 0 of 1 points',
      0,
      1,
      'You got :num out of :total points'
    );
    expect(subject.$content.find('.h5p-true-false-answer').eq(1).hasClass('wrong')).toBe(true);
    expect(subject.showButton).toHaveBeenCalledWith('show-solution');
    expect(subject.trigger).toHaveBeenCalledWith(expect.objectContaining({ verb: 'answered' }));
  });

  it.each([
    ['correct', 0, 'Nice work', 'feedbackOnCorrect'],
    ['wrong', 1, 'Try once more', 'feedbackOnWrong']
  ])('uses custom %s feedback', (name, answerIndex, feedback, feedbackProperty) => {
    const subject = createSubject({
      correct: 'true',
      behaviour: { [feedbackProperty]: feedback }
    });
    subject.registerDomElements();
    selectAnswer(subject, answerIndex);

    subject.buttons.get('check-answer').callback();

    expect(subject.setFeedback).toHaveBeenCalledWith(feedback, expect.any(Number), 1, expect.any(String));
  });

  it('checks and emits an answered event automatically', () => {
    const subject = createSubject({ behaviour: { autoCheck: true } });
    subject.registerDomElements();

    selectAnswer(subject, 0);

    expect(subject.buttons.has('check-answer')).toBe(false);
    expect(subject.setFeedback).toHaveBeenCalled();
    expect(subject.trigger).toHaveBeenCalledWith(expect.objectContaining({ verb: 'answered' }));
  });

  it('shows the solution and resets the task', () => {
    const subject = createSubject();
    subject.registerDomElements();
    selectAnswer(subject, 1);

    subject.showSolutions(true);
    vi.runAllTimers();
    expect(subject.$content.find('.correct')).toHaveLength(1);
    expect(subject.showButton).toHaveBeenCalledWith('try-again');

    subject.resetTask();
    vi.runAllTimers();
    expect(subject.getAnswerGiven()).toBe(false);
    expect(subject.removeFeedback).toHaveBeenCalled();
    expect(subject.$content.find('.correct, .wrong')).toHaveLength(0);
    expect(subject.showButton).toHaveBeenCalledWith('check-answer');
  });

  it.each([
    [
      'image',
      { disableImageZooming: true, type: { library: 'H5P.Image 1.1', params: { alt: 'Alt', file: { path: 'image.png' } } } },
      'setImage'
    ],
    [
      'video',
      { type: { library: 'H5P.Video 1.6', params: { sources: [{ path: 'video.mp4' }] } } },
      'setVideo'
    ],
    [
      'audio',
      { type: { library: 'H5P.Audio 1.5', params: { files: [{ path: 'audio.mp3' }] } } },
      'setAudio'
    ]
  ])('registers %s task media', (name, media, method) => {
    const subject = createSubject({ media });

    subject.registerDomElements();

    expect(subject[method]).toHaveBeenCalled();
  });

  it('returns metadata and fallback titles', () => {
    expect(createSubject({}, { metadata: { title: 'Custom title' } }).getTitle()).toBe('Custom title');
    expect(createSubject().getTitle()).toBe('True-False');
  });

  it('builds xAPI data for an answered question', () => {
    const subject = createSubject({ question: '<strong>Correct?</strong>', correct: 'false' });
    subject.registerDomElements();
    selectAnswer(subject, 1);

    const { statement } = subject.getXAPIData();

    expect(statement.object.definition).toMatchObject({
      correctResponsesPattern: ['false'],
      description: { 'en-US': 'Correct?' },
      interactionType: 'true-false'
    });
    expect(statement.result).toMatchObject({
      completion: true,
      response: 'false',
      score: { max: 1, raw: 1 },
      success: true
    });
  });

  it('uses the H5P container for confirmation dialogs', () => {
    const subject = createSubject({
      behaviour: { confirmCheckDialog: true, confirmRetryDialog: true }
    });

    subject.registerDomElements();

    expect(subject.buttons.get('check-answer').options.confirmationDialog.$parentElement.is('.h5p-container')).toBe(true);
    expect(subject.buttons.get('try-again').options.confirmationDialog.$parentElement.is('.h5p-container')).toBe(true);
  });
});