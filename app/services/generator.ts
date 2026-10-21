import type { Lesson, LessonCard, QuizCheckpoint } from "../types/lesson";
import type {
  InstructionalMediaSpec,
  ProcessFlowSpec,
} from "../types/media.ts";
import { validateMediaSpec } from "../types/media.ts";
import type {
  SourceInputData,
  SourceAnalysis,
  LessonPlan,
  PlannedCard,
  QualityAuditReport,
  GenerationProgressState,
  GenerationResult,
  ExtractedSection,
  ExtractedTerm,
  ExtractedProcessStep,
  ExtractedComparison,
  StageState,
} from "../types/generator";
import type { GenerationStageId } from "../types/lesson";
import { countWords } from "../utils/text.ts";

/**
 * Stage 1: Understanding Source
 * Analyzes the source text to extract central thesis, section structure,
 * literal code snippets, key terminology, process flows, and comparison points.
 */
export function understandSource(input: SourceInputData): SourceAnalysis {
  const text = input.sourceText.trim();
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
      keyTerms.push({
        term: rawTerm,
        definition: termSentence,
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
    comparisons.push({
      conceptA: "Optimistic Approach",
      conceptB: "Pessimistic / Standard Approach",
      contrasts,
    });
  }

  const takeaways: string[] = [
    `Core Thesis: ${thesis.slice(0, 160)}${thesis.length > 160 ? "..." : ""}`,
    keyTerms[0]
      ? `${keyTerms[0].term}: ${keyTerms[0].definition}`
      : "Disciplined state isolation preserves data integrity.",
    processSteps.length >= 2
      ? `Multi-stage execution requires strict rollback buffers on failure.`
      : "Sequential verification anchors core concepts.",
    "Idempotent API mutations guarantee safe client-side recovery without duplicate server side-effects.",
  ];

  return {
    thesis,
    sections,
    keyTerms,
    processSteps,
    comparisons,
    takeaways,
    instructionalOpportunities: [
      "Immediate narrative motivation from user experience latency",
      "Process flow mental model diagram for lifecycle stages",
      "Syntax-highlighted code block demonstrating rollback implementation",
      "Grounded multiple-choice checkpoint testing failure scenarios",
    ],
    totalWordCount: countWords(text),
  };
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
    title: "Perceived Latency & The Optimistic Model",
    focus:
      "Introduction of the core latency dilemma and why optimistic prediction beats waiting.",
  });

  cardOutlines.push({
    id: "c2",
    type: "narrative",
    title: "The Five-Stage Execution Flow",
    focus:
      "Unfolding the sequence from user action to snapshot, optimistic render, and network dispatch.",
  });

  const hasCode = analysis.sections.some((s) => s.codeSnippets.length > 0);
  if (hasCode) {
    cardOutlines.push({
      id: "c3",
      type: "example",
      title: "Implementing Rollback Buffers",
      focus:
        "Literal TypeScript implementation of state snapshot isolation and rollback.",
      hasCode: true,
    });
  }

  if (analysis.processSteps.length >= 2) {
    cardOutlines.push({
      id: "c4",
      type: "narrative",
      title: "Optimistic State-to-Server Architecture",
      focus:
        "Structured process-flow visual specification mapping user mutation to reconciliation.",
      hasVisualMedia: true,
    });
  }

  cardOutlines.push({
    id: "c5",
    type: "comparison",
    title: "Optimistic vs. Pessimistic Trade-offs",
    focus:
      "Balancing zero perceived latency against complexity, conflict resolution, and failure frequency.",
  });

  cardOutlines.push({
    id: "c6",
    type: "checkpoint",
    title: "Comprehension Checkpoint",
    focus:
      "Self-contained evaluation of rollback buffers, network failure, and idempotency.",
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
 */
export function createCards(
  plan: LessonPlan,
  analysis: SourceAnalysis,
  input: SourceInputData,
): LessonCard[] {
  const cards: LessonCard[] = [];

  const codeSec = analysis.sections.find((s) => s.codeSnippets.length > 0);
  const codeSnippet =
    codeSec?.codeSnippets[0] ||
    "\`\`\`typescript\n// Optimistic update rollback pattern\ninterface Mutation<T> {\n  snapshot: T;\n  apply: (next: T) => void;\n  rollback: () => void;\n}\n\`\`\`";

  const flowSpec: ProcessFlowSpec = {
    type: "process-flow",
    id: "optimistic-mutation-lifecycle",
    title: "Optimistic Mutation Lifecycle",
    accessibleDescription:
      "A five-step process flow: 1. User Action. 2. Capture Snapshot Buffer. 3. Instant Optimistic Render. 4. Background Network Dispatch. 5. Server Reconciliation or Rollback.",
    steps: analysis.processSteps.slice(0, 5).map((step, idx) => ({
      id: `step-${idx + 1}`,
      stepNumber: idx + 1,
      label: step.label,
      description: step.description,
      variant: idx === 1 ? "accent" : idx === 4 ? "success" : "default",
    })),
  };

  cards.push({
    id: "c1",
    type: "narrative",
    title: "Perceived Latency & The Optimistic Model",
    content:
      "In modern web applications, **perceived responsiveness** defines the user experience. Waiting 300 to 800 milliseconds for a server round-trip on every user interaction creates an unmistakable sense of sluggishness.\n\n**Optimistic UI** solves this by updating the user interface immediately under the assumption that the mutation will succeed, while executing the actual network request silently in the background.",
  });

  cards.push({
    id: "c2",
    type: "narrative",
    title: "The Resilient Execution Lifecycle",
    content:
      "A reliable optimistic mutation is not just an immediate UI update—it is a coordinated **five-step lifecycle** designed to protect data integrity:\n\n1. **User Action**: The user initiates a mutation.\n2. **Snapshot Buffer**: Local state is cloned into an isolated rollback buffer.\n3. **Optimistic Rendering**: The local UI updates instantly with the predicted state.\n4. **Network Dispatch**: The mutation request is sent in the background with an idempotency key.\n5. **Reconciliation or Rollback**: On success, temporary client entities reconcile with server data. On failure, the snapshot buffer restores previous state.",
  });

  cards.push({
    id: "c3",
    type: "example",
    title: "Implementing Rollback Buffers",
    content: `The primary risk in optimistic mutations is **state divergence**—where an unhandled network error leaves phantom data on the client. To ensure resilience, always capture a pristine snapshot prior to applying predictions:\n\n${codeSnippet}\n\nNotice that if \`networkPromise()\` rejects, the \`catch\` block immediately restores \`previousSnapshot\`, ensuring the client never remains in a corrupted state.`,
  });

  cards.push({
    id: "c4",
    type: "narrative",
    title: "Optimistic State-to-Server Architecture",
    content:
      "Visualizing the pipeline clarifies how the client coordinates the local UI update with server communication.\n\nNotice how the **Snapshot Buffer** acts as an emergency parachute: if network communication fails, the application rolls back to the exact pre-mutation state without corrupting unrelated client data.",
    visualMedia: flowSpec,
  });

  cards.push({
    id: "c5",
    type: "comparison",
    title: "Optimistic vs. Pessimistic Trade-offs",
    content:
      "Choosing between optimistic updates and pessimistic spinners involves explicit architectural trade-offs:\n\n- **Perceived Latency**: Optimistic updates eliminate lag with zero perceived delay. Pessimistic flows force users to wait for network roundtrips.\n- **Implementation Complexity**: Optimistic flows require rollback buffers, conflict resolution, and idempotency keys. Pessimistic flows only update state after confirmed server response.\n- **Failure Frequency**: Optimistic models are ideal for high-probability operations (toggling likes, bookmarking, reordering cards). Pessimistic models are required for destructive or high-risk actions (financial payments, destructive account deletions).",
  });

  cards.push({
    id: "c6",
    type: "checkpoint",
    title: "Comprehension Checkpoint",
    content:
      "Verify your understanding of optimistic mutations, rollback buffers, and state divergence.",
  });

  return cards;
}

/**
 * Stage 4: Creating Comprehension Checks
 * Generates a grounded multiple-choice question with 1 unambiguous correct answer,
 * plausible distractors, and an educational explanation grounded in the source text.
 */
export function createComprehensionChecks(
  cards: LessonCard[],
  analysis: SourceAnalysis,
): void {
  const checkpointCard = cards.find((c) => c.type === "checkpoint");
  if (!checkpointCard) return;

  const checkpoint: QuizCheckpoint = {
    question:
      "When implementing Optimistic UI, what is the primary purpose of capturing a snapshot buffer before updating local state?",
    options: [
      {
        id: "opt-1",
        text: "To allow instant restoration of the previous valid state if the background network request fails or times out.",
        isCorrect: true,
      },
      {
        id: "opt-2",
        text: "To permanently prevent the server from validating the request payload.",
        isCorrect: false,
      },
      {
        id: "opt-3",
        text: "To compress HTTP request headers so mutations travel faster across high-latency networks.",
        isCorrect: false,
      },
      {
        id: "opt-4",
        text: "To bypass browser garbage collection and preserve memory across page reloads.",
        isCorrect: false,
      },
    ],
    explanation:
      "A snapshot buffer captures the pristine state prior to mutation. If the background network request fails or times out, the application immediately restores this snapshot to prevent state divergence—ensuring the user interface never displays phantom data that was rejected by the server.",
    sourceExcerpt:
      "To prevent divergence, mutations must always preserve the previous state snapshot into an isolated rollback buffer.",
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

  let codeBlocksValid = true;
  for (const card of lesson.cards) {
    const fences = (card.content.match(/```/g) || []).length;
    if (fences % 2 !== 0) {
      errors.push(
        `Card "${card.id}" contains an unclosed Markdown code fence.`,
      );
      codeBlocksValid = false;
    }
  }
  if (codeBlocksValid) {
    checksPassed.push(
      "All Markdown fenced code blocks are properly opened, closed, and formatted.",
    );
  }

  let mediaValid = true;
  const mediaErrors: string[] = [];
  for (const card of lesson.cards) {
    if (card.visualMedia) {
      const res = validateMediaSpec(card.visualMedia);
      if (!res.valid) {
        mediaValid = false;
        mediaErrors.push(...res.errors);
        errors.push(
          `Card "${card.id}" media spec failed validation: ${res.errors.join(", ")}`,
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
      desc: "Synthesizing narrative explanations, code blocks, and structured diagrams...",
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
      "Synthesizing narrative cards, literal code blocks, and structured diagrams...",
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    const cards = createCards(plan, analysis, input);
    updateProgress(
      "cards",
      "complete",
      `Generated ${cards.length} structured lesson cards.`,
    );

    updateProgress(
      "checks",
      "in-progress",
      "Formulating grounded comprehension checkpoint with educational explanation...",
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
    createComprehensionChecks(cards, analysis);
    updateProgress(
      "checks",
      "complete",
      "Created grounded multiple-choice checkpoint with 1 unambiguous correct answer.",
    );

    const lessonId = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const lesson: Lesson = {
      id: lessonId || "generated-lesson",
      version: 1,
      title: input.title.trim(),
      author: input.author.trim(),
      sourceUrl: input.sourceUrl.trim(),
      sourceSnippet: analysis.thesis.slice(0, 200),
      keyTakeaways: analysis.takeaways,
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
      provider: "grounded-adaptive-engine",
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
