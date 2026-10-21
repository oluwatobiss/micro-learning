import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import type {
  Lesson,
  LessonCard,
  QuizCheckpoint,
  QuizOption,
  CardType,
} from "../../types/lesson";
import type { CardDeckEditorProps } from "../../types/editor";
import { storageService } from "../../services/storage.ts";
import { draftService } from "../../services/draft.ts";
import {
  validateEditedLesson,
  recalculateEstimatedMinutes,
} from "../../utils/editorValidation.ts";
import { LessonCard as LessonCardComponent } from "../LessonCard";
import { CheckpointCard as CheckpointCardComponent } from "../CheckpointCard";
import { countWords } from "../../utils/text.ts";
import styles from "./CardDeckEditor.module.css";

type MobileTab = "cards" | "edit" | "preview";

export const CardDeckEditor: React.FC<CardDeckEditorProps> = ({
  initialPayload,
  onSave,
  onPublish,
  onBack,
  readOnly = false,
}) => {
  const navigate = useNavigate();

  // Initialize lesson from draft if available, otherwise from payload
  const [lesson, setLesson] = useState<Lesson>(() => {
    const draft = draftService.getDraft(initialPayload.lesson.id);
    if (draft && draft.cards && draft.cards.length > 0) {
      return draft;
    }
    return JSON.parse(JSON.stringify(initialPayload.lesson));
  });

  const [selectedCardId, setSelectedCardId] = useState<string>(() => {
    return lesson.cards[0]?.id || "";
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(() => {
    return draftService.hasDraft(initialPayload.lesson.id);
  });

  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [undoDeletedCard, setUndoDeletedCard] = useState<{
    card: LessonCard;
    index: number;
  } | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");
  const [showValidationErrors, setShowValidationErrors] =
    useState<boolean>(false);

  // Compute validation
  const validation = useMemo(() => {
    return validateEditedLesson(lesson);
  }, [lesson]);

  // Recalculate read time
  const estimatedReadTime = useMemo(() => {
    return recalculateEstimatedMinutes(lesson.cards);
  }, [lesson.cards]);

  // Auto-sync read time
  useEffect(() => {
    if (lesson.estimatedMinutes !== estimatedReadTime) {
      setLesson((prev) => ({
        ...prev,
        estimatedMinutes: estimatedReadTime,
      }));
    }
  }, [estimatedReadTime, lesson.estimatedMinutes]);

  // Warn on page unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Persist draft on changes
  const applyLessonChange = useCallback((updated: Lesson) => {
    setLesson(updated);
    setHasUnsavedChanges(true);
    draftService.saveDraft(updated.id, updated);
  }, []);

  // Card selection
  const activeCardIndex = lesson.cards.findIndex(
    (c) => c.id === selectedCardId,
  );
  const activeCard: LessonCard | undefined =
    activeCardIndex >= 0 ? lesson.cards[activeCardIndex] : lesson.cards[0];

  useEffect(() => {
    if (!activeCard && lesson.cards.length > 0) {
      setSelectedCardId(lesson.cards[0].id);
    }
  }, [activeCard, lesson.cards]);

  // Lesson-level metadata change
  const handleTitleChange = (newTitle: string) => {
    applyLessonChange({
      ...lesson,
      title: newTitle,
    });
  };

  // Card field update
  const handleCardFieldChange = <K extends keyof LessonCard>(
    field: K,
    value: LessonCard[K],
  ) => {
    if (!activeCard || (activeCard.isLocked && field !== "isLocked")) return;

    const updatedCards = [...lesson.cards];
    updatedCards[activeCardIndex] = {
      ...activeCard,
      [field]: value,
    };

    applyLessonChange({
      ...lesson,
      cards: updatedCards,
    });
  };

  // Toggle card type
  const handleCardTypeChange = (newType: CardType) => {
    if (!activeCard || activeCard.isLocked) return;

    const updatedCards = [...lesson.cards];
    let checkpointData: QuizCheckpoint | undefined = activeCard.checkpoint;

    if (newType === "checkpoint" && !checkpointData) {
      checkpointData = {
        question: `What is the core takeaway of "${activeCard.title}"?`,
        options: [
          {
            id: `opt_${Date.now()}_1`,
            text: "Option A (Enter correct takeaway)",
            isCorrect: true,
          },
          {
            id: `opt_${Date.now()}_2`,
            text: "Option B (Enter plausible distractor)",
            isCorrect: false,
          },
        ],
        explanation: "Provide a clear explanation grounded in the lesson text.",
      };
    }

    updatedCards[activeCardIndex] = {
      ...activeCard,
      type: newType,
      checkpoint: checkpointData,
    };

    applyLessonChange({
      ...lesson,
      cards: updatedCards,
    });
  };

  // Checkpoint editing
  const handleCheckpointFieldChange = <K extends keyof QuizCheckpoint>(
    field: K,
    value: QuizCheckpoint[K],
  ) => {
    if (!activeCard || !activeCard.checkpoint || activeCard.isLocked) return;

    const updatedCheckpoint: QuizCheckpoint = {
      ...activeCard.checkpoint,
      [field]: value,
    };

    handleCardFieldChange("checkpoint", updatedCheckpoint);
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    if (!activeCard || !activeCard.checkpoint || activeCard.isLocked) return;

    const updatedOptions = activeCard.checkpoint.options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt,
    );

    handleCheckpointFieldChange("options", updatedOptions);
  };

  const handleSetCorrectOption = (correctOptionId: string) => {
    if (!activeCard || !activeCard.checkpoint || activeCard.isLocked) return;

    const updatedOptions = activeCard.checkpoint.options.map((opt) => ({
      ...opt,
      isCorrect: opt.id === correctOptionId,
    }));

    handleCheckpointFieldChange("options", updatedOptions);
  };

  const handleAddOption = () => {
    if (!activeCard || !activeCard.checkpoint || activeCard.isLocked) return;
    if (activeCard.checkpoint.options.length >= 4) return;

    const newOption: QuizOption = {
      id: `opt_${Date.now()}_${activeCard.checkpoint.options.length + 1}`,
      text: "",
      isCorrect: false,
    };

    handleCheckpointFieldChange("options", [
      ...activeCard.checkpoint.options,
      newOption,
    ]);
  };

  const handleRemoveOption = (optionId: string) => {
    if (!activeCard || !activeCard.checkpoint || activeCard.isLocked) return;
    if (activeCard.checkpoint.options.length <= 2) return;

    const filtered = activeCard.checkpoint.options.filter(
      (opt) => opt.id !== optionId,
    );

    // If we removed the correct option, assign correct to first remaining option
    const hasCorrect = filtered.some((opt) => opt.isCorrect);
    if (!hasCorrect && filtered.length > 0) {
      filtered[0].isCorrect = true;
    }

    handleCheckpointFieldChange("options", filtered);
  };

  // Card operations: Add, Duplicate, Delete, Reorder, Lock
  const handleAddCard = () => {
    const newCardNumber = lesson.cards.length + 1;
    const newCard: LessonCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: "narrative",
      title: `Concept #${newCardNumber}`,
      content: `Explain this key concept clearly and concisely.\n\nUse **bold** for key concepts, or code blocks:\n\n\`\`\`ts\n// Practical code example\n\`\`\``,
      isLocked: false,
    };

    const updatedCards = [...lesson.cards, newCard];
    applyLessonChange({
      ...lesson,
      cards: updatedCards,
    });
    setSelectedCardId(newCard.id);
    setMobileTab("edit");
  };

  const handleDuplicateCard = (cardId: string) => {
    const idx = lesson.cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;

    const original = lesson.cards[idx];
    const duplicated: LessonCard = {
      ...JSON.parse(JSON.stringify(original)),
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${original.title} (Copy)`,
      isLocked: false,
    };

    if (duplicated.checkpoint) {
      duplicated.checkpoint.options = duplicated.checkpoint.options.map(
        (opt, optIdx) => ({
          ...opt,
          id: `opt_${Date.now()}_${optIdx + 1}`,
        }),
      );
    }

    const updatedCards = [...lesson.cards];
    updatedCards.splice(idx + 1, 0, duplicated);

    applyLessonChange({
      ...lesson,
      cards: updatedCards,
    });
    setSelectedCardId(duplicated.id);
    setMobileTab("edit");
  };

  const handleDeleteCard = (cardId: string) => {
    if (lesson.cards.length <= 1) {
      alert("A lesson must have at least one card.");
      return;
    }

    const idx = lesson.cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;

    const deletedCard = lesson.cards[idx];
    setUndoDeletedCard({ card: deletedCard, index: idx });

    const updatedCards = lesson.cards.filter((c) => c.id !== cardId);
    const nextSelectedIndex = Math.min(idx, updatedCards.length - 1);
    const nextSelectedId = updatedCards[nextSelectedIndex].id;

    applyLessonChange({
      ...lesson,
      cards: updatedCards,
    });
    setSelectedCardId(nextSelectedId);
  };

  const handleUndoDelete = () => {
    if (!undoDeletedCard) return;

    const updatedCards = [...lesson.cards];
    updatedCards.splice(undoDeletedCard.index, 0, undoDeletedCard.card);

    applyLessonChange({
      ...lesson,
      cards: updatedCards,
    });
    setSelectedCardId(undoDeletedCard.card.id);
    setUndoDeletedCard(null);
  };

  const handleReorderCard = (cardId: string, direction: "up" | "down") => {
    const idx = lesson.cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= lesson.cards.length) return;

    const updatedCards = [...lesson.cards];
    const [moved] = updatedCards.splice(idx, 1);
    updatedCards.splice(targetIdx, 0, moved);

    applyLessonChange({
      ...lesson,
      cards: updatedCards,
    });
  };

  const handleToggleLock = (cardId: string) => {
    const idx = lesson.cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;

    const updatedCards = [...lesson.cards];
    updatedCards[idx] = {
      ...updatedCards[idx],
      isLocked: !updatedCards[idx].isLocked,
    };

    applyLessonChange({
      ...lesson,
      cards: updatedCards,
    });
  };

  // Save to persistence
  const handleSaveToStorage = () => {
    storageService.saveLesson(lesson);
    draftService.clearDraft(lesson.id);
    setHasUnsavedChanges(false);
    setSaveToast("Lesson saved to library ✓");
    setTimeout(() => setSaveToast(null), 3000);
    if (onSave) {
      onSave(lesson);
    }
  };

  // Export as JSON
  const handleExportJson = () => {
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

  // Save & View in Reader
  const handleSaveAndView = () => {
    if (!validation.isValid) {
      setShowValidationErrors(true);
      return;
    }

    storageService.saveLesson(lesson);
    draftService.clearDraft(lesson.id);
    setHasUnsavedChanges(false);

    if (onPublish) {
      onPublish(lesson);
    } else {
      navigate(`/lessons/${lesson.id}`);
    }
  };

  // Navigation back
  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes in this draft. Leaving now will keep your draft saved locally. Continue?",
      );
      if (!confirmLeave) return;
    }

    if (onBack) {
      onBack();
    } else {
      navigate("/studio");
    }
  };

  const getCardTypeLabel = (type: CardType) => {
    switch (type) {
      case "checkpoint":
        return "Checkpoint";
      case "example":
        return "Code Example";
      case "comparison":
        return "Comparison";
      default:
        return "Narrative";
    }
  };

  return (
    <div className={styles.editorContainer}>
      {/* Top Header Bar */}
      <header className={styles.headerBar}>
        <div className={styles.headerTopRow}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              onClick={handleBackNavigation}
              className={styles.backBtn}
              aria-label="Back to Studio or Lessons"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Studio</span>
            </button>

            <div className={styles.titleWrapper}>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={styles.lessonTitleInput}
                aria-label="Lesson Title"
                placeholder="Lesson Title"
                id="lesson-title-editor-input"
              />
            </div>

            <span
              className={`${styles.saveStatusBadge} ${
                hasUnsavedChanges ? styles.statusUnsaved : styles.statusSaved
              }`}
            >
              {hasUnsavedChanges ? (
                <>
                  <span aria-hidden="true">●</span>
                  <span>Unsaved changes</span>
                </>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
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
                  <span>Saved</span>
                </>
              )}
            </span>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={handleSaveToStorage}
              className={`${styles.actionBtn} ${styles.primaryActionBtn}`}
              title="Save changes to your lesson library"
              id="save-draft-btn"
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
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>Save Lesson</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className={styles.actionBtn}
              title="Export lesson JSON file"
              id="export-json-btn"
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
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndView}
              className={`${styles.actionBtn} ${styles.readerActionBtn}`}
              id="save-view-reader-btn"
              title="Save lesson and open in Reader Player"
            >
              <span>Save & View in Reader →</span>
            </button>
          </div>
        </div>

        {/* Metadata subrow */}
        <div className={styles.metaSubrow}>
          <div className={styles.metaItem}>
            <span>
              By <strong>{lesson.author}</strong>
            </span>
          </div>
          <div className={styles.metaItem}>
            <span>•</span>
            <span>{lesson.cards.length} Cards</span>
          </div>
          <div className={styles.metaItem}>
            <span>•</span>
            <span>Est. {estimatedReadTime} min read</span>
          </div>
          {saveToast && (
            <div
              className={styles.metaItem}
              style={{ color: "var(--feedback-success)", fontWeight: 600 }}
            >
              <span>•</span>
              <span>{saveToast}</span>
            </div>
          )}
        </div>
      </header>

      {/* Undo deleted card banner */}
      {undoDeletedCard && (
        <div className={styles.undoToast} role="status">
          <span>Card &ldquo;{undoDeletedCard.card.title}&rdquo; deleted.</span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className={styles.undoBtn}
          >
            Undo Delete ↺
          </button>
        </div>
      )}

      {/* Validation alert banner */}
      {showValidationErrors && !validation.isValid && (
        <div
          className={`${styles.bannerAlert} ${styles.bannerError}`}
          role="alert"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Cannot save & view lesson:</strong> Please resolve the
            following errors:
            <ul style={{ margin: "0.4rem 0 0 1.2rem", padding: 0 }}>
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Mobile Segmented Navigation */}
      <nav className={styles.mobileSegmentedNav} aria-label="Editor sections">
        <button
          type="button"
          onClick={() => setMobileTab("cards")}
          className={`${styles.segmentBtn} ${
            mobileTab === "cards" ? styles.segmentBtnActive : ""
          }`}
          aria-pressed={mobileTab === "cards"}
        >
          📋 Cards ({lesson.cards.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={`${styles.segmentBtn} ${
            mobileTab === "edit" ? styles.segmentBtnActive : ""
          }`}
          aria-pressed={mobileTab === "edit"}
        >
          ✏️ Edit Card
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`${styles.segmentBtn} ${
            mobileTab === "preview" ? styles.segmentBtnActive : ""
          }`}
          aria-pressed={mobileTab === "preview"}
        >
          👁️ Live Preview
        </button>
      </nav>

      {/* Main Workspace */}
      <main className={styles.workspace}>
        {/* 1. Deck Outline Sidebar */}
        <aside
          className={`${styles.deckOutline} ${
            mobileTab !== "cards" ? styles.mobileHideOutline : ""
          }`}
          aria-label="Lesson Card Outline"
        >
          <div className={styles.outlineHeader}>
            <span className={styles.outlineTitle}>
              Cards ({lesson.cards.length})
            </span>
          </div>

          <div className={styles.cardList} role="list">
            {lesson.cards.map((card, idx) => {
              const isSelected = card.id === selectedCardId;
              const hasCardError = Boolean(validation.cardErrors[card.id]);

              return (
                <div
                  key={card.id}
                  className={`${styles.outlineItem} ${
                    isSelected ? styles.outlineItemActive : ""
                  }`}
                  onClick={() => {
                    setSelectedCardId(card.id);
                    setMobileTab("edit");
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedCardId(card.id);
                      setMobileTab("edit");
                    }
                  }}
                  aria-label={`Select Card ${idx + 1}: ${card.title}`}
                  aria-current={isSelected ? "true" : undefined}
                >
                  {/* Left Column: Title Row + Meta Row */}
                  <div className={styles.itemMainCol}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemNumber}>#{idx + 1}</span>
                      <span className={styles.itemTitleText} title={card.title}>
                        {card.title}
                      </span>
                    </div>
                    <div className={styles.itemMetaRow}>
                      <span
                        className={`${styles.itemBadge} ${
                          isSelected ? styles.itemBadgeActive : ""
                        }`}
                      >
                        {getCardTypeLabel(card.type)}
                      </span>
                      {card.isLocked && (
                        <span
                          className={styles.lockBadge}
                          title="Locked against editing"
                          aria-label="Locked against editing"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          <span>Locked</span>
                        </span>
                      )}
                      {hasCardError && (
                        <span
                          className={styles.errorBadge}
                          title="Contains validation errors"
                          aria-label="Contains validation errors"
                        >
                          <span>⚠️ Error</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Trailing Action Group: Fixed Reorder Buttons */}
                  <div
                    className={styles.reorderGroup}
                    aria-label={`Reorder controls for card ${idx + 1}`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderCard(card.id, "up");
                      }}
                      disabled={idx === 0}
                      className={styles.reorderBtn}
                      aria-label={`Move card ${idx + 1} up: ${card.title}`}
                      title="Move up"
                    >
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
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderCard(card.id, "down");
                      }}
                      disabled={idx === lesson.cards.length - 1}
                      className={styles.reorderBtn}
                      aria-label={`Move card ${idx + 1} down: ${card.title}`}
                      title="Move down"
                    >
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
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddCard}
            className={styles.addCardBtn}
            id="add-card-btn"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Card</span>
          </button>
        </aside>

        {/* 2. Primary Card Editing Pane */}
        {activeCard && (
          <section
            className={`${styles.editorPane} ${
              mobileTab !== "edit" ? styles.mobileHideEditor : ""
            }`}
            aria-labelledby="active-card-heading"
          >
            {/* Top Toolbar for Active Card */}
            <div className={styles.cardTopControls}>
              <h2 id="active-card-heading" className={styles.cardIndexHeading}>
                <span>
                  Card #{activeCardIndex + 1} of {lesson.cards.length}
                </span>
              </h2>

              <div className={styles.cardTopActions}>
                <button
                  type="button"
                  onClick={() => handleToggleLock(activeCard.id)}
                  className={`${styles.lockToggleBtn} ${
                    activeCard.isLocked ? styles.lockedActive : ""
                  }`}
                  aria-pressed={activeCard.isLocked}
                  aria-label={
                    activeCard.isLocked
                      ? "Unlock card for editing"
                      : "Lock card wording against editing"
                  }
                  title={
                    activeCard.isLocked
                      ? "Unlock card for editing"
                      : "Lock card wording against editing"
                  }
                >
                  {activeCard.isLocked ? (
                    <>
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
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Locked</span>
                    </>
                  ) : (
                    <>
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
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </svg>
                      <span>Lock Wording</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Lock Notice */}
            {activeCard.isLocked && (
              <div className={styles.cardLockedNotice} role="status">
                <span>🔒 This card is locked against accidental edits.</span>
                <button
                  type="button"
                  onClick={() => handleToggleLock(activeCard.id)}
                  className={styles.unlockActionBtn}
                  aria-label="Unlock card to edit content"
                >
                  Unlock to Edit
                </button>
              </div>
            )}

            {/* Card Title Input */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label htmlFor="card-title-field">Card Title</label>
                <span className={styles.helperText}>
                  {activeCard.title.length} characters
                </span>
              </div>
              <input
                id="card-title-field"
                type="text"
                value={activeCard.title}
                onChange={(e) => handleCardFieldChange("title", e.target.value)}
                disabled={activeCard.isLocked || readOnly}
                className={styles.textInput}
                placeholder="Enter a descriptive card title..."
              />
            </div>

            {/* Card Type Selector */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label htmlFor="card-type-field">Card Type</label>
                <span className={styles.helperText}>Pedagogical format</span>
              </div>
              <select
                id="card-type-field"
                value={activeCard.type}
                onChange={(e) =>
                  handleCardTypeChange(e.target.value as CardType)
                }
                disabled={activeCard.isLocked || readOnly}
                className={styles.selectInput}
              >
                <option value="narrative">Core Concept (Narrative)</option>
                <option value="example">Code Example (Practical Case)</option>
                <option value="comparison">Contrast & Comparison</option>
                <option value="checkpoint">
                  Comprehension Checkpoint (Quiz)
                </option>
              </select>
            </div>

            {/* Content Body Editor (Markdown) */}
            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label htmlFor="card-content-field">
                  Card Content (Markdown)
                </label>
                <span className={styles.helperText}>
                  {countWords(activeCard.content)} words • Markdown & code
                  fences supported
                </span>
              </div>
              <textarea
                id="card-content-field"
                value={activeCard.content}
                onChange={(e) =>
                  handleCardFieldChange("content", e.target.value)
                }
                disabled={activeCard.isLocked || readOnly}
                className={styles.textareaInput}
                rows={8}
                placeholder="Write card explanations using Markdown..."
              />
            </div>

            {/* Checkpoint Structured Editor (If type === 'checkpoint') */}
            {activeCard.type === "checkpoint" && activeCard.checkpoint && (
              <div className={styles.checkpointEditorBox}>
                <div className={styles.checkpointBoxHeader}>
                  <span>💡 Comprehension Checkpoint Configuration</span>
                </div>

                {/* Question */}
                <div className={styles.formGroup}>
                  <label
                    htmlFor="checkpoint-question-field"
                    style={{ fontSize: "0.85rem", fontWeight: 600 }}
                  >
                    Question
                  </label>
                  <input
                    id="checkpoint-question-field"
                    type="text"
                    value={activeCard.checkpoint.question}
                    onChange={(e) =>
                      handleCheckpointFieldChange("question", e.target.value)
                    }
                    disabled={activeCard.isLocked || readOnly}
                    className={styles.textInput}
                    placeholder="Enter self-contained quiz question..."
                  />
                </div>

                {/* Answer Options */}
                <div className={styles.optionsSection}>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Answer Options (Select the single correct answer):
                  </div>
                  {activeCard.checkpoint.options.map((opt, optIdx) => (
                    <div key={opt.id} className={styles.optionRow}>
                      <label
                        className={styles.correctRadioWrapper}
                        title="Designate as correct answer"
                      >
                        <input
                          type="radio"
                          name={`correct-option-${activeCard.id}`}
                          checked={opt.isCorrect}
                          onChange={() => handleSetCorrectOption(opt.id)}
                          disabled={activeCard.isLocked || readOnly}
                        />
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                          {["A", "B", "C", "D"][optIdx] || optIdx + 1}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) =>
                          handleOptionTextChange(opt.id, e.target.value)
                        }
                        disabled={activeCard.isLocked || readOnly}
                        className={styles.textInput}
                        placeholder={`Option ${["A", "B", "C", "D"][optIdx]} text...`}
                        aria-label={`Answer option ${["A", "B", "C", "D"][optIdx]}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        disabled={
                          activeCard.checkpoint!.options.length <= 2 ||
                          activeCard.isLocked ||
                          readOnly
                        }
                        className={styles.removeOptionBtn}
                        aria-label={`Remove option ${["A", "B", "C", "D"][optIdx]}`}
                        title="Remove option"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddOption}
                    disabled={
                      activeCard.checkpoint.options.length >= 4 ||
                      activeCard.isLocked ||
                      readOnly
                    }
                    className={styles.addOptionBtn}
                  >
                    + Add Option (Max 4)
                  </button>
                </div>

                {/* Explanation */}
                <div className={styles.formGroup}>
                  <label
                    htmlFor="checkpoint-explanation-field"
                    style={{ fontSize: "0.85rem", fontWeight: 600 }}
                  >
                    Source-Grounded Explanation
                  </label>
                  <textarea
                    id="checkpoint-explanation-field"
                    value={activeCard.checkpoint.explanation}
                    onChange={(e) =>
                      handleCheckpointFieldChange("explanation", e.target.value)
                    }
                    disabled={activeCard.isLocked || readOnly}
                    className={styles.textareaInput}
                    rows={3}
                    placeholder="Explain why the designated option is correct..."
                  />
                </div>
              </div>
            )}

            {/* Bottom Card Actions */}
            <div className={styles.bottomCardBar}>
              <div className={styles.cardActionGroup}>
                <button
                  type="button"
                  onClick={() => handleDuplicateCard(activeCard.id)}
                  className={styles.actionBtn}
                  title="Duplicate this card"
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
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Duplicate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteCard(activeCard.id)}
                  disabled={lesson.cards.length <= 1}
                  className={`${styles.actionBtn} ${styles.dangerBtn}`}
                  title={
                    lesson.cards.length <= 1
                      ? "Cannot delete the only card"
                      : "Delete this card"
                  }
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>

              <div className={styles.cardActionGroup}>
                <button
                  type="button"
                  onClick={() => handleReorderCard(activeCard.id, "up")}
                  disabled={activeCardIndex === 0}
                  className={styles.actionBtn}
                  title="Move card earlier"
                >
                  ▲ Move Up
                </button>
                <button
                  type="button"
                  onClick={() => handleReorderCard(activeCard.id, "down")}
                  disabled={activeCardIndex === lesson.cards.length - 1}
                  className={styles.actionBtn}
                  title="Move card later"
                >
                  ▼ Move Down
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 3. Live Reader Preview Pane */}
        {activeCard && (
          <aside
            className={`${styles.previewPane} ${
              mobileTab !== "preview" ? styles.mobileHidePreview : ""
            }`}
            aria-label="Live Reader Preview"
          >
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>
                <span>👁️</span>
                <span>Live Reader Preview</span>
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Card {activeCardIndex + 1} of {lesson.cards.length}
              </span>
            </div>

            <div className={styles.previewFrame}>
              {activeCard.type === "checkpoint" && activeCard.checkpoint ? (
                <CheckpointCardComponent checkpoint={activeCard.checkpoint} />
              ) : (
                <LessonCardComponent card={activeCard} />
              )}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};
