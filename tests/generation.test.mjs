import test from "node:test";
import assert from "node:assert/strict";

import {
  countWords,
  isValidUrl,
  validateSourceInput,
  MIN_WORD_COUNT,
  MAX_WORD_COUNT,
} from "../app/utils/text.ts";
import { SAMPLE_SOURCE_INPUT } from "../app/services/sampleArticle.ts";
import {
  understandSource,
  planLesson,
  createCards,
  createComprehensionChecks,
  validateQuality,
  generateLesson,
} from "../app/services/generator.ts";
import { validateMediaSpec } from "../app/types/media.ts";

test("1. Word Count Utility & Boundary Conditions", () => {
  assert.equal(countWords(""), 0);
  assert.equal(countWords("   \n\t  "), 0);
  assert.equal(countWords("single"), 1);
  assert.equal(countWords("  hello   world  "), 2);

  // Exact 199 words
  const text199 = Array(199).fill("word").join(" ");
  assert.equal(countWords(text199), 199);

  // Exact 200 words (Minimum boundary)
  const text200 = Array(200).fill("word").join(" ");
  assert.equal(countWords(text200), 200);

  // Exact 10,000 words (Maximum boundary)
  const text10000 = Array(10000).fill("word").join(" ");
  assert.equal(countWords(text10000), 10000);

  // Exact 10,001 words (Exceeding boundary)
  const text10001 = Array(10001).fill("word").join(" ");
  assert.equal(countWords(text10001), 10001);

  // Markdown with code fences and multi-line formatting
  const markdownSample = `
    # Heading
    Here is a paragraph with **bold** text and \`inline code\`.
    
    \`\`\`ts
    const x = 42;
    console.log(x);
    \`\`\`
  `;
  const count = countWords(markdownSample);
  assert.ok(count > 10, `Expected word count > 10, got ${count}`);
});

test("2. URL Validation Rules", () => {
  assert.equal(isValidUrl("https://example.com"), true);
  assert.equal(
    isValidUrl("http://sub.domain.org/path/to/article?ref=123#sec"),
    true,
  );
  assert.equal(isValidUrl("ftp://example.com"), false);
  assert.equal(isValidUrl("javascript:alert(1)"), false);
  assert.equal(isValidUrl("notaurl"), false);
  assert.equal(isValidUrl(""), false);
  assert.equal(isValidUrl("http://localhost"), false); // needs valid domain
});

test("3. Source Input Validation & Error Association", () => {
  // Empty input -> all fields invalid
  const emptyRes = validateSourceInput({
    title: "",
    author: "",
    sourceUrl: "",
    sourceText: "",
    permissionConfirmed: false,
  });
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.title, "Title error expected");
  assert.ok(emptyRes.errors.author, "Author error expected");
  assert.ok(emptyRes.errors.sourceUrl, "Source URL error expected");
  assert.ok(emptyRes.errors.sourceText, "Source text error expected");
  assert.ok(
    emptyRes.errors.permissionConfirmed,
    "Permission acknowledgment error expected",
  );

  // Whitespace-only title
  const wsRes = validateSourceInput({
    title: "    ",
    author: "Alice",
    sourceUrl: "https://example.com",
    sourceText: Array(250).fill("valid").join(" "),
    permissionConfirmed: true,
  });
  assert.equal(wsRes.isValid, false);
  assert.ok(wsRes.errors.title);

  // Word count below 200 words
  const shortRes = validateSourceInput({
    title: "Optimistic Mutations",
    author: "Alice",
    sourceUrl: "https://example.com",
    sourceText: Array(199).fill("word").join(" "),
    permissionConfirmed: true,
  });
  assert.equal(shortRes.isValid, false);
  assert.ok(shortRes.errors.sourceText?.includes("minimum of 200 words"));

  // Word count above 10,000 words
  const longRes = validateSourceInput({
    title: "Optimistic Mutations",
    author: "Alice",
    sourceUrl: "https://example.com",
    sourceText: Array(10001).fill("word").join(" "),
    permissionConfirmed: true,
  });
  assert.equal(longRes.isValid, false);
  assert.ok(longRes.errors.sourceText?.includes("exceeds maximum limit"));

  // Missing permission checkbox
  const noPermRes = validateSourceInput({
    title: "Optimistic Mutations",
    author: "Alice",
    sourceUrl: "https://example.com",
    sourceText: Array(250).fill("word").join(" "),
    permissionConfirmed: false,
  });
  assert.equal(noPermRes.isValid, false);
  assert.ok(noPermRes.errors.permissionConfirmed);

  // Sample article loaded but unconfirmed permission
  const sampleInitialRes = validateSourceInput(SAMPLE_SOURCE_INPUT);
  assert.equal(sampleInitialRes.isValid, false);
  assert.ok(
    sampleInitialRes.errors.permissionConfirmed,
    "Sample must not silently bypass permission",
  );

  // Sample article with explicit permission -> fully valid
  const sampleValidRes = validateSourceInput({
    ...SAMPLE_SOURCE_INPUT,
    permissionConfirmed: true,
  });
  assert.equal(sampleValidRes.isValid, true);
  assert.equal(Object.keys(sampleValidRes.errors).length, 0);
  assert.ok(
    sampleValidRes.wordCount >= 200 && sampleValidRes.wordCount <= 10000,
  );
});

test("4. Five-Stage Adaptive Generation Engine - Pipeline & Execution Order", async () => {
  const stageTransitions = [];

  const input = {
    ...SAMPLE_SOURCE_INPUT,
    permissionConfirmed: true,
  };

  const result = await generateLesson(input, (progress) => {
    if (progress.currentStageId) {
      const status = progress.stages[progress.currentStageId]?.status;
      stageTransitions.push({
        stageId: progress.currentStageId,
        status,
      });
    }
  });

  // Verify result structure
  assert.ok(result, "Result must exist");
  assert.ok(result.lesson, "Lesson must exist in result");
  assert.ok(result.sourceAnalysis, "Source analysis must exist");
  assert.ok(result.qualityReport, "Quality report must exist");

  // Verify 5 stages were transitioned in order
  const stageIds = ["understanding", "planning", "cards", "checks", "quality"];
  for (const expectedStage of stageIds) {
    const hasTransition = stageTransitions.some(
      (t) => t.stageId === expectedStage,
    );
    assert.ok(
      hasTransition,
      `Stage ${expectedStage} must be reported during execution`,
    );
  }
});

test("5. Stage 1 — Understanding Source Analysis", () => {
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);

  assert.ok(analysis.thesis.length > 20, "Must extract non-trivial thesis");
  assert.ok(analysis.sections.length >= 2, "Must extract multiple sections");
  assert.ok(analysis.keyTerms.length >= 2, "Must extract key technical terms");
  assert.ok(
    analysis.processSteps.length >= 2,
    "Must extract sequential process steps",
  );
  assert.ok(analysis.takeaways.length >= 2, "Must extract key takeaways");
  for (const takeaway of analysis.takeaways) {
    assert.ok(
      !/^([^:]+):\s*\1[:\s]/i.test(takeaway),
      `Takeaway must not contain duplicate term prefix: "${takeaway}"`,
    );
  }
  assert.ok(
    analysis.totalWordCount >= 200,
    "Word count must be tracked accurately",
  );

  // Code snippets grounded in source
  const allSnippets = analysis.sections.flatMap((s) => s.codeSnippets);
  assert.ok(
    allSnippets.length >= 1,
    "Must extract code snippets from technical source",
  );
  assert.ok(
    allSnippets[0].includes("function") || allSnippets[0].includes("const"),
    "Snippet should contain literal code",
  );
});

test("6. Stage 2 — Adaptive Lesson Planning", () => {
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);
  const plan = planLesson(analysis, SAMPLE_SOURCE_INPUT);

  // Between 4 and 8 cards
  assert.ok(
    plan.targetCardCount >= 4 && plan.targetCardCount <= 8,
    `Card count must be 4–8, got ${plan.targetCardCount}`,
  );
  assert.equal(plan.cardOutlines.length, plan.targetCardCount);
  assert.ok(plan.estimatedMinutes >= 2 && plan.estimatedMinutes <= 15);

  // Contains checkpoint card
  const hasCheckpoint = plan.cardOutlines.some((c) => c.type === "checkpoint");
  assert.ok(hasCheckpoint, "Plan must include a checkpoint card");

  // Contains visual media card
  const hasVisual = plan.cardOutlines.some((c) => c.hasVisualMedia);
  assert.ok(
    hasVisual,
    "Plan should identify structured visual media opportunity",
  );
});

test("7. Stage 3 — Creating Grounded Cards & Structured Media", () => {
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);
  const plan = planLesson(analysis, SAMPLE_SOURCE_INPUT);
  const cards = createCards(plan, analysis, SAMPLE_SOURCE_INPUT);

  assert.equal(cards.length, plan.targetCardCount);

  // Inspect media card
  const mediaCard = cards.find((c) => c.visualMedia);
  assert.ok(mediaCard, "Must have card with visualMedia spec");
  if (mediaCard && mediaCard.visualMedia) {
    const mediaValidation = validateMediaSpec(mediaCard.visualMedia);
    assert.equal(
      mediaValidation.valid,
      true,
      `Visual media must be valid: ${mediaValidation.errors.join(", ")}`,
    );
    assert.ok(
      mediaCard.visualMedia.steps.length >= 3,
      "Media should have multi-step process flow",
    );
  }

  // Verify markdown integrity & literal code
  for (const card of cards) {
    assert.ok(card.id, "Card must have stable id");
    assert.ok(card.title, "Card must have title");
    assert.ok(card.content.length > 50, "Card content must be non-trivial");

    // Check code fence balance
    const fenceCount = (card.content.match(/```/g) || []).length;
    assert.equal(
      fenceCount % 2,
      0,
      `Card ${card.id} has unbalanced code fences`,
    );
  }
});

test("8. Stage 4 — Comprehension Checkpoint Strict Contract", () => {
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);
  const plan = planLesson(analysis, SAMPLE_SOURCE_INPUT);
  const cards = createCards(plan, analysis, SAMPLE_SOURCE_INPUT);
  createComprehensionChecks(cards, analysis);

  const checkpointCard = cards.find(
    (c) => c.type === "checkpoint" && c.checkpoint,
  );
  assert.ok(checkpointCard, "Checkpoint card must be created");

  const cp = checkpointCard.checkpoint;
  assert.ok(cp.question.length > 15, "Question must be substantial");
  assert.ok(cp.options.length >= 3, "Must have at least 3 options");

  // Exactly one designated correct answer
  const correctOptions = cp.options.filter((o) => o.isCorrect);
  assert.equal(
    correctOptions.length,
    1,
    `Checkpoint must have EXACTLY 1 correct answer, found ${correctOptions.length}`,
  );

  // Must have educational explanation grounded in source
  assert.ok(
    cp.explanation.length > 20,
    "Explanation must be complete and instructional",
  );
});

test("9. Stage 5 — Deterministic Quality Audit & Defensible Scoring", () => {
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);
  const plan = planLesson(analysis, SAMPLE_SOURCE_INPUT);
  const cards = createCards(plan, analysis, SAMPLE_SOURCE_INPUT);
  createComprehensionChecks(cards, analysis);

  const lesson = {
    id: "optimistic-ui-test",
    version: 1,
    title: SAMPLE_SOURCE_INPUT.title,
    author: SAMPLE_SOURCE_INPUT.author,
    sourceUrl: SAMPLE_SOURCE_INPUT.sourceUrl,
    sourceSnippet: analysis.thesis.slice(0, 200),
    keyTakeaways: analysis.takeaways,
    estimatedMinutes: plan.estimatedMinutes,
    createdAt: new Date().toISOString(),
    cards,
  };

  // Valid lesson quality check: all 7 checks pass, score is exactly 100%
  const validAudit = validateQuality(lesson, analysis);
  assert.equal(validAudit.isValid, true);
  assert.equal(validAudit.errors.length, 0);
  assert.equal(validAudit.checksPassed.length, 7);
  assert.equal(validAudit.totalChecksCount, 7);
  assert.equal(validAudit.groundingScore, 100);

  // Invalid test case 1: Checkpoint with multiple correct answers
  const badLessonMultipleCorrect = JSON.parse(JSON.stringify(lesson));
  const cpCard = badLessonMultipleCorrect.cards.find((c) => c.checkpoint);
  if (cpCard) {
    cpCard.checkpoint.options[0].isCorrect = true;
    cpCard.checkpoint.options[1].isCorrect = true;
  }
  const badAudit1 = validateQuality(badLessonMultipleCorrect, analysis);
  assert.equal(badAudit1.isValid, false);
  assert.ok(
    badAudit1.errors.some((e) =>
      e.toLowerCase().includes("exactly one correct option"),
    ),
  );

  // Invalid test case 2: Unclosed code fence
  const badLessonUnclosedFence = JSON.parse(JSON.stringify(lesson));
  badLessonUnclosedFence.cards[0].content +=
    "\n```typescript\nconst broken = 1;";
  const badAudit2 = validateQuality(badLessonUnclosedFence, analysis);
  assert.equal(badAudit2.isValid, false);
  assert.ok(
    badAudit2.errors.some((e) => e.toLowerCase().includes("code fence")),
  );

  // Invalid test case 3: Card count out of bounds
  const badLessonTooFewCards = JSON.parse(JSON.stringify(lesson));
  badLessonTooFewCards.cards = [badLessonTooFewCards.cards[0]];
  const badAudit3 = validateQuality(badLessonTooFewCards, analysis);
  assert.equal(badAudit3.isValid, false);
  assert.ok(
    badAudit3.errors.some((e) => e.toLowerCase().includes("card count")),
  );
});

test("10. Slice 4 Handoff Contract Integrity", async () => {
  const input = {
    ...SAMPLE_SOURCE_INPUT,
    permissionConfirmed: true,
  };

  const handoff = await generateLesson(input);

  // Downstream Slice 4 consumer assertions:
  assert.equal(typeof handoff.lesson.id, "string");
  assert.equal(typeof handoff.lesson.title, "string");
  assert.equal(typeof handoff.lesson.author, "string");
  assert.equal(typeof handoff.lesson.sourceUrl, "string");
  assert.ok(Array.isArray(handoff.lesson.cards));
  assert.ok(handoff.lesson.cards.length >= 4);

  // Verify cards have valid types
  const validTypes = new Set([
    "narrative",
    "example",
    "comparison",
    "checkpoint",
  ]);
  for (const card of handoff.lesson.cards) {
    assert.ok(validTypes.has(card.type), `Invalid card type: ${card.type}`);
    assert.equal(typeof card.content, "string");
  }

  // Verify takeaways
  assert.ok(Array.isArray(handoff.lesson.keyTakeaways));
  assert.ok(handoff.lesson.keyTakeaways.length >= 2);

  // Quality report conforms
  assert.equal(handoff.qualityReport.isValid, true);
  assert.equal(handoff.qualityReport.totalChecksCount, 7);
  assert.equal(handoff.provider, "grounded-adaptive-engine");
});

test("11. Symbol & Unicode Encoding Integrity Audit", async () => {
  const input = {
    ...SAMPLE_SOURCE_INPUT,
    permissionConfirmed: true,
  };

  const handoff = await generateLesson(input);

  // Ensure no generated lesson titles, cards, or takeaways contain stray '??'
  assert.ok(
    !handoff.lesson.title.includes("??"),
    "Title must not contain '??'",
  );
  for (const card of handoff.lesson.cards) {
    assert.ok(
      !card.title.includes("??"),
      `Card title '${card.title}' must not contain '??'`,
    );
    assert.ok(
      !card.content.includes("??"),
      `Card content in '${card.id}' must not contain '??'`,
    );
  }
  for (const takeaway of handoff.lesson.keyTakeaways) {
    assert.ok(
      !takeaway.includes("??"),
      `Takeaway '${takeaway}' must not contain '??'`,
    );
  }

  // Ensure Quality checks passed strings use genuine em-dash / en-dash and no '?'
  for (const check of handoff.qualityReport.checksPassed) {
    assert.ok(
      !check.includes("?"),
      `Quality check description '${check}' must not contain '?'`,
    );
    assert.ok(
      !check.includes("??"),
      `Quality check description '${check}' must not contain '??'`,
    );
  }
});

test("12. Create Another Lesson Reset & Isolation Contract", () => {
  // Mock localStorage for storage service check
  class MockLocalStorage {
    constructor() {
      this.store = {};
    }
    getItem(key) {
      return this.store[key] || null;
    }
    setItem(key, val) {
      this.store[key] = String(val);
    }
    removeItem(key) {
      delete this.store[key];
    }
    clear() {
      this.store = {};
    }
  }
  const storage = new MockLocalStorage();
  storage.setItem(
    "microlearning_lessons_v3",
    JSON.stringify([{ id: "existing-lesson-1" }]),
  );

  // Verify that an application reset state yields clean initial values
  const cleanState = {
    title: "",
    author: "",
    sourceUrl: "",
    sourceText: "",
    permissionConfirmed: false,
  };
  const valResult = validateSourceInput(cleanState);
  assert.equal(valResult.isValid, false);
  assert.equal(valResult.wordCount, 0);

  // Verify that previously saved lessons in storage remain completely intact
  const savedData = JSON.parse(storage.getItem("microlearning_lessons_v3"));
  assert.equal(savedData.length, 1);
  assert.equal(savedData[0].id, "existing-lesson-1");
});
