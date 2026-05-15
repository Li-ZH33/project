import { jest } from '@jest/globals';
import { Storage } from '../src/storage.js';

function mockLocalStorage() {
  const store = {};
  const mock = {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, value) => { store[key] = String(value); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { for (const k in store) delete store[k]; }),
  };
  Object.defineProperty(globalThis, 'localStorage', { value: mock, writable: true });
  return { mock, store };
}

beforeEach(() => {
    mockLocalStorage();
});

describe('Storage', () => {
  test('save writes to localStorage and load retrieves the same value', () => {
    const storage = new Storage();
    const data = { a: 1, b: 'test' };

    const result = storage.save('testKey', data);
    expect(result).toBe(true);

    const loaded = storage.load('testKey');
    expect(loaded).toEqual(data);
  });

  test('load returns default value for non-existent key', () => {
    const storage = new Storage();

    const result = storage.load('nonexistent', 'fallback');
    expect(result).toBe('fallback');
  });

  test('load returns null for non-existent key when no default given', () => {
    const storage = new Storage();

    const result = storage.load('nonexistent');
    expect(result).toBeNull();
  });

  test('gracefully degrades when localStorage is unavailable', () => {
    const broken = {
      getItem: jest.fn(() => { throw new Error('unavailable'); }),
      setItem: jest.fn(() => { throw new Error('unavailable'); }),
      removeItem: jest.fn(() => { throw new Error('unavailable'); }),
    };
    Object.defineProperty(globalThis, 'localStorage', { value: broken, writable: true });

    const storage = new Storage();

    expect(storage.isAvailable()).toBe(false);
    expect(storage.save('x', 1)).toBe(false);
    expect(storage.load('x', 42)).toBe(42);
    expect(storage.remove('x')).toBe(false);
  });

  test('remove deletes a key from localStorage', () => {
    const storage = new Storage();
    storage.save('toBeRemoved', 'value');
    expect(storage.load('toBeRemoved')).toBe('value');

    const result = storage.remove('toBeRemoved');
    expect(result).toBe(true);
    expect(storage.load('toBeRemoved')).toBeNull();
  });

  test('handles corrupted JSON gracefully', () => {
    const { store } = mockLocalStorage();
    const storage = new Storage();

    store['pomodoro_corrupt'] = 'not-json{{{';

    const result = storage.load('corrupt', 'safe');
    expect(result).toBe('safe');
  });

  test('uses pomodoro_ prefix for keys', () => {
    const storage = new Storage();
    storage.save('key1', 123);

    const raw = globalThis.localStorage.getItem('pomodoro_key1');
    expect(raw).toBe('123');
  });
});
