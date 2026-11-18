/* ==========================================================================
   curriculum.js — titik masuk tunggal untuk struktur materi
   Menambah modul atau pelajaran cukup dilakukan di berkas moduleN.js.
   ========================================================================== */

import { module1 } from './module1.js';
import { module2 } from './module2.js';
import { module3 } from './module3.js';
import { module4 } from './module4.js';

export const modules = [module1, module2, module3, module4];

export const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
export const totalMinutes = modules.reduce((n, m) => n + m.duration, 0);

export function moduleById(id) {
  return modules.find((m) => m.id === id) || null;
}

export function lessonById(moduleId, lessonId) {
  const mod = moduleById(moduleId);
  if (!mod) return null;
  const idx = mod.lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return null;
  return { module: mod, lesson: mod.lessons[idx], index: idx };
}

export function lessonPath(moduleId, lessonId) {
  return `#/modul/${moduleId}/${lessonId}`;
}

export function neighbours(moduleId, lessonId) {
  const found = lessonById(moduleId, lessonId);
  if (!found) return { prev: null, next: null };
  const { module: mod, index } = found;
  const prev =
    index > 0
      ? { module: mod, lesson: mod.lessons[index - 1] }
      : null;
  const next =
    index < mod.lessons.length - 1
      ? { module: mod, lesson: mod.lessons[index + 1] }
      : null;
  return { prev, next };
}

/* Urutan linear seluruh pelajaran — dipakai untuk tombol "lanjut" dan
   untuk menentukan pelajaran berikutnya setelah modul selesai. */
export function flatLessons() {
  return modules.flatMap((m) =>
    m.lessons.map((l, i) => ({
      moduleId: m.id,
      moduleNum: m.num,
      moduleTitle: m.title,
      lessonId: l.id,
      lessonTitle: l.title,
      index: i,
    }))
  );
}

export function nextInPath(moduleId, lessonId) {
  const flat = flatLessons();
  const at = flat.findIndex(
    (x) => x.moduleId === moduleId && x.lessonId === lessonId
  );
  return at >= 0 && at < flat.length - 1 ? flat[at + 1] : null;
}

export function firstUnfinishedLesson(store) {
  const flat = flatLessons();
  const next = flat.find((x) => !store.isLessonDone(x.moduleId, x.lessonId));
  return next || flat[flat.length - 1];
}
