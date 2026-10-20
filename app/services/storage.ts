import type { Lesson } from "../types/lesson";
import { DEFAULT_LESSONS, SAMPLE_LESSON } from "./sampleLesson";

const STORAGE_KEY = "microlearning_lessons_v3";

export const storageService = {
  getLessons(): Lesson[] {
    if (typeof window === "undefined") {
      return DEFAULT_LESSONS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LESSONS));
        return DEFAULT_LESSONS;
      }
      const parsed = JSON.parse(stored) as Lesson[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LESSONS));
        return DEFAULT_LESSONS;
      }

      // Ensure default lessons exist and are updated to latest version
      let hasChanges = false;
      const combined = [...parsed];

      for (const defaultLesson of DEFAULT_LESSONS) {
        const existingIdx = combined.findIndex((l) => l.id === defaultLesson.id);
        if (existingIdx === -1) {
          combined.push(defaultLesson);
          hasChanges = true;
        } else if ((combined[existingIdx].version || 1) < defaultLesson.version) {
          combined[existingIdx] = defaultLesson;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      }

      return combined;
    } catch (e) {
      console.warn(
        "Failed to parse localStorage lessons, falling back to defaults:",
        e,
      );
      return DEFAULT_LESSONS;
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
      JSON.stringify(filtered.length ? filtered : DEFAULT_LESSONS),
    );
  },

  resetDefaults(): Lesson[] {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LESSONS));
    }
    return DEFAULT_LESSONS;
  },
};
