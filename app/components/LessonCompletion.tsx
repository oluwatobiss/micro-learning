import React from "react";
import { Link } from "react-router";
import type { Lesson } from "../types/lesson";
import styles from "./LessonCompletion.module.css";

interface LessonCompletionProps {
  lesson: Lesson;
  onRevisit: () => void;
  onRestart: () => void;
}

export const LessonCompletion: React.FC<LessonCompletionProps> = ({
  lesson,
  onRevisit,
  onRestart,
}) => {
  const takeaways =
    lesson.keyTakeaways && lesson.keyTakeaways.length > 0
      ? lesson.keyTakeaways
      : [lesson.sourceSnippet];

  return (
    <div
      className={styles.container}
      role="region"
      aria-label="Lesson Completion Summary"
    >
      <div className={styles.celebrationBadge} aria-hidden="true">
        ✓
      </div>

      <h1 className={styles.title}>Lesson Completed!</h1>
      <div className={styles.lessonTitleRecap}>{lesson.title}</div>

      <p className={styles.subtitle}>
        You successfully walked through the core narrative, completed the active
        comprehension checks, and verified your mental model.
      </p>

      <div className={styles.recapBox}>
        <div className={styles.recapHeader}>
          <span aria-hidden="true">📌</span> Key Takeaways
        </div>
        <ul className={styles.takeawayList}>
          {takeaways.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <Link to="/" className={styles.primaryBtn}>
          Explore Available Lessons →
        </Link>
        <button
          type="button"
          onClick={onRevisit}
          className={styles.secondaryBtn}
        >
          Review Lesson Cards ↺
        </button>
      </div>

      <div className={styles.linksRow}>
        {lesson.feedbackUrl && (
          <a
            href={lesson.feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkItem}
          >
            💬 Share Feedback on this Lesson
          </a>
        )}

        {lesson.sourceUrl && (
          <a
            href={lesson.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkItem}
          >
            Original Source by {lesson.author} ↗
          </a>
        )}
      </div>
    </div>
  );
};
