import React from "react";
import type {
  GenerationProgressState,
  StageExecutionStatus,
} from "../../types/generator";
import type { GenerationStageId } from "../../types/lesson";
import styles from "./GenerationProgressOverlay.module.css";

interface GenerationProgressOverlayProps {
  progress: GenerationProgressState;
  onRetry?: () => void;
  onCancel?: () => void;
}

interface StageDefinition {
  id: GenerationStageId;
  stepNumber: number;
  label: string;
  defaultDescription: string;
}

const STAGES: StageDefinition[] = [
  {
    id: "understanding",
    stepNumber: 1,
    label: "Stage 1 — Understanding Source",
    defaultDescription:
      "Extracting thesis, terminology, code patterns, and relationships from source.",
  },
  {
    id: "planning",
    stepNumber: 2,
    label: "Stage 2 — Planning Lesson",
    defaultDescription:
      "Formulating adaptive 4–8 card pedagogical progression.",
  },
  {
    id: "cards",
    stepNumber: 3,
    label: "Stage 3 — Creating Cards",
    defaultDescription:
      "Drafting grounded narrative cards, code blocks, and structured diagrams.",
  },
  {
    id: "checks",
    stepNumber: 4,
    label: "Stage 4 — Creating Checks",
    defaultDescription:
      "Formulating grounded comprehension checkpoints with distractors and explanations.",
  },
  {
    id: "quality",
    stepNumber: 5,
    label: "Stage 5 — Checking Quality",
    defaultDescription:
      "Verifying schema integrity, media specifications, and pedagogical balance.",
  },
];

export const GenerationProgressOverlay: React.FC<
  GenerationProgressOverlayProps
> = ({ progress, onRetry, onCancel }) => {
  const getStatusBadge = (status: StageExecutionStatus) => {
    switch (status) {
      case "in-progress":
        return (
          <span
            className={`${styles.stageStatusBadge} ${styles.statusInProgress}`}
          >
            In Progress
          </span>
        );
      case "complete":
        return (
          <span
            className={`${styles.stageStatusBadge} ${styles.statusCompleted}`}
          >
            Completed
          </span>
        );
      case "failed":
        return (
          <span className={`${styles.stageStatusBadge} ${styles.statusFailed}`}>
            Failed
          </span>
        );
      default:
        return (
          <span
            className={`${styles.stageStatusBadge} ${styles.statusPending}`}
          >
            Pending
          </span>
        );
    }
  };

  const renderIndicatorContent = (
    stepNumber: number,
    status: StageExecutionStatus,
  ) => {
    if (status === "complete") {
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
        </svg>
      );
    }
    if (status === "failed") {
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="8" y1="4" x2="8" y2="9" />
          <line x1="8" y1="12" x2="8.01" y2="12" />
        </svg>
      );
    }
    if (status === "in-progress") {
      return <span aria-hidden="true">●</span>;
    }
    return stepNumber;
  };

  return (
    <div
      className={styles.overlay}
      role="region"
      aria-label="Generation Progress"
    >
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.badge} aria-hidden="true">
            Real-Time Adaptive Pipeline
          </div>
          <h2 className={styles.title}>Synthesizing Interactive Lesson</h2>
          <p className={styles.subtitle}>
            Analyzing your source text through 5 truthful generation stages.
            Each stage executes real parsing and validation operations.
          </p>
        </header>

        <div className={styles.stageList} role="status" aria-live="polite">
          {STAGES.map((def) => {
            const stageState = progress.stages[def.id];
            const status: StageExecutionStatus =
              stageState?.status || "pending";
            const message = stageState?.message || def.defaultDescription;
            const isActive = status === "in-progress";
            const isCompleted = status === "complete";
            const isFailed = status === "failed";

            return (
              <div
                key={def.id}
                className={`
                  ${styles.stageItem}
                  ${isActive ? styles.stageItemActive : ""}
                  ${isCompleted ? styles.stageItemCompleted : ""}
                  ${isFailed ? styles.stageItemFailed : ""}
                `}
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className={`
                    ${styles.indicator}
                    ${isActive ? styles.indicatorActive : ""}
                    ${isCompleted ? styles.indicatorCompleted : ""}
                    ${isFailed ? styles.indicatorFailed : ""}
                  `}
                  aria-hidden="true"
                >
                  {renderIndicatorContent(def.stepNumber, status)}
                </div>

                <div className={styles.stageContent}>
                  <div className={styles.stageHeader}>
                    <span className={styles.stageName}>{def.label}</span>
                    {getStatusBadge(status)}
                  </div>
                  <p className={styles.stageMessage}>{message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {progress.errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <div className={styles.errorHeader}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="7" />
                <line x1="8" y1="5" x2="8" y2="9" />
                <line x1="8" y1="12" x2="8.01" y2="12" />
              </svg>
              <span>Generation Error Encountered</span>
            </div>
            <p className={styles.errorBody}>{progress.errorMessage}</p>
            <div className={styles.errorActions}>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={styles.retryButton}
                >
                  Retry Generation
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className={styles.cancelButton}
                >
                  Back to Source Input
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
