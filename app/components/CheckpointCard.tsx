import React, { useState, useEffect } from "react";
import type { QuizCheckpoint } from "../types/lesson";
import { MarkdownContent } from "./MarkdownContent";
import styles from "./CheckpointCard.module.css";

interface CheckpointCardProps {
  checkpoint: QuizCheckpoint;
  onAnswerSelected?: (optionId: string, isCorrect: boolean) => void;
  selectedOptionId?: string;
}

export const CheckpointCard: React.FC<CheckpointCardProps> = ({
  checkpoint,
  onAnswerSelected,
  selectedOptionId: propSelectedId,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    propSelectedId || null,
  );

  useEffect(() => {
    if (propSelectedId) {
      setSelectedId(propSelectedId);
    }
  }, [propSelectedId]);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    if (selectedId) return; // already answered
    setSelectedId(optionId);
    if (onAnswerSelected) {
      onAnswerSelected(optionId, isCorrect);
    }
  };

  const hasAnswered = selectedId !== null;

  return (
    <article
      className={styles.checkpointContainer}
      aria-label="Comprehension Checkpoint"
    >
      <div className={styles.badge} aria-hidden="true">
        <span>💡</span> Active Comprehension Check
      </div>

      <div className={styles.questionWrapper}>
        <MarkdownContent content={checkpoint.question} />
      </div>

      <div
        className={styles.optionsList}
        role="radiogroup"
        aria-label="Answer options"
      >
        {checkpoint.options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const letters = ["A", "B", "C", "D"];
          const letter = letters[index] || `${index + 1}`;

          let buttonClass = styles.optionBtn;
          let statusLabel = "";

          if (hasAnswered) {
            if (option.isCorrect) {
              buttonClass += ` ${styles.optionCorrect}`;
              statusLabel = "Correct";
            } else if (isSelected && !option.isCorrect) {
              buttonClass += ` ${styles.optionIncorrect}`;
              statusLabel = "Incorrect";
            } else {
              buttonClass += ` ${styles.optionDimmed}`;
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id, option.isCorrect)}
              disabled={hasAnswered}
              className={buttonClass}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${letter}: ${option.text}${statusLabel ? ` (${statusLabel})` : ""}`}
            >
              <div className={styles.optionIndicator} aria-hidden="true">
                {hasAnswered
                  ? option.isCorrect
                    ? "✓"
                    : isSelected
                      ? "✕"
                      : letter
                  : letter}
              </div>

              <div className={styles.optionText}>{option.text}</div>

              {hasAnswered && statusLabel && (
                <span
                  className={`${styles.statusTag} ${
                    option.isCorrect ? styles.tagCorrect : styles.tagIncorrect
                  }`}
                  aria-hidden="true"
                >
                  {option.isCorrect ? "✓ Correct" : "✕ Your Choice"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div
          className={styles.explanationBox}
          role="region"
          aria-live="polite"
          aria-label="Answer explanation"
        >
          <div className={styles.explanationHeader}>
            <span aria-hidden="true">📖</span> Source-Grounded Explanation
          </div>
          <MarkdownContent content={checkpoint.explanation} />
        </div>
      )}
    </article>
  );
};
