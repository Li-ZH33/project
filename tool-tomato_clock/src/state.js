export const STATES = {
  IDLE: 'IDLE',
  WORK: 'WORK',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK: 'LONG_BREAK',
  PAUSED: 'PAUSED',
};

const TRANSITIONS = {
  [STATES.IDLE]:        [STATES.WORK],
  [STATES.WORK]:        [STATES.PAUSED, STATES.SHORT_BREAK],
  [STATES.PAUSED]:      [STATES.WORK],
  [STATES.SHORT_BREAK]: [STATES.WORK],
  [STATES.LONG_BREAK]:  [STATES.WORK],
};

export class StateMachine {
  #state = STATES.IDLE;
  #pomodoroCount = 0;

  get state() {
    return this.#state;
  }

  get pomodoroCount() {
    return this.#pomodoroCount;
  }

  transition(to) {
    const allowed = TRANSITIONS[this.#state];
    if (!allowed || !allowed.includes(to)) return false;

    if (this.#state === STATES.WORK && to === STATES.SHORT_BREAK) {
      this.#pomodoroCount++;
    }

    this.#state = to;
    return true;
  }

  completeWorkPeriod() {
    if (this.#state !== STATES.WORK) return false;

    this.#pomodoroCount++;
    this.#state = this.#pomodoroCount % 4 === 0
      ? STATES.LONG_BREAK
      : STATES.SHORT_BREAK;
    return true;
  }

  reset() {
    this.#state = STATES.IDLE;
    this.#pomodoroCount = 0;
  }
}
