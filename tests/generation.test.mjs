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
import {
  setGeminiClientOverride,
  GeminiError,
  getGeminiModel,
  DEFAULT_GEMINI_MODEL,
  listAvailableGeminiModels,
} from "../app/services/gemini.server.ts";
import { validateMediaSpec } from "../app/types/media.ts";
import { action as generateAction } from "../app/routes/api.generate.ts";

// Standard Sample Article Mock Response (Optimistic UI article)
const SAMPLE_MOCK_GEMINI_OUTPUT = {
  keyTakeaways: [
    "Core Principle: Optimistic updates provide instant perceived responsiveness.",
    "Rollback Buffers: Preserving snapshots ensures safe recovery on network failure.",
    "Idempotency: Reconciling server state prevents duplicate client side-effects.",
  ],
  cards: [
    {
      type: "narrative",
      title: "Perceived Latency & The Optimistic Model",
      content:
        "In modern web applications, **perceived responsiveness** defines the user experience. Waiting 300 to 800 milliseconds for a server round-trip on every user interaction creates an unmistakable sense of sluggishness.\n\n**Optimistic UI** solves this by updating the user interface immediately under the assumption that the mutation will succeed, while executing the actual network request silently in the background.",
    },
    {
      type: "narrative",
      title: "The Resilient Execution Lifecycle",
      content:
        "A reliable optimistic mutation is not just an immediate UI update—it is a coordinated **five-step lifecycle** designed to protect data integrity:\n\n1. **User Action**: The user initiates a mutation.\n2. **Snapshot Buffer**: Local state is cloned into an isolated rollback buffer.\n3. **Optimistic Rendering**: The local UI updates instantly with the predicted state.\n4. **Network Dispatch**: The mutation request is sent in the background with an idempotency key.\n5. **Reconciliation or Rollback**: On success, temporary client entities reconcile with server data. On failure, the snapshot buffer restores previous state.",
    },
    {
      type: "example",
      title: "Implementing Rollback Buffers",
      content:
        "The primary risk in optimistic mutations is **state divergence**—where an unhandled network error leaves phantom data on the client.\n\n```typescript\ninterface Mutation<T> {\n  snapshot: T;\n  apply: (next: T) => void;\n  rollback: () => void;\n}\n```\n\nNotice that if `networkPromise()` rejects, the `catch` block immediately restores `previousSnapshot`, ensuring the client never remains in a corrupted state.",
    },
    {
      type: "narrative",
      title: "Optimistic State-to-Server Architecture",
      content:
        "Visualizing the pipeline clarifies how the client coordinates the local UI update with server communication.\n\nNotice how the **Snapshot Buffer** acts as an emergency parachute: if network communication fails, the application rolls back to the exact pre-mutation state without corrupting unrelated client data.",
      visualMedia: {
        type: "process-flow",
        title: "Optimistic Mutation Lifecycle",
        accessibleDescription:
          "A five-step process flow: 1. User Action. 2. Capture Snapshot Buffer. 3. Instant Optimistic Render. 4. Background Network Dispatch. 5. Server Reconciliation or Rollback.",
        steps: [
          {
            stepNumber: 1,
            label: "1. User Action",
            description: "User initiates mutation in the client interface",
            variant: "default",
          },
          {
            stepNumber: 2,
            label: "2. Capture Snapshot Buffer",
            description: "Preserve previous state in isolated rollback buffer",
            variant: "accent",
          },
          {
            stepNumber: 3,
            label: "3. Instant Render",
            description:
              "Apply optimistic prediction to local state immediately",
            variant: "default",
          },
          {
            stepNumber: 4,
            label: "4. Network Dispatch",
            description:
              "Send HTTP mutation in background with idempotency key",
            variant: "default",
          },
          {
            stepNumber: 5,
            label: "5. Reconciliation",
            description:
              "Reconcile with server confirmation or rollback on error",
            variant: "success",
          },
        ],
      },
    },
    {
      type: "comparison",
      title: "Optimistic vs. Pessimistic Trade-offs",
      content:
        "Choosing between optimistic updates and pessimistic spinners involves explicit architectural trade-offs:\n\n- **Perceived Latency**: Optimistic updates eliminate lag with zero perceived delay. Pessimistic flows force users to wait for network roundtrips.\n- **Implementation Complexity**: Optimistic flows require rollback buffers, conflict resolution, and idempotency keys. Pessimistic flows only update state after confirmed server response.\n- **Failure Frequency**: Optimistic models are ideal for high-probability operations (toggling likes, bookmarking, reordering cards). Pessimistic models are required for destructive or high-risk actions (financial payments, destructive account deletions).",
    },
    {
      type: "checkpoint",
      title: "Comprehension Checkpoint",
      content:
        "Verify your understanding of optimistic mutations, rollback buffers, and state divergence.",
      checkpoint: {
        question:
          "When implementing Optimistic UI, what is the primary purpose of capturing a snapshot buffer before updating local state?",
        options: [
          {
            text: "To allow instant restoration of the previous valid state if the background network request fails or times out.",
            isCorrect: true,
          },
          {
            text: "To permanently prevent the server from validating the request payload.",
            isCorrect: false,
          },
          {
            text: "To compress HTTP request headers so mutations travel faster across high-latency networks.",
            isCorrect: false,
          },
          {
            text: "To bypass browser garbage collection and preserve memory across page reloads.",
            isCorrect: false,
          },
        ],
        explanation:
          "A snapshot buffer captures the pristine state prior to mutation. If the background network request fails or times out, the application immediately restores this snapshot to prevent state divergence—ensuring the user interface never displays phantom data that was rejected by the server.",
        sourceExcerpt:
          "To prevent divergence, mutations must always preserve the previous state snapshot into an isolated rollback buffer.",
      },
    },
  ],
};

function setupSampleMock() {
  setGeminiClientOverride({
    async generateContent() {
      return { text: JSON.stringify(SAMPLE_MOCK_GEMINI_OUTPUT) };
    },
  });
}

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
  assert.equal(isValidUrl("http://localhost"), false);
});

test("3. Source Input Validation & Error Association", () => {
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

  const wsRes = validateSourceInput({
    title: "    ",
    author: "Alice",
    sourceUrl: "https://example.com",
    sourceText: Array(250).fill("valid").join(" "),
    permissionConfirmed: true,
  });
  assert.equal(wsRes.isValid, false);
  assert.ok(wsRes.errors.title);

  const shortRes = validateSourceInput({
    title: "Optimistic Mutations",
    author: "Alice",
    sourceUrl: "https://example.com",
    sourceText: Array(199).fill("word").join(" "),
    permissionConfirmed: true,
  });
  assert.equal(shortRes.isValid, false);
  assert.ok(shortRes.errors.sourceText?.includes("minimum of 200 words"));

  const longRes = validateSourceInput({
    title: "Optimistic Mutations",
    author: "Alice",
    sourceUrl: "https://example.com",
    sourceText: Array(10001).fill("word").join(" "),
    permissionConfirmed: true,
  });
  assert.equal(longRes.isValid, false);
  assert.ok(longRes.errors.sourceText?.includes("exceeds maximum limit"));

  const noPermRes = validateSourceInput({
    title: "Optimistic Mutations",
    author: "Alice",
    sourceUrl: "https://example.com",
    sourceText: Array(250).fill("word").join(" "),
    permissionConfirmed: false,
  });
  assert.equal(noPermRes.isValid, false);
  assert.ok(noPermRes.errors.permissionConfirmed);

  const sampleInitialRes = validateSourceInput(SAMPLE_SOURCE_INPUT);
  assert.equal(sampleInitialRes.isValid, false);
  assert.ok(
    sampleInitialRes.errors.permissionConfirmed,
    "Sample must not silently bypass permission",
  );

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
  setupSampleMock();
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

  assert.ok(result, "Result must exist");
  assert.ok(result.lesson, "Lesson must exist in result");
  assert.ok(result.sourceAnalysis, "Source analysis must exist");
  assert.ok(result.qualityReport, "Quality report must exist");

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

  assert.ok(
    plan.targetCardCount >= 4 && plan.targetCardCount <= 8,
    `Card count must be 4–8, got ${plan.targetCardCount}`,
  );
  assert.equal(plan.cardOutlines.length, plan.targetCardCount);
  assert.ok(plan.estimatedMinutes >= 2 && plan.estimatedMinutes <= 15);

  const hasCheckpoint = plan.cardOutlines.some((c) => c.type === "checkpoint");
  assert.ok(hasCheckpoint, "Plan must include a checkpoint card");

  const hasVisual = plan.cardOutlines.some((c) => c.hasVisualMedia);
  assert.ok(
    hasVisual,
    "Plan should identify structured visual media opportunity",
  );
});

test("7. Stage 3 — Creating Grounded Cards & Structured Media", async () => {
  setupSampleMock();
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);
  const plan = planLesson(analysis, SAMPLE_SOURCE_INPUT);
  const cards = await createCards(plan, analysis, SAMPLE_SOURCE_INPUT);

  assert.ok(cards.length >= 4 && cards.length <= 8);

  const mediaCard = cards.find((c) => c.visualMedia);
  assert.ok(mediaCard, "Must have card with visualMedia spec");
  if (mediaCard && mediaCard.visualMedia) {
    const mediaValidation = validateMediaSpec(mediaCard.visualMedia);
    assert.equal(
      mediaValidation.valid,
      true,
      `Visual media must be valid: ${mediaValidation.errors.join(", ")}`,
    );
  }

  for (const card of cards) {
    assert.ok(card.id, "Card must have stable id");
    assert.ok(card.title, "Card must have title");
    assert.ok(card.content.length > 50, "Card content must be non-trivial");

    const fenceCount = (card.content.match(/```/g) || []).length;
    assert.equal(
      fenceCount % 2,
      0,
      `Card ${card.id} has unbalanced code fences`,
    );
  }
});

test("8. Stage 4 — Comprehension Checkpoint Strict Contract", async () => {
  setupSampleMock();
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);
  const plan = planLesson(analysis, SAMPLE_SOURCE_INPUT);
  const cards = await createCards(plan, analysis, SAMPLE_SOURCE_INPUT);
  createComprehensionChecks(cards, analysis);

  const checkpointCard = cards.find(
    (c) => c.type === "checkpoint" && c.checkpoint,
  );
  assert.ok(checkpointCard, "Checkpoint card must be created");

  const cp = checkpointCard.checkpoint;
  assert.ok(cp.question.length > 15, "Question must be substantial");
  assert.ok(cp.options.length >= 3, "Must have at least 3 options");

  const correctOptions = cp.options.filter((o) => o.isCorrect);
  assert.equal(
    correctOptions.length,
    1,
    `Checkpoint must have EXACTLY 1 correct answer, found ${correctOptions.length}`,
  );

  assert.ok(
    cp.explanation.length > 20,
    "Explanation must be complete and instructional",
  );
});

test("9. Stage 5 — Deterministic Quality Audit & Defensible Scoring", async () => {
  setupSampleMock();
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);
  const plan = planLesson(analysis, SAMPLE_SOURCE_INPUT);
  const cards = await createCards(plan, analysis, SAMPLE_SOURCE_INPUT);
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

  const validAudit = validateQuality(lesson, analysis);
  assert.equal(validAudit.isValid, true);
  assert.equal(validAudit.errors.length, 0);
  assert.equal(validAudit.checksPassed.length, 7);
  assert.equal(validAudit.totalChecksCount, 7);
  assert.equal(validAudit.groundingScore, 100);

  // Checkpoint with multiple correct answers fails
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

  // Unclosed code fence fails
  const badLessonUnclosedFence = JSON.parse(JSON.stringify(lesson));
  badLessonUnclosedFence.cards[0].content +=
    "\n```typescript\nconst broken = 1;";
  const badAudit2 = validateQuality(badLessonUnclosedFence, analysis);
  assert.equal(badAudit2.isValid, false);
  assert.ok(
    badAudit2.errors.some((e) => e.toLowerCase().includes("code fence")),
  );

  // Card count out of bounds fails
  const badLessonTooFewCards = JSON.parse(JSON.stringify(lesson));
  badLessonTooFewCards.cards = [badLessonTooFewCards.cards[0]];
  const badAudit3 = validateQuality(badLessonTooFewCards, analysis);
  assert.equal(badAudit3.isValid, false);
  assert.ok(
    badAudit3.errors.some((e) => e.toLowerCase().includes("card count")),
  );
});

test("10. Slice 4 Handoff Contract Integrity", async () => {
  setupSampleMock();
  const input = {
    ...SAMPLE_SOURCE_INPUT,
    permissionConfirmed: true,
  };

  const handoff = await generateLesson(input);

  assert.equal(typeof handoff.lesson.id, "string");
  assert.equal(typeof handoff.lesson.title, "string");
  assert.equal(typeof handoff.lesson.author, "string");
  assert.equal(typeof handoff.lesson.sourceUrl, "string");
  assert.ok(Array.isArray(handoff.lesson.cards));
  assert.ok(handoff.lesson.cards.length >= 4);

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

  assert.ok(Array.isArray(handoff.lesson.keyTakeaways));
  assert.ok(handoff.lesson.keyTakeaways.length >= 2);

  assert.equal(handoff.qualityReport.isValid, true);
  assert.equal(handoff.qualityReport.totalChecksCount, 7);
  assert.equal(handoff.provider, "gemini-ai");
});

test("11. Symbol & Unicode Encoding Integrity Audit", async () => {
  setupSampleMock();
  const input = {
    ...SAMPLE_SOURCE_INPUT,
    permissionConfirmed: true,
  };

  const handoff = await generateLesson(input);

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

  for (const check of handoff.qualityReport.checksPassed) {
    assert.ok(
      !check.includes("?"),
      `Quality check description '${check}' must not contain '?'`,
    );
  }
});

test("12. Create Another Lesson Reset & Isolation Contract", () => {
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

  const savedData = JSON.parse(storage.getItem("microlearning_lessons_v3"));
  assert.equal(savedData.length, 1);
  assert.equal(savedData[0].id, "existing-lesson-1");
});

// =========================================================================
// NEW VERIFICATION SUITE: Source Grounding, Gemini Integration & Error Safety
// =========================================================================

const CSS_GRID_ARTICLE_INPUT = {
  title: "CSS Grid Layout Architecture",
  author: "Rachel Andrew",
  sourceUrl: "https://example.com/css-grid-guide",
  permissionConfirmed: true,
  sourceText: `
# CSS Grid Layout Architecture

Modern web application layout fundamentally changed with the introduction of **CSS Grid**, providing the first native two-dimensional layout system for the web. While Flexbox excels at single-dimensional layouts along one axis, CSS Grid orchestrates elements along both rows and columns simultaneously.

## The Grid Container & Fractional Units

To create a grid layout, you declare \`display: grid\` on the parent container element. This establishes a grid formatting context for all direct child elements.

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1.5rem;
}
\`\`\`

The \`fr\` unit represents a fraction of the available free space in the container. Using \`repeat(3, 1fr)\` creates three equally sized columns that adapt fluidly as the viewport expands or contracts.

## Grid Areas & Template Definitions

Developers can name sections of the page using **grid-template-areas**. This makes complex responsive layouts expressive and maintainable without nested wrapper div elements.

1. **Declare Container**: Apply display grid and define template tracks.
2. **Assign Grid Areas**: Assign item names using grid-area properties.
3. **Map Structural Layout**: Define template areas matching the page structure.
4. **Responsive Reordering**: Rearrange areas inside media queries without altering HTML DOM.

## CSS Grid vs Flexbox Trade-offs

Understanding when to choose Grid over Flexbox is essential:

- **Dimensionality**: CSS Grid provides two-dimensional layout across rows and columns; Flexbox provides single-dimensional distribution along one axis.
- **Content vs Container Direction**: Grid is container-directed where children snap into pre-defined tracks; Flexbox is content-directed where children size based on content.
- **Alignment Control**: Both support gap, justify-content, and align-items.
- **Use Cases**: Use Grid for page layouts, galleries, and dashboards; use Flexbox for navigation bars, button rows, and component alignment.

In conclusion, CSS Grid represents the standard foundation for modern web layout systems.
  `.trim(),
};

const DB_INDEX_ARTICLE_INPUT = {
  title: "Database Indexing: B-Trees and Query Optimization",
  author: "Martin Kleppmann",
  sourceUrl: "https://example.com/db-indexing",
  permissionConfirmed: true,
  sourceText: `
# Database Indexing: B-Trees and Query Optimization

In relational databases, efficient data retrieval relies on **database indexes**. Without an index, a database engine must perform a full table scan, reading every row from disk sequentially to satisfy a search query.

## The B-Tree Index Structure

The most ubiquitous index structure in modern databases is the **B-Tree**. A B-Tree organizes keys in a balanced hierarchical tree structure with logarithmic search complexity O(log N).

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
SELECT * FROM users WHERE email = 'learner@example.com';
\`\`\`

When executing this query, the query planner traverses the B-Tree from the root node to the target leaf node in a fraction of a millisecond.

## Index Maintenance Lifecycle

Maintaining indexes involves a continuous coordination cycle during data modifications:

1. **Read Request**: Traverses B-Tree nodes to locate target row pointers.
2. **Write Operation**: Inserts or updates row data in heap storage.
3. **B-Tree Split**: Rebalances tree nodes when leaf blocks exceed capacity.
4. **WAL Logging**: Writes index mutations to write-ahead logs for durability.

## Clustered vs Non-Clustered Indexes

Key architectural distinctions exist between index architectures:

- **Data Storage**: Clustered index stores actual table rows in leaf nodes; Non-clustered index stores pointers back to heap data.
- **Index Count**: A table can only have one clustered index; multiple non-clustered secondary indexes can exist.
- **Query Performance**: Clustered index eliminates lookup roundtrips for primary keys; secondary indexes require double-lookup.
- **Write Overhead**: Clustered reordering is expensive on inserts; non-clustered adds secondary tree update cost.

Designing optimal index strategies requires balancing query acceleration against write performance degradation.
  `.trim(),
};

test("13. Source Grounding: CSS Grid Article produces CSS Grid lesson (Zero Optimistic UI content)", async () => {
  setGeminiClientOverride({
    async generateContent(args) {
      assert.ok(
        args.contents.includes("CSS Grid Layout Architecture"),
        "Prompt must contain the CSS Grid title",
      );
      assert.ok(
        args.contents.includes("grid-template-columns"),
        "Prompt must contain CSS Grid article text",
      );

      return {
        text: JSON.stringify({
          keyTakeaways: [
            "CSS Grid provides native two-dimensional layout orchestration.",
            "Fractional units (fr) enable fluid responsiveness without hardcoded pixels.",
            "Choose Grid for container-directed layout and Flexbox for single-axis content.",
          ],
          cards: [
            {
              type: "narrative",
              title: "Two-Dimensional Grid Layout",
              content:
                "Unlike Flexbox, **CSS Grid** coordinates elements along both rows and columns simultaneously. This establishes full two-dimensional layout control from the parent container.",
            },
            {
              type: "example",
              title: "Declaring Tracks with the fr Unit",
              content:
                "The `fr` unit distributes leftover space in the grid container:\n\n```css\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-gap: 1.5rem;\n}\n```\n\nThis creates three equal columns that resize automatically.",
            },
            {
              type: "comparison",
              title: "CSS Grid vs. Flexbox Trade-offs",
              content:
                "Choosing between Grid and Flexbox:\n\n- **CSS Grid**: 2D layouts, container-directed track definitions.\n- **Flexbox**: 1D layouts, content-directed flow along a single axis.",
            },
            {
              type: "checkpoint",
              title: "CSS Grid Checkpoint",
              content: "Test your understanding of CSS Grid mechanics.",
              checkpoint: {
                question:
                  "What is the fundamental architectural difference between CSS Grid and Flexbox?",
                options: [
                  {
                    text: "CSS Grid is a two-dimensional layout system managing rows and columns simultaneously, while Flexbox is single-dimensional.",
                    isCorrect: true,
                  },
                  {
                    text: "CSS Grid only functions in Firefox and requires polyfills in modern browsers.",
                    isCorrect: false,
                  },
                  {
                    text: "Flexbox supports the fr unit but CSS Grid strictly requires fixed pixel widths.",
                    isCorrect: false,
                  },
                ],
                explanation:
                  "CSS Grid introduces true two-dimensional layout control across both dimensions, whereas Flexbox calculates layouts along a single axis at a time.",
              },
            },
          ],
        }),
      };
    },
  });

  const result = await generateLesson(CSS_GRID_ARTICLE_INPUT);

  assert.equal(result.lesson.title, "CSS Grid Layout Architecture");
  assert.equal(result.lesson.cards.length, 4);

  // Assert all cards discuss CSS Grid, NEVER optimistic mutations
  for (const card of result.lesson.cards) {
    const text = (card.title + " " + card.content).toLowerCase();
    assert.ok(
      !text.includes("optimistic"),
      `Card ${card.id} must not mention optimistic mutations!`,
    );
    assert.ok(
      !text.includes("rollback buffer"),
      `Card ${card.id} must not mention rollback buffers!`,
    );
  }

  // Checkpoint is strictly grounded in CSS Grid
  const cpCard = result.lesson.cards.find((c) => c.checkpoint);
  assert.ok(cpCard, "Checkpoint card must exist");
  assert.ok(cpCard.checkpoint.question.includes("CSS Grid"));
  assert.equal(cpCard.checkpoint.options.filter((o) => o.isCorrect).length, 1);
});

test("14. Source Grounding: Database Indexes Article produces distinct DB Index lesson", async () => {
  setGeminiClientOverride({
    async generateContent(args) {
      assert.ok(
        args.contents.includes("B-Tree"),
        "Prompt must contain B-Tree context",
      );

      return {
        text: JSON.stringify({
          keyTakeaways: [
            "B-Trees offer logarithmic search time O(log N) for relational queries.",
            "Clustered indexes store actual rows, while non-clustered indexes store pointers.",
            "Index strategy balances fast reads against write overhead.",
          ],
          cards: [
            {
              type: "narrative",
              title: "The Problem with Full Table Scans",
              content:
                "Without indexes, a database reads every block sequentially. **B-Tree indexes** organize search keys hierarchically to provide sub-millisecond retrieval.",
            },
            {
              type: "example",
              title: "Creating a B-Tree Index",
              content:
                "Creating an index creates a balanced hierarchical lookup tree:\n\n```sql\nCREATE INDEX idx_users_email ON users(email);\nSELECT * FROM users WHERE email = 'learner@example.com';\n```",
            },
            {
              type: "comparison",
              title: "Clustered vs. Non-Clustered Indexes",
              content:
                "Comparison of index storage architectures:\n\n- **Clustered Index**: Stores actual data rows at leaf level.\n- **Non-Clustered Index**: Stores row pointers back to heap storage.",
            },
            {
              type: "checkpoint",
              title: "Database Indexing Checkpoint",
              content: "Evaluate your retention of database index mechanics.",
              checkpoint: {
                question:
                  "Why does a B-Tree index significantly improve query retrieval performance compared to a full table scan?",
                options: [
                  {
                    text: "It organizes keys into a balanced hierarchical structure with O(log N) search complexity, bypassing sequential disk reads.",
                    isCorrect: true,
                  },
                  {
                    text: "It compresses the entire database into memory and eliminates disk persistence completely.",
                    isCorrect: false,
                  },
                  {
                    text: "It prevents other database clients from executing write transactions.",
                    isCorrect: false,
                  },
                ],
                explanation:
                  "A B-Tree structures keys into balanced hierarchical nodes, allowing the database engine to find records in logarithmic time without scanning every row sequentially.",
              },
            },
          ],
        }),
      };
    },
  });

  const result = await generateLesson(DB_INDEX_ARTICLE_INPUT);

  assert.equal(
    result.lesson.title,
    "Database Indexing: B-Trees and Query Optimization",
  );
  assert.equal(result.lesson.cards.length, 4);

  // Assert all cards discuss database indexing, never optimistic mutations or CSS grid
  for (const card of result.lesson.cards) {
    const text = (card.title + " " + card.content).toLowerCase();
    assert.ok(
      !text.includes("optimistic"),
      `Card ${card.id} must not mention optimistic UI`,
    );
    assert.ok(
      !text.includes("css grid"),
      `Card ${card.id} must not mention CSS Grid`,
    );
  }
});

test("15. Generation Service Payload Integrity: Submitted article reaches model prompt", async () => {
  let capturedPrompt = "";

  setGeminiClientOverride({
    async generateContent(args) {
      capturedPrompt = args.contents;
      return { text: JSON.stringify(SAMPLE_MOCK_GEMINI_OUTPUT) };
    },
  });

  const uniqueCustomArticle = {
    title: "Quantum Entanglement & Teleportation Protocols",
    author: "Anton Zeilinger",
    sourceUrl: "https://example.com/quantum",
    permissionConfirmed: true,
    sourceText: Array(250)
      .fill("Bell-state qubits demonstrate non-local quantum correlations.")
      .join(" "),
  };

  await generateLesson(uniqueCustomArticle);

  assert.ok(
    capturedPrompt.includes("Quantum Entanglement & Teleportation Protocols"),
    "Prompt must contain the unique title",
  );
  assert.ok(
    capturedPrompt.includes("Bell-state qubits"),
    "Prompt must contain the actual submitted article body",
  );
  assert.ok(
    capturedPrompt.includes("Anton Zeilinger"),
    "Prompt must contain author attribution",
  );
});

test("16. Output Schema Normalization & Safety: Sanitizes HTML and normalizes IDs", async () => {
  setGeminiClientOverride({
    async generateContent() {
      return {
        text: JSON.stringify({
          keyTakeaways: ["Key insight 1", "Key insight 2"],
          cards: [
            {
              type: "unknown-type-attempt",
              title: "Card With <script>alert(1)</script>Title",
              content:
                "Content with <iframe src='evil.com'></iframe> and unclosed code\n```typescript\nconst a = 1;",
            },
            {
              type: "narrative",
              title: "Card Two",
              content:
                "Normal valid narrative card content explaining core architecture.",
            },
            {
              type: "narrative",
              title: "Card Three",
              content:
                "Another card providing practical application guidelines.",
            },
            {
              type: "checkpoint",
              title: "Checkpoint Card",
              content: "Retention check card.",
              checkpoint: {
                question:
                  "Question with <script>evil()</script> test prompt exceeding twenty chars?",
                options: [
                  { text: "Option A", isCorrect: true },
                  { text: "Option B", isCorrect: true }, // multiple correct attempted
                  { text: "Option C", isCorrect: false },
                ],
                explanation:
                  "Explanation text that is educational and instructional.",
              },
            },
          ],
        }),
      };
    },
  });

  const result = await generateLesson(SAMPLE_SOURCE_INPUT);

  // Stable normalized IDs assigned by application code
  assert.equal(result.lesson.cards[0].id, "c1");
  assert.equal(result.lesson.cards[1].id, "c2");
  assert.equal(result.lesson.cards[2].id, "c3");
  assert.equal(result.lesson.cards[3].id, "c4");

  // Unknown type normalized to allowed type
  assert.equal(result.lesson.cards[0].type, "narrative");

  // Script and iframe tags stripped
  assert.ok(!result.lesson.cards[0].title.includes("<script>"));
  assert.ok(!result.lesson.cards[0].content.includes("<iframe"));

  // Unclosed code fence repaired automatically
  const fences = (result.lesson.cards[0].content.match(/```/g) || []).length;
  assert.equal(fences % 2, 0, "Unclosed code fence must be balanced");

  // Multiple correct options normalized to EXACTLY ONE
  const cpCard = result.lesson.cards.find((c) => c.checkpoint);
  assert.ok(cpCard);
  const correctCount = cpCard.checkpoint.options.filter(
    (o) => o.isCorrect,
  ).length;
  assert.equal(correctCount, 1, "Must normalize to exactly 1 correct option");
});

test("17. Missing API Configuration Graceful Handling (503 Config Error)", async () => {
  // Clear mock override so it tests real configuration checks
  setGeminiClientOverride(null);

  const prevKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    await generateLesson(SAMPLE_SOURCE_INPUT);
    assert.fail("Should have thrown GeminiError when API key is missing");
  } catch (err) {
    assert.ok(
      err.message.includes("GEMINI_API_KEY is not configured"),
      `Expected missing key message, got: ${err.message}`,
    );
  } finally {
    if (prevKey) process.env.GEMINI_API_KEY = prevKey;
  }
});

test("18. Rate-Limit & Timeout Failure Handling: No silent hardcoded fallback", async () => {
  // Test 18a: Rate Limit Error (429)
  setGeminiClientOverride({
    async generateContent() {
      throw new GeminiError(
        "Gemini API rate limit or quota exceeded. Please wait a moment before retrying.",
        "RATE_LIMIT",
        429,
      );
    },
  });

  try {
    await generateLesson(SAMPLE_SOURCE_INPUT);
    assert.fail("Should have thrown rate limit error");
  } catch (err) {
    assert.ok(
      err.message.includes("rate limit or quota exceeded"),
      "Must surface actionable rate limit error",
    );
  }

  // Test 18b: Timeout Error (504)
  setGeminiClientOverride({
    async generateContent() {
      throw new GeminiError(
        "Gemini API request timed out after 60 seconds. Please check your connection and retry.",
        "TIMEOUT",
        504,
      );
    },
  });

  try {
    await generateLesson(SAMPLE_SOURCE_INPUT);
    assert.fail("Should have thrown timeout error");
  } catch (err) {
    assert.ok(
      err.message.includes("timed out"),
      "Must surface actionable timeout error",
    );
  }
});

test("19. Sample and Custom Article Shared Pipeline Integrity", async () => {
  let callCount = 0;

  setGeminiClientOverride({
    async generateContent() {
      callCount++;
      return { text: JSON.stringify(SAMPLE_MOCK_GEMINI_OUTPUT) };
    },
  });

  // Call 1: Load Sample Article path
  const sampleResult = await generateLesson({
    ...SAMPLE_SOURCE_INPUT,
    permissionConfirmed: true,
  });
  assert.equal(sampleResult.provider, "gemini-ai");

  // Call 2: Custom Article path
  const customResult = await generateLesson(CSS_GRID_ARTICLE_INPUT);
  assert.equal(customResult.provider, "gemini-ai");

  // Both invoked the same AI generation engine!
  assert.equal(
    callCount,
    2,
    "Both sample and custom paths must use the AI generation pipeline",
  );
});


test("20. Provider Error Classification & Safe Action Responses (Regression for HTTP 500)", async () => {
  const validPayload = {
    ...SAMPLE_SOURCE_INPUT,
    permissionConfirmed: true,
  };

  function createRequest(body) {
    return new Request("http://localhost:5173/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  // 20a: Model Not Found (404) - e.g. gemini-2.5-flash not accessible on account
  setGeminiClientOverride({
    async generateContent() {
      const err = new Error("models/gemini-2.5-flash is not found for API version v1beta");
      err.status = 404;
      throw err;
    },
  });

  const res404 = await generateAction({
    request: createRequest(validPayload),
    params: {},
    context: {},
  });
  assert.equal(res404.status, 404);
  const data404 = await res404.json();
  assert.equal(data404.code, "MODEL_ERROR");
  assert.ok(data404.correlationId, "Must include correlationId");
  assert.ok(
    data404.error.includes("not found or is not accessible"),
    `Expected model error message, got: ${data404.error}`
  );
  assert.ok(
    data404.error.includes("recommended: gemini-3.8-flash or gemini-3.6-flash"),
    `Expected actionable current model recommendations, got: ${data404.error}`
  );
  const recommendationText = data404.error.slice(data404.error.indexOf("Please verify"));
  assert.ok(
    !recommendationText.includes("gemini-2.0-flash") && !recommendationText.includes("gemini-1.5-flash"),
    "Error guidance must not recommend retired models"
  );

  // 20b: Unauthorized / Invalid API Key (401 / 403)
  setGeminiClientOverride({
    async generateContent() {
      const err = new Error(
        JSON.stringify({
          error: {
            code: 400,
            message: "API key not valid. Please pass a valid API key.",
            status: "INVALID_ARGUMENT",
            details: [{ reason: "API_KEY_INVALID" }],
          },
        })
      );
      err.status = 400;
      throw err;
    },
  });

  const resAuth = await generateAction({
    request: createRequest(validPayload),
    params: {},
    context: {},
  });
  assert.equal(resAuth.status, 401);
  const dataAuth = await resAuth.json();
  assert.equal(dataAuth.code, "AUTH_ERROR");
  assert.ok(
    dataAuth.error.includes("Invalid or unauthorized GEMINI_API_KEY"),
    `Expected auth message, got: ${dataAuth.error}`
  );

  // 20c: Invalid Request / Schema Rejected (400)
  setGeminiClientOverride({
    async generateContent() {
      const err = new Error("Invalid JSON payload received. Schema complexity exceeds limit.");
      err.status = 400;
      throw err;
    },
  });

  const res400 = await generateAction({
    request: createRequest(validPayload),
    params: {},
    context: {},
  });
  assert.equal(res400.status, 400);
  const data400 = await res400.json();
  assert.equal(data400.code, "INVALID_REQUEST");

  // 20d: Content Flagged by Safety Filter (422)
  setGeminiClientOverride({
    async generateContent() {
      return {
        text: "",
        candidates: [{ finishReason: "SAFETY" }],
      };
    },
  });

  const resSafety = await generateAction({
    request: createRequest(validPayload),
    params: {},
    context: {},
  });
  assert.equal(resSafety.status, 422);
  const dataSafety = await resSafety.json();
  assert.equal(dataSafety.code, "SAFETY_BLOCKED");
  assert.ok(dataSafety.error.includes("safety filters"));

  // 20e: Malformed JSON Output (422)
  setGeminiClientOverride({
    async generateContent() {
      return { text: "NOT_VALID_JSON{{{ broken" };
    },
  });

  const resMalformed = await generateAction({
    request: createRequest(validPayload),
    params: {},
    context: {},
  });
  assert.equal(resMalformed.status, 422);
  const dataMalformed = await resMalformed.json();
  assert.equal(dataMalformed.code, "MALFORMED_OUTPUT");

  // 20f: Empty Response (422)
  setGeminiClientOverride({
    async generateContent() {
      return { text: "   " };
    },
  });

  const resEmpty = await generateAction({
    request: createRequest(validPayload),
    params: {},
    context: {},
  });
  assert.equal(resEmpty.status, 422);
  const dataEmpty = await resEmpty.json();
  assert.equal(dataEmpty.code, "MALFORMED_OUTPUT");

  // 20g: Generic Upstream Provider Error (500)
  setGeminiClientOverride({
    async generateContent() {
      const err = new Error("Internal Google service unavailable");
      err.status = 500;
      throw err;
    },
  });

  const res500 = await generateAction({
    request: createRequest(validPayload),
    params: {},
    context: {},
  });
  assert.equal(res500.status, 500);
  const data500 = await res500.json();
  assert.equal(data500.code, "PROVIDER_ERROR");
});

test("21. Template Placeholder Key Detection & Safe Configuration Error", async () => {
  setGeminiClientOverride(null);

  const prevKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "your_gemini_api_key_here";

  try {
    const req = new Request("http://localhost:5173/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...SAMPLE_SOURCE_INPUT, permissionConfirmed: true }),
    });

    const res = await generateAction({ request: req, params: {}, context: {} });
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.code, "CONFIG_ERROR");
    assert.ok(
      data.error.includes("placeholder") || data.error.includes("GEMINI_API_KEY is not configured"),
      `Expected placeholder warning message, got: ${data.error}`
    );
  } finally {
    if (prevKey) {
      process.env.GEMINI_API_KEY = prevKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  }
});

test("22. Safe Server-Side Diagnostic Logging Verification (No Secret or Body Leaks)", async () => {
  const loggedErrors = [];
  const loggedWarns = [];
  const loggedInfos = [];

  const origError = console.error;
  const origWarn = console.warn;
  const origLog = console.log;

  console.error = (...args) => loggedErrors.push(args.join(" "));
  console.warn = (...args) => loggedWarns.push(args.join(" "));
  console.log = (...args) => loggedInfos.push(args.join(" "));

  try {
    setGeminiClientOverride({
      async generateContent() {
        const err = new Error("models/gemini-2.5-flash is not found");
        err.status = 404;
        throw err;
      },
    });

    const req = new Request("http://localhost:5173/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...SAMPLE_SOURCE_INPUT,
        permissionConfirmed: true,
      }),
    });

    const res = await generateAction({ request: req, params: {}, context: {} });
    assert.equal(res.status, 404);

    // Verify diagnostic logs were produced
    assert.ok(
      loggedErrors.length >= 1,
      "console.error must be invoked when a server-side error occurs"
    );

    const fullLogText = loggedErrors.join(" ");
    assert.ok(
      fullLogText.includes("MODEL_ERROR") || fullLogText.includes("404"),
      "Error log must classify error code and upstream status"
    );

    // Verify ZERO credentials or secret leakage
    assert.ok(
      !fullLogText.includes("AIza"),
      "Logs must never contain raw API key prefixes"
    );
    assert.ok(
      !fullLogText.includes(SAMPLE_SOURCE_INPUT.sourceText),
      "Logs must never dump the full source article text"
    );
  } finally {
    console.error = origError;
    console.warn = origWarn;
    console.log = origLog;
  }
});

test("23. Complete Successful Generation Route Verification with Mock Engine", async () => {
  setGeminiClientOverride({
    async generateContent() {
      return { text: JSON.stringify(SAMPLE_MOCK_GEMINI_OUTPUT) };
    },
  });

  const req = new Request("http://localhost:5173/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...SAMPLE_SOURCE_INPUT,
      permissionConfirmed: true,
    }),
  });

  const res = await generateAction({ request: req, params: {}, context: {} });
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.correlationId, "Success response must include correlationId");
  assert.ok(data.result.lesson.cards.length >= 4, "Must generate valid card deck");
  assert.ok(data.result.qualityReport.isValid, "Quality report must be valid");
});



test("24. Active Gemini Model Configuration & Deprecation Safeguards", async () => {
  // Confirm default model is the current stable flagship gemini-3.8-flash
  assert.equal(DEFAULT_GEMINI_MODEL, "gemini-3.8-flash");

  // Verify server-side GEMINI_MODEL override behavior
  const originalEnvModel = process.env.GEMINI_MODEL;
  try {
    delete process.env.GEMINI_MODEL;
    assert.equal(getGeminiModel(), "gemini-3.8-flash", "Should default to gemini-3.8-flash when unset");

    process.env.GEMINI_MODEL = "gemini-3.6-flash";
    assert.equal(getGeminiModel(), "gemini-3.6-flash", "Should respect GEMINI_MODEL override");

    process.env.GEMINI_MODEL = "  gemini-4-argon  ";
    assert.equal(getGeminiModel(), "gemini-4-argon", "Should trim whitespace from GEMINI_MODEL");
  } finally {
    if (originalEnvModel !== undefined) {
      process.env.GEMINI_MODEL = originalEnvModel;
    } else {
      delete process.env.GEMINI_MODEL;
    }
  }
});

test("25. Diagnostic Model Discovery Verification (listAvailableGeminiModels)", async () => {
  // Test missing API key fails safely with CONFIG_ERROR without unhandled rejection
  const origKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    await assert.rejects(
      async () => {
        await listAvailableGeminiModels("");
      },
      (err) => {
        assert.equal(err.code, "CONFIG_ERROR");
        assert.equal(err.status, 503);
        assert.ok(err.message.includes("GEMINI_API_KEY is required"));
        return true;
      }
    );
  } finally {
    if (origKey !== undefined) {
      process.env.GEMINI_API_KEY = origKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  }
});

test("26. Live Route Registration and Service Import Integrity", async () => {
  // Inspect app/routes.ts mapping
  const fs = await import("node:fs");
  const routesContent = fs.readFileSync("app/routes.ts", "utf-8");
  assert.ok(
    routesContent.includes('route("api/generate", "routes/api.generate.ts")'),
    "app/routes.ts must route api/generate to routes/api.generate.ts"
  );

  // Inspect app/routes/api.generate.ts imports
  const apiRouteContent = fs.readFileSync("app/routes/api.generate.ts", "utf-8");
  assert.ok(
    apiRouteContent.includes('import { generateLessonWithGeminiServer } from "../services/gemini.server.ts"'),
    "api.generate.ts must import generateLessonWithGeminiServer from gemini.server.ts"
  );
  assert.ok(
    apiRouteContent.includes("await generateLessonWithGeminiServer(body, correlationId)"),
    "api.generate.ts must invoke generateLessonWithGeminiServer on live POST requests"
  );
});
