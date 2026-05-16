const PREFIX = 'pomodoro_';

export class Storage {
  #available = false;

  constructor() {
    try {
      const k = `${PREFIX}_avail_test`;
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      this.#available = true;
    } catch {
      this.#available = false;
    }
  }

  isAvailable() {
    return this.#available;
  }

  save(key, value) {
    if (!this.#available) return false;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  load(key, defaultValue = null) {
    if (!this.#available) return defaultValue;
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  remove(key) {
    if (!this.#available) return false;
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch {
      return false;
    }
  }
}
