/* ==========================================================================
   exercises.js — bank soal gabungan dan pembantu penilaian
   ========================================================================== */

import { exercises12 } from './exercises1.js';
import { exercises34 } from './exercises2.js';

export const exercises = [...exercises12, ...exercises34];

export function byId(id) {
  return exercises.find((e) => e.id === id) || null;
}

export function forLesson(moduleId, lessonId) {
  return exercises.filter((e) => e.module === moduleId && e.lesson === lessonId);
}

export function forModule(moduleId) {
  return exercises.filter((e) => e.module === moduleId);
}

/* Perbandingan jawaban teks: tidak peka huruf besar-kecil, spasi berlebih,
   koma, dan tanda kutip. Contoh: `4, 10, 18` dianggap sama dengan `4 10 18`. */
export function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\[1\]/g, ' ')
    .replace(/["'`]/g, '')
    .replace(/[,\u2018\u2019\u201c\u201d]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

export function checkText(exercise, value) {
  const got = normalize(value);
  if (!got) return false;
  return (exercise.answer || []).some((a) => normalize(a) === got);
}

export function checkChoice(exercise, index) {
  return Number(index) === Number(exercise.answer);
}

export function isAutoGraded(exercise) {
  return exercise.type === 'choice' || exercise.type === 'debug' ||
    exercise.type === 'predict' || exercise.type === 'short';
}

/* Statistik ringan untuk halaman progres dan penyaring bank soal. */
export function counts() {
  const out = { total: exercises.length, byType: {}, byLevel: {}, byModule: {} };
  for (const e of exercises) {
    out.byType[e.type] = (out.byType[e.type] || 0) + 1;
    out.byLevel[e.level] = (out.byLevel[e.level] || 0) + 1;
    out.byModule[e.module] = (out.byModule[e.module] || 0) + 1;
  }
  return out;
}
