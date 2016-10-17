var H5P = H5P || {};
H5P.TrueFalse = (function ($, Question) {
  'use strict';

  var MAX_SCORE = 1;

  var State = {
    ONGOING: 1,
    FINISHED_WRONG: 2,
    FINISHED_CORRECT: 3,
    SOLUTION: 4

  };

  var Button = {
    CHECK: 'check-answer',
    TRYAGAIN: 'try-again'
  };

  /**
   * Initialize module.
   *
   * @class H5P.TrueFalse
   * @extends H5P.Question
   * @param {Object} options
   * @param {number} id Content identification
   * @param {Object} contentData Task specific content data
   */
  function TrueFalse(options, id, contentData) {
    var self = this;

    // Inheritance
    Question.call(self, 'blanks');

    var params = $.extend(true, {}, {
      question: 'No question text provided',
      correct: 'true',
      trueText: 'True',
      falseText: 'False',
      score: 'You got @score of @total points',
      checkAnswer: 'Check',
      tryAgain: 'Retry',
      noAnswerMessage: 'Please choose an alternative',
      wrongAnswerMessage: 'Wrong answer',
      correctAnswerMessage: 'Correct answer',
      behaviour: {
        enableRetry: true,
        disableImageZooming: false,
        confirmCheckDialog: false,
        confirmRetryDialog: false,
        autoCheck: false
      },
      overrideSettings: {}
    }, options);

    // IDs
    self.contentId = id;

    // Counter used to create unique id for this question
    H5P.TrueFalse.counter = (H5P.TrueFalse.counter === undefined ? 0 : H5P.TrueFalse.counter + 1);

    // A unique ID is needed for aria label
    var domId = 'h5p-tfq' + H5P.TrueFalse.counter;

    // The radio group
    var answerGroup;

    /**
     * Registers this question type's DOM elements before they are attached.
     * Called from H5P.Question.
     */
    self.registerDomElements = function () {
      var self = this;

      // Check for task media
      var media = params.media;
      if (media && media.library) {
        var type = media.library.split(' ')[0];
        if (type === 'H5P.Image') {
          if (media.params.file) {
            // Register task image
            self.setImage(media.params.file.path, {
              disableImageZooming: params.behaviour.disableImageZooming,
              alt: media.params.alt
            });
          }
        }
        else if (type === 'H5P.Video') {
          if (media.params.sources) {
            // Register task video
            self.setVideo(media);
          }
        }
      }

      // Add task question text
      self.setIntroduction('<div id="' + domId + '">' + params.question + '</div>');

      // Register task content area
      self.setContent(createAnswers());

      // ... and buttons
      registerButtons();
    };

    /**
     * Create the answers
     *
     * @method createAnswers
     * @return {$jQuery}
     */
    var createAnswers = function () {
      answerGroup = new H5P.TrueFalse.AnswerGroup(domId, params.trueText, params.falseText, params.correct, params.correctAnswerMessage, params.wrongAnswerMessage);

      if (contentData.previousState !== undefined && contentData.previousState.answer !== undefined) {
        answerGroup.check(contentData.previousState.answer);
      }

      answerGroup.on('selected', function () {
        self.triggerXAPI('interacted');

        if (params.behaviour.autoCheck) {
          checkAnswer();
        }
      });

      return answerGroup.getDomElement();
    };

    /**
     * Register buttons
     *
     * @method registerButtons
     */
    var registerButtons = function () {
      // Check button
      if (!params.behaviour.autoCheck) {
        self.addButton(Button.CHECK, params.checkAnswer, function () {
          checkAnswer();
        }, true, {}, {
          confirmationDialog: {
            enable: params.behaviour.confirmCheckDialog,
            l10n: params.confirmCheck,
            instance: params.overrideSettings.instance,
            $parentElement: params.overrideSettings.$confirmationDialogParent
          }
        });
      }

      // Try again button
      if (params.behaviour.enableRetry === true) {
        self.addButton(Button.TRYAGAIN, params.tryAgain, function () {
          self.resetTask();
          //self.$questions.filter(':first').find('input:first').focus();
          //self.retry();
        }, true, {}, {
          confirmationDialog: {
            enable: params.behaviour.confirmRetryDialog,
            l10n: params.confirmRetry,
            instance: params.overrideSettings.instance,
            $parentElement: params.overrideSettings.$confirmationDialogParent
          }
        });
      }

      toggleButtonState(State.ONGOING);
    };

    /**
     * Creates and triggers the xAPI answered event
     *
     * @method triggerXAPIAnswered
     * @fires xAPIEvent
     */
    var triggerXAPIAnswered = function () {
      var xAPIEvent = self.createXAPIEventTemplate('answered');
      addQuestionToXAPI(xAPIEvent);
      addResponseToXAPI(xAPIEvent);
      self.trigger(xAPIEvent);
    };

    /**
     * Add the question itself to the definition part of an xAPIEvent
     */
    var addQuestionToXAPI = function(xAPIEvent) {
      var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
      definition.description = {
        // Remove tags, must wrap in div tag because jQuery 1.9 will crash if the string isn't wrapped in a tag.
        'en-US': $('<div>' + params.question + '</div>').text()
      };
      definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
      definition.interactionType = 'true-false';
      definition.correctResponsesPattern = [getCorrectAnswer()];
    };

    /**
     * Returns the correct answer
     *
     * @method getCorrectAnswer
     * @return {String}
     */
    var getCorrectAnswer = function () {
      return (params.correct === 'true' ? params.trueText : params.falseText);
    };

    /**
     * Returns the wrong answer
     *
     * @method getWrongAnswer
     * @return {String}
     */
    var getWrongAnswer = function () {
      return (params.correct === 'false' ? params.trueText : params.falseText);
    };

    /**
     * Add the response part to an xAPI event
     *
     * @param {H5P.XAPIEvent} xAPIEvent
     *  The xAPI event we will add a response to
     */
    var addResponseToXAPI = function(xAPIEvent) {
      var isCorrect = answerGroup.isCorrect();
      xAPIEvent.setScoredResult(isCorrect ? MAX_SCORE : 0, MAX_SCORE, self, true, isCorrect);
      xAPIEvent.data.statement.result.response = (isCorrect ? getCorrectAnswer() : getWrongAnswer());
    };

    /**
     * Toggles btton visibility dependent of current state
     *
     * @method toggleButtonVisibility
     * @param  {String}    buttonId
     * @param  {Boolean}   visible
     */
    var toggleButtonVisibility = function (buttonId, visible) {
      if (visible === true) {
        self.showButton(buttonId);
      }
      else {
        self.hideButton(buttonId);
      }
    };

    /**
     * Toggles buttons state
     *
     * @method toggleButtonState
     * @param  {String}          state
     */
    var toggleButtonState = function (state) {
      toggleButtonVisibility(Button.CHECK, state === State.ONGOING);
      toggleButtonVisibility(Button.TRYAGAIN, state === State.FINISHED_WRONG);
    };

    /**
     * Check if answer is correct or wrong, and update visuals accordingly
     *
     * @method checkAnswer
     * @param  {Boolean}    showSolution
     */
    var checkAnswer = function (showSolution) {

      // Create feedback widget
      var score = self.getScore();
      var scoreText;

      toggleButtonState(score === MAX_SCORE ? State.FINISHED_CORRECT : State.FINISHED_WRONG);

      if (answerGroup.hasAnswered()) {
        if (score === MAX_SCORE && params.behaviour.feedbackOnCorrect) {
          scoreText = params.behaviour.feedbackOnCorrect;
        }
        else if (score === 0 && params.behaviour.feedbackOnWrong) {
          scoreText = params.behaviour.feedbackOnWrong;
        }
        else {
          scoreText = params.score;
        }
        // Replace relevant variables:
        scoreText = scoreText.replace('@score', score).replace('@total', MAX_SCORE);
      }
      else {
        scoreText = params.noAnswerMessage;
      }

      self.setFeedback(scoreText, score, MAX_SCORE);

      if (answerGroup.hasAnswered()) {
        // Show solution
        answerGroup.reveal(showSolution);
        triggerXAPIAnswered();
      }
      else {
        answerGroup.disable();
      }
    };

    /**
     * Implements resume (save content state)
     *
     * @public
     * @returns {object} object containing answer
     */
    self.getCurrentState = function () {
      return {answer: answerGroup.getAnswer()};
    };

    /**
     * Used for contracts.
     * Checks if the parent program can proceed. Always true.
     * @public
     * @returns {Boolean} true
     */
    self.getAnswerGiven = function () {
      return answerGroup.hasAnswered();
    };

    /**
     * Used for contracts.
     * Checks the current score for this task.
     * @public
     * @returns {Number} The current score.
     */
    self.getScore = function () {
      return answerGroup.isCorrect() ? MAX_SCORE : 0;
    };

    /**
     * Used for contracts.
     * Checks the maximum score for this task.
     * @public
     * @returns {Number} The maximum score.
     */
    self.getMaxScore = function () {
      return MAX_SCORE;
    };

    /**
     * Get title of task
     * @returns {string} title
     */
    self.getTitle = function () {
      return H5P.createTitle(params.question);
    };

    /**
     * Used for contracts.
     * Show the solution.
     * @public
     */
    self.showSolutions = function () {
      checkAnswer(true);
      toggleButtonState(State.SOLUTION);
    };

    /**
     * Used for contracts.
     * Resets the complete task back to its' initial state.
     * @public
     */
    self.resetTask = function () {
      answerGroup.reset();
      self.setFeedback();
      toggleButtonState(State.ONGOING);
    };
  }

  // Inheritance
  TrueFalse.prototype = Object.create(Question.prototype);
  TrueFalse.prototype.constructor = TrueFalse;

  return TrueFalse;
})(H5P.jQuery, H5P.Question);
