import {
  validateMediaSpec,
  REACT_RENDER_LOOP_SPEC,
} from "./app/types/media.ts";
import test from "node:test";
import assert from "node:assert/strict";

class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();
globalThis.window = globalThis;

import {
  DEFAULT_LESSONS,
  SAMPLE_LESSON,
  REACT_STATE_LESSON,
} from "./app/services/sampleLesson.ts";
import { progressService } from "./app/services/progress.ts";

test("1. Quiz Quality and Content Audit", () => {
  assert.equal(
    DEFAULT_LESSONS.length,
    2,
    "Must contain exactly 2 default lessons",
  );

  for (const lesson of DEFAULT_LESSONS) {
    assert.ok(lesson.id, "Lesson must have an id");
    assert.ok(lesson.title, "Lesson must have a title");
    assert.ok(lesson.cards.length >= 4, "Lesson must have at least 4 cards");
    assert.ok(lesson.version >= 1, "Lesson must have a version >= 1");
    assert.ok(
      Array.isArray(lesson.keyTakeaways),
      "Lesson must have keyTakeaways array",
    );
    assert.ok(
      lesson.keyTakeaways.length >= 2,
      "Lesson must have at least 2 key takeaways",
    );
    assert.ok(lesson.sourceUrl, "Lesson must have sourceUrl");

    // Checkpoints audit
    const checkpoints = lesson.cards.filter((c) => c.type === "checkpoint");
    assert.ok(
      checkpoints.length >= 1,
      `${lesson.id} must have at least one checkpoint card`,
    );

    for (const cpCard of checkpoints) {
      const cp = cpCard.checkpoint;
      assert.ok(cp, `Card ${cpCard.id} missing checkpoint object`);
      assert.ok(
        cp.question.length > 20,
        `Question on ${cpCard.id} must be substantial`,
      );
      assert.ok(
        !cp.question.toLowerCase().includes("example above"),
        `Question on ${cpCard.id} must not refer to absent 'example above' without self-contained context`,
      );
      assert.ok(
        cp.options.length >= 3,
        `Checkpoint on ${cpCard.id} must have at least 3 options`,
      );

      const correctOptions = cp.options.filter((o) => o.isCorrect === true);
      assert.equal(
        correctOptions.length,
        1,
        `Checkpoint on ${cpCard.id} must have exactly one correct option`,
      );
      assert.ok(
        cp.explanation.length > 30,
        `Explanation on ${cpCard.id} must be substantial and educational`,
      );
    }
  }
});

test("2. Reader State Persistence - Lifecycle & Graceful Degrade", () => {
  localStorage.clear();
  const lessonId = "react-state-render-cycle";
  const version = 1;
  const totalCards = 6;

  // Initial state should be null
  assert.equal(
    progressService.getProgress(lessonId, version, totalCards),
    null,
  );

  // Record an answer
  progressService.recordAnswer(lessonId, version, "react-card-4", "opt-b");
  let saved = progressService.getProgress(lessonId, version, totalCards);
  assert.ok(saved);
  assert.equal(saved.selectedAnswers["react-card-4"], "opt-b");
  assert.equal(saved.isCompleted, false);

  // Clamping: test corrupted out-of-bounds card index
  localStorage.setItem(
    "microlearning_reader_progress_v1",
    JSON.stringify({
      [lessonId]: {
        lessonId,
        version,
        currentCardIndex: 999,
        selectedAnswers: { "react-card-4": "opt-b" },
        isCompleted: false,
      },
    }),
  );
  saved = progressService.getProgress(lessonId, version, totalCards);
  assert.equal(
    saved.currentCardIndex,
    0,
    "Out-of-bounds index must fall back gracefully to 0",
  );

  // Corrupted non-JSON storage
  localStorage.setItem("microlearning_reader_progress_v1", "invalid-json{{[");
  saved = progressService.getProgress(lessonId, version, totalCards);
  assert.equal(
    saved,
    null,
    "Malformed JSON in storage must safely return null without throwing",
  );

  // Version mismatch
  localStorage.setItem(
    "microlearning_reader_progress_v1",
    JSON.stringify({
      [lessonId]: {
        lessonId,
        version: 999,
        currentCardIndex: 2,
        selectedAnswers: {},
      },
    }),
  );
  saved = progressService.getProgress(lessonId, version, totalCards);
  assert.equal(
    saved,
    null,
    "Version mismatch must not bleed into current version",
  );
});

test("3. Completion State & Revisit Workflow", () => {
  localStorage.clear();
  const lessonId = "micro-learning-architecture";
  const version = 1;
  const totalCards = 5;

  // Complete lesson
  progressService.markCompleted(lessonId, version);
  let saved = progressService.getProgress(lessonId, version, totalCards);
  assert.equal(saved.isCompleted, true);
  assert.ok(saved.completedAt);

  // Updating position during review does not erase completion flag
  progressService.setCardIndex(lessonId, version, 0);
  saved = progressService.getProgress(lessonId, version, totalCards);
  assert.equal(
    saved.isCompleted,
    true,
    "Revisiting cards must preserve completed status",
  );
  assert.equal(saved.currentCardIndex, 0);
});

test("4. Multi-lesson Independence", () => {
  localStorage.clear();
  progressService.setCardIndex("lesson-a", 1, 3);
  progressService.recordAnswer("lesson-a", 1, "q1", "opt-1");

  progressService.setCardIndex("lesson-b", 1, 1);
  progressService.recordAnswer("lesson-b", 1, "q2", "opt-2");

  const a = progressService.getProgress("lesson-a", 1, 5);
  const b = progressService.getProgress("lesson-b", 1, 5);

  assert.equal(a.currentCardIndex, 3);
  assert.equal(a.selectedAnswers["q1"], "opt-1");
  assert.equal(b.currentCardIndex, 1);
  assert.equal(b.selectedAnswers["q2"], "opt-2");
  assert.equal(
    a.selectedAnswers["q2"],
    undefined,
    "Lessons must not share answer records",
  );
});

test("5. Encoding Integrity & Mojibake Prevention", () => {
  const mojibakePatterns = ["â€”", "â€™", "â€œ", "â€", "Ã"];

  for (const lesson of DEFAULT_LESSONS) {
    const textsToCheck = [
      lesson.title,
      lesson.author,
      lesson.sourceSnippet,
      ...(lesson.keyTakeaways || []),
    ];

    for (const card of lesson.cards) {
      textsToCheck.push(card.title, card.content);
      if (card.checkpoint) {
        textsToCheck.push(
          card.checkpoint.question,
          card.checkpoint.explanation,
        );
        for (const opt of card.checkpoint.options) {
          textsToCheck.push(opt.text);
        }
      }
    }

    for (const text of textsToCheck) {
      for (const pattern of mojibakePatterns) {
        assert.ok(
          !text.includes(pattern),
          `Found mojibake pattern "${pattern}" in text: "${text.substring(0, 40)}..."`,
        );
      }
    }
  }

  // Explicit positive check for em-dash in retention dilemma card
  const sampleLesson = DEFAULT_LESSONS.find(
    (l) => l.id === "micro-learning-architecture",
  );
  assert.ok(sampleLesson, "Must find micro-learning-architecture lesson");
  const card1 = sampleLesson.cards[0];
  assert.ok(
    card1.content.includes("—leaving no lasting neural retention"),
    "Card 1 must contain valid em dash '—'",
  );
});

test("6. Instructional Media Architecture & Automatic Quality Checks", () => {
  // A. Valid ProcessFlowSpec
  const validCheck = validateMediaSpec(REACT_RENDER_LOOP_SPEC);
  assert.equal(
    validCheck.valid,
    true,
    "Preset REACT_RENDER_LOOP_SPEC must be valid",
  );
  assert.equal(validCheck.errors.length, 0);
  assert.equal(
    REACT_RENDER_LOOP_SPEC.steps.length,
    4,
    "Must have exactly 4 steps",
  );

  // B. Technical accuracy check of render-loop steps
  const stepLabels = REACT_RENDER_LOOP_SPEC.steps.map((s) => s.label);
  assert.ok(stepLabels[0].includes("User Action"));
  assert.ok(stepLabels[1].includes("setState Called"));
  assert.ok(stepLabels[2].includes("React Re-renders"));
  assert.ok(stepLabels[3].includes("Commit & DOM Sync"));

  // Descriptions must clarify scheduled re-render (not synchronous mutation)
  const step2Desc = REACT_RENDER_LOOP_SPEC.steps[1].description.toLowerCase();
  assert.ok(
    step2Desc.includes("schedules re-render") &&
      step2Desc.includes("does not mutate"),
    "Step 2 must accurately describe that setState schedules rather than mutates synchronously",
  );

  // Step 4 must clarify minimal diffs
  const step4Desc = REACT_RENDER_LOOP_SPEC.steps[3].description.toLowerCase();
  assert.ok(
    step4Desc.includes("diff"),
    "Step 4 must accurately describe DOM reconciliation",
  );

  // C. Rejection of invalid specs
  const invalidEmptySteps = validateMediaSpec({
    type: "process-flow",
    steps: [],
  });
  assert.equal(invalidEmptySteps.valid, false, "Must reject flow with 0 steps");

  const invalidOneStep = validateMediaSpec({
    type: "process-flow",
    steps: [{ id: "1", label: "Solo", description: "Only one step" }],
  });
  assert.equal(invalidOneStep.valid, false, "Must reject flow with < 2 steps");

  const invalidEmptyLabel = validateMediaSpec({
    type: "process-flow",
    steps: [
      { id: "1", label: "", description: "Missing label" },
      { id: "2", label: "Step 2", description: "Valid desc" },
    ],
  });
  assert.equal(
    invalidEmptyLabel.valid,
    false,
    "Must reject step with empty label",
  );

  const unsupportedType = validateMediaSpec({ type: "unsupported-3d-model" });
  assert.equal(
    unsupportedType.valid,
    false,
    "Must reject unsupported media type",
  );

  // D. Verify Lesson Card 3 references validated visualMedia
  const reactLesson = DEFAULT_LESSONS.find(
    (l) => l.id === "react-state-render-cycle",
  );
  assert.ok(reactLesson, "Must find react-state-render-cycle lesson");
  const card3 = reactLesson.cards.find((c) => c.id === "rs-3");
  assert.ok(card3, "Must find card rs-3");
  assert.ok(card3.visualMedia, "Card rs-3 must have visualMedia configured");
  assert.equal(card3.visualMedia.type, "process-flow");
  assert.equal(card3.visualMedia.steps.length, 4);
});
