import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import type { Lesson } from '../types/lesson';
import { storageService } from '../services/storage';
import styles from './_index.module.css';

export default function IndexRoute() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    setLessons(storageService.getLessons());
  }, []);

  const featuredLesson = lessons[0];

  return (
    <div className={styles.container}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>Source-Grounded Micro-Learning</div>
        <h1 className={styles.title}>Turn Long-Form Knowledge Into Interactive Lessons</h1>
        <p className={styles.subtitle}>
          Transform books, essays, and articles into focused narrative cards with embedded comprehension checks. Built for deep retention without doomscrolling.
        </p>

        <div className={styles.actionRow}>
          {featuredLesson && (
            <Link to={`/lessons/${featuredLesson.id}`} className={styles.primaryBtn}>
              Play Featured Lesson →
            </Link>
          )}
          <Link to="/studio" className={styles.secondaryBtn}>
            Open Creator Studio ✨
          </Link>
        </div>
      </section>

      {/* Lesson Showcase Grid */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Available Micro-Lessons</h2>
          <span className={styles.sectionCount}>{lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} available</span>
        </div>

        <div className={styles.grid}>
          {lessons.map((lesson) => (
            <Link key={lesson.id} to={`/lessons/${lesson.id}`} className={styles.cardItem}>
              <div>
                <div className={styles.itemMeta}>
                  <span>{lesson.cards.length} Cards</span>
                  <span>{lesson.estimatedMinutes} min read</span>
                </div>
                <h3 className={styles.itemTitle}>{lesson.title}</h3>
                <p className={styles.itemSnippet}>{lesson.sourceSnippet}</p>
              </div>

              <div className={styles.itemFooter}>
                <span className={styles.authorName}>By {lesson.author}</span>
                <span>Start Lesson →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
