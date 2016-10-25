describe('TrueFalse', function () {
  var contentId = 1;
  var contentData = {
    previousState: {
      answer: true
    }
  };
  var optionsCorrect = {
    question: 'Is this true?',
    correct: 'true'
  };
  var optionsWrong = {
    question: 'Is this true?',
    correct: 'false'
  };

  it('shall handle resume consistently on correct', function () {
    var question = new H5P.TrueFalse(optionsCorrect, contentId, contentData);
    expect(question.getCurrentState()).toEqual(contentData.previousState);
    expect(question.getAnswerGiven()).toBe(true);
    expect(question.getScore()).toBe(1);
    expect(question.getMaxScore()).toBe(1);
  });

  it('shall handle resume consistently on wrong', function () {
    var question = new H5P.TrueFalse(optionsWrong, contentId, contentData);
    expect(question.getCurrentState()).toEqual(contentData.previousState);
    expect(question.getAnswerGiven()).toBe(true);
    expect(question.getScore()).toBe(0);
    expect(question.getMaxScore()).toBe(1);
  });
});
