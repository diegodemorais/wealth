import { describe, it, expect } from 'vitest';
import {
  classifyDriftBucket,
  classifyTwrYtd,
  classifyMaxDdItd,
  classifyTerAllIn,
} from '../holdingsSemaphore';

describe('holdingsSemaphore — drift bucket', () => {
  it('green when |drift| < 2pp', () => {
    expect(classifyDriftBucket(1.9)).toBe('green');
    expect(classifyDriftBucket(-1.5)).toBe('green');
    expect(classifyDriftBucket(0)).toBe('green');
  });
  it('yellow when 2 <= |drift| < 5', () => {
    expect(classifyDriftBucket(2.0)).toBe('yellow');
    expect(classifyDriftBucket(-4.9)).toBe('yellow');
  });
  it('red when |drift| >= 5pp', () => {
    expect(classifyDriftBucket(5.0)).toBe('red');
    expect(classifyDriftBucket(-15)).toBe('red');
  });
});

describe('holdingsSemaphore — TWR YTD', () => {
  it('green when twr >= 0', () => {
    expect(classifyTwrYtd(0)).toBe('green');
    expect(classifyTwrYtd(15.4)).toBe('green');
  });
  it('yellow when -5 <= twr < 0', () => {
    expect(classifyTwrYtd(-0.1)).toBe('yellow');
    expect(classifyTwrYtd(-5)).toBe('yellow');
  });
  it('red when twr < -5', () => {
    expect(classifyTwrYtd(-5.1)).toBe('red');
    expect(classifyTwrYtd(-30)).toBe('red');
  });
});

describe('holdingsSemaphore — Max DD ITD', () => {
  it('green when |dd| < 15', () => {
    expect(classifyMaxDdItd(-14.9)).toBe('green');
    expect(classifyMaxDdItd(0)).toBe('green');
  });
  it('yellow when 15 <= |dd| < 30', () => {
    expect(classifyMaxDdItd(-15)).toBe('yellow');
    expect(classifyMaxDdItd(-29.9)).toBe('yellow');
  });
  it('red when |dd| >= 30', () => {
    expect(classifyMaxDdItd(-30)).toBe('red');
    expect(classifyMaxDdItd(-50)).toBe('red');
  });
});

describe('holdingsSemaphore — TER all-in', () => {
  it('green when ter <= 0.40', () => {
    expect(classifyTerAllIn(0.38)).toBe('green');
    expect(classifyTerAllIn(0.40)).toBe('green');
  });
  it('yellow when 0.40 < ter <= 1.00', () => {
    expect(classifyTerAllIn(0.71)).toBe('yellow');
    expect(classifyTerAllIn(1.00)).toBe('yellow');
  });
  it('red when ter > 1.00', () => {
    expect(classifyTerAllIn(1.01)).toBe('red');
    expect(classifyTerAllIn(1.18)).toBe('red');
  });
});

describe('holdingsSemaphore — null/NaN safe', () => {
  it('returns green for null/undefined/NaN', () => {
    expect(classifyDriftBucket(null)).toBe('green');
    expect(classifyTwrYtd(undefined)).toBe('green');
    expect(classifyMaxDdItd(NaN)).toBe('green');
    expect(classifyTerAllIn(null)).toBe('green');
  });
});
