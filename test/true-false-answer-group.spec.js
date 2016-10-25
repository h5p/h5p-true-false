describe('TrueFalseAnswerGroup', function () {
  var domId = 'unique-id';
  var l10n = {
    trueText: 'True',
    falseText: 'False',
    correctAnswerMessage: 'Correct answer',
    wrongAnswerMessage: 'Wrong answer'
  };

  it('shall be possible to check and uncheck answers when True is correct', function () {
    var answerGroup = new H5P.TrueFalse.AnswerGroup(domId, 'true', l10n);
    expect(answerGroup.hasAnswered()).toBe(false);

    answerGroup.check(true);
    expect(answerGroup.isCorrect()).toBe(true);

    answerGroup.check(false);
    expect(answerGroup.isCorrect()).toBe(false);
  });

  it('shall be possible to check and uncheck answers when False is correct', function () {
    var answerGroup = new H5P.TrueFalse.AnswerGroup(domId, 'false', l10n);
    expect(answerGroup.hasAnswered()).toBe(false);

    answerGroup.check(true);
    expect(answerGroup.isCorrect()).toBe(false);

    answerGroup.check(false);
    expect(answerGroup.isCorrect()).toBe(true);
  });

  it('shall not be possible to check when disabled', function () {
    var answerGroup = new H5P.TrueFalse.AnswerGroup(domId, 'true', l10n);

    answerGroup.check(true);
    answerGroup.disable();
    expect(answerGroup.isCorrect()).toBe(true);

    answerGroup.check(false);
    expect(answerGroup.isCorrect()).toBe(true);

    answerGroup.enable();
    answerGroup.check(false);
    expect(answerGroup.isCorrect()).toBe(false);
  });

  it('shall be sent a trigger when answer is checked', function () {
    var answerGroup = new H5P.TrueFalse.AnswerGroup(domId, 'true', l10n);

    var event;
    answerGroup.on('selected', function (e) {
      event = e;
    });

    answerGroup.check(true);

    expect(event).not.toBe(undefined);
    expect(event.type).toBe('selected');
  });
});
