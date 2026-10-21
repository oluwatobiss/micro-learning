import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { GenerationResult } from "../../types/generator";
import { storageService } from "../../services/storage";
import { MarkdownContent } from "../MarkdownContent";
import styles from "./GenerationResultReview.module.css";

interface GenerationResultReviewProps {
  result: GenerationResult;
  onCreateAnother: () => void;
  onOpenEditor?: () => void;
}

function stripMarkdownPreview(text: string, maxLength = 160): string {
  const stripped = text
    .replace(/```[\s\S]*?```/g, "[Code demonstration]")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#+\s+/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trim() + "...";
}

export const GenerationResultReview: React.FC<GenerationResultReviewProps> = ({
  result,
  onCreateAnother,
  onOpenEditor,
}) => {
  const navigate = useNavigate();
  const { lesson, qualityReport, sourceAnalysis } = result;
  const [isSaved, setIsSaved] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const totalChecks = qualityReport.totalChecksCount || 7;
  const passedCount = qualityReport.checksPassed.length;

  const handleSaveToReader = () => {
    storageService.saveLesson(lesson);
    setIsSaved(true);
  };

  const handleDownloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(lesson, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${lesson.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleOpenEditor = () => {
    storageService.saveLesson(lesson);
    if (onOpenEditor) {
      onOpenEditor();
    } else {
      navigate(`/editor/${lesson.id}`);
    }
  };

  const getCardTypeLabel = (type: string, hasVisual?: boolean) => {
    if (type === "checkpoint") return "Checkpoint";
    if (hasVisual) return "Interactive Diagram";
    if (type === "example") return "Code Example";
    if (type === "comparison") return "Comparison";
    return "Narrative";
  };

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <section className={styles.heroCard} aria-labelledby="result-title">
        <div className={styles.heroHeader}>
          <div>
            <div className={styles.successBadge}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
              </svg>
              <span>Lesson generated successfully</span>
            </div>
            <h1 id="result-title" className={styles.lessonTitle}>
              {lesson.title}
            </h1>
            <p className={styles.attribution}>
              Synthesized from original material by{" "}
              <strong>{lesson.author}</strong>
              {lesson.sourceUrl && (
                <>
                  {" • "}
                  <a
                    href={lesson.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sourceLink}
                  >
                    <span>Original Source</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Card Count</span>
            <span className={styles.statValue}>
              {lesson.cards.length} Cards
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Est. Read Time</span>
            <span className={styles.statValue}>
              {lesson.estimatedMinutes} min
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Source Words</span>
            <span className={styles.statValue}>
              {sourceAnalysis.totalWordCount.toLocaleString()}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Quality Status</span>
            <span
              className={styles.statValue}
              style={{ color: "var(--feedback-success)" }}
            >
              {passedCount}/{totalChecks} Checks
            </span>
            <span className={styles.statSubtext}>
              Deterministic verification
            </span>
          </div>
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={handleOpenEditor}
            className={styles.primaryAction}
            id="open-editor-btn"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Open Card Editor ✏️</span>
          </button>
          <button
            type="button"
            onClick={handleSaveToReader}
            className={styles.primaryAction}
            id="save-preview-btn"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>
              {isSaved ? "Saved to Reader ✓" : "Save Lesson to Reader"}
            </span>
          </button>
          {isSaved && (
            <Link
              to={`/lessons/${lesson.id}`}
              className={styles.primaryAction}
              style={{ backgroundColor: "var(--feedback-success)" }}
            >
              <span>Launch Reader Player →</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleDownloadJson}
            className={styles.secondaryAction}
            id="download-json-btn"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Lesson JSON</span>
          </button>
          <button
            type="button"
            onClick={onCreateAnother}
            className={styles.secondaryAction}
            id="create-another-btn"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Create Another Lesson</span>
          </button>
        </div>
      </section>

      {/* Stage 5 Quality Audit Section */}
      <section className={styles.sectionCard} aria-labelledby="quality-title">
        <div className={styles.sectionHeader}>
          <h2 id="quality-title" className={styles.sectionTitle}>
            <span>Stage 5 — Deterministic Quality Audit</span>
          </h2>
          <span className={styles.auditScore}>
            Passed {passedCount} of {totalChecks} Checks
          </span>
        </div>
        <div className={styles.auditList}>
          {qualityReport.checksPassed.map((check, idx) => (
            <div key={idx} className={styles.auditItem}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.auditIconPass}
                aria-hidden="true"
              >
                <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
              </svg>
              <span>{check}</span>
            </div>
          ))}
          {qualityReport.warnings.map((warn, idx) => (
            <div
              key={`warn-${idx}`}
              className={styles.auditItem}
              style={{ color: "var(--feedback-warning)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.auditIconWarn}
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="7" />
                <line x1="8" y1="5" x2="8" y2="9" />
                <line x1="8" y1="12" x2="8.01" y2="12" />
              </svg>
              <span>Audit Note: {warn}</span>
            </div>
          ))}
          {qualityReport.errors.map((err, idx) => (
            <div
              key={`err-${idx}`}
              className={styles.auditItem}
              style={{ color: "var(--feedback-danger)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
              <span>Audit Failure: {err}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Card Deck Breakdown */}
      <section className={styles.sectionCard} aria-labelledby="deck-title">
        <div className={styles.sectionHeader}>
          <h2 id="deck-title" className={styles.sectionTitle}>
            <span>
              Generated Lesson Card Deck ({lesson.cards.length} Cards)
            </span>
          </h2>
        </div>

        {/* Pedagogical flow */}
        <div className={styles.progressionBar}>
          <span className={styles.progressionLabel}>Pedagogical flow:</span>
          <div className={styles.progressionSteps}>
            {lesson.cards.map((c, idx) => (
              <React.Fragment key={c.id}>
                <span className={styles.progressionPill}>
                  {getCardTypeLabel(c.type, Boolean(c.visualMedia))}
                </span>
                {idx < lesson.cards.length - 1 && (
                  <span className={styles.progressionArrow} aria-hidden="true">
                    →
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className={styles.cardList}>
          {lesson.cards.map((card, idx) => {
            const isExpanded = expandedCardId === card.id;
            const badgeLabel = getCardTypeLabel(
              card.type,
              Boolean(card.visualMedia),
            );

            return (
              <div key={card.id} className={styles.deckCard}>
                <div className={styles.deckCardHeader}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        fontSize: "0.875rem",
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <span className={styles.deckCardTitle}>{card.title}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span className={styles.cardTypeBadge}>{badgeLabel}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCardId(isExpanded ? null : card.id)
                      }
                      className={styles.inspectBtn}
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? "Collapse" : "Inspect"}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {isExpanded ? (
                          <polyline points="18 15 12 9 6 15" />
                        ) : (
                          <polyline points="6 9 12 15 18 9" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {!isExpanded && (
                  <p className={styles.cardSnippet}>
                    {stripMarkdownPreview(card.content)}
                  </p>
                )}

                {isExpanded && (
                  <div className={styles.expandedContent}>
                    <MarkdownContent content={card.content} />

                    {card.checkpoint && (
                      <div className={styles.checkpointBox}>
                        <div className={styles.checkpointQuestion}>
                          Check Question: {card.checkpoint.question}
                        </div>
                        {card.checkpoint.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`${styles.checkOption} ${opt.isCorrect ? styles.checkOptionCorrect : ""}`}
                          >
                            {opt.isCorrect ? (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
                              </svg>
                            ) : (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                aria-hidden="true"
                              >
                                <circle cx="8" cy="8" r="6" />
                              </svg>
                            )}
                            <span>
                              {opt.text} {opt.isCorrect ? "(Correct)" : ""}
                            </span>
                          </div>
                        ))}
                        <div className={styles.checkpointExplanation}>
                          <strong>Explanation:</strong>
                          <MarkdownContent
                            content={card.checkpoint.explanation}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Completion Takeaways */}
      {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
        <section
          className={styles.sectionCard}
          aria-labelledby="takeaways-title"
        >
          <h2
            id="takeaways-title"
            className={styles.sectionTitle}
            style={{ marginBottom: "1rem" }}
          >
            <span>
              Lesson Completion Takeaways ({lesson.keyTakeaways.length})
            </span>
          </h2>
          <ul className={styles.takeawaysList}>
            {lesson.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className={styles.takeawayItem}>
                <span className={styles.takeawayBullet} aria-hidden="true">
                  •
                </span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Next Step: Customize Lesson */}
      <section
        className={styles.handoffBanner}
        aria-labelledby="customize-title"
      >
        <div className={styles.handoffHeader}>
          <span className={styles.handoffBadge}>Next Step</span>
          <h2 id="customize-title" className={styles.handoffTitle}>
            Your lesson is ready to customize
          </h2>
        </div>
        <p className={styles.handoffText}>
          Review your lesson cards, refine the content, and preview the reading
          experience before saving it to your lesson library.
        </p>
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleOpenEditor}
            className={styles.primaryAction}
            id="handoff-open-editor-btn"
          >
            <span>Open Card Editor →</span>
          </button>
        </div>
      </section>
    </div>
  );
};
