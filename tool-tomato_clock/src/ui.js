const STATE_LABELS = {
  IDLE: '闲置中',
  WORK: '工作中',
  SHORT_BREAK: '短休中',
  LONG_BREAK: '长休中',
  PAUSED: '已暂停',
};

const THEME_STORAGE_KEY = 'theme';

export class UI {
  #onStart;
  #onPause;
  #onReset;

  constructor() {
    this.displayEl = document.getElementById('timer-display');
    this.stateLabelEl = document.getElementById('state-label');
    this.startBtn = document.getElementById('btn-start');
    this.pauseBtn = document.getElementById('btn-pause');
    this.resetBtn = document.getElementById('btn-reset');
    this.themeBtn = document.getElementById('btn-theme');

    this.startBtn.addEventListener('click', () => this.#onStart?.());
    this.pauseBtn.addEventListener('click', () => this.#onPause?.());
    this.resetBtn.addEventListener('click', () => this.#onReset?.());
    this.themeBtn.addEventListener('click', () => this.#toggleTheme());

    this.#initTheme();
  }

  updateTimer(remainingMs) {
    const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    this.displayEl.textContent =
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  updateState(state) {
    this.stateLabelEl.textContent = STATE_LABELS[state] || state;
  }

  onStart(callback) {
    this.#onStart = callback;
  }

  onPause(callback) {
    this.#onPause = callback;
  }

  onReset(callback) {
    this.#onReset = callback;
  }

  #initTheme() {
    const saved = this.#loadTheme();
    if (saved) {
      this.#applyTheme(saved);
    } else {
      const dark = this.#systemDark();
      this.#applyTheme(dark ? 'dark' : 'light');
    }
  }

  #toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.#applyTheme(next);
    this.#saveTheme(next);
  }

  #applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
    if (this.themeBtn) {
      this.themeBtn.textContent = theme === 'dark' ? '浅色模式' : '深色模式';
    }
  }

  #systemDark() {
    return typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  #loadTheme() {
    try {
      return localStorage.getItem('pomodoro_theme') || '';
    } catch {
      return '';
    }
  }

  #saveTheme(theme) {
    try {
      localStorage.setItem('pomodoro_theme', theme);
    } catch {
      // storage unavailable — preference won't persist, no crash
    }
  }
}
