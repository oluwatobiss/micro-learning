import React, { useState } from "react";
import { Link } from "react-router";
import type { GenerationResult } from "../../types/generator";
import { storageService } from "../../services/storage";
import styles from "./GenerationResultReview.module.css";

interface GenerationResultReviewProps {
  result: GenerationResult;
  onCreateAnother: () => void;
}

export const GenerationResultReview: React.FC<GenerationResultReviewProps> = ({
  result,
  onCreateAnother,
}) => {
  const { lesson, qualityReport, sourceAnalysis } = result;
  const [isSaved, setIsSaved] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const handleSaveToReader = () => {
    storageService.saveLesson(lesson);
    setIsSaved(true);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lesson, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${lesson.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <section className={styles.heroCard} aria-labelledby="result-title">
        <div className={styles.heroHeader}>
          <div>
            <div className={styles.successBadge}>
              <span aria-hidden="true">?</span> Generation Complete &amp; Quality Verified
            </div>
            <h1 id="result-title" className={styles.lessonTitle}>{lesson.title}</h1>
            <p className={styles.attribution}>
              Synthesized from original material by <strong>{lesson.author}</strong>
              {lesson.sourceUrl && (
                <> ? <a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>Original Source ?</a></>
              )}
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Card Count</span>
            <span className={styles.statValue}>{lesson.cards.length} Cards</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Est. Read Time</span>
            <span className={styles.statValue}>{lesson.estimatedMinutes} min</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Source Words</span>
            <span className={styles.statValue}>{sourceAnalysis.totalWordCount.toLocaleString()}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Quality Score</span>
            <span className={styles.statValue} style={{ color: "var(--feedback-success)" }}>
              {qualityReport.groundingScore}%
            </span>
          </div>
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={handleSaveToReader}
            className={styles.primaryAction}
            id="save-preview-btn"
          >
            <span>{isSaved ? "Saved to Reader ?" : "Save Lesson to Reader"}</span>
          </button>
          {isSaved && (
            <Link
              to={`/lessons/${lesson.id}`}
              className={styles.primaryAction}
              style={{ backgroundColor: "var(--feedback-success)" }}
            >
              <span>Launch Reader Player ?</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleDownloadJson}
            className={styles.secondaryAction}
            id="download-json-btn"
          >
            <span>?? Export Lesson JSON</span>
          </button>
          <button
            type="button"
            onClick={onCreateAnother}
            className={styles.secondaryAction}
            id="create-another-btn"
          >
            <span>? Create Another Lesson</span>
          </button>
        </div>
      </section>

      {/* Stage 5 Quality Audit Section */}
      <section className={styles.sectionCard} aria-labelledby="quality-title">
        <div className={styles.sectionHeader}>
          <h2 id="quality-title" className={styles.sectionTitle}>
            <span aria-hidden="true">??</span> Stage 5 ? Deterministic Quality Audit
          </h2>
          <span className={styles.auditScore}>
            Passed {qualityReport.checksPassed.length} of {qualityReport.checksPassed.length} Checks
          </span>
        </div>
        <div className={styles.auditList}>
          {qualityReport.checksPassed.map((check, idx) => (
            <div key={idx} className={styles.auditItem}>
              <span className={styles.auditIcon} aria-hidden="true">?</span>
              <span>{check}</span>
            </div>
          ))}
          {qualityReport.warnings.length > 0 && (
            <div className={styles.auditItem} style={{ color: "var(--feedback-warning)" }}>
              <span style={{ fontWeight: 700 }}>?</span>
              <span>Audit Note: {qualityReport.warnings.join("; ")}</span>
            </div>
          )}
        </div>
      </section>

      {/* Card Deck Breakdown (Slice 3 Read-Only Inspection) */}
      <section className={styles.sectionCard} aria-labelledby="deck-title">
        <div className={styles.sectionHeader}>
          <h2 id="deck-title" className={styles.sectionTitle}>
            <span aria-hidden="true">??</span> Generated Lesson Card Deck ({lesson.cards.length} Cards)
          </h2>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Pedagogical progression: {lesson.cards.map(c => c.type).join(" ? ")}
          </span>
        </div>

        <div className={styles.cardList}>
          {lesson.cards.map((card, idx) => {
            const isExpanded = expandedCardId === card.id;
            return (
              <div key={card.id} className={styles.deckCard}>
                <div className={styles.deckCardHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      #{idx + 1}
                    </span>
                    <span className={styles.deckCardTitle}>{card.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className={styles.cardTypeBadge}>{card.type}</span>
                    {card.visualMedia && <span className={styles.cardTypeBadge}>diagram spec</span>}
                    {card.checkpoint && <span className={styles.cardTypeBadge}>checkpoint</span>}
                    <button
                      type="button"
                      onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--accent-primary)",
                        padding: "0.2rem 0.5rem",
                        fontWeight: 600
                      }}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Collapse ?" : "Inspect ?"}
                    </button>
                  </div>
                </div>

                {!isExpanded && (
                  <p className={styles.cardSnippet}>
                    {card.content.slice(0, 180)}...
                  </p>
                )}

                {isExpanded && (
                  <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8125rem",
                      whiteSpace: "pre-wrap",
                      padding: "0.75rem",
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-secondary)"
                    }}>
                      {card.content}
                    </div>

                    {card.checkpoint && (
                      <div className={styles.cardCheckDetails}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem" }}>
                          Check Question: {card.checkpoint.question}
                        </div>
                        {card.checkpoint.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`${styles.checkOption} ${opt.isCorrect ? styles.checkOptionCorrect : ""}`}
                          >
                            <span>{opt.isCorrect ? "? (Correct)" : "?"}</span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                        <div style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          Explanation: {card.checkpoint.explanation}
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
        <section className={styles.sectionCard} aria-labelledby="takeaways-title">
          <h2 id="takeaways-title" className={styles.sectionTitle} style={{ marginBottom: "1rem" }}>
            <span aria-hidden="true">??</span> Lesson Completion Takeaways ({lesson.keyTakeaways.length})
          </h2>
          <ul className={styles.takeawaysList}>
            {lesson.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className={styles.takeawayItem}>
                <span className={styles.takeawayBullet}>?</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Slice 4 Handoff Contract Card */}
      <section className={styles.handoffBanner} aria-labelledby="handoff-title">
        <div className={styles.handoffHeader}>
          <span className={styles.handoffBadge}>Handoff Contract</span>
          <h2 id="handoff-title" className={styles.handoffTitle}>
            Ready for Slice 4: Card Deck Editor
          </h2>
        </div>
        <p className={styles.handoffText}>
          Slice 3 successfully produced a fully structured, validated, and grounded <code>Lesson</code> object.
          The downstream Slice 4 Deck Editor consumes this typed payload without needing knowledge of generation internals or provider mechanics.
        </p>
        <pre className={styles.codeBlock}>
{`// Slice 4 Ingestion Contract
export interface Slice4HandoffPayload {
  lesson: Lesson;           // id: "${lesson.id}", ${lesson.cards.length} cards, schema v${lesson.version || 1}
  sourceAnalysis: SourceAnalysis; // ${sourceAnalysis.sections.length} sections, ${sourceAnalysis.keyTerms.length} terms
  qualityReport: QualityAuditReport; // Passed all ${qualityReport.checksPassed.length} checks (score: ${qualityReport.groundingScore}%)
  provider: "${result.provider}";
}`}
        </pre>
      </section>
    </div>
  );
};
