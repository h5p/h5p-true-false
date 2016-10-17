H5P.TrueFalse.AnswerGroup = (function ($, EventDispatcher) {
  'use strict';

  /**
   * Initialize module.
   *
   * @class H5P.TrueFalse.AnswerGroup
   * @extends H5P.EventDispatcher
   * @param {String} domId Id for label
   * @param {String} trueLabel text on "True" alternative
   * @param {String} falseLabel text on "False" alternative
   * @param {String} correctOption solution
   * @param {String} correctMessage Message read by readspeaker when correct alternative is chosen
   * @param {String} wrongMessage Message read by readspeaker when wrong alternative is chosen
   */
  function AnswerGroup(domId, trueLabel, falseLabel, correctOption, correctMessage, wrongMessage) {
    var self = this;

    EventDispatcher.call(self);

    var $answers = $('<div>', {
      'class': 'h5p-true-false-answers',
      role: 'radiogroup',
      'aria-labelledby': domId
    });

    var answer;
    var trueAnswer = new H5P.TrueFalse.Answer(trueLabel, correctMessage, wrongMessage);
    var falseAnswer = new H5P.TrueFalse.Answer(falseLabel, correctMessage, wrongMessage);
    var correctAnswer = (correctOption === 'true' ? trueAnswer : falseAnswer);
    var wrongAnswer = (correctOption === 'false' ? trueAnswer : falseAnswer);

    // Handle checked
    var handleChecked = function (newAnswer, other) {
      return function () {
        answer = newAnswer;
        other.uncheck();
        self.trigger('selected');
      };
    };
    trueAnswer.on('checked', handleChecked(true, falseAnswer));
    falseAnswer.on('checked', handleChecked(false, trueAnswer));

    // Handle switches (using arrow keys)
    var handleInvert = function (newAnswer, other) {
      return function () {
        answer = newAnswer;
        other.check();
        self.trigger('selected');
      };
    };
    trueAnswer.on('invert', handleInvert(false, falseAnswer));
    falseAnswer.on('invert', handleInvert(true, trueAnswer));

    // Handle tabbing
    var handleTabable = function(other, tabable) {
      return function () {
        other.tabable(tabable);
      };
    };
    // Need to remove tabIndex on the other alternative on focus
    trueAnswer.on('focus', handleTabable(falseAnswer, false));
    falseAnswer.on('focus', handleTabable(trueAnswer, false));
    // Need to make both alternatives tabable on blur:
    trueAnswer.on('blur', handleTabable(falseAnswer, true));
    falseAnswer.on('blur', handleTabable(trueAnswer, true));

    $answers.append(trueAnswer.getDomElement());
    $answers.append(falseAnswer.getDomElement());

    /**
     * Get hold of the DOM element representing this thingy
     * @method getDomElement
     * @return {jQuery}
     */
    self.getDomElement = function () {
      return $answers;
    };

    /**
     * Programatic check
     * @method check
     * @param  {[type]} answer [description]
     */
    self.check = function (answer) {
      if (answer) {
        trueAnswer.check();
      }
      else {
        falseAnswer.check();
      }
    };

    /**
     * Return current answer
     * @method getAnswer
     * @return {Boolean} undefined if no answer if given
     */
    self.getAnswer = function () {
      return answer;
    };

    /**
     * Check if user has answered question yet
     * @method hasAnswered
     * @return {Boolean}
     */
    self.hasAnswered = function () {
      return answer !== undefined;
    };

    /**
     * Is answer correct?
     * @method isCorrect
     * @return {Boolean}
     */
    self.isCorrect = function () {
      return correctAnswer.isChecked();
    };

    /**
     * Enable user input
     *
     * @method enable
     */
    self.enable = function () {
      trueAnswer.enable().tabable(true);
      falseAnswer.enable();
    };

    /**
     * Disable user input
     *
     * @method disable
     */
    self.disable = function () {
      trueAnswer.disable();
      falseAnswer.disable();
    };

    /**
     * Reveal correct/wrong answer
     *
     * @method reveal
     * @param  {Boolean} markWrong When true, the wrong alternative is also visualized
     */
    self.reveal = function (markBoth) {
      if (markBoth || self.isCorrect()) {
        correctAnswer.markCorrect();
      }
      if (markBoth || !self.isCorrect()){
        wrongAnswer.markWrong();
      }

      self.disable();
    };

    /**
     * Reset task
     * @method reset
     */
    self.reset = function () {
      trueAnswer.reset();
      falseAnswer.reset();
      self.enable();
      answer = undefined;
    };
  }

  // Inheritance
  AnswerGroup.prototype = Object.create(EventDispatcher.prototype);
  AnswerGroup.prototype.constructor = AnswerGroup;

  return AnswerGroup;
})(H5P.jQuery, H5P.EventDispatcher);
