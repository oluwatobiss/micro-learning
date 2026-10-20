import React, { useState, useEffect, useCallback } from 'react';
import type { Lesson } from '../types/lesson';
import { LessonCard } from './LessonCard';
import styles from './ReaderPlayer.module.css';

interface ReaderPlayerProps {
  lesson: Lesson;
  onFinish?: () => void;
}

export const ReaderPlayer: React.FC<ReaderPlayerProps> = ({ lesson, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const totalCards = lesson.cards.length;
  const currentCard = lesson.cards[currentIndex];

  const isLastCard = currentIndex === totalCards - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalCards) * 100);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onFinish) {
      onFinish();
    }
  }, [currentIndex, totalCards, onFinish]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

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

      {/* Main Card */}
      <LessonCard card={currentCard} />

      {/* Visible Bottom Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.btnGroup}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`${styles.navBtn} ${styles.prevBtn}`}
            aria-label="Previous card"
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            className={`${styles.navBtn} ${styles.nextBtn}`}
            aria-label={isLastCard ? 'Complete lesson' : 'Next card'}
          >
            {isLastCard ? 'Complete Lesson ✓' : 'Next →'}
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
