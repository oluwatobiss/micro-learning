import React, { useState, useId } from "react";
import type { SourceInputData, SourceValidationErrors } from "../../types/generator";
import { countWords, validateSourceInput, MIN_WORD_COUNT, MAX_WORD_COUNT } from "../../utils/text";
import { SAMPLE_SOURCE_INPUT } from "../../services/sampleArticle";
import styles from "./SourceInputForm.module.css";

interface SourceInputFormProps {
  initialData?: Partial<SourceInputData>;
  onSubmit: (data: SourceInputData) => void;
  isGenerating?: boolean;
}

export const SourceInputForm: React.FC<SourceInputFormProps> = ({
  initialData,
  onSubmit,
  isGenerating = false,
}) => {
  const [formData, setFormData] = useState<SourceInputData>({
    title: initialData?.title || "",
    author: initialData?.author || "",
    sourceUrl: initialData?.sourceUrl || "",
    sourceText: initialData?.sourceText || "",
    permissionConfirmed: initialData?.permissionConfirmed || false,
  });

  const [errors, setErrors] = useState<SourceValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const titleId = useId();
  const authorId = useId();
  const sourceUrlId = useId();
  const sourceTextId = useId();
  const permissionId = useId();

  const currentWordCount = countWords(formData.sourceText);
  const isWordCountValid = currentWordCount >= MIN_WORD_COUNT && currentWordCount <= MAX_WORD_COUNT;

  const handleBlur = (field: keyof SourceInputData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validation = validateSourceInput(formData);
    if (validation.errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validation.errors[field] }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleChange = (
    field: keyof SourceInputData,
    value: string | boolean
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (errors[field]) {
      const validation = validateSourceInput(updated);
      setErrors((prev) => {
        const next = { ...prev };
        if (!validation.errors[field]) {
          delete next[field];
        } else {
          next[field] = validation.errors[field];
        }
        return next;
      });
    }
  };

  const handleLoadSample = () => {
    setFormData({
      title: SAMPLE_SOURCE_INPUT.title,
      author: SAMPLE_SOURCE_INPUT.author,
      sourceUrl: SAMPLE_SOURCE_INPUT.sourceUrl,
      sourceText: SAMPLE_SOURCE_INPUT.sourceText,
      // Deliberately keep permission false so creator must explicitly acknowledge
      permissionConfirmed: false,
    });
    setErrors({});
    setTouched({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    setTouched({
      title: true,
      author: true,
      sourceUrl: true,
      sourceText: true,
      permissionConfirmed: true,
    });

    const validation = validateSourceInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField === "title") document.getElementById(titleId)?.focus();
      else if (firstErrorField === "author") document.getElementById(authorId)?.focus();
      else if (firstErrorField === "sourceUrl") document.getElementById(sourceUrlId)?.focus();
      else if (firstErrorField === "sourceText") document.getElementById(sourceTextId)?.focus();
      else if (firstErrorField === "permissionConfirmed") document.getElementById(permissionId)?.focus();
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <div className={styles.container}>
      <header className={styles.intro}>
        <div className={styles.badge} aria-hidden="true">
          Adaptive Lesson Engine
        </div>
        <h1 className={styles.title}>Creator Studio</h1>
        <p className={styles.subtitle}>
          Transform long-form software engineering articles, guides, and documentation into interactive, grounded micro-learning card decks.
        </p>
      </header>

      <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
        <div className={styles.actionBar}>
          <span className={styles.sampleNotice}>
            Need a realistic technical article to test generation?
          </span>
          <button
            type="button"
            onClick={handleLoadSample}
            className={styles.sampleButton}
            disabled={isGenerating}
            id="load-sample-btn"
          >
            <span aria-hidden="true">??</span>
            <span>Load Sample Article</span>
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label htmlFor={titleId} className={styles.label}>
              <span>Lesson Title <span className={styles.requiredMark}>*</span></span>
            </label>
            <input
              id={titleId}
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              onBlur={() => handleBlur("title")}
              placeholder="e.g. Optimistic UI and Mutation Resilience"
              className={`${styles.input} ${errors.title ? styles.inputInvalid : ""}`}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? `${titleId}-error` : undefined}
              disabled={isGenerating}
            />
            {errors.title && (
              <div id={`${titleId}-error`} className={styles.errorText} role="alert">
                <span aria-hidden="true">?</span> {errors.title}
              </div>
            )}
          </div>

          <div className={styles.formGridTwoCol}>
            <div className={styles.fieldGroup}>
              <label htmlFor={authorId} className={styles.label}>
                <span>Original Author / Creator <span className={styles.requiredMark}>*</span></span>
              </label>
              <input
                id={authorId}
                type="text"
                value={formData.author}
                onChange={(e) => handleChange("author", e.target.value)}
                onBlur={() => handleBlur("author")}
                placeholder="e.g. Dr. Alex Mercer"
                className={`${styles.input} ${errors.author ? styles.inputInvalid : ""}`}
                aria-required="true"
                aria-invalid={!!errors.author}
                aria-describedby={errors.author ? `${authorId}-error` : undefined}
                disabled={isGenerating}
              />
              {errors.author && (
                <div id={`${authorId}-error`} className={styles.errorText} role="alert">
                  <span aria-hidden="true">?</span> {errors.author}
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor={sourceUrlId} className={styles.label}>
                <span>Source Article URL <span className={styles.requiredMark}>*</span></span>
              </label>
              <input
                id={sourceUrlId}
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleChange("sourceUrl", e.target.value)}
                onBlur={() => handleBlur("sourceUrl")}
                placeholder="https://example.com/blog/optimistic-ui"
                className={`${styles.input} ${errors.sourceUrl ? styles.inputInvalid : ""}`}
                aria-required="true"
                aria-invalid={!!errors.sourceUrl}
                aria-describedby={errors.sourceUrl ? `${sourceUrlId}-error` : undefined}
                disabled={isGenerating}
              />
              {errors.sourceUrl && (
                <div id={`${sourceUrlId}-error`} className={styles.errorText} role="alert">
                  <span aria-hidden="true">?</span> {errors.sourceUrl}
                </div>
              )}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor={sourceTextId} className={styles.label}>
              <span>Source Article Text <span className={styles.requiredMark}>*</span></span>
              <span className={styles.sampleNotice}>Markdown &amp; code fences supported</span>
            </label>
            <textarea
              id={sourceTextId}
              value={formData.sourceText}
              onChange={(e) => handleChange("sourceText", e.target.value)}
              onBlur={() => handleBlur("sourceText")}
              placeholder="Paste full technical article or markdown content here (minimum 200 words, maximum 10,000 words)..."
              className={`${styles.textarea} ${errors.sourceText ? styles.textareaInvalid : ""}`}
              aria-required="true"
              aria-invalid={!!errors.sourceText}
              aria-describedby={`${sourceTextId}-status ${errors.sourceText ? `${sourceTextId}-error` : ""}`}
              disabled={isGenerating}
            />
            <div className={styles.textareaFooter}>
              <div id={`${sourceTextId}-status`} aria-live="polite">
                <span className={
                  currentWordCount === 0
                    ? styles.wordCountMuted
                    : isWordCountValid
                    ? styles.wordCountValid
                    : styles.wordCountInvalid
                }>
                  {currentWordCount.toLocaleString()} words
                </span>
                <span className={styles.wordCountMuted}>
                  {" "}(Requirement: 200 ? 10,000 words)
                </span>
              </div>
              {currentWordCount > 0 && currentWordCount < MIN_WORD_COUNT && (
                <span className={styles.wordCountInvalid}>
                  {MIN_WORD_COUNT - currentWordCount} more words needed
                </span>
              )}
              {currentWordCount > MAX_WORD_COUNT && (
                <span className={styles.wordCountInvalid}>
                  Exceeds limit by {currentWordCount - MAX_WORD_COUNT} words
                </span>
              )}
            </div>
            {errors.sourceText && (
              <div id={`${sourceTextId}-error`} className={styles.errorText} role="alert">
                <span aria-hidden="true">?</span> {errors.sourceText}
              </div>
            )}
          </div>

          <div className={`${styles.permissionCard} ${errors.permissionConfirmed ? styles.permissionCardError : ""}`}>
            <label className={styles.checkboxLabel} htmlFor={permissionId}>
              <input
                id={permissionId}
                type="checkbox"
                checked={formData.permissionConfirmed}
                onChange={(e) => handleChange("permissionConfirmed", e.target.checked)}
                className={styles.checkboxInput}
                aria-required="true"
                aria-invalid={!!errors.permissionConfirmed}
                aria-describedby={errors.permissionConfirmed ? `${permissionId}-error` : undefined}
                disabled={isGenerating}
              />
              <div className={styles.permissionText}>
                <strong>Ownership &amp; Permission Acknowledgment <span className={styles.requiredMark}>*</span></strong>
                <p className={styles.permissionNotice}>
                  I confirm that I have the necessary rights, authorization, or fair-use permission to synthesize and adapt this source material into an interactive lesson.
                </p>
              </div>
            </label>
            {errors.permissionConfirmed && (
              <div id={`${permissionId}-error`} className={styles.errorText} role="alert" style={{ marginTop: "0.5rem", paddingLeft: "1.875rem" }}>
                <span aria-hidden="true">?</span> {errors.permissionConfirmed}
              </div>
            )}
          </div>
        </div>

        <div className={styles.submitSection}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isGenerating}
            id="generate-lesson-btn"
          >
            <span aria-hidden="true">?</span>
            <span>Start 5-Stage Adaptive Generation</span>
            <span aria-hidden="true">?</span>
          </button>
          <p className={styles.formFooterHelp}>
            Grounded in your source text. All cards, diagrams, and comprehension checks are verified deterministically against quality and schema rules.
          </p>
        </div>
      </form>
    </div>
  );
};
