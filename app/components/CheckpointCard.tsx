import React, { useState } from 'react';
import type { QuizCheckpoint } from '../types/lesson';
import styles from './CheckpointCard.module.css';

interface CheckpointCardProps {
  checkpoint: QuizCheckpoint;
  onAnswerSelected?: (isCorrect: boolean) => void;
  selectedOptionId?: string;
}

export const CheckpointCard: React.FC<CheckpointCardProps> = ({
  checkpoint,
  onAnswerSelected,
  selectedOptionId: initialSelectedId,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    if (selectedId) return; // already answered
    setSelectedId(optionId);
    if (onAnswerSelected) {
      onAnswerSelected(isCorrect);
    }
  };

  const hasAnswered = selectedId !== null;

  return (
    <article className={styles.checkpointContainer} aria-label="Comprehension Checkpoint">
      <div>
        <div className={styles.badge}>
          <span>💡</span> Active Comprehension Check
        </div>

        <h2 className={styles.question}>{checkpoint.question}</h2>

        <div className={styles.optionsList} role="radiogroup">
          {checkpoint.options.map((option, index) => {
            const isSelected = selectedId === option.id;
            const letters = ['A', 'B', 'C', 'D'];
            const letter = letters[index] || `${index + 1}`;

            let buttonClass = styles.optionBtn;
            if (hasAnswered) {
              if (option.isCorrect) {
                buttonClass += ` ${styles.optionCorrect}`;
              } else if (isSelected && !option.isCorrect) {
                buttonClass += ` ${styles.optionIncorrect}`;
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
              >
                <div className={styles.optionIndicator}>
                  {hasAnswered ? (option.isCorrect ? '✓' : isSelected ? '✕' : letter) : letter}
                </div>
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className={styles.explanationBox}>
            <div className={styles.explanationHeader}>
              <span>📖</span> Source-Grounded Explanation
            </div>
            <p className={styles.explanationText}>{checkpoint.explanation}</p>
          </div>
        )}
      </div>
    </article>
  );
};
