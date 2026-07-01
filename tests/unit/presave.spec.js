'use strict';

const { expect } = require('chai');
const { resetGlobals, loadScript } = require('../setup/h5p-globals');
const fixtures = require('../fixtures/params');

/**
 * presave.js — needs H5PEditor.Presave (stubbed by the harness).
 * Binds to: TF-DATA-01 (maxScore:1), TF-DATA-02 (throws on missing/blank question).
 */
describe('presave.js', function () {
  let presave;

  beforeEach(function () {
    resetGlobals();
    loadScript('presave.js');
    presave = global.H5PPresave['H5P.TrueFalse'];
  });

  it('yields {maxScore: 1} for valid content (TF-DATA-01)', function () {
    const content = fixtures.content.withRetryShow();
    let result;

    presave(content, function (data) {
      result = data;
    });

    expect(result).to.deep.equal({ maxScore: 1 });
  });

  it('throws InvalidContentSemanticsException when question is missing (TF-DATA-02)', function () {
    expect(function () {
      presave({ correct: 'true' }, function () {});
    }).to.throw().with.property('name', 'InvalidContentSemanticsException');
  });

  it('throws InvalidContentSemanticsException when question is blank (TF-DATA-02)', function () {
    expect(function () {
      presave({ question: '   ' }, function () {});
    }).to.throw().with.property('name', 'InvalidContentSemanticsException');
  });
});

