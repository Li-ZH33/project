import { jest } from '@jest/globals';
import { UI } from '../src/ui.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="timer-container">
      <div id="state-label">闲置中</div>
      <div id="timer-display">25:00</div>
      <div id="controls">
        <button id="btn-start">开始</button>
        <button id="btn-pause">暂停</button>
        <button id="btn-reset">重置</button>
      </div>
      <button id="btn-theme">深色模式</button>
    </div>
  `;
});

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('UI', () => {
  test('updateTimer displays remaining time in MM:SS format', () => {
    const ui = new UI();
    ui.updateTimer(150000);
    expect(document.getElementById('timer-display').textContent).toBe('02:30');
  });

  test('updateTimer shows 00:00 for zero', () => {
    const ui = new UI();
    ui.updateTimer(0);
    expect(document.getElementById('timer-display').textContent).toBe('00:00');
  });

  test('updateTimer rounds up partial seconds', () => {
    const ui = new UI();
    ui.updateTimer(1500);
    expect(document.getElementById('timer-display').textContent).toBe('00:02');
  });

  test('updateTimer handles time just before minute boundary', () => {
    const ui = new UI();
    ui.updateTimer(599000);
    expect(document.getElementById('timer-display').textContent).toBe('09:59');
  });

  test('updateState shows correct Chinese label for each state', () => {
    const ui = new UI();
    const labelEl = document.getElementById('state-label');

    ui.updateState('IDLE');
    expect(labelEl.textContent).toBe('闲置中');

    ui.updateState('WORK');
    expect(labelEl.textContent).toBe('工作中');

    ui.updateState('SHORT_BREAK');
    expect(labelEl.textContent).toBe('短休中');

    ui.updateState('LONG_BREAK');
    expect(labelEl.textContent).toBe('长休中');

    ui.updateState('PAUSED');
    expect(labelEl.textContent).toBe('已暂停');
  });

  test('start button triggers onStart callback', () => {
    const ui = new UI();
    const fn = jest.fn();
    ui.onStart(fn);
    document.getElementById('btn-start').click();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('pause button triggers onPause callback', () => {
    const ui = new UI();
    const fn = jest.fn();
    ui.onPause(fn);
    document.getElementById('btn-pause').click();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('reset button triggers onReset callback', () => {
    const ui = new UI();
    const fn = jest.fn();
    ui.onReset(fn);
    document.getElementById('btn-reset').click();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('theme toggle button switches data-theme attribute', () => {
    const ui = new UI();
    const html = document.documentElement;

    html.removeAttribute('data-theme');
    document.getElementById('btn-theme').click();
    expect(html.getAttribute('data-theme')).toBe('dark');

    document.getElementById('btn-theme').click();
    expect(html.getAttribute('data-theme')).toBe('light');

    document.getElementById('btn-theme').click();
    expect(html.getAttribute('data-theme')).toBe('dark');
  });
});
