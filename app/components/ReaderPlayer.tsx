import React, { useState, useEffect, useCallback } from 'react';
import type { Lesson } from '../types/lesson';
import { LessonCard } from './LessonCard';
import { CheckpointCard } from './CheckpointCard';
import { LessonCompletion } from './LessonCompletion';
import styles from './ReaderPlayer.module.css';

interface ReaderPlayerProps {
  lesson: Lesson;
  onFinish?: () => void;
}

export const ReaderPlayer: React.FC<ReaderPlayerProps> = ({ lesson, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const totalCards = lesson.cards.length;
  const currentCard = lesson.cards[currentIndex];

  const isLastCard = currentIndex === totalCards - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalCards) * 100);

  // Check if current card requires an answer before advancing
  const isCurrentCardCheckpoint = currentCard?.type === 'checkpoint' && !!currentCard.checkpoint;
  const hasAnsweredCurrentCheckpoint = isCurrentCardCheckpoint 
    ? !!answeredCheckpoints[currentCard.id] 
    : true;

  const handleNext = useCallback(() => {
    if (!hasAnsweredCurrentCheckpoint) return;

    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (onFinish) {
        onFinish();
      }
    }
  }, [currentIndex, totalCards, hasAnsweredCurrentCheckpoint, onFinish]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnsweredCheckpoints({});
    setIsCompleted(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;
      if (e.key === 'ArrowRight' && hasAnsweredCurrentCheckpoint) {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, hasAnsweredCurrentCheckpoint, isCompleted]);

  if (isCompleted) {
    return (
      <div className={styles.playerWrapper}>
        <LessonCompletion lesson={lesson} onRestart={handleRestart} />
      </div>
    );
  }

  if (!currentCard) {
    return <div className={styles.playerWrapper}>Lesson has no cards.</div>;
  }

  return (
    <div className={styles.playerWrapper}>
      {/* Top Bar with Progress */}
      <div className={styles.topBar}>
        <div className={styles.metaRow}>
          <span>{lesson.title}</span>
          <span className={styles.stepCounter}>
            Card {currentIndex + 1} of {totalCards}
          </span>
        </div>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Main Card: Narrative Card or Checkpoint Card */}
      {isCurrentCardCheckpoint && currentCard.checkpoint ? (
        <CheckpointCard
          checkpoint={currentCard.checkpoint}
          onAnswerSelected={(_isCorrect) => {
            setAnsweredCheckpoints((prev) => ({
              ...prev,
              [currentCard.id]: true,
            }));
          }}
        />
      ) : (
        <LessonCard card={currentCard} />
      )}

      {/* Visible Bottom Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.btnGroup}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`${styles.navBtn} ${styles.prevBtn}`}
            aria-label="Previous card"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasAnsweredCurrentCheckpoint}
            className={`${styles.navBtn} ${styles.nextBtn}`}
            aria-label={isLastCard ? 'Complete lesson' : 'Next card'}
          >
            {isLastCard
              ? 'Complete Lesson ✓'
              : !hasAnsweredCurrentCheckpoint
              ? 'Select an answer to continue'
              : 'Next →'}
          </button>
        </div>

        {lesson.sourceUrl && (
          <a
            href={lesson.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            Original Source ↗
          </a>
        )}
      </div>
    </div>
  );
};
