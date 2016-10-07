H5P.TrueFalse.Answer = (function ($, EventDispatcher) {
  'use strict';

  var Keys = {
    ENTER: 13,
    SPACE: 32,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40
  };

  /**
   * Initialize module.
   *
   * @class H5P.TrueFalse.Answer
   * @extends H5P.EventDispatcher
   * @param {String} text Label
   * @param {String} correctMessage Message read by readspeaker when correct alternative is chosen
   * @param {String} wrongMessage Message read by readspeaker when wrong alternative is chosen
   */
  function Answer (text, correctMessage, wrongMessage) {
    var self = this;

    EventDispatcher.call(self);

    var checked = false;
    var enabled = true;

    var $answer = $('<div>', {
      'class': 'h5p-true-false-answer',
      role: 'radio',
      'aria-checked': false,
      html: text + '<span class="aria-label"></span>',
      tabindex: -1, // Not tabable by default
      click: function () {
        self.check();
      },
      keydown: function (event) {
        if ([Keys.SPACE, Keys.ENTER].indexOf(event.keyCode) !== -1) {
          self.check();
        }
        else if ([Keys.LEFT_ARROW, Keys.UP_ARROW, Keys.RIGHT_ARROW, Keys.DOWN_ARROW].indexOf(event.keyCode) !== -1) {
          self.uncheck();
          self.trigger('invert');
        }
      }
    });

    var $ariaLabel = $answer.find('.aria-label');

    /**
     * Return the dom element representing the alternative
     *
     * @public
     * @method getDomElement
     * @return {H5P.jQuery}
     */
    self.getDomElement = function () {
      return $answer;
    };

    /**
     * Unchecks the alternative
     *
     * @public
     * @method uncheck
     * @return {H5P.TrueFalse.Answer}
     */
    self.uncheck = function () {
      if (enabled) {
        checked = false;
        $answer.attr({
          'aria-checked': checked,
          tabIndex: -1
        });
      }
      return self;
    };

    /**
     * Set tabable or not
     * @method tabable
     * @param  {Boolean} enabled
     * @return {H5P.TrueFalse.Answer}
     */
    self.tabable = function (enabled) {
      $answer.attr('tabIndex', enabled ? 0 : -1);
      return self;
    };

    /**
     * Checks the alternative
     *
     * @method check
     * @return {H5P.TrueFalse.Answer}
     */
    self.check = function () {
      if (enabled) {
        checked = true;
        $answer.attr({
          'aria-checked': checked,
          tabIndex: 0
        });
        $answer.focus();
        self.trigger('checked');
      }
      return self;
    };

    /**
     * Is this alternative checked?
     *
     * @method isChecked
     * @return {boolean}
     */
    self.isChecked = function () {
      return checked;
    };

    /**
     * Enable alternative
     *
     * @method enable
     * @return {H5P.TrueFalse.Answer}
     */
    self.enable = function () {
      $answer.attr({
        'aria-disabled': ''
      });
      enabled = true;

      return self;
    };

    /**
     * Disables alternative
     *
     * @method disable
     * @return {H5P.TrueFalse.Answer}
     */
    self.disable = function () {
      $answer.attr({
        'aria-disabled': true,
        tabIndex: -1
      });
      enabled = false;

      return self;
    };

    /**
     * Reset alternative
     *
     * @method reset
     * @return {H5P.TrueFalse.Answer}
     */
    self.reset = function () {
      self.enable();
      self.uncheck();
      $answer.removeClass('wrong correct');
      $ariaLabel.html('');

      return self;
    };

    /**
     * Marks this alternative as the wrong one
     *
     * @method markWrong
     * @return {H5P.TrueFalse.Answer}
     */
    self.markWrong = function () {
      $answer.addClass('wrong');
      $ariaLabel.html('.' + wrongMessage);

      return self;
    };

    /**
     * Marks this alternative as the wrong one
     *
     * @method markCorrect
     * @return {H5P.TrueFalse.Answer}
     */
    self.markCorrect = function () {
      $answer.addClass('correct');
      $ariaLabel.html('.' + correctMessage);

      return self;
    };
  }

  // Inheritance
  Answer.prototype = Object.create(EventDispatcher.prototype);
  Answer.prototype.constructor = Answer;

  return Answer;

})(H5P.jQuery, H5P.EventDispatcher);
