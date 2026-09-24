import jquery from 'jquery';
import { vi } from 'vitest';

function EventDispatcher() {
  this.listeners = new Map();
}

EventDispatcher.prototype.on = function (eventName, callback) {
  const listeners = this.listeners.get(eventName) || [];
  listeners.push(callback);
  this.listeners.set(eventName, listeners);
};

EventDispatcher.prototype.trigger = function (event) {
  const eventName = typeof event === 'string' ? event : event.type;
  (this.listeners.get(eventName) || []).forEach((callback) => callback(event));
};

function Question() {
  EventDispatcher.call(this);

  this.buttons = new Map();
  this.addButton = vi.fn((id, text, callback, visible, attributes, options) => {
    this.buttons.set(id, { attributes, callback, options, text, visible });
  });
  this.showButton = vi.fn();
  this.hideButton = vi.fn();
  this.setFeedback = vi.fn();
  this.removeFeedback = vi.fn();
  this.setIntroduction = vi.fn();
  this.setContent = vi.fn();
  this.setImage = vi.fn();
  this.setVideo = vi.fn();
  this.setAudio = vi.fn();
  this.triggerXAPI = vi.fn();
  this.trigger = vi.fn(EventDispatcher.prototype.trigger.bind(this));
}

Question.prototype = Object.create(EventDispatcher.prototype);
Question.prototype.constructor = Question;
Question.prototype.createXAPIEventTemplate = function (verb) {
  const statement = {
    object: { definition: {} },
    result: {}
  };

  return {
    data: { statement },
    getVerifiedStatementValue(path) {
      return path.reduce((value, key) => value[key], statement);
    },
    setScoredResult(score, maxScore, instance, completion, success) {
      statement.result = {
        completion,
        score: { max: maxScore, raw: score },
        success
      };
    },
    verb
  };
};

globalThis.H5P = {
  createTitle: vi.fn((title) => title),
  EventDispatcher,
  jQuery: jquery,
  Question
};

await import('../scripts/h5p-true-false.js');
await import('../scripts/h5p-true-false-answer-group.js');
await import('../scripts/h5p-true-false-answer.js');