import React from 'react';
import type { LessonCard as LessonCardType } from '../types/lesson';
import styles from './LessonCard.module.css';

interface LessonCardProps {
  card: LessonCardType;
}

export const LessonCard: React.FC<LessonCardProps> = ({ card }) => {
  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'comparison':
        return 'Contrast & Comparison';
      case 'example':
        return 'Practical Case';
      default:
        return 'Core Concept';
    }
  };

  return (
    <article className={styles.cardContainer} aria-label={card.title}>
      <div>
        <div className={styles.typeBadge}>{getBadgeLabel(card.type)}</div>
        <h2 className={styles.title}>{card.title}</h2>
        <div className={styles.content}>{card.content}</div>
      </div>

      {card.visualSvg && (
        <div 
          className={styles.visualBox} 
          dangerouslySetInnerHTML={{ __html: card.visualSvg }} 
          aria-label="Concept diagram" 
        />
      )}
    </article>
  );
};
