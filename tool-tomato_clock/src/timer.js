export class Timer {
  #duration;
  #remaining;
  #startTime = 0;
  #running = false;
  #onComplete;
  #intervalId = null;

  constructor(duration, onComplete) {
    this.#duration = duration;
    this.#remaining = duration;
    this.#onComplete = onComplete;
  }

  start() {
    if (this.#running) return;
    if (this.#remaining <= 0) {
      this.#remaining = this.#duration;
    }
    this.#running = true;
    this.#startTime = Date.now();
    this.#startPolling();
  }

  pause() {
    if (!this.#running) return;
    this.#stopPolling();
    this.#remaining = Math.max(0, this.#remaining - (Date.now() - this.#startTime));
    this.#running = false;
  }

  reset() {
    this.#stopPolling();
    this.#remaining = this.#duration;
    this.#running = false;
  }

  getRemaining() {
    if (this.#running) {
      return Math.max(0, this.#remaining - (Date.now() - this.#startTime));
    }
    return this.#remaining;
  }

  isRunning() {
    return this.#running;
  }

  #startPolling() {
    this.#intervalId = setInterval(() => {
      if (this.getRemaining() <= 0) {
        this.#remaining = 0;
        this.#running = false;
        this.#stopPolling();
        this.#onComplete?.();
      }
    }, 100);
  }

  #stopPolling() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }
}
