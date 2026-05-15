import { StateMachine, STATES } from '../src/state.js';

describe('StateMachine', () => {
  test('initial state is IDLE with count 0', () => {
    const sm = new StateMachine();
    expect(sm.state).toBe(STATES.IDLE);
    expect(sm.pomodoroCount).toBe(0);
  });

  test('IDLE to WORK transition is allowed', () => {
    const sm = new StateMachine();
    expect(sm.transition(STATES.WORK)).toBe(true);
    expect(sm.state).toBe(STATES.WORK);
  });

  test('WORK to PAUSED transition is allowed', () => {
    const sm = new StateMachine();
    sm.transition(STATES.WORK);
    expect(sm.transition(STATES.PAUSED)).toBe(true);
    expect(sm.state).toBe(STATES.PAUSED);
  });

  test('WORK to SHORT_BREAK transition is allowed and increments count', () => {
    const sm = new StateMachine();
    sm.transition(STATES.WORK);
    expect(sm.transition(STATES.SHORT_BREAK)).toBe(true);
    expect(sm.state).toBe(STATES.SHORT_BREAK);
    expect(sm.pomodoroCount).toBe(1);
  });

  test('WORK cannot transition directly to LONG_BREAK', () => {
    const sm = new StateMachine();
    sm.transition(STATES.WORK);
    expect(sm.transition(STATES.LONG_BREAK)).toBe(false);
    expect(sm.state).toBe(STATES.WORK);
  });

  test('SHORT_BREAK to WORK transition is allowed', () => {
    const sm = new StateMachine();
    sm.transition(STATES.WORK);
    sm.transition(STATES.SHORT_BREAK);
    expect(sm.transition(STATES.WORK)).toBe(true);
    expect(sm.state).toBe(STATES.WORK);
  });

  test('LONG_BREAK to WORK transition is allowed', () => {
    const sm = new StateMachine();
    sm.completeWorkPeriod(); // not in WORK → no-op
    sm.transition(STATES.WORK);
    sm.completeWorkPeriod(); // count=1 → SHORT_BREAK
    sm.transition(STATES.WORK);
    sm.completeWorkPeriod(); // count=2 → SHORT_BREAK
    sm.transition(STATES.WORK);
    sm.completeWorkPeriod(); // count=3 → SHORT_BREAK
    sm.transition(STATES.WORK);
    sm.completeWorkPeriod(); // count=4 → LONG_BREAK
    expect(sm.state).toBe(STATES.LONG_BREAK);
    expect(sm.pomodoroCount).toBe(4);
    expect(sm.transition(STATES.WORK)).toBe(true);
    expect(sm.state).toBe(STATES.WORK);
  });

  test('PAUSED to WORK transition is allowed (resume)', () => {
    const sm = new StateMachine();
    sm.transition(STATES.WORK);
    sm.transition(STATES.PAUSED);
    expect(sm.transition(STATES.WORK)).toBe(true);
    expect(sm.state).toBe(STATES.WORK);
    // count should not increase from resume
    expect(sm.pomodoroCount).toBe(0);
  });

  test('invalid transition IDLE to PAUSED is rejected', () => {
    const sm = new StateMachine();
    expect(sm.transition(STATES.PAUSED)).toBe(false);
    expect(sm.state).toBe(STATES.IDLE);
  });

  test('invalid transition IDLE to SHORT_BREAK is rejected', () => {
    const sm = new StateMachine();
    expect(sm.transition(STATES.SHORT_BREAK)).toBe(false);
    expect(sm.state).toBe(STATES.IDLE);
  });

  test('completeWorkPeriod routes to SHORT_BREAK and increments count', () => {
    const sm = new StateMachine();
    sm.transition(STATES.WORK);
    expect(sm.completeWorkPeriod()).toBe(true);
    expect(sm.state).toBe(STATES.SHORT_BREAK);
    expect(sm.pomodoroCount).toBe(1);
  });

  test('completeWorkPeriod routes to LONG_BREAK every 4th pomodoro', () => {
    const sm = new StateMachine();

    for (let i = 0; i < 3; i++) {
      sm.transition(STATES.WORK);
      sm.completeWorkPeriod();
      expect(sm.state).toBe(STATES.SHORT_BREAK);
      expect(sm.pomodoroCount).toBe(i + 1);
    }

    // 4th pomodoro → LONG_BREAK
    sm.transition(STATES.WORK);
    sm.completeWorkPeriod();
    expect(sm.state).toBe(STATES.LONG_BREAK);
    expect(sm.pomodoroCount).toBe(4);
  });

  test('completeWorkPeriod returns false when not in WORK state', () => {
    const sm = new StateMachine();
    expect(sm.completeWorkPeriod()).toBe(false);
    expect(sm.state).toBe(STATES.IDLE);

    sm.transition(STATES.WORK);
    sm.transition(STATES.PAUSED);
    expect(sm.completeWorkPeriod()).toBe(false);
    expect(sm.state).toBe(STATES.PAUSED);
  });

  test('reset returns to IDLE with count 0', () => {
    const sm = new StateMachine();
    sm.transition(STATES.WORK);
    sm.completeWorkPeriod();
    sm.completeWorkPeriod(); // no-op, already in SHORT_BREAK
    expect(sm.pomodoroCount).toBe(1);
    sm.reset();
    expect(sm.state).toBe(STATES.IDLE);
    expect(sm.pomodoroCount).toBe(0);
  });
});
