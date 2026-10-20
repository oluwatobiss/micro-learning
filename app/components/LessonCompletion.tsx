import React from 'react';
import { Link } from 'react-router';
import type { Lesson } from '../types/lesson';
import styles from './LessonCompletion.module.css';

interface LessonCompletionProps {
  lesson: Lesson;
  onRestart: () => void;
}

export const LessonCompletion: React.FC<LessonCompletionProps> = ({ lesson, onRestart }) => {
  return (
    <div className={styles.container}>
      <div className={styles.celebrationBadge}>✓</div>

      <h1 className={styles.title}>Lesson Completed!</h1>
      <p className={styles.subtitle}>
        You successfully walked through the core narrative and actively verified your understanding.
      </p>

      <div className={styles.recapBox}>
        <div className={styles.recapHeader}>Core Takeaway Recap</div>
        <p className={styles.recapText}>{lesson.sourceSnippet}</p>
      </div>

      <div className={styles.actions}>
        <Link to="/" className={styles.primaryBtn}>
          Explore Other Lessons →
        </Link>
        <button type="button" onClick={onRestart} className={styles.secondaryBtn}>
          Restart Lesson ↺
        </button>
      </div>

      {lesson.sourceUrl && (
        <div className={styles.sourceBox}>
          Grounded in original writing by {lesson.author}:{' '}
          <a
            href={lesson.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            Read Original Full-Length Piece ↗
          </a>
        </div>
      )}
    </div>
  );
};
