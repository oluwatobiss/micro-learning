import type { LessonProgress } from "../types/lesson";

const PROGRESS_STORAGE_KEY = "microlearning_reader_progress_v1";

function getAllStoredProgress(): Record<string, LessonProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (err) {
    console.warn("Unable to read reader progress from localStorage:", err);
    return {};
  }
}

function saveAllStoredProgress(map: Record<string, LessonProgress>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn("Unable to write reader progress to localStorage:", err);
  }
}

export const progressService = {
  /**
   * Retrieves and validates progress for a specific lesson.
   * If stored data is corrupted, outdated, or out of bounds, it gracefully sanitizes it.
   */
  getProgress(
    lessonId: string,
    expectedVersion: number,
    totalCards: number,
  ): LessonProgress | null {
    const all = getAllStoredProgress();
    const entry = all[lessonId];
    if (!entry) return null;

    // Validate schema
    if (typeof entry !== "object" || entry.lessonId !== lessonId) {
      return null;
    }

    // Version check: if content changed, ignore stale card positions
    if (
      typeof entry.version === "number" &&
      entry.version !== expectedVersion
    ) {
      return null;
    }

    // Sanitize card index bounds
    const safeIndex =
      typeof entry.currentCardIndex === "number" &&
      entry.currentCardIndex >= 0 &&
      entry.currentCardIndex < totalCards
        ? entry.currentCardIndex
        : 0;

    // Sanitize answers
    const safeAnswers =
      typeof entry.selectedAnswers === "object" &&
      entry.selectedAnswers !== null
        ? entry.selectedAnswers
        : {};

    return {
      lessonId,
      version: expectedVersion,
      currentCardIndex: safeIndex,
      selectedAnswers: safeAnswers,
      isCompleted: Boolean(entry.isCompleted),
      completedAt: entry.completedAt,
      lastUpdatedAt: entry.lastUpdatedAt || new Date().toISOString(),
    };
  },

  /**
   * Updates reader progress for a given lesson.
   */
  updateProgress(
    lessonId: string,
    version: number,
    updater: (prev: LessonProgress) => Partial<LessonProgress>,
  ): LessonProgress {
    const all = getAllStoredProgress();
    const existing = all[lessonId];

    const current: LessonProgress =
      existing && existing.version === version
        ? existing
        : {
            lessonId,
            version,
            currentCardIndex: 0,
            selectedAnswers: {},
            isCompleted: false,
            lastUpdatedAt: new Date().toISOString(),
          };

    const changes = updater(current);
    const updated: LessonProgress = {
      ...current,
      ...changes,
      lessonId,
      version,
      lastUpdatedAt: new Date().toISOString(),
    };

    all[lessonId] = updated;
    saveAllStoredProgress(all);
    return updated;
  },

  /**
   * Records the current card position as the reader advances.
   */
  setCardIndex(lessonId: string, version: number, index: number): void {
    this.updateProgress(lessonId, version, () => ({
      currentCardIndex: index,
    }));
  },

  /**
   * Persists an answered checkpoint question so feedback is preserved across reloads.
   */
  recordAnswer(
    lessonId: string,
    version: number,
    cardId: string,
    optionId: string,
  ): void {
    this.updateProgress(lessonId, version, (prev) => ({
      selectedAnswers: {
        ...prev.selectedAnswers,
        [cardId]: optionId,
      },
    }));
  },

  /**
   * Marks a lesson as fully completed.
   */
  markCompleted(lessonId: string, version: number): void {
    this.updateProgress(lessonId, version, (prev) => ({
      isCompleted: true,
      completedAt: prev.completedAt || new Date().toISOString(),
    }));
  },

  /**
   * Resets progress for a lesson (e.g. learner wants to start fresh).
   */
  resetProgress(lessonId: string, version: number): void {
    const all = getAllStoredProgress();
    all[lessonId] = {
      lessonId,
      version,
      currentCardIndex: 0,
      selectedAnswers: {},
      isCompleted: false,
      lastUpdatedAt: new Date().toISOString(),
    };
    saveAllStoredProgress(all);
  },
};
