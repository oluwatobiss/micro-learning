import type { Lesson } from "../types/lesson";
import { SAMPLE_LESSON } from "./sampleLesson";

const STORAGE_KEY = "microlearning_lessons_v1";

export const storageService = {
  getLessons(): Lesson[] {
    if (typeof window === "undefined") {
      return [SAMPLE_LESSON];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_LESSON]));
        return [SAMPLE_LESSON];
      }
      const parsed = JSON.parse(stored) as Lesson[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_LESSON]));
        return [SAMPLE_LESSON];
      }
      return parsed;
    } catch (e) {
      console.warn(
        "Failed to parse localStorage lessons, falling back to sample:",
        e,
      );
      return [SAMPLE_LESSON];
    }
  },

  getLessonById(id: string): Lesson | undefined {
    const lessons = this.getLessons();
    return lessons.find((l) => l.id === id);
  },

  saveLesson(lesson: Lesson): void {
    if (typeof window === "undefined") return;
    const lessons = this.getLessons();
    const existingIndex = lessons.findIndex((l) => l.id === lesson.id);

    let updated: Lesson[];
    if (existingIndex >= 0) {
      updated = [...lessons];
      updated[existingIndex] = lesson;
    } else {
      updated = [lesson, ...lessons];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteLesson(id: string): void {
    if (typeof window === "undefined") return;
    const lessons = this.getLessons();
    const filtered = lessons.filter((l) => l.id !== id);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered.length ? filtered : [SAMPLE_LESSON]),
    );
  },

  resetDefaults(): Lesson[] {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_LESSON]));
    }
    return [SAMPLE_LESSON];
  },
};
