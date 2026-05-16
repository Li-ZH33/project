function toDateStr(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isMorning(ts) {
  return new Date(ts).getHours() < 12;
}

export class Stats {
  #storage;
  #data;

  constructor(storage) {
    this.#storage = storage;
    this.#data = this.#storage.load('stats', {});
  }

  #save() {
    this.#storage.save('stats', this.#data);
  }

  record(timestamp) {
    const ts = timestamp ?? Date.now();
    const dateStr = toDateStr(ts);
    const period = isMorning(ts) ? 'morning' : 'afternoon';

    if (!this.#data[dateStr]) {
      this.#data[dateStr] = { morning: 0, afternoon: 0 };
    }
    this.#data[dateStr][period]++;
    this.#save();
  }

  getToday() {
    const dateStr = toDateStr(Date.now());
    const day = this.#data[dateStr];
    if (!day) {
      return { morning: 0, afternoon: 0, total: 0 };
    }
    return {
      morning: day.morning,
      afternoon: day.afternoon,
      total: day.morning + day.afternoon,
    };
  }

  getHistory(days) {
    const today = new Date(Date.now());
    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toDateStr(d.getTime());
      const day = this.#data[dateStr];
      result.push({
        date: dateStr,
        morning: day?.morning ?? 0,
        afternoon: day?.afternoon ?? 0,
        total: (day?.morning ?? 0) + (day?.afternoon ?? 0),
      });
    }
    return result;
  }
}
