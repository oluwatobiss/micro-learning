import type { Lesson, LessonCard, GenerationStageId } from "./lesson";
import type { InstructionalMediaSpec } from "./media";

export interface SourceInputData {
  title: string;
  author: string;
  sourceUrl: string;
  sourceText: string;
  permissionConfirmed: boolean;
}

export interface SourceValidationErrors {
  title?: string;
  author?: string;
  sourceUrl?: string;
  sourceText?: string;
  permissionConfirmed?: string;
}

export interface ExtractedSection {
  heading: string;
  body: string;
  codeSnippets: string[];
}

export interface ExtractedTerm {
  term: string;
  definition: string;
}

export interface ExtractedProcessStep {
  stepNumber: number;
  label: string;
  description: string;
}

export interface ExtractedComparison {
  conceptA: string;
  conceptB: string;
  contrasts: Array<{ aspect: string; valA: string; valB: string }>;
}

export interface SourceAnalysis {
  thesis: string;
  sections: ExtractedSection[];
  keyTerms: ExtractedTerm[];
  processSteps: ExtractedProcessStep[];
  comparisons: ExtractedComparison[];
  takeaways: string[];
  instructionalOpportunities: string[];
  totalWordCount: number;
}

export interface PlannedCard {
  id: string;
  type: "narrative" | "example" | "comparison" | "checkpoint";
  title: string;
  focus: string;
  hasCode?: boolean;
  hasVisualMedia?: boolean;
}

export interface LessonPlan {
  targetCardCount: number;
  estimatedMinutes: number;
  cardOutlines: PlannedCard[];
}

export interface QualityAuditReport {
  isValid: boolean;
  cardCount: number;
  checkpointCount: number;
  checksPassed: string[];
  warnings: string[];
  errors: string[];
  groundingScore: number;
  mediaValidation?: {
    valid: boolean;
    errors: string[];
  };
}

export type StageExecutionStatus = "pending" | "in-progress" | "complete" | "failed";

export interface StageState {
  id: GenerationStageId;
  label: string;
  description: string;
  status: StageExecutionStatus;
  message?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface GenerationProgressState {
  stages: Record<GenerationStageId, StageState>;
  currentStageId: GenerationStageId | null;
  overallStatus: "idle" | "generating" | "complete" | "failed";
  errorMessage?: string;
}

export interface GenerationResult {
  lesson: Lesson;
  sourceAnalysis: SourceAnalysis;
  qualityReport: QualityAuditReport;
  generatedAt: string;
  provider: "grounded-adaptive-engine" | "gemini-ai";
}
