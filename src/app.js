import { StateMachine, STATES } from './state.js';
import { Timer } from './timer.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';
import { Stats } from './stats.js';

const DEFAULT_WORK = 25 * 60 * 1000;
const DEFAULT_SHORT_BREAK = 5 * 60 * 1000;
const DEFAULT_LONG_BREAK = 15 * 60 * 1000;

export class App {
  #state;
  #timer;
  #ui;
  #stats;
  #workDuration;
  #shortBreakDuration;
  #longBreakDuration;
  #displayInterval = null;

  constructor() {
    const storage = new Storage();
    this.#state = new StateMachine();
    this.#stats = new Stats(storage);
    this.#ui = new UI();
    this.#timer = null;
    this.#workDuration = DEFAULT_WORK;
    this.#shortBreakDuration = DEFAULT_SHORT_BREAK;
    this.#longBreakDuration = DEFAULT_LONG_BREAK;

    this.#ui.onStart(() => this.#handleStart());
    this.#ui.onPause(() => this.#handlePause());
    this.#ui.onReset(() => this.#handleReset());

    this.#initView();
  }

  setWorkDuration(ms) {
    if (this.#state.state !== STATES.IDLE) return;
    this.#workDuration = ms;
    this.#ui.updateTimer(ms);
  }

  setShortBreakDuration(ms) {
    this.#shortBreakDuration = ms;
  }

  setLongBreakDuration(ms) {
    this.#longBreakDuration = ms;
  }

  #initView() {
    this.#ui.updateState(this.#state.state);
    this.#ui.updateTimer(this.#workDuration);
    this.#updateStatsView();
  }

  #updateStatsView() {
    const today = this.#stats.getToday();
    const el = document.getElementById('stats-summary');
    if (el) {
      el.textContent = `今日完成: ${today.total} 个番茄`;
    }
  }

  #handleStart() {
    if (
      this.#state.state === STATES.IDLE ||
      this.#state.state === STATES.SHORT_BREAK ||
      this.#state.state === STATES.LONG_BREAK
    ) {
      this.#state.transition(STATES.WORK);
      this.#ui.updateState(this.#state.state);
      this.#startTimer(this.#workDuration);
    } else if (this.#state.state === STATES.PAUSED) {
      this.#state.transition(STATES.WORK);
      this.#ui.updateState(this.#state.state);
      this.#timer?.start();
      this.#startDisplayUpdate();
    }
  }

  #handlePause() {
    if (this.#state.state !== STATES.WORK || !this.#timer?.isRunning()) return;
    this.#state.transition(STATES.PAUSED);
    this.#timer.pause();
    this.#stopDisplayUpdate();
    this.#ui.updateState(this.#state.state);
  }

  #handleReset() {
    this.#stopDisplayUpdate();
    if (this.#timer) {
      this.#timer.reset();
      this.#timer = null;
    }
    this.#state.reset();
    this.#ui.updateState(this.#state.state);
    this.#ui.updateTimer(this.#workDuration);
  }

  #startTimer(duration) {
    this.#stopDisplayUpdate();
    this.#timer = new Timer(duration, () => this.#handleTimerComplete());
    this.#timer.start();
    this.#startDisplayUpdate();
  }

  #startDisplayUpdate() {
    this.#stopDisplayUpdate();
    this.#displayInterval = setInterval(() => {
      if (this.#timer) {
        this.#ui.updateTimer(this.#timer.getRemaining());
      }
    }, 100);
  }

  #stopDisplayUpdate() {
    if (this.#displayInterval !== null) {
      clearInterval(this.#displayInterval);
      this.#displayInterval = null;
    }
  }

  #handleTimerComplete() {
    this.#stopDisplayUpdate();

    if (this.#state.state === STATES.WORK) {
      this.#stats.record();
      this.#state.completeWorkPeriod();
      this.#updateStatsView();

      const breakDuration =
        this.#state.state === STATES.LONG_BREAK
          ? this.#longBreakDuration
          : this.#shortBreakDuration;
      this.#ui.updateState(this.#state.state);
      this.#startTimer(breakDuration);
    } else {
      this.#state.transition(STATES.WORK);
      this.#ui.updateState(this.#state.state);
      this.#startTimer(this.#workDuration);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
