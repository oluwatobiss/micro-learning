export type ThemeMode = "clean-light" | "focused-dark" | "warm-editorial";

export type CardType = "narrative" | "example" | "comparison" | "checkpoint";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizCheckpoint {
  question: string;
  options: QuizOption[];
  explanation: string;
  sourceExcerpt?: string;
}

export interface LessonCard {
  id: string;
  type: CardType;
  title: string;
  content: string; // Markdown formatted
  isLocked?: boolean;
  visualSvg?: string; // Optional accessible concept diagram
  checkpoint?: QuizCheckpoint; // Present if type === 'checkpoint'
}

export interface Lesson {
  id: string;
  version: number; // For compatibility and cache invalidation
  title: string;
  author: string;
  sourceUrl: string;
  sourceSnippet: string;
  keyTakeaways?: string[]; // Essential bullet takeaways for completion
  feedbackUrl?: string; // Configurable feedback URL
  estimatedMinutes: number;
  createdAt: string;
  cards: LessonCard[];
}

export interface LessonProgress {
  lessonId: string;
  version: number;
  currentCardIndex: number;
  selectedAnswers: Record<string, string>; // cardId -> selected optionId
  isCompleted: boolean;
  completedAt?: string;
  lastUpdatedAt: string;
}

export type GenerationStageId =
  "understanding" | "planning" | "cards" | "checks" | "quality" | "ready";

export interface GenerationStage {
  id: GenerationStageId;
  label: string;
  status: "pending" | "in-progress" | "complete" | "failed";
}
