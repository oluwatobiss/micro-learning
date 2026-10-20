import React, { useState, useEffect, useCallback } from "react";
import type { Lesson } from "../types/lesson";
import { LessonCard } from "./LessonCard";
import { CheckpointCard } from "./CheckpointCard";
import { LessonCompletion } from "./LessonCompletion";
import { progressService } from "../services/progress";
import styles from "./ReaderPlayer.module.css";

interface ReaderPlayerProps {
  lesson: Lesson;
  onFinish?: () => void;
}

export const ReaderPlayer: React.FC<ReaderPlayerProps> = ({
  lesson,
  onFinish,
}) => {
  const totalCards = lesson.cards.length;

  // Initialize state from persisted progress if valid
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = progressService.getProgress(
      lesson.id,
      lesson.version,
      totalCards,
    );
    return saved ? saved.currentCardIndex : 0;
  });

  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<
    Record<string, string>
  >(() => {
    const saved = progressService.getProgress(
      lesson.id,
      lesson.version,
      totalCards,
    );
    return saved ? saved.selectedAnswers : {};
  });

  const [isCompletedState, setIsCompletedState] = useState(() => {
    const saved = progressService.getProgress(
      lesson.id,
      lesson.version,
      totalCards,
    );
    return saved ? saved.isCompleted : false;
  });

  const [isViewingCompletion, setIsViewingCompletion] = useState(false);

  // Sync index changes to storage
  useEffect(() => {
    progressService.setCardIndex(lesson.id, lesson.version, currentIndex);
  }, [lesson.id, lesson.version, currentIndex]);

  const currentCard = lesson.cards[currentIndex];
  const isLastCard = currentIndex === totalCards - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalCards) * 100);

  // Checkpoint validation
  const isCurrentCardCheckpoint =
    currentCard?.type === "checkpoint" && Boolean(currentCard.checkpoint);
  const selectedOptionForCurrentCard = isCurrentCardCheckpoint
    ? answeredCheckpoints[currentCard.id]
    : undefined;
  const hasAnsweredCurrentCheckpoint = isCurrentCardCheckpoint
    ? Boolean(selectedOptionForCurrentCard)
    : true;

  const handleNext = useCallback(() => {
    if (!hasAnsweredCurrentCheckpoint) return;

    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      progressService.markCompleted(lesson.id, lesson.version);
      setIsCompletedState(true);
      setIsViewingCompletion(true);
      if (onFinish) {
        onFinish();
      }
    }
  }, [
    currentIndex,
    totalCards,
    hasAnsweredCurrentCheckpoint,
    lesson.id,
    lesson.version,
    onFinish,
  ]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleAnswerSelected = (optionId: string, _isCorrect: boolean) => {
    if (!currentCard) return;
    setAnsweredCheckpoints((prev) => ({
      ...prev,
      [currentCard.id]: optionId,
    }));
    progressService.recordAnswer(
      lesson.id,
      lesson.version,
      currentCard.id,
      optionId,
    );
  };

  const handleRestart = () => {
    progressService.resetProgress(lesson.id, lesson.version);
    setCurrentIndex(0);
    setAnsweredCheckpoints({});
    setIsCompletedState(false);
    setIsViewingCompletion(false);
  };

  const handleRevisit = () => {
    setIsViewingCompletion(false);
    setCurrentIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isViewingCompletion) return;
      if (e.key === "ArrowRight" && hasAnsweredCurrentCheckpoint) {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleNext,
    handlePrev,
    hasAnsweredCurrentCheckpoint,
    isViewingCompletion,
  ]);

  if (isViewingCompletion) {
    return (
      <div className={styles.playerWrapper}>
        <LessonCompletion
          lesson={lesson}
          onRevisit={handleRevisit}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  if (!currentCard) {
    return <div className={styles.playerWrapper}>Lesson has no cards.</div>;
  }

  return (
    <div
      className={styles.playerWrapper}
      role="region"
      aria-label={`Lesson: ${lesson.title}`}
    >
      {/* If already completed in past session, show subtle banner with option to jump to summary */}
      {isCompletedState && !isViewingCompletion && (
        <aside
          className={styles.completedBanner}
          aria-label="Completion status"
        >
          <span>✓ You previously completed this lesson</span>
          <button
            type="button"
            onClick={() => setIsViewingCompletion(true)}
            className={styles.viewRecapBtn}
          >
            View Completion Summary →
          </button>
        </aside>
      )}

      {/* Top Bar with Progress */}
      <div className={styles.topBar}>
        <div className={styles.metaRow}>
          <span className={styles.lessonTitle} title={lesson.title}>
            {lesson.title}
          </span>
          <span
            className={styles.stepCounter}
            aria-label={`Card ${currentIndex + 1} of ${totalCards}`}
          >
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
            aria-label="Lesson reading progress"
          />
        </div>
      </div>

      {/* Main Card: Narrative Card or Checkpoint Card */}
      {isCurrentCardCheckpoint && currentCard.checkpoint ? (
        <CheckpointCard
          checkpoint={currentCard.checkpoint}
          selectedOptionId={selectedOptionForCurrentCard}
          onAnswerSelected={handleAnswerSelected}
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
            className={`${styles.navBtn} ${styles.nextBtn} ${
              !hasAnsweredCurrentCheckpoint ? styles.nextBtnDisabled : ""
            }`}
            aria-label={
              isLastCard
                ? "Complete lesson"
                : !hasAnsweredCurrentCheckpoint
                  ? "Select an answer to continue"
                  : "Next card"
            }
          >
            {isLastCard
              ? "Complete Lesson ✓"
              : !hasAnsweredCurrentCheckpoint
                ? "Select answer to continue"
                : "Next →"}
          </button>
        </div>

        {lesson.sourceUrl && (
          <a
            href={lesson.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
            aria-label={`View original source by ${lesson.author} in a new tab`}
          >
            Original Source ↗
          </a>
        )}
      </div>
    </div>
  );
};
