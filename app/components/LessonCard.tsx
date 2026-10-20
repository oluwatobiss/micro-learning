import React from "react";
import type { LessonCard as LessonCardType } from "../types/lesson";
import { MarkdownContent } from "./MarkdownContent";
import { InstructionalDiagram } from "./InstructionalDiagram";
import styles from "./LessonCard.module.css";

interface LessonCardProps {
  card: LessonCardType;
}

export const LessonCard: React.FC<LessonCardProps> = ({ card }) => {
  const getBadgeLabel = (type: string) => {
    switch (type) {
      case "comparison":
        return "Contrast & Comparison";
      case "example":
        return "Practical Case";
      default:
        return "Core Concept";
    }
  };

  // Determine if this card has an instructionally justified diagram
  const hasDiagram =
    card.visualSvg === "react-render-loop" || Boolean(card.visualSvg);

  return (
    <article className={styles.cardContainer} aria-label={card.title}>
      <div className={styles.typeBadge}>{getBadgeLabel(card.type)}</div>
      <h2 className={styles.title}>{card.title}</h2>

      <div className={styles.contentBody}>
        <MarkdownContent content={card.content} />
      </div>

      {hasDiagram && (
        <div className={styles.visualContainer}>
          <InstructionalDiagram
            diagramId={
              card.visualSvg === "react-render-loop"
                ? "react-render-loop"
                : "react-render-loop"
            }
          />
        </div>
      )}
    </article>
  );
};
