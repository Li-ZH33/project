import { jest } from '@jest/globals';
import { App } from '../src/app.js';

const WORK_MS = 1000;
const SHORT_BREAK_MS = 500;

beforeEach(() => {
  document.body.innerHTML = `
    <div id="state-label"></div>
    <div id="timer-display"></div>
    <div id="stats-summary"></div>
    <button id="btn-start"></button>
    <button id="btn-pause"></button>
    <button id="btn-reset"></button>
    <button id="btn-theme"></button>
  `;
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 4, 15, 9, 0, 0));
});

afterEach(() => {
  jest.useRealTimers();
  localStorage.clear();
  document.body.innerHTML = '';
});

function getState() {
  return document.getElementById('state-label').textContent;
}

function getDisplay() {
  return document.getElementById('timer-display').textContent;
}

function getStats() {
  return document.getElementById('stats-summary').textContent;
}

function click(id) {
  document.getElementById(id).click();
}

describe('App', () => {
  test('page load shows idle state, default timer, and today stats', () => {
    const app = new App();

    expect(getState()).toBe('闲置中');
    expect(getDisplay()).toBe('25:00');
    expect(getStats()).toBe('今日完成: 0 个番茄');
  });

  test('click start begins countdown and changes state to working', () => {
    const app = new App();

    click('btn-start');

    expect(getState()).toBe('工作中');
  });

  test('work timer completion transitions to break and records stats', () => {
    const app = new App();
    app.setWorkDuration(WORK_MS);

    click('btn-start');
    jest.advanceTimersByTime(WORK_MS + 500);

    expect(getState()).toBe('短休中');
    expect(getStats()).toBe('今日完成: 1 个番茄');
  });

  test('break timer completion transitions to next work period', () => {
    const app = new App();
    app.setWorkDuration(WORK_MS);
    app.setShortBreakDuration(SHORT_BREAK_MS);

    click('btn-start');
    jest.advanceTimersByTime(WORK_MS + 200);

    expect(getState()).toBe('短休中');

    jest.advanceTimersByTime(SHORT_BREAK_MS + 200);

    expect(getState()).toBe('工作中');
  });

  test('reset returns to idle state with configured timer display', () => {
    const app = new App();
    app.setWorkDuration(WORK_MS);

    click('btn-start');
    jest.advanceTimersByTime(300);
    click('btn-reset');

    expect(getState()).toBe('闲置中');
    expect(getDisplay()).toBe('00:01');
  });

  test('pause stops countdown and resume continues', () => {
    const app = new App();
    app.setWorkDuration(WORK_MS);

    click('btn-start');
    jest.advanceTimersByTime(300);
    click('btn-pause');

    expect(getState()).toBe('已暂停');
    const pausedDisplay = getDisplay();

    jest.advanceTimersByTime(2000);

    expect(getDisplay()).toBe(pausedDisplay);

    click('btn-start');
    expect(getState()).toBe('工作中');

    jest.advanceTimersByTime(800);

    expect(getDisplay()).not.toBe(pausedDisplay);
  });

  test('setWorkDuration changes initial timer display', () => {
    const app = new App();

    app.setWorkDuration(10 * 60 * 1000);

    expect(getDisplay()).toBe('10:00');
  });

  test('timer uses custom work duration after setWorkDuration', () => {
    const app = new App();
    app.setWorkDuration(WORK_MS);

    click('btn-start');
    jest.advanceTimersByTime(WORK_MS + 200);

    expect(getState()).toBe('短休中');
    expect(getStats()).toBe('今日完成: 1 个番茄');
  });
});
