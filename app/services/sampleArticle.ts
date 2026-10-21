import type { SourceInputData } from "../types/generator";

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
