import type { Lesson } from "../types/lesson";

export const SAMPLE_ARTICLE_TEXT = `
The Architecture of Micro-Learning: Why Coherent Chunking Beats Endless Summaries
By Oluwatobi S.

In an era dominated by information overload, people constantly encounter long-form educational essays, books, and technical breakdowns that contain profound insights. Yet the modern reader is chronically pressed for time. When presented with a 5,000-word treatise, most people either bookmark it into an overflowing reading list that they never revisit, or skim through generic AI bullet-point summaries.

However, cognitive science shows that bulleted summaries produce weak retention. When an AI generates a five-bullet list from a nuanced chapter, it strips away the author's narrative momentum, the foundational evidence, and the logical bridges connecting premise to conclusion. The reader leaves with an illusion of competence—a vague recognition of buzzwords without the conceptual framework required to actually apply the knowledge.

True micro-learning is not summarization; it is structural transformation. It takes an expert's cohesive argument and unfolds it across a sequence of bite-sized, narrative cards. Each card serves as a focused building block of a unified mental model. Rather than disconnected trivia flashcards or infinite algorithmic feeds designed to maximize addiction, the card sequence has a clear beginning, middle, and end.

Crucially, retention requires active verification. When a learner pauses at a grounded comprehension checkpoint—answering a question whose resolution depends directly on the core logic of the preceding cards—retrieval practice solidifies neural pathways. When coupled with an immediate, source-grounded explanation, the learner verifies whether they actually grasped the idea or merely skimmed past it.

For knowledge creators and authors, the bottleneck has always been the immense friction of manual repurposing. Re-crafting a 20-page chapter into engaging social carousels or educational slide decks often takes hours of tedious manual design work. By leveraging AI to adaptively extract structure, formulate narrative cards, and synthesize grounded checkpoints—while leaving the author in complete editorial control—creators can repeatedly turn their existing expertise into credible, interactive lessons that readers actually remember.
`.trim();

/**
 * Sample 1: The foundational micro-learning architecture lesson
 */
export const SAMPLE_LESSON: Lesson = {
  id: "micro-learning-architecture",
  version: 2,
  title: "The Architecture of Micro-Learning: Why Chunking Beats Summaries",
  author: "Oluwatobi S.",
  sourceUrl: "https://example.com/books/architecture-of-microlearning",
  sourceSnippet:
    "Cognitive science shows that bulleted summaries produce weak retention. True micro-learning is structural transformation.",
  keyTakeaways: [
    "Bulleted summaries strip causal reasoning, leaving only an illusion of competence.",
    "Effective micro-learning unfolds arguments as sequential narrative building blocks.",
    "Grounded checkpoints activate retrieval practice, anchoring concepts in memory.",
    "Creators preserve credibility by retaining full editorial authority over generated cards.",
  ],
  feedbackUrl: "https://github.com/oluwatobiss/micro-learning/issues",
  estimatedMinutes: 3,
  createdAt: "2026-10-20T00:00:00.000Z",
  cards: [
    {
      id: "c1",
      type: "narrative",
      title: "The Modern Retention Dilemma",
      content: `Readers are drowning in valuable long-form articles, newsletters, and books. But when pressed for time, people either abandon long texts or turn to generic AI bullet points that produce only an **illusion of competence**—leaving no lasting neural retention.`,
    },
    {
      id: "c2",
      type: "comparison",
      title: "Summarization vs. Structural Transformation",
      content: `Generic summaries strip away the logical bridges connecting premise to conclusion.

**Micro-learning does not summarize; it transforms.**

* **Summaries:** Flatten an argument into isolated bullet points.
* **Micro-learning:** Preserves narrative momentum across sequential cards where each card establishes one clear layer of understanding.`,
    },
    {
      id: "c3",
      type: "checkpoint",
      title: "Concept Check: Active Understanding",
      content:
        "Verify your understanding before advancing to the next layer of the mental model.",
      checkpoint: {
        question:
          "Why do generic bullet-point summaries often produce weak long-term retention compared to narrative micro-learning?",
        options: [
          {
            id: "opt-a",
            text: "Because bullet points are always too short to contain any accurate vocabulary.",
            isCorrect: false,
          },
          {
            id: "opt-b",
            text: "Because they strip away the logical bridges, evidence, and narrative structure needed to build an enduring mental model.",
            isCorrect: true,
          },
          {
            id: "opt-c",
            text: "Because human memory cannot process information unless it is delivered via video.",
            isCorrect: false,
          },
        ],
        explanation:
          "According to cognitive science, bullet lists trigger passive recognition rather than active mental reconstruction. Coherent narrative cards preserve the causal connections and evidence that anchor concepts in long-term memory.",
      },
    },
    {
      id: "c4",
      type: "example",
      title: "Active Verification via Retrieval Practice",
      content: `Stopping at intentional checkpoints triggers **active retrieval practice**.

When you pause to answer a question grounded directly in the source material, your brain must actively reconstruct the concept rather than passively scanning words. This verification immediately clarifies whether you understood the core premise.`,
    },
    {
      id: "c5",
      type: "narrative",
      title: "The Creator Advantage: Repurposing Without Dilution",
      content: `Authors and educators invest weeks producing deep knowledge.

Instead of manually spending hours rebuilding slides or settling for shallow AI bullet points, adaptive extraction lets creators generate credible, interactive lessons in minutes while retaining **100% editorial authority** over every word before publishing.`,
    },
  ],
};

/**
 * Sample 2: Software Development Lesson (React Component State & The Render Cycle)
 * Inspired by CodeSweetly educational principles (https://codesweetly.com)
 */
export const REACT_STATE_LESSON: Lesson = {
  id: "react-state-render-cycle",
  version: 1,
  title: "React State & The Component Render Cycle",
  author: "CodeSweetly (Oluwatobi S.)",
  sourceUrl: "https://codesweetly.com/react-state-management",
  sourceSnippet:
    "State in React is not an in-memory mutable variable. It is a series of immutable snapshots evaluated per render cycle.",
  keyTakeaways: [
    "Component state behaves as an immutable snapshot within any single render pass.",
    "Calling `setState` schedules a re-render; it does not synchronously mutate the current variable.",
    "Updater functions `setCount(prev => prev + 1)` ensure calculations use pending state transitions.",
    "Virtual DOM reconciliation calculates the minimal diff before touching the browser DOM.",
  ],
  feedbackUrl: "https://github.com/oluwatobiss/micro-learning/issues",
  estimatedMinutes: 4,
  createdAt: "2026-10-20T01:00:00.000Z",
  cards: [
    {
      id: "rs-1",
      type: "narrative",
      title: "State is a Snapshot in Time",
      content: `In standard JavaScript, a variable holds a mutable reference in memory. If you change \`x = 5\`, reading \`x\` on the very next line yields \`5\`.

In React, **component state behaves like a photographic snapshot**.

When React renders your component function, it calls the function with state values frozen for that specific render pass:

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // Still prints 0, not 1!
  }

  return <button onClick={handleClick}>Clicked {count} times</button>;
}
\`\`\`

Why does \`console.log(count)\` log \`0\` immediately after calling \`setCount(count + 1)\`? Because \`count\` is an immutable constant captured inside that specific render's closure.`,
    },
    {
      id: "rs-2",
      type: "example",
      title: "The Scheduled Re-Render",
      content: `Calling \`setCount(count + 1)\` does not mutate the existing \`count\` constant. Instead, it informs React:

> *"When you run the next render pass, please provide the value \`1\` for this state slot."*

React places this state request into a queue and schedules a re-render. During that next render pass:
1. React executes \`Counter()\` from top to bottom.
2. \`useState(0)\` returns the new snapshot: \`[1, setCount]\`.
3. The component produces a fresh JSX virtual DOM tree.
4. React reconciles differences and updates the real browser DOM.`,
    },
    {
      id: "rs-3",
      type: "comparison",
      title: "The State-to-DOM Render Loop",
      content: `The diagram below illustrates the exact cycle triggered every time state changes:`,
      visualSvg: "react-render-loop",
    },
    {
      id: "rs-4",
      type: "example",
      title: "Batching and Updater Functions",
      content: `What happens if you trigger multiple updates in the same event handler?

\`\`\`jsx
function handleTripleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
\`\`\`

If \`count\` started at \`0\`, each line calls \`setCount(0 + 1)\`. When the next render occurs, \`count\` will be **\`1\`**, not \`3\`!

To base an update on pending transitions, pass an **updater function**:

\`\`\`jsx
function handleTripleClick() {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  // Result: exactly 3!
}
\`\`\``,
    },
    {
      id: "rs-5",
      type: "checkpoint",
      title: "Comprehension Check: The Render Snapshot",
      content:
        "Test your understanding of React render snapshots and closures.",
      checkpoint: {
        question:
          "In a React component with state initialized to `count = 0`, what is logged when a user clicks a button running `setCount(count + 1); console.log(count);`?",
        options: [
          {
            id: "opt-a",
            text: "It logs 1, because setState immediately updates the variable in memory.",
            isCorrect: false,
          },
          {
            id: "opt-b",
            text: "It logs 0, because the current function closure holds the snapshot value (0) while a re-render is scheduled for the next pass.",
            isCorrect: true,
          },
          {
            id: "opt-c",
            text: "It throws a runtime ReferenceError because state cannot be accessed synchronously.",
            isCorrect: false,
          },
        ],
        explanation:
          "State variables in React are constants within a specific render execution. Calling the setter function notifies React to schedule a re-render with the new value, but it does not change the value of the constant inside the already-executing render pass.",
      },
    },
    {
      id: "rs-6",
      type: "narrative",
      title: "Summary: Predictable UI Architecture",
      content: `Treating state as an immutable snapshot is what makes React interfaces predictable.

* **Never mutate state directly:** Always use the setter function.
* **Use updater functions for sequential changes:** Use \`set(prev => prev + 1)\` whenever the new state derives from the previous state.
* **Let React handle DOM manipulation:** You declare what the UI should look like for a given snapshot, and React reconciles the browser DOM.`,
    },
  ],
};

export const DEFAULT_LESSONS: Lesson[] = [SAMPLE_LESSON, REACT_STATE_LESSON];
