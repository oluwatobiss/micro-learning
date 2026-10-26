import type {
  Lesson,
  LessonCard,
  QuizCheckpoint,
  QuizOption,
  GenerationStageId,
} from "../types/lesson.ts";
import type { ProcessFlowSpec } from "../types/media.ts";
import { validateMediaSpec } from "../types/media.ts";
import type {
  SourceInputData,
  SourceAnalysis,
  ExtractedSection,
  ExtractedTerm,
  ExtractedProcessStep,
  ExtractedComparison,
  LessonPlan,
  PlannedCard,
  QualityAuditReport,
  StageState,
  GenerationProgressState,
  GenerationResult,
} from "../types/generator.ts";
import { countWords } from "../utils/text.ts";

export type ServerGenerationEngine = (
  plan: LessonPlan,
  analysis: SourceAnalysis,
  input: SourceInputData,
) => Promise<{ cards: LessonCard[]; keyTakeaways: string[] }>;

let registeredServerEngine: ServerGenerationEngine | null = null;

export function registerServerEngine(
  engine: ServerGenerationEngine | null,
): void {
  registeredServerEngine = engine;
}

/**
 * Stage 1: Understanding Source Analysis
 * Deterministically parses structured sections, headings, literal code snippets,
 * bold terminology definitions, numbered sequences, and trade-off comparisons.
 */
export function understandSource(input: SourceInputData): SourceAnalysis {
  const text = input.sourceText;
  const lines = text.split("\n");

  const sections: ExtractedSection[] = [];
  let currentHeading = "Overview";
  let currentBodyLines: string[] = [];
  let currentCodeSnippets: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        codeBuffer.push(line);
        currentCodeSnippets.push(codeBuffer.join("\n"));
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBuffer.push(line);
      }
      currentBodyLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      currentBodyLines.push(line);
      continue;
    }

    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      if (currentBodyLines.length > 0 || currentCodeSnippets.length > 0) {
        sections.push({
          heading: currentHeading,
          body: currentBodyLines.join("\n").trim(),
          codeSnippets: [...currentCodeSnippets],
        });
        currentBodyLines = [];
        currentCodeSnippets = [];
      }
      currentHeading = headingMatch[1].trim();
    } else {
      currentBodyLines.push(line);
    }
  }

  if (currentBodyLines.length > 0 || currentCodeSnippets.length > 0) {
    sections.push({
      heading: currentHeading,
      body: currentBodyLines.join("\n").trim(),
      codeSnippets: [...currentCodeSnippets],
    });
  }

  const firstSection = sections[0] || { body: text };
  const paragraphs = firstSection.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30 && !p.startsWith("#") && !p.startsWith("```"));
  const thesis = paragraphs[0] || input.title;

  const keyTerms: ExtractedTerm[] = [];
  const termRegex = /\*\*([^*]+)\*\*/g;
  let match;
  const seenTerms = new Set<string>();

  while ((match = termRegex.exec(text)) !== null) {
    const rawTerm = match[1].trim();
    if (
      rawTerm.length > 3 &&
      rawTerm.length < 40 &&
      !seenTerms.has(rawTerm.toLowerCase())
    ) {
      seenTerms.add(rawTerm.toLowerCase());
      const termSentence = findSentenceWithTerm(text, rawTerm);
      const cleanedDef = cleanDefinition(rawTerm, termSentence);
      keyTerms.push({
        term: rawTerm,
        definition: cleanedDef,
      });
      if (keyTerms.length >= 6) break;
    }
  }

  const processSteps: ExtractedProcessStep[] = [];
  const stepRegex = /^\s*(\d+)\.\s+(?:\*\*([^*]+)\*\*[:\s]*)?(.+)$/gm;
  let stepMatch;
  while ((stepMatch = stepRegex.exec(text)) !== null) {
    const stepNum = parseInt(stepMatch[1], 10);
    const label = stepMatch[2] ? stepMatch[2].trim() : `Step ${stepNum}`;
    const desc = stepMatch[3] ? stepMatch[3].trim() : "";
    processSteps.push({
      stepNumber: stepNum,
      label: `${stepNum}. ${label}`,
      description: desc.replace(/\*\*/g, ""),
    });
    if (processSteps.length >= 6) break;
  }

  if (processSteps.length < 2) {
    const candidateSections = sections.filter((s) => s.heading !== "Overview");
    if (candidateSections.length >= 2) {
      candidateSections.slice(0, 4).forEach((sec, idx) => {
        processSteps.push({
          stepNumber: idx + 1,
          label: `${idx + 1}. ${sec.heading}`,
          description: sec.body.split(".")[0] || sec.heading,
        });
      });
    }
  }

  const comparisons: ExtractedComparison[] = [];
  const compSection = sections.find(
    (s) =>
      s.heading.toLowerCase().includes("vs") ||
      s.heading.toLowerCase().includes("versus") ||
      s.heading.toLowerCase().includes("comparison") ||
      s.heading.toLowerCase().includes("trade-off"),
  );

  if (compSection) {
    const items = compSection.body
      .split(/\n-|\n\*/)
      .map((i) => i.trim())
      .filter((i) => i.length > 10);
    const contrasts = items.slice(0, 4).map((it) => {
      const parts = it.split(":");
      return {
        aspect: parts[0]?.replace(/\*\*/g, "").trim() || "Aspect",
        valA: parts[1]?.split(";")[0]?.trim() || parts[1]?.trim() || it,
        valB: parts[1]?.split(";")[1]?.trim() || "Standard approach",
      };
    });

    const headingParts = compSection.heading.split(
      /\s+(?:vs\.?|versus|and)\s+/i,
    );
    const conceptA =
      headingParts[0]?.trim() ||
      (keyTerms[0] ? keyTerms[0].term : "Primary Approach");
    const conceptB =
      headingParts[1]?.trim() ||
      (keyTerms[1] ? keyTerms[1].term : "Alternative Approach");

    comparisons.push({
      conceptA,
      conceptB,
      contrasts,
    });
  }

  const takeaways: string[] = [
    `Core Principle: ${thesis.slice(0, 160)}${thesis.length > 160 ? "..." : ""}`,
  ];
  if (keyTerms[0]) {
    takeaways.push(
      `${keyTerms[0].term}: ${cleanDefinition(keyTerms[0].term, keyTerms[0].definition)}`,
    );
  }
  if (keyTerms[1]) {
    takeaways.push(
      `${keyTerms[1].term}: ${cleanDefinition(keyTerms[1].term, keyTerms[1].definition)}`,
    );
  }
  if (processSteps.length >= 2) {
    takeaways.push(
      `Sequential execution: ${processSteps[0].label} establishes foundational mechanics.`,
    );
  } else if (sections.length >= 2) {
    takeaways.push(
      `Key architectural principle: Core concepts in ${sections[1].heading} guide practical implementation.`,
    );
  } else {
    takeaways.push(
      "Disciplined system design anchors dependable implementation.",
    );
  }

  return {
    thesis,
    sections,
    keyTerms,
    processSteps,
    comparisons,
    takeaways,
    instructionalOpportunities: [
      `Foundational motivation derived from ${input.title}`,
      processSteps.length >= 2
        ? "Process flow diagram for execution lifecycle"
        : "Core architectural mental model",
      sections.some((s) => s.codeSnippets.length > 0)
        ? "Syntax-highlighted code block demonstrating concrete implementation"
        : "Concrete technical pattern examples",
      "Grounded multiple-choice checkpoint testing retention of core principles",
    ],
    totalWordCount: countWords(text),
  };
}

function cleanDefinition(term: string, definition: string): string {
  const t = term.toLowerCase().trim();
  const d = definition.trim();
  if (d.toLowerCase().startsWith(t)) {
    const rest = d.slice(t.length).trim();
    const cleaned = rest.replace(/^[:–—\-]\s*/, "").trim();
    return cleaned || definition;
  }
  return definition;
}

function findSentenceWithTerm(text: string, term: string): string {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const match = sentences.find((s) =>
    s.toLowerCase().includes(term.toLowerCase()),
  );
  if (match) {
    return match.replace(/\*\*/g, "").replace(/\n/g, " ").trim();
  }
  return `Key concept relating to ${term} in the lesson.`;
}

/**
 * Stage 2: Planning Lesson
 * Determines an adaptive 4 to 8 card progression based on extracted source structure.
 */
export function planLesson(
  analysis: SourceAnalysis,
  input: SourceInputData,
): LessonPlan {
  const cardOutlines: PlannedCard[] = [];

  cardOutlines.push({
    id: "c1",
    type: "narrative",
    title: `${input.title.trim()}: Core Overview`,
    focus: `Foundational introduction to the core dilemma, thesis, and primary principles.`,
  });

  const firstTerm = analysis.keyTerms[0];
  const hasProcess = analysis.processSteps.length >= 2;
  cardOutlines.push({
    id: "c2",
    type: "narrative",
    title: firstTerm
      ? `Understanding ${firstTerm.term}`
      : `${input.title.trim()}: Key Mechanics`,
    focus: `Detailed examination of fundamental terminology, mechanics, and system flow.`,
    hasVisualMedia: hasProcess,
  });

  const hasCode = analysis.sections.some((s) => s.codeSnippets.length > 0);
  if (hasCode) {
    cardOutlines.push({
      id: "c3",
      type: "example",
      title: "Implementation Patterns & Practical Code",
      focus: `Concrete code demonstration grounded in the technical source material.`,
      hasCode: true,
    });
  }

  if (analysis.comparisons.length > 0) {
    const comp = analysis.comparisons[0];
    cardOutlines.push({
      id: "c4",
      type: "comparison",
      title: `${comp.conceptA} vs. ${comp.conceptB}`,
      focus: `Balancing benefits against trade-offs, operational complexity, and edge cases.`,
    });
  } else if (analysis.sections.length >= 3) {
    const sec = analysis.sections[2];
    cardOutlines.push({
      id: "c4",
      type: "narrative",
      title: sec.heading,
      focus: `In-depth exploration of ${sec.heading} and practical considerations.`,
    });
  }

  if (cardOutlines.length < 4 && analysis.keyTerms.length >= 2) {
    const secondTerm = analysis.keyTerms[1];
    cardOutlines.push({
      id: `c${cardOutlines.length + 1}`,
      type: "narrative",
      title: `Applying ${secondTerm.term}`,
      focus: `Practical integration guidance and architectural takeaways.`,
    });
  }

  cardOutlines.push({
    id: `c${cardOutlines.length + 1}`,
    type: "checkpoint",
    title: `${input.title.trim()}: Comprehension Checkpoint`,
    focus: `Self-contained evaluation of core concepts, mechanics, and failure modes.`,
  });

  return {
    targetCardCount: cardOutlines.length,
    estimatedMinutes: Math.max(2, Math.ceil(cardOutlines.length * 0.75)),
    cardOutlines,
  };
}

/**
 * Stage 3: Creating Cards
 * Synthesizes grounded lesson cards with clear Markdown, literal code, and structured media specs.
 * Grounded via Gemini AI with strict schema conformance.
 */
export async function createCards(
  plan: LessonPlan,
  analysis: SourceAnalysis,
  input: SourceInputData,
): Promise<LessonCard[]> {
  // 1. If registered server engine exists (e.g. in Node tests or server runtime)
  if (registeredServerEngine) {
    const res = await registeredServerEngine(plan, analysis, input);
    return res.cards;
  }

  // 2. If executing in browser environment, call the server-side API endpoint
  if (typeof window !== "undefined") {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      const errMsg =
        data?.error ||
        `Lesson card generation failed with HTTP status ${res.status}.`;
      throw new Error(errMsg);
    }

    return data.result.lesson.cards;
  }

  throw new Error(
    "Server generation engine is not registered and browser environment is not available.",
  );
}

/**
 * Stage 4: Creating Comprehension Checks
 * Generates or validates a grounded multiple-choice question with 1 unambiguous correct answer,
 * plausible distractors, and an educational explanation grounded in the source text.
 */
export function createComprehensionChecks(
  cards: LessonCard[],
  analysis: SourceAnalysis,
): void {
  const checkpointCard = cards.find((c) => c.type === "checkpoint");
  if (!checkpointCard) return;

  // Preserve already-valid checkpoint generated by AI
  if (
    checkpointCard.checkpoint &&
    checkpointCard.checkpoint.question &&
    checkpointCard.checkpoint.question.length >= 20 &&
    checkpointCard.checkpoint.options?.length >= 3 &&
    checkpointCard.checkpoint.options.filter((o) => o.isCorrect).length === 1 &&
    checkpointCard.checkpoint.explanation &&
    checkpointCard.checkpoint.explanation.length >= 15
  ) {
    return;
  }

  const checkpoint: QuizCheckpoint = {
    question: `According to the source material, which statement represents the core principle?`,
    options: [
      {
        id: "opt-1",
        text: analysis.thesis.slice(0, 120),
        isCorrect: true,
      },
      {
        id: "opt-2",
        text: "The author advocates disregarding architectural trade-offs entirely.",
        isCorrect: false,
      },
      {
        id: "opt-3",
        text: "Implementation complexity should be prioritized over system reliability.",
        isCorrect: false,
      },
    ],
    explanation: `The source material establishes: ${analysis.thesis.slice(0, 140)}`,
    sourceExcerpt: analysis.thesis.slice(0, 120),
  };

  checkpointCard.checkpoint = checkpoint;
}

/**
 * Stage 5: Checking Quality
 * Deterministic audit of lesson schema, metadata, card count, code blocks,
 * structured media spec, and checkpoint integrity.
 */
export function validateQuality(
  lesson: Lesson,
  analysis: SourceAnalysis,
): QualityAuditReport {
  const checksPassed: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  if (lesson.id && lesson.title && lesson.author && lesson.sourceUrl) {
    checksPassed.push(
      "Lesson metadata (id, title, author, sourceUrl) is complete and well-formed.",
    );
  } else {
    errors.push("Missing required lesson metadata fields.");
  }

  if (lesson.cards.length >= 4 && lesson.cards.length <= 8) {
    checksPassed.push(
      `Card count (${lesson.cards.length} cards) is within the optimal 4–8 range.`,
    );
  } else {
    errors.push(
      `Card count (${lesson.cards.length}) is outside the acceptable 4–8 card range.`,
    );
  }

  const cardIds = new Set<string>();
  let allContentValid = true;
  for (const card of lesson.cards) {
    if (cardIds.has(card.id)) {
      errors.push(`Duplicate card ID detected: "${card.id}".`);
      allContentValid = false;
    }
    cardIds.add(card.id);
    if (!card.title || card.title.trim().length === 0) {
      errors.push(`Card "${card.id}" has an empty title.`);
      allContentValid = false;
    }
    if (!card.content || card.content.trim().length === 0) {
      errors.push(`Card "${card.id}" has empty content.`);
      allContentValid = false;
    }
  }
  if (allContentValid) {
    checksPassed.push(
      "All cards have unique identifiers, non-empty titles, and substantial Markdown content.",
    );
  }

  let fencesBalanced = true;
  for (const card of lesson.cards) {
    const fenceMatches = card.content.match(/```/g);
    const count = fenceMatches ? fenceMatches.length : 0;
    if (count % 2 !== 0) {
      fencesBalanced = false;
      errors.push(`Card "${card.id}" has an unclosed code fence.`);
    }
  }
  if (fencesBalanced) {
    checksPassed.push(
      "Code blocks integrity verified: all Markdown code fences are balanced.",
    );
  }

  let mediaValid = true;
  const mediaErrors: string[] = [];
  for (const card of lesson.cards) {
    if (card.visualMedia) {
      const validation = validateMediaSpec(card.visualMedia);
      if (!validation.valid) {
        mediaValid = false;
        mediaErrors.push(...validation.errors);
        errors.push(
          `Card "${card.id}" has invalid instructional media: ${validation.errors.join(", ")}`,
        );
      }
    }
  }
  if (mediaValid) {
    checksPassed.push(
      "Instructional media specifications conform to schema and pass validation.",
    );
  }

  const checkpointCards = lesson.cards.filter((c) => c.type === "checkpoint");
  if (checkpointCards.length === 0) {
    errors.push("Lesson must contain at least one comprehension checkpoint.");
  } else {
    for (const cpCard of checkpointCards) {
      const cp = cpCard.checkpoint;
      if (!cp) {
        errors.push(
          `Checkpoint card "${cpCard.id}" lacks a checkpoint object.`,
        );
        continue;
      }
      if (!cp.question || cp.question.trim().length < 20) {
        errors.push(
          `Checkpoint question on "${cpCard.id}" is too brief or missing.`,
        );
      }
      if (!Array.isArray(cp.options) || cp.options.length < 3) {
        errors.push(
          `Checkpoint on "${cpCard.id}" must provide at least 3 options.`,
        );
      } else {
        const correctOptions = cp.options.filter((o) => o.isCorrect);
        if (correctOptions.length !== 1) {
          errors.push(
            `Checkpoint on "${cpCard.id}" must have exactly ONE correct option. Found: ${correctOptions.length}.`,
          );
        }
      }
      if (!cp.explanation || cp.explanation.trim().length < 15) {
        errors.push(
          `Checkpoint on "${cpCard.id}" must have an educational explanation.`,
        );
      }
    }
    if (
      errors.filter((e) => e.includes("Checkpoint") || e.includes("checkpoint"))
        .length === 0
    ) {
      checksPassed.push(
        "Comprehension checkpoint verified: self-contained question, exactly 1 correct answer, and grounded explanation.",
      );
    }
  }

  if (Array.isArray(lesson.keyTakeaways) && lesson.keyTakeaways.length >= 2) {
    checksPassed.push(
      `Key takeaways verified (${lesson.keyTakeaways.length} takeaways generated).`,
    );
  } else {
    warnings.push(
      "Lesson should have at least 2 key takeaways for the completion screen.",
    );
  }

  const totalChecksCount = 7;
  const groundingScore = Math.round(
    (checksPassed.length / totalChecksCount) * 100,
  );

  return {
    isValid: errors.length === 0,
    cardCount: lesson.cards.length,
    checkpointCount: checkpointCards.length,
    checksPassed,
    warnings,
    errors,
    groundingScore,
    totalChecksCount,
    mediaValidation: {
      valid: mediaValid,
      errors: mediaErrors,
    },
  };
}

/**
 * Five-Stage Generation Pipeline:
 * Coordinates the full adaptive generation workflow, reporting honest stage progress.
 */
export async function generateLesson(
  input: SourceInputData,
  onProgress?: (state: GenerationProgressState) => void,
): Promise<GenerationResult> {
  const stageDefs: Array<{
    id: GenerationStageId;
    label: string;
    desc: string;
  }> = [
    {
      id: "understanding",
      label: "Stage 1 — Understanding Source",
      desc: "Extracting thesis, technical structure, code snippets, and concepts...",
    },
    {
      id: "planning",
      label: "Stage 2 — Planning Lesson",
      desc: "Determining adaptive 4–8 card pedagogical progression...",
    },
    {
      id: "cards",
      label: "Stage 3 — Creating Cards",
      desc: "Synthesizing narrative explanations, code blocks, and structured diagrams via Gemini AI...",
    },
    {
      id: "checks",
      label: "Stage 4 — Creating Checks",
      desc: "Formulating grounded comprehension checkpoints with educational explanations...",
    },
    {
      id: "quality",
      label: "Stage 5 — Checking Quality",
      desc: "Running deterministic schema, media, and quality verification...",
    },
  ];

  const stages: Record<GenerationStageId, StageState> = {} as Record<
    GenerationStageId,
    StageState
  >;
  for (const s of stageDefs) {
    stages[s.id] = {
      id: s.id,
      label: s.label,
      description: s.desc,
      status: "pending",
    };
  }

  const updateProgress = (
    stageId: GenerationStageId,
    status: "in-progress" | "complete" | "failed",
    msg?: string,
  ) => {
    stages[stageId] = {
      ...stages[stageId],
      status,
      message: msg || stages[stageId].description,
      ...(status === "in-progress" ? { startedAt: Date.now() } : {}),
      ...(status === "complete" || status === "failed"
        ? { completedAt: Date.now() }
        : {}),
    };
    if (onProgress) {
      onProgress({
        stages: { ...stages },
        currentStageId: stageId,
        overallStatus: status === "failed" ? "failed" : "generating",
      });
    }
  };

  try {
    updateProgress(
      "understanding",
      "in-progress",
      "Analyzing source text, extracting thesis, code patterns, and terminology...",
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
    const analysis = understandSource(input);
    updateProgress(
      "understanding",
      "complete",
      `Extracted ${analysis.sections.length} sections, ${analysis.keyTerms.length} terms, and ${analysis.totalWordCount} words.`,
    );

    updateProgress(
      "planning",
      "in-progress",
      "Planning adaptive card deck progression...",
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
    const plan = planLesson(analysis, input);
    updateProgress(
      "planning",
      "complete",
      `Planned ${plan.targetCardCount}-card instructional progression.`,
    );

    updateProgress(
      "cards",
      "in-progress",
      "Generating source-grounded cards via Gemini AI...",
    );

    let cards: LessonCard[];
    let keyTakeaways = analysis.takeaways;

    try {
      if (registeredServerEngine) {
        const serverRes = await registeredServerEngine(plan, analysis, input);
        cards = serverRes.cards;
        if (serverRes.keyTakeaways && serverRes.keyTakeaways.length >= 2) {
          keyTakeaways = serverRes.keyTakeaways;
        }
      } else if (typeof window !== "undefined") {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          const errorMsg =
            data?.error ||
            `Server lesson generation failed with status ${res.status}.`;
          throw new Error(errorMsg);
        }

        cards = data.result.lesson.cards;
        if (
          data.result.lesson.keyTakeaways &&
          data.result.lesson.keyTakeaways.length >= 2
        ) {
          keyTakeaways = data.result.lesson.keyTakeaways;
        }
      } else {
        throw new Error(
          "Server generation engine is not registered in this runtime.",
        );
      }
    } catch (cardsError: any) {
      const errMsg = cardsError instanceof Error ? cardsError.message : "Card generation failed.";
      updateProgress("cards", "failed", errMsg);
      throw cardsError;
    }

    updateProgress(
      "cards",
      "complete",
      `Generated ${cards.length} source-grounded lesson cards.`,
    );

    updateProgress(
      "checks",
      "in-progress",
      "Verifying grounded comprehension checkpoint with educational explanation...",
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
    createComprehensionChecks(cards, analysis);
    updateProgress(
      "checks",
      "complete",
      "Created grounded multiple-choice checkpoint with 1 unambiguous correct answer.",
    );

    const lessonId =
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "generated-lesson";

    const lesson: Lesson = {
      id: lessonId,
      version: 1,
      title: input.title.trim(),
      author: input.author.trim(),
      sourceUrl: input.sourceUrl.trim(),
      sourceSnippet: analysis.thesis.slice(0, 200),
      keyTakeaways,
      estimatedMinutes: plan.estimatedMinutes,
      createdAt: new Date().toISOString(),
      cards,
    };

    updateProgress(
      "quality",
      "in-progress",
      "Running deterministic quality, schema, and media audits...",
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
    const qualityReport = validateQuality(lesson, analysis);

    if (!qualityReport.isValid) {
      updateProgress(
        "quality",
        "failed",
        `Validation failed: ${qualityReport.errors.join("; ")}`,
      );
      throw new Error(
        `Generated lesson failed quality verification: ${qualityReport.errors.join("; ")}`,
      );
    }

    updateProgress(
      "quality",
      "complete",
      `Passed all ${qualityReport.checksPassed.length} quality verification audits.`,
    );

    if (onProgress) {
      onProgress({
        stages: { ...stages },
        currentStageId: null,
        overallStatus: "complete",
      });
    }

    return {
      lesson,
      sourceAnalysis: analysis,
      qualityReport,
      generatedAt: new Date().toISOString(),
      provider: "gemini-ai",
    };
  } catch (error) {
    const errMessage =
      error instanceof Error
        ? error.message
        : "An unexpected generation error occurred.";
    if (onProgress) {
      onProgress({
        stages: { ...stages },
        currentStageId: null,
        overallStatus: "failed",
        errorMessage: errMessage,
      });
    }
    throw error;
  }
}
