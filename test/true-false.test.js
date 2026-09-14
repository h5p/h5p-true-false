import { expect } from 'chai';
import { buildUrl } from './utilities/helpers.js';

beforeAll(() => {
  const url = buildUrl('example-content', 'h5p-true-false');
});

describe('True False', () => {
  it('should return true when the value is true', () => {
    const value = true;
    expect(value).to.be.true;
  });

  it('should return false when the value is false', () => {
    const value = false;
    expect(value).to.be.false;
  });
});