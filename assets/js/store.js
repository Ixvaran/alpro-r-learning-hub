/* ==========================================================================
   store.js — progres belajar di localStorage
   Tidak ada akun dan tidak ada data yang dikirim ke mana pun. Bila
   localStorage tidak tersedia (mode privat keras), aplikasi tetap berjalan
   dengan penyimpanan di memori saja.
   ========================================================================== */

const KEY = 'alpro-lh-progress-v1';

const empty = () => ({
  v: 1,
  lessons: {}, // id -> { done: true, at: number }
  exercises: {}, // id -> { attempts, correct, lastCorrectAt, revealed }
  last: null, // { moduleId, lessonId, at }
  startedAt: Date.now(),
});

let memoryOnly = false;
let state = empty();
const listeners = new Set();

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1) return null;
    return { ...empty(), ...parsed };
  } catch {
    return null;
  }
}

export const store = {
  get state() {
    return state;
  },

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = (raw && safeParse(raw)) || empty();
    } catch {
      memoryOnly = true;
      state = empty();
    }
    return state;
  },

  save() {
    if (memoryOnly) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      memoryOnly = true;
    }
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  emit() {
    this.save();
    listeners.forEach((fn) => {
      try {
        fn(state);
      } catch {
        /* satu listener gagal tidak boleh menghentikan yang lain */
      }
    });
  },

  get memoryOnly() {
    return memoryOnly;
  },

  /* ---- Pelajaran ------------------------------------------------------- */
  isLessonDone(moduleId, lessonId) {
    return Boolean(state.lessons[`${moduleId}/${lessonId}`]?.done);
  },

  setLessonDone(moduleId, lessonId, done = true) {
    const key = `${moduleId}/${lessonId}`;
    if (done) state.lessons[key] = { done: true, at: Date.now() };
    else delete state.lessons[key];
    state.last = { moduleId, lessonId, at: Date.now() };
    this.emit();
  },

  countDone(module) {
    return module.lessons.filter((l) =>
      Boolean(state.lessons[`${module.id}/${l.id}`]?.done)
    ).length;
  },

  modulePercent(module) {
    if (!module.lessons.length) return 0;
    return Math.round((this.countDone(module) / module.lessons.length) * 100);
  },

  /* ---- Latihan --------------------------------------------------------- */
  exercise(id) {
    return state.exercises[id] || null;
  },

  recordExercise(id, { correct = null, revealed = false } = {}) {
    const rec = state.exercises[id] || { attempts: 0, correct: 0 };
    rec.attempts += 1;
    if (correct === true) {
      rec.correct += 1;
      rec.lastCorrectAt = Date.now();
    }
    if (revealed) rec.revealed = true;
    state.exercises[id] = rec;
    this.emit();
    return rec;
  },

  isSolved(id) {
    return Boolean(state.exercises[id]?.correct > 0);
  },

  /* ---- Ringkasan ------------------------------------------------------- */
  totals(modules) {
    const lessons = modules.reduce((n, m) => n + m.lessons.length, 0);
    const done = modules.reduce((n, m) => n + this.countDone(m), 0);
    const attempted = Object.keys(state.exercises).length;
    const solved = Object.values(state.exercises).filter((e) => e.correct > 0)
      .length;
    return {
      lessons,
      done,
      attempted,
      solved,
      percent: lessons ? Math.round((done / lessons) * 100) : 0,
    };
  },

  lastLesson() {
    return state.last;
  },

  setLast(moduleId, lessonId) {
    state.last = { moduleId, lessonId, at: Date.now() };
    this.save();
  },

  reset() {
    state = empty();
    this.emit();
  },
};
