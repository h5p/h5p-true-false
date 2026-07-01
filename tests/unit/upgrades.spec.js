'use strict';

const { expect } = require('chai');
const { resetGlobals, loadScript } = require('../setup/h5p-globals');
const fixtures = require('../fixtures/params');

/**
 * upgrades.js — pure param transforms. No jQuery / DOM.
 * Binds to: TF-UPG-01 (v1.5 title), TF-UPG-02 (v1.6 media move).
 * Versioned inputs come from tests/fixtures/versions/1_5.json & 1_6.json.
 */
describe('upgrades.js', function () {
  let upgrades;

  beforeEach(function () {
    resetGlobals();
    loadScript('upgrades.js');
    upgrades = global.H5PUpgrades['H5P.TrueFalse'];
  });

  it('registers the H5P.TrueFalse upgrade map', function () {
    expect(upgrades).to.be.an('object');
    expect(upgrades[1][5]).to.be.a('function');
    expect(upgrades[1][6]).to.be.a('function');
  });

  describe('1.5 — title from question (TF-UPG-01)', function () {
    it('sets metadata.title from question with HTML tags stripped', function () {
      const params = fixtures.versions.v1_5();
      let result;
      upgrades[1][5](params, function (err, outParams, extras) {
        result = { err, outParams, extras };
      }, {});

      expect(result.err).to.equal(null);
      expect(result.extras.metadata.title).to.equal('The Earth is flat.');
    });

    it('falls back to an existing extras title when question is absent', function () {
      let result;
      upgrades[1][5]({}, function (err, outParams, extras) {
        result = extras;
      }, { metadata: { title: 'Existing Title' } });

      expect(result.metadata.title).to.equal('Existing Title');
    });

    it("falls back to 'True-False' when neither question nor title exist", function () {
      let result;
      upgrades[1][5]({}, function (err, outParams, extras) {
        result = extras;
      }, {});

      expect(result.metadata.title).to.equal('True-False');
    });
  });

  describe('1.6 — move disableImageZooming into media (TF-UPG-02)', function () {
    it('wraps top-level media and relocates disableImageZooming from behaviour', function () {
      const params = fixtures.versions.v1_6();
      const originalMedia = fixtures.versions.v1_6().media;
      let result;

      upgrades[1][6](params, function (err, outParams) {
        result = outParams;
      });

      expect(result.media.type).to.deep.equal(originalMedia);
      expect(result.media.disableImageZooming).to.equal(true);
      expect(result.behaviour).to.not.have.property('disableImageZooming');
    });

    it('leaves params without media untouched', function () {
      const params = { correct: 'true', behaviour: { enableRetry: true } };
      let result;

      upgrades[1][6](params, function (err, outParams) {
        result = outParams;
      });

      expect(result).to.not.have.property('media');
      expect(result.behaviour).to.deep.equal({ enableRetry: true });
    });
  });
});

