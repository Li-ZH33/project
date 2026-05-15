import { jest } from '@jest/globals';
import { Timer } from '../src/timer.js';

let now;

beforeEach(() => {
  jest.useFakeTimers();
  now = 1000000;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function advanceTime(ms) {
  now += ms;
  jest.advanceTimersByTime(ms);
}

describe('Timer', () => {
  test('remaining time decreases with real time after start', () => {
    const timer = new Timer(5000);
    timer.start();
    advanceTime(1000);
    expect(timer.getRemaining()).toBe(4000);
    advanceTime(2000);
    expect(timer.getRemaining()).toBe(2000);
  });

  test('pause stops remaining time from changing', () => {
    const timer = new Timer(5000);
    timer.start();
    advanceTime(1000);
    timer.pause();
    const paused = timer.getRemaining();
    advanceTime(2000);
    expect(timer.getRemaining()).toBe(paused);
  });

  test('resume continues from paused remaining time', () => {
    const timer = new Timer(5000);
    timer.start();
    advanceTime(1000);
    timer.pause();
    const paused = timer.getRemaining();
    timer.start();
    advanceTime(500);
    expect(timer.getRemaining()).toBe(paused - 500);
  });

  test('reset restores initial duration and stops timer', () => {
    const timer = new Timer(5000);
    timer.start();
    advanceTime(3000);
    timer.reset();
    expect(timer.getRemaining()).toBe(5000);
    expect(timer.isRunning()).toBe(false);
  });

  test('fires onComplete callback when timer reaches zero', () => {
    const onComplete = jest.fn();
    const timer = new Timer(1000, onComplete);
    timer.start();
    advanceTime(1000);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(timer.isRunning()).toBe(false);
    expect(timer.getRemaining()).toBe(0);
  });

  test('start is idempotent when already running', () => {
    const timer = new Timer(5000);
    timer.start();
    timer.start();
    advanceTime(1000);
    expect(timer.getRemaining()).toBe(4000);
  });

  test('pause on non-running timer is no-op', () => {
    const timer = new Timer(5000);
    timer.pause();
    expect(timer.getRemaining()).toBe(5000);
  });

  test('reset on non-running timer keeps initial duration', () => {
    const timer = new Timer(5000);
    timer.reset();
    expect(timer.getRemaining()).toBe(5000);
  });

  test('start after completion resets to full duration', () => {
    const onComplete = jest.fn();
    const timer = new Timer(1000, onComplete);
    timer.start();
    advanceTime(1000);
    expect(onComplete).toHaveBeenCalledTimes(1);

    timer.start();
    expect(timer.isRunning()).toBe(true);
    expect(timer.getRemaining()).toBeGreaterThan(0);
  });

  test('does not fire onComplete when paused before zero', () => {
    const onComplete = jest.fn();
    const timer = new Timer(1000, onComplete);
    timer.start();
    advanceTime(500);
    timer.pause();
    advanceTime(2000);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
