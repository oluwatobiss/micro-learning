import type { Lesson } from "../types/lesson";

const DRAFT_PREFIX = "microlearning_editor_draft_";

export const draftService = {
  getDraft(lessonId: string): Lesson | null {
    if (
      (typeof window === "undefined" && typeof localStorage === "undefined") ||
      !lessonId
    )
      return null;
    try {
      const stored = localStorage.getItem(`${DRAFT_PREFIX}${lessonId}`);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as Lesson;
      if (parsed && parsed.id === lessonId && Array.isArray(parsed.cards)) {
        return parsed;
      }
      return null;
    } catch (e) {
      console.warn("Failed to retrieve draft from localStorage:", e);
      return null;
    }
  },

  saveDraft(lessonId: string, draft: Lesson): void {
    if (
      (typeof window === "undefined" && typeof localStorage === "undefined") ||
      !lessonId ||
      !draft
    )
      return;
    try {
      localStorage.setItem(`${DRAFT_PREFIX}${lessonId}`, JSON.stringify(draft));
    } catch (e) {
      console.warn("Failed to save draft to localStorage:", e);
    }
  },

  clearDraft(lessonId: string): void {
    if (
      (typeof window === "undefined" && typeof localStorage === "undefined") ||
      !lessonId
    )
      return;
    try {
      localStorage.removeItem(`${DRAFT_PREFIX}${lessonId}`);
    } catch (e) {
      console.warn("Failed to clear draft from localStorage:", e);
    }
  },

  hasDraft(lessonId: string): boolean {
    if (
      (typeof window === "undefined" && typeof localStorage === "undefined") ||
      !lessonId
    )
      return false;
    try {
      return localStorage.getItem(`${DRAFT_PREFIX}${lessonId}`) !== null;
    } catch {
      return false;
    }
  },
};
