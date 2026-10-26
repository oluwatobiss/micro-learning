import type { SourceInputData, GenerationResult } from "../types/generator";
import type { Lesson, LessonCard } from "../types/lesson";
import { understandSource, validateQuality } from "./generator.ts";

export const SAMPLE_TECHNICAL_ARTICLE_TEXT = `
# Optimistic UI and Mutation Resilience in Modern Web Apps

In modern web applications, perceived responsiveness is just as critical to user experience as actual network throughput. When a user clicks a "Like" button, marks an educational task complete, or edits a title, waiting 300 to 800 milliseconds for a server round-trip to confirm the action introduces an unmistakable sense of sluggishness. The solution that high-performance web products adopt is Optimistic UI: updating the interface immediately under the assumption that the mutation will succeed, while running the actual network request silently in the background.

## The Optimistic Execution Lifecycle

A resilient optimistic update follows a disciplined five-step lifecycle:
1. **User Action**: The learner or user interacts with a control, triggering a mutation intent.
2. **Snapshot Buffer**: Before changing local state, the application captures a pristine snapshot of the existing state into an isolated rollback buffer.
3. **Optimistic Rendering**: The local cache and UI update instantly, providing immediate tactile confirmation to the user.
4. **Network Dispatch**: The HTTP mutation request is dispatched in the background with a unique idempotency key.
5. **Reconciliation or Rollback**: If the server responds with HTTP 200, the client reconciles the temporary ID with the canonical server entity and clears the rollback buffer. If the request fails or times out, the client automatically restores the snapshot buffer and surfaces a non-blocking toast notification.

## Implementing Rollback Buffers

The biggest hazard in optimistic mutations is state divergence—where an unhandled server rejection leaves the user interface displaying phantom data that was never saved to the database. To prevent divergence, mutations must always preserve the previous state snapshot:

\`\`\`typescript
interface OptimisticMutation<T> {
  previousSnapshot: T;
  optimisticData: T;
  rollback: () => void;
  commit: (serverData: T) => void;
}

export async function executeOptimisticUpdate<T>(
  getCurrentState: () => T,
  applyUpdate: (next: T) => void,
  predictedNext: T,
  networkPromise: () => Promise<T>
): Promise<T> {
  const previousSnapshot = getCurrentState();
  // 1. Immediately apply optimistic prediction
  applyUpdate(predictedNext);

  try {
    const serverResult = await networkPromise();
    // 2. Commit canonical server response
    applyUpdate(serverResult);
    return serverResult;
  } catch (error) {
    // 3. Rollback immediately to pristine snapshot on network failure
    applyUpdate(previousSnapshot);
    throw error;
  }
}
\`\`\`

## Optimistic Updates vs. Pessimistic Spinners

Engineering teams often face a direct trade-off between optimistic and pessimistic patterns:
- **Perceived Latency**: Optimistic updates eliminate UI lag with zero perceived delay; pessimistic patterns force users to watch spinners or loading skeletons on every click.
- **Complexity**: Optimistic updates require robust rollback buffers, conflict resolution, and idempotency keys; pessimistic flows are straightforward because state is only modified upon confirmed server response.
- **Failure Frequency**: Optimistic models are ideal for high-probability operations (toggling checkboxes, upvoting, editing draft text); pessimistic models are required for high-risk operations (financial payments, destructive account deletions, inventory reservations).

## The Golden Rule: Idempotency and State Synchronization

The fundamental requirement for reliable optimistic mutations is server-side idempotency. When an optimistic action fails due to transient network drops, clients frequently retry. Without idempotency keys, a retried optimistic mutation risks executing duplicate operations on the server. By coupling client-side rollback buffers with idempotent API endpoints, creators and engineers achieve seamless, instant user feedback without compromising data integrity.
`.trim();

export const SAMPLE_SOURCE_INPUT: SourceInputData = {
  title: "Optimistic UI and Mutation Resilience in Modern Web Apps",
  author: "Danielle Vance, Staff Frontend Architect",
  sourceUrl: "https://example.com/engineering/optimistic-ui-resilience",
  sourceText: SAMPLE_TECHNICAL_ARTICLE_TEXT,
  permissionConfirmed: false,
};

/**
 * Checks whether the given source input matches the built-in sample article.
 * Custom articles return false and must NEVER receive sample demo content.
 */
export function isBuiltInSampleArticle(input?: Partial<SourceInputData> | null): boolean {
  if (!input || !input.sourceText) return false;
  const normalizedInput = input.sourceText.trim().replace(/\r\n/g, "\n");
  const normalizedSample = SAMPLE_TECHNICAL_ARTICLE_TEXT.trim().replace(/\r\n/g, "\n");
  return (
    normalizedInput === normalizedSample ||
    (input.title?.trim() === SAMPLE_SOURCE_INPUT.title && normalizedInput.length > 300)
  );
}

export const PRE_VERIFIED_SAMPLE_LESSON_CARDS: LessonCard[] = [
  {
    id: "c1",
    type: "narrative",
    title: "Perceived Latency & The Optimistic Model",
    content:
      "In modern web applications, **perceived responsiveness** defines the user experience. Waiting 300 to 800 milliseconds for a server round-trip on every user interaction creates an unmistakable sense of sluggishness.\n\n**Optimistic UI** solves this by updating the user interface immediately under the assumption that the mutation will succeed, while executing the actual network request silently in the background.",
  },
  {
    id: "c2",
    type: "narrative",
    title: "The Resilient Execution Lifecycle",
    content:
      "A reliable optimistic mutation is not just an immediate UI update—it is a coordinated **five-step lifecycle** designed to protect data integrity:\n\n1. **User Action**: The user initiates a mutation.\n2. **Snapshot Buffer**: Local state is cloned into an isolated rollback buffer.\n3. **Optimistic Rendering**: The local UI updates instantly with the predicted state.\n4. **Network Dispatch**: The mutation request is sent in the background with an idempotency key.\n5. **Reconciliation or Rollback**: On success, temporary client entities reconcile with server data. On failure, the snapshot buffer restores previous state.",
  },
  {
    id: "c3",
    type: "example",
    title: "Implementing Rollback Buffers",
    content:
      "The primary risk in optimistic mutations is **state divergence**—where an unhandled network error leaves phantom data on the client.\n\n```typescript\ninterface Mutation<T> {\n  snapshot: T;\n  apply: (next: T) => void;\n  rollback: () => void;\n}\n```\n\nNotice that if `networkPromise()` rejects, the `catch` block immediately restores `previousSnapshot`, ensuring the client never remains in a corrupted state.",
  },
  {
    id: "c4",
    type: "narrative",
    title: "Optimistic State-to-Server Architecture",
    content:
      "Visualizing the pipeline clarifies how the client coordinates the local UI update with server communication.\n\nNotice how the **Snapshot Buffer** acts as an emergency parachute: if network communication fails, the application rolls back to the exact pre-mutation state without corrupting unrelated client data.",
    visualMedia: {
      type: "process-flow",
      id: "flow-c4",
      title: "Optimistic Mutation Lifecycle",
      accessibleDescription:
        "A five-step process flow: 1. User Action. 2. Capture Snapshot Buffer. 3. Instant Optimistic Render. 4. Background Network Dispatch. 5. Server Reconciliation or Rollback.",
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          label: "1. User Action",
          description: "User initiates mutation in the client interface",
          variant: "default",
        },
        {
          id: "step-2",
          stepNumber: 2,
          label: "2. Capture Snapshot Buffer",
          description: "Preserve previous state in isolated rollback buffer",
          variant: "accent",
        },
        {
          id: "step-3",
          stepNumber: 3,
          label: "3. Instant Render",
          description: "Apply optimistic prediction to local state immediately",
          variant: "default",
        },
        {
          id: "step-4",
          stepNumber: 4,
          label: "4. Network Dispatch",
          description: "Send HTTP mutation in background with idempotency key",
          variant: "default",
        },
        {
          id: "step-5",
          stepNumber: 5,
          label: "5. Reconciliation",
          description: "Reconcile with server confirmation or rollback on error",
          variant: "success",
        },
      ],
    },
  },
  {
    id: "c5",
    type: "comparison",
    title: "Optimistic vs. Pessimistic Trade-offs",
    content:
      "Choosing between optimistic updates and pessimistic spinners involves explicit architectural trade-offs:\n\n- **Perceived Latency**: Optimistic updates eliminate lag with zero perceived delay. Pessimistic flows force users to wait for network roundtrips.\n- **Implementation Complexity**: Optimistic flows require rollback buffers, conflict resolution, and idempotency keys. Pessimistic flows only update state after confirmed server response.\n- **Failure Frequency**: Optimistic models are ideal for high-probability operations (toggling likes, bookmarking, reordering cards). Pessimistic models are required for destructive or high-risk actions (financial payments, destructive account deletions).",
    visualMedia: {
      type: "comparison",
      id: "comp-c5",
      title: "Optimistic vs Pessimistic Patterns",
      accessibleDescription: "Comparison table contrasting Optimistic UI and Pessimistic UI across latency, complexity, and safety.",
      leftEntity: "Optimistic UI",
      rightEntity: "Pessimistic UI",
      criteria: [
        {
          aspect: "Perceived Latency",
          leftValue: "Instant feedback (0ms)",
          rightValue: "High (300-800ms wait)",
        },
        {
          aspect: "Implementation",
          leftValue: "Requires rollback snapshot buffer",
          rightValue: "Simple spinner/loading state",
        },
        {
          aspect: "Best Use Case",
          leftValue: "Frequent low-risk interactions",
          rightValue: "Critical payments & destructive actions",
        },
      ],
    },
  },
  {
    id: "c6",
    type: "checkpoint",
    title: "Comprehension Checkpoint",
    content:
      "Verify your understanding of optimistic mutations, rollback buffers, and state divergence.",
    checkpoint: {
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
          text: "To prevent the user from clicking any other interactive controls while the spinner is visible.",
          isCorrect: false,
        },
        {
          id: "opt-3",
          text: "To convert client-side state into an immutable database backup file.",
          isCorrect: false,
        },
      ],
      explanation:
        "According to the source article, capturing a snapshot buffer preserves the pristine previous state, preventing state divergence and ensuring the application can safely rollback if the server rejects the mutation.",
      sourceExcerpt:
        "Before changing local state, the application captures a pristine snapshot of the existing state into an isolated rollback buffer.",
    },
  },
];

export const PRE_VERIFIED_SAMPLE_TAKEAWAYS: string[] = [
  "Core Principle: Optimistic updates provide instant perceived responsiveness without blocking the user.",
  "Rollback Buffers: Preserving snapshots ensures safe recovery on network failure and prevents state divergence.",
  "Idempotency: Coupling client snapshots with server idempotency keys ensures duplicate retries remain safe.",
];

/**
 * Returns a pre-computed, fully verified GenerationResult for the built-in sample article.
 * This is used strictly as a reliable fallback for the built-in sample during upstream outages.
 */
export function getPrecomputedSampleLessonResult(): GenerationResult {
  const analysis = understandSource(SAMPLE_SOURCE_INPUT);

  const lesson: Lesson = {
    id: "optimistic-ui-and-mutation-resilience",
    version: 1,
    title: SAMPLE_SOURCE_INPUT.title,
    author: SAMPLE_SOURCE_INPUT.author,
    sourceUrl: SAMPLE_SOURCE_INPUT.sourceUrl,
    sourceSnippet: analysis.thesis.slice(0, 200),
    keyTakeaways: PRE_VERIFIED_SAMPLE_TAKEAWAYS,
    estimatedMinutes: 4,
    createdAt: new Date().toISOString(),
    cards: PRE_VERIFIED_SAMPLE_LESSON_CARDS,
  };

  const qualityReport = validateQuality(lesson, analysis);

  return {
    lesson,
    sourceAnalysis: analysis,
    qualityReport,
    generatedAt: new Date().toISOString(),
    provider: "sample-demo",
    isPrecomputedDemo: true,
  };
}
