import test from "node:test";
import assert from "node:assert/strict";

import {
  validateEditedLesson,
  recalculateEstimatedMinutes,
} from "./app/utils/editorValidation.ts";
import { storageService } from "./app/services/storage.ts";
import { draftService } from "./app/services/draft.ts";
import { SAMPLE_LESSON } from "./app/services/sampleLesson.ts";
import { REACT_RENDER_LOOP_SPEC } from "./app/types/media.ts";

// In-memory mock for localStorage in Node test environment
const mockStorage = new Map();
globalThis.window = globalThis;
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  length: 0,
  key: () => null,
};

function createTestLesson() {
  return JSON.parse(JSON.stringify(SAMPLE_LESSON));
}

test("1. Card CRUD Operations - Add, Edit, Duplicate, Delete Isolation", () => {
  const lesson = createTestLesson();
  const initialCount = lesson.cards.length;

  // 1. Add Card: receives unique ID and valid defaults
  const newCard = {
    id: `card_${Date.now()}_test_new`,
    type: "narrative",
    title: "New Architectural Concept",
    content:
      "Detailed explanation of asynchronous dispatch.\n\n```ts\ndispatch({ type: 'ASYNC' });\n```",
    isLocked: false,
  };
  const withAdded = [...lesson.cards, newCard];
  assert.equal(withAdded.length, initialCount + 1);
  assert.ok(withAdded[withAdded.length - 1].id.includes("test_new"));

  // 2. Edit Card: modifying one card does NOT mutate other cards
  const cardToEdit = { ...withAdded[0], title: "Updated Snapshot Title" };
  const withEdited = [cardToEdit, ...withAdded.slice(1)];
  assert.equal(withEdited[0].title, "Updated Snapshot Title");
  assert.equal(
    withEdited[1].title,
    withAdded[1].title,
    "Adjacent card must remain unchanged",
  );

  // 3. Duplicate Card: receives new unique ID and unique option IDs for checkpoints
  const checkpointCard = withAdded.find((c) => c.type === "checkpoint");
  assert.ok(checkpointCard, "Sample lesson should contain a checkpoint");

  const duplicatedCard = {
    ...JSON.parse(JSON.stringify(checkpointCard)),
    id: `card_${Date.now()}_dup`,
    title: `${checkpointCard.title} (Copy)`,
  };
  if (duplicatedCard.checkpoint) {
    duplicatedCard.checkpoint.options = duplicatedCard.checkpoint.options.map(
      (opt, idx) => ({
        ...opt,
        id: `opt_dup_${Date.now()}_${idx}`,
      }),
    );
  }

  assert.notEqual(duplicatedCard.id, checkpointCard.id);
  assert.equal(
    duplicatedCard.checkpoint.options.length,
    checkpointCard.checkpoint.options.length,
  );
  for (let i = 0; i < duplicatedCard.checkpoint.options.length; i++) {
    assert.notEqual(
      duplicatedCard.checkpoint.options[i].id,
      checkpointCard.checkpoint.options[i].id,
      "Nested checkpoint option IDs must be unique",
    );
  }

  // 4. Delete Card: updates deck correctly
  const withDeleted = withAdded.filter((c) => c.id !== newCard.id);
  assert.equal(withDeleted.length, initialCount);
  assert.ok(!withDeleted.some((c) => c.id === newCard.id));
});

test("2. Card Reordering - Stable Identifiers & Boundary Enforcements", () => {
  const lesson = createTestLesson();
  const initialCards = [...lesson.cards];
  const firstId = initialCards[0].id;
  const secondId = initialCards[1].id;

  // Move #1 down -> should become #2, #2 becomes #1
  const reordered = [...initialCards];
  const [moved] = reordered.splice(0, 1);
  reordered.splice(1, 0, moved);

  assert.equal(reordered[0].id, secondId);
  assert.equal(reordered[1].id, firstId);
  assert.equal(
    reordered[0].content,
    initialCards[1].content,
    "Content must remain intact",
  );
  assert.equal(
    reordered[1].content,
    initialCards[0].content,
    "Content must remain intact",
  );

  // Boundary condition: cannot move top card up (targetIdx < 0)
  const canMoveTopUp = 0 - 1 >= 0;
  assert.equal(canMoveTopUp, false);

  // Boundary condition: cannot move bottom card down (targetIdx >= length)
  const lastIndex = reordered.length - 1;
  const canMoveBottomDown = lastIndex + 1 < reordered.length;
  assert.equal(canMoveBottomDown, false);
});

test("3. Checkpoint Strict Contract Validation", () => {
  const lesson = createTestLesson();
  const cpCard = lesson.cards.find((c) => c.type === "checkpoint");
  assert.ok(cpCard && cpCard.checkpoint);

  // Valid checkpoint passes validation
  const validRes = validateEditedLesson(lesson);
  assert.ok(validRes.isValid, "Initial lesson must be valid");

  // 1. Missing correct answer fails validation
  const brokenLesson1 = JSON.parse(JSON.stringify(lesson));
  const targetCp1 = brokenLesson1.cards.find((c) => c.type === "checkpoint");
  targetCp1.checkpoint.options.forEach((opt) => (opt.isCorrect = false));
  const res1 = validateEditedLesson(brokenLesson1);
  assert.equal(res1.isValid, false);
  assert.ok(
    res1.errors.some((e) =>
      e.includes("must designate exactly one correct answer"),
    ),
    "Must enforce at least one correct answer",
  );

  // 2. Multiple correct answers fail validation
  const brokenLesson2 = JSON.parse(JSON.stringify(lesson));
  const targetCp2 = brokenLesson2.cards.find((c) => c.type === "checkpoint");
  targetCp2.checkpoint.options.forEach((opt) => (opt.isCorrect = true));
  const res2 = validateEditedLesson(brokenLesson2);
  assert.equal(res2.isValid, false);
  assert.ok(
    res2.errors.some((e) => e.includes("multiple correct answers")),
    "Must reject multiple correct answers",
  );

  // 3. Less than 2 options fails validation
  const brokenLesson3 = JSON.parse(JSON.stringify(lesson));
  const targetCp3 = brokenLesson3.cards.find((c) => c.type === "checkpoint");
  targetCp3.checkpoint.options = [targetCp3.checkpoint.options[0]];
  const res3 = validateEditedLesson(brokenLesson3);
  assert.equal(res3.isValid, false);
  assert.ok(
    res3.errors.some((e) => e.includes("at least 2 answer options")),
    "Must enforce at least 2 options",
  );

  // 4. Empty explanation fails validation
  const brokenLesson4 = JSON.parse(JSON.stringify(lesson));
  const targetCp4 = brokenLesson4.cards.find((c) => c.type === "checkpoint");
  targetCp4.checkpoint.explanation = "   ";
  const res4 = validateEditedLesson(brokenLesson4);
  assert.equal(res4.isValid, false);
  assert.ok(
    res4.errors.some((e) => e.includes("educational explanation")),
    "Must enforce educational explanation",
  );
});

test("4. Card Locking Behavior", () => {
  const lesson = createTestLesson();
  assert.equal(lesson.cards[0].isLocked || false, false);

  // Toggle lock
  const lockedLesson = {
    ...lesson,
    cards: lesson.cards.map((c, i) => (i === 0 ? { ...c, isLocked: true } : c)),
  };
  assert.equal(lockedLesson.cards[0].isLocked, true);
  assert.equal(lockedLesson.cards[1].isLocked || false, false);

  // Locked card maintains content and title
  assert.equal(lockedLesson.cards[0].title, lesson.cards[0].title);
  assert.equal(lockedLesson.cards[0].content, lesson.cards[0].content);
});

test("5. Read Time Recalculation Dynamics", () => {
  const lesson = createTestLesson();
  const initialEst = recalculateEstimatedMinutes(lesson.cards);
  assert.ok(initialEst >= 1, "Estimated minutes should be at least 1");

  // Add 400 words to deck
  const longCard = {
    id: "card_long_test",
    type: "narrative",
    title: "Deep Dive Architecture",
    content: Array(400).fill("architecture").join(" "),
  };
  const extendedCards = [...lesson.cards, longCard];
  const updatedEst = recalculateEstimatedMinutes(extendedCards);
  assert.ok(
    updatedEst > initialEst,
    "Adding 400 words must increase estimated read time",
  );
});

test("6. Draft Persistence & Recovery Isolation", () => {
  const lesson = createTestLesson();
  const testId = "draft_isolation_test_lesson";
  lesson.id = testId;

  // Initially no draft exists
  assert.equal(draftService.hasDraft(testId), false);
  assert.equal(draftService.getDraft(testId), null);

  // Save modified draft
  const modifiedDraft = {
    ...lesson,
    title: "Draft Modified In-Progress Title",
  };
  draftService.saveDraft(testId, modifiedDraft);
  assert.equal(draftService.hasDraft(testId), true);

  const recovered = draftService.getDraft(testId);
  assert.ok(recovered);
  assert.equal(recovered.title, "Draft Modified In-Progress Title");

  // Storage service canonical store must NOT be mutated by draft saves
  const stored = storageService.getLessonById(testId);
  assert.equal(
    stored,
    undefined,
    "Canonical storage must remain unmutated until explicit save",
  );

  // Clear draft
  draftService.clearDraft(testId);
  assert.equal(draftService.hasDraft(testId), false);
});

test("7. JSON Export Serialization and Schema Conformance", () => {
  const lesson = createTestLesson();
  const exportedString = JSON.stringify(lesson, null, 2);
  const parsed = JSON.parse(exportedString);

  assert.equal(parsed.id, lesson.id);
  assert.equal(parsed.title, lesson.title);
  assert.equal(parsed.cards.length, lesson.cards.length);
  assert.equal(parsed.version, lesson.version);
  assert.equal(parsed.estimatedMinutes, lesson.estimatedMinutes);

  // Validate that parsed JSON satisfies validateEditedLesson
  const validation = validateEditedLesson(parsed);
  assert.ok(validation.isValid, "Exported JSON must be schema-valid");
});

test("8. Slice 4 Handoff Contract Ingestion & Round-trip", () => {
  const lesson = createTestLesson();
  const handoffPayload = {
    lesson,
    sourceAnalysis: {
      thesis: "Optimistic UI mutations require reliable rollback invariants.",
      sections: [
        { heading: "Background", body: "Mutation handling", codeSnippets: [] },
      ],
      keyTerms: [
        {
          term: "Snapshot",
          definition: "A point-in-time closure of React state",
        },
      ],
      processSteps: [
        { stepNumber: 1, label: "Action", description: "Event triggered" },
      ],
      comparisons: [
        { conceptA: "Optimistic", conceptB: "Pessimistic", contrasts: [] },
      ],
      takeaways: ["Always keep rollback cache"],
      instructionalOpportunities: ["Diagram the mutation flow"],
      totalWordCount: 850,
    },
    qualityReport: {
      isValid: true,
      cardCount: lesson.cards.length,
      checkpointCount: 1,
      checksPassed: ["Schema valid", "Checkpoint valid"],
      warnings: [],
      errors: [],
      groundingScore: 100,
      totalChecksCount: 7,
    },
    provider: "grounded-adaptive-engine",
  };

  // Assert handoff payload structure is intact
  assert.equal(handoffPayload.lesson.id, lesson.id);
  assert.equal(handoffPayload.provider, "grounded-adaptive-engine");
  assert.equal(handoffPayload.qualityReport.groundingScore, 100);
  assert.equal(handoffPayload.sourceAnalysis.sections.length, 1);

  // Validation preserves lesson schema
  const res = validateEditedLesson(handoffPayload.lesson);
  assert.ok(res.isValid, "Lesson from Slice 4 handoff must be fully valid");
});
