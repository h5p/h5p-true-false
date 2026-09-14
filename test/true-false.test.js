import { expect } from 'chai';
import { buildUrl } from './utilities/helpers.js';

describe('True False', () => {
  let frame;

  beforeEach(async () => {
    frame = document.createElement('iframe');
    frame.src = buildUrl('H5P-True-False');
    document.body.appendChild(frame);
    await new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
  });

  afterEach(() => frame.remove());

  it('loads the content type', () => {
    expect(frame.contentDocument.querySelector('.h5p-iframe')).to.exist;
  });
});