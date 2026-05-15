import { jest } from '@jest/globals';
import { Stats } from '../src/stats.js';

class MockStorage {
  constructor() {
    this.data = {};
  }
  save(key, val) {
    this.data[key] = val;
    return true;
  }
  load(key, def) {
    return this.data[key] ?? def;
  }
}

const MORNING = new Date(2026, 4, 15, 9, 0, 0).getTime();
const AFTERNOON = new Date(2026, 4, 15, 14, 0, 0).getTime();
const YESTERDAY_AFTERNOON = new Date(2026, 4, 14, 14, 0, 0).getTime();

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Stats', () => {
  test('record increments today morning count after morning record', () => {
    jest.setSystemTime(MORNING);
    const stats = new Stats(new MockStorage());

    stats.record();
    const today = stats.getToday();

    expect(today).toEqual({ morning: 1, afternoon: 0, total: 1 });
  });

  test('record increments today afternoon count after afternoon record', () => {
    jest.setSystemTime(AFTERNOON);
    const stats = new Stats(new MockStorage());

    stats.record();
    const today = stats.getToday();

    expect(today).toEqual({ morning: 0, afternoon: 1, total: 1 });
  });

  test('getToday returns zeros when no records exist today', () => {
    jest.setSystemTime(MORNING);
    const stats = new Stats(new MockStorage());

    expect(stats.getToday()).toEqual({ morning: 0, afternoon: 0, total: 0 });
  });

  test('getHistory returns last N days sorted descending', () => {
    jest.setSystemTime(AFTERNOON);
    const stats = new Stats(new MockStorage());

    // Record on May 13 (morning)
    jest.setSystemTime(new Date(2026, 4, 13, 10, 0, 0));
    stats.record();

    // Record on May 15 (morning)
    jest.setSystemTime(new Date(2026, 4, 15, 9, 0, 0));
    stats.record();

    // Query history from May 15
    jest.setSystemTime(new Date(2026, 4, 15, 9, 0, 0));
    const history = stats.getHistory(5);

    expect(history).toEqual([
      { date: '2026-05-15', morning: 1, afternoon: 0, total: 1 },
      { date: '2026-05-14', morning: 0, afternoon: 0, total: 0 },
      { date: '2026-05-13', morning: 1, afternoon: 0, total: 1 },
      { date: '2026-05-12', morning: 0, afternoon: 0, total: 0 },
      { date: '2026-05-11', morning: 0, afternoon: 0, total: 0 },
    ]);
  });

  test('yesterday afternoon records do not affect today stats', () => {
    jest.setSystemTime(YESTERDAY_AFTERNOON);
    const stats = new Stats(new MockStorage());
    stats.record();

    // Check today (next day morning)
    jest.setSystemTime(MORNING);
    const today = stats.getToday();

    expect(today).toEqual({ morning: 0, afternoon: 0, total: 0 });
  });

  test('multiple records accumulate correctly', () => {
    jest.setSystemTime(MORNING);
    const stats = new Stats(new MockStorage());

    stats.record();
    stats.record();
    jest.setSystemTime(AFTERNOON);
    stats.record();

    jest.setSystemTime(MORNING);
    expect(stats.getToday()).toEqual({ morning: 2, afternoon: 1, total: 3 });
  });
});
