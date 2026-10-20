import type { Lesson } from '../types/lesson';

export const SAMPLE_ARTICLE_TEXT = `
The Architecture of Micro-Learning: Why Coherent Chunking Beats Endless Summaries
By Oluwatobi S.

In an era dominated by information overload, people constantly encounter long-form educational essays, books, and technical breakdowns that contain profound insights. Yet the modern reader is chronically pressed for time. When presented with a 5,000-word treatise, most people either bookmark it into an overflowing reading list that they never revisit, or skim through generic AI bullet-point summaries.

However, cognitive science shows that bulleted summaries produce weak retention. When an AI generates a five-bullet list from a nuanced chapter, it strips away the author's narrative momentum, the foundational evidence, and the logical bridges connecting premise to conclusion. The reader leaves with an illusion of competence—a vague recognition of buzzwords without the conceptual framework required to actually apply the knowledge.

True micro-learning is not summarization; it is structural transformation. It takes an expert's cohesive argument and unfolds it across a sequence of bite-sized, narrative cards. Each card serves as a focused building block of a unified mental model. Rather than disconnected trivia flashcards or infinite algorithmic feeds designed to maximize addiction, the card sequence has a clear beginning, middle, and end.

Crucially, retention requires active verification. When a learner pauses at a grounded comprehension checkpoint—answering a question whose resolution depends directly on the core logic of the preceding cards—retrieval practice solidifies neural pathways. When coupled with an immediate, source-grounded explanation, the learner verifies whether they actually grasped the idea or merely skimmed past it.

For knowledge creators and authors, the bottleneck has always been the immense friction of manual repurposing. Re-crafting a 20-page chapter into engaging social carousels or educational slide decks often takes hours of tedious manual design work. By leveraging AI to adaptively extract structure, formulate narrative cards, and synthesize grounded checkpoints—while leaving the author in complete editorial control—creators can repeatedly turn their existing expertise into credible, interactive lessons that readers actually remember.
`.trim();

export const SAMPLE_LESSON: Lesson = {
  id: 'micro-learning-architecture',
  title: 'The Architecture of Micro-Learning: Why Chunking Beats Summaries',
  author: 'Oluwatobi S.',
  sourceUrl: 'https://example.com/books/architecture-of-microlearning',
  sourceSnippet: 'Cognitive science shows that bulleted summaries produce weak retention. True micro-learning is structural transformation.',
  estimatedMinutes: 3,
  createdAt: '2026-10-20T00:00:00.000Z',
  cards: [
    {
      id: 'c1',
      type: 'narrative',
      title: 'The Modern Retention Dilemma',
      content: 'Readers are drowning in valuable long-form articles, newsletters, and books. But when pressed for time, people either abandon long texts or turn to generic AI bullet points that produce only an illusion of competence—leaving no lasting neural retention.'
    },
    {
      id: 'c2',
      type: 'comparison',
      title: 'Summarization vs. Structural Transformation',
      content: 'Generic summaries strip away the logical bridges connecting premise to conclusion. Micro-learning does not summarize; it transforms an argument into sequential narrative building blocks where each card establishes one clear layer of understanding.'
    },
    {
      id: 'c3',
      type: 'checkpoint',
      title: 'Concept Check: Active Understanding',
      content: 'Test your understanding before advancing to the next concept.',
      checkpoint: {
        question: 'Why do generic bullet-point summaries often produce weak long-term retention compared to narrative micro-learning?',
        options: [
          {
            id: 'opt-a',
            text: 'Because bullet points are always too short to contain any accurate vocabulary.',
            isCorrect: false
          },
          {
            id: 'opt-b',
            text: 'Because they strip away the logical bridges, evidence, and narrative structure needed to build an enduring mental model.',
            isCorrect: true
          },
          {
            id: 'opt-c',
            text: 'Because human memory cannot process information unless it is delivered via vertical video.',
            isCorrect: false
          }
        ],
        explanation: 'According to cognitive science, bullet lists trigger passive recognition rather than active mental reconstruction. Coherent narrative cards preserve the causal connections and evidence that anchor concepts in long-term memory.'
      }
    },
    {
      id: 'c4',
      type: 'example',
      title: 'Active Verification via Retrieval Practice',
      content: 'Stopping at intentional checkpoints triggers active retrieval practice. Answering a question grounded in the source text forces the brain to synthesize the concept, dramatically improving recall and immediate comprehension.'
    },
    {
      id: 'c5',
      type: 'narrative',
      title: 'The Creator Advantage: Repurposing Without Dilution',
      content: 'Authors invest weeks producing deep knowledge. Instead of manually rebuilding slides or settling for shallow AI summaries, adaptive extraction lets creators generate credible, interactive lessons in minutes while retaining 100% editorial authority.'
    }
  ]
};
