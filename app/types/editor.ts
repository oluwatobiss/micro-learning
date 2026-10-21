import type { Lesson, LessonCard } from "./lesson";
import type { Slice4HandoffPayload } from "./generator";

export type EditorViewMode = "split" | "edit-only" | "preview-only";
export type MobileTab = "edit" | "preview";

export interface CardValidationError {
  cardId: string;
  field: "title" | "content" | "checkpoint" | "media";
  message: string;
}

export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  cardErrors: Record<string, string[]>;
}

export interface CardDeckEditorProps {
  initialPayload: Slice4HandoffPayload;
  onSave?: (savedLesson: Lesson) => void;
  onPublish?: (publishedLesson: Lesson) => void;
  onBack?: () => void;
  readOnly?: boolean;
}
