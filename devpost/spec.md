---
doc: spec
status: draft
---

# MicroLearning Studio — Technical Spec

## How This Works, In Plain Language

MicroLearning Studio is a web application built using **React Router Framework Mode (v7)** with **TypeScript** and **CSS Modules**. 

The app consists of two coordinated experiences:
1. **The Reader Experience (`/` and `/lessons/:id`):** When anyone visits the app, they immediately see a showcase of available lessons. Clicking a lesson opens the distraction-free player where they navigate through narrative cards one by one, encounter interactive comprehension checkpoints that give immediate feedback and explanations, and reach a completion summary with a direct link back to the author's original source.
2. **The Creator Studio (`/studio`):** When a creator wants to turn an article, chapter, or essay into a lesson, they enter the studio, paste the text, provide attribution metadata (Title, Author, Source Link), and check the authorization acknowledgment. Clicking "Generate Lesson" runs a 5-stage extraction pipeline (`Understanding source` -> `Planning lesson` -> `Creating cards` -> `Creating checks` -> `Checking quality`). Once generated, the creator can edit text, reorder cards, change card types, lock approved wording, and adjust quiz questions before publishing.

All styling is built purely with **CSS Modules and native CSS Custom Properties**, giving us three bespoke themes (**Clean Light**, **Focused Dark**, and **Warm Editorial**) with zero bloated component libraries.

## The Core Journey Through the System

1. **Discovery (Reader Landing):** The user visits `/`. The route loader in `routes/_index.tsx` loads published lessons from the local storage / seed service and renders the lesson showcase with topic tags, reading times, and the theme switcher.
   - *PRD ref:* `prd.md > The Core Journey` (Step 1) and `prd.md > 1. Reader Experience & Showcase`.
2. **Starting a Lesson:** The user clicks a lesson card. React Router navigates to `/lessons/:id`. The route loader retrieves the lesson data by ID and mounts the `ReaderPlayer` starting at Card 1.
   - *PRD ref:* `prd.md > The Core Journey` (Step 6) and `prd.md > 1. Reader Experience & Showcase`.
3. **Card Progression & Checkpoint:** The reader clicks `Next` or presses right-arrow. State advances to Card 2, updating the progress indicator. When hitting a Checkpoint Card, the `Next` button is disabled until the reader selects an option. Selection triggers immediate visual feedback (correct green / incorrect amber) and displays the explanation grounded in the source text, unlocking the `Continue` button.
   - *PRD ref:* `prd.md > 5. Checkpoint & Feedback Mechanics`.
4. **Lesson Completion:** Finishing the final card mounts `LessonCompletion`, presenting key takeaways and an external link to the author's original publication.
   - *PRD ref:* `prd.md > The Core Journey` (Step 7).
5. **Creator Studio Navigation:** Clicking "Creator Studio" in the top navigation routes to `/studio`. The creator sees the `SourceInputForm`.
   - *PRD ref:* `prd.md > 2. Source Input & Validation`.
6. **Triggering Generation:** The creator pastes article text (or clicks "Load Sample Article") and checks the authorization box. Clicking "Generate Lesson" initiates the multi-stage pipeline, rendering the `GenerationProgressOverlay` cycling through the 5 extraction stages.
   - *PRD ref:* `prd.md > 3. Adaptive Generation Pipeline`.
7. **Deck Editing:** The generation pipeline returns an adaptive card deck. The creator uses `CardDeckEditor` to tweak text, reorder cards, lock specific cards from changes, and preview mobile/desktop layouts.
   - *PRD ref:* `prd.md > 4. Creator Studio Editor & Polish`.
8. **Publishing:** The creator clicks "Publish / View as Reader". The lesson is saved into storage and the creator is routed directly to `/lessons/:newId` to experience the live lesson.

## Stack

- **Framework:** [React Router v7 (Framework Mode)](https://reactrouter.com/) with [Vite](https://vitejs.dev/)
  - *Rationale:* Provides official route conventions, route loaders, and SSR-ready architecture without hand-rolling router plumbing or ad-hoc data fetching.
- **Language:** [TypeScript](https://www.typescriptlang.org/)
  - *Rationale:* Enforces strict compile-time types for lessons, narrative cards, checkpoints, and theme tokens.
- **Styling:** CSS Modules (`*.module.css`) + Native CSS Custom Properties
  - *Rationale:* Delivers scoped styles per component and global theme switching with zero runtime CSS library overhead, fulfilling the requirement to avoid bulky design ecosystems.
- **State & Storage:** React Context / Route Loaders + Browser `localStorage`
  - *Rationale:* Self-contained client persistence that preserves custom-created lessons across page refreshes for the hackathon proof of concept.

## Where It Runs and How Someone Tries It

- **Runtime:** Browser execution served by Node.js local dev server.
- **System Requirements:** Node.js v18+ (verified: system has Node v24.15.0).
- **Start Command:**
  ```bash
  npm install
  npm run dev
  ```
- **What to Open:** `http://localhost:5173` (or the local port provided by Vite).
- **Submission Demo:** 60-second video recorded on desktop or mobile viewport showing Reader play -> Studio generation -> Deck edit -> Publish. Deployment is optional.

## Look and Feel

- **CSS Custom Properties Design Tokens (`app/root.css`):**
  - Theme attribute selector: `[data-theme="clean-light"]`, `[data-theme="focused-dark"]`, `[data-theme="warm-editorial"]`.
  - Token variables: `--bg-page`, `--bg-surface`, `--border-color`, `--text-primary`, `--text-secondary`, `--accent-primary`, `--accent-glow`, `--feedback-success`, `--feedback-warning`.
- **Typography:**
  - UI / Controls: System humanist sans-serif stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
  - Lesson Headlines & Body: High-legibility editorial serif/sans stack for calm, book-like reading immersion.
- **Visual Restraint:**
  - Visible navigation controls (Next, Prev, Progress) are primary.
  - Zero decorative clutter; diagrams/visuals appear only when reinforcing a concrete concept.

## Components

### RootLayout
- The top-level layout component rendering the persistent header, brand mark, ThemeToggle, and route outlet.
- *PRD ref:* `prd.md > Screens and Layout`.

### ThemeToggle
- Controls the active theme (`clean-light`, `focused-dark`, `warm-editorial`), persisting selection to `localStorage` and updating the `data-theme` attribute on the `<html>` root.
- *PRD ref:* `prd.md > Look and Feel`.

### ReaderLandingRoute
- Route component for `/`. Displays the hero introduction, "Create Lesson" call-to-action, and the showcase grid of available micro-learning lessons.
- *PRD ref:* `prd.md > 1. Reader Experience & Showcase`.

### ReaderPlayerRoute
- Route component for `/lessons/:id`. Manages current card index, progress bar calculations, and transitions between cards.
- *PRD ref:* `prd.md > 1. Reader Experience & Showcase`.

### LessonCard
- Renders narrative, example, or comparison cards with title, body text, and optional responsive concept diagram with alt text.
- *PRD ref:* `prd.md > 1. Reader Experience & Showcase`.

### CheckpointCard
- Renders an interactive multiple-choice question. Handles option selection, displays instant correct/incorrect visual states, reveals the grounded explanation, and unlocks the advance button.
- *PRD ref:* `prd.md > 5. Checkpoint & Feedback Mechanics`.

### LessonCompletion
- Renders the lesson recap, completion celebration badge, and external button linking to the author's original long-form publication.
- *PRD ref:* `prd.md > 1. Reader Experience & Showcase`.

### CreatorStudioRoute
- Route component for `/studio`. Coordinates the state machine between source input, generation progress, and the deck editor.
- *PRD ref:* `prd.md > 2. Source Input & Validation` and `prd.md > 4. Creator Studio Editor & Polish`.

### SourceInputForm
- Input form capturing Title, Author Attribution, Source URL, Authorization Checkbox, and Article Textarea. Includes "Load Sample Article" quick-start and character validation.
- *PRD ref:* `prd.md > 2. Source Input & Validation`.

### GenerationProgressOverlay
- Modal or inline stage progress indicator displaying the 5 pipeline extraction steps (`Understanding source`, `Planning lesson`, `Creating cards`, `Creating checks`, `Checking quality`).
- *PRD ref:* `prd.md > 3. Adaptive Generation Pipeline`.

### CardDeckEditor
- Studio workspace allowing the creator to edit card text, reorder cards (up/down), delete/duplicate cards, lock cards against regeneration, and edit quiz questions and explanations.
- *PRD ref:* `prd.md > 4. Creator Studio Editor & Polish`.

## Data Model

```typescript
export type ThemeMode = 'clean-light' | 'focused-dark' | 'warm-editorial';

export type CardType = 'narrative' | 'example' | 'comparison' | 'checkpoint';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizCheckpoint {
  question: string;
  options: QuizOption[];
  explanation: string;
  sourceExcerpt?: string;
}

export interface LessonCard {
  id: string;
  type: CardType;
  title: string;
  content: string;
  isLocked?: boolean;
  visualSvg?: string; // Optional concept diagram
  checkpoint?: QuizCheckpoint; // Present if type === 'checkpoint'
}

export interface Lesson {
  id: string;
  title: string;
  author: string;
  sourceUrl: string;
  sourceSnippet: string;
  estimatedMinutes: number;
  createdAt: string;
  cards: LessonCard[];
}
```

## File Structure

```
micro-learning/
├── app/
│   ├── root.css                  # Global CSS custom properties (tokens & themes)
│   ├── root.tsx                  # Root layout & ThemeProvider
│   ├── routes.ts                 # React Router Framework Mode route configuration
│   ├── routes/
│   │   ├── _index.tsx            # Reader landing & showcase route
│   │   ├── lessons.$id.tsx       # Reader player route
│   │   └── studio.tsx            # Creator studio route
│   ├── components/
│   │   ├── Header.tsx            # Navigation header & theme switcher
│   │   ├── Header.module.css
│   │   ├── ReaderPlayer.tsx      # Card-by-card presentation engine
│   │   ├── ReaderPlayer.module.css
│   │   ├── LessonCard.tsx        # Individual narrative card display
│   │   ├── LessonCard.module.css
│   │   ├── CheckpointCard.tsx    # Interactive quiz card with explanation
│   │   ├── CheckpointCard.module.css
│   │   ├── LessonCompletion.tsx  # Completion screen & source attribution
│   │   ├── LessonCompletion.module.css
│   │   ├── SourceInput.tsx       # Creator input form with validation & sample loader
│   │   ├── SourceInput.module.css
│   │   ├── ProgressOverlay.tsx   # 5-stage generation progress indicator
│   │   ├── ProgressOverlay.module.css
│   │   ├── DeckEditor.tsx        # Visual card deck editor & card management
│   │   └── DeckEditor.module.css
│   ├── services/
│   │   ├── storage.ts            # LocalStorage & lesson seed service
│   │   ├── generator.ts          # 5-stage adaptive lesson extraction engine
│   │   └── sampleLesson.ts       # Rich seed article and pre-built lesson
│   └── types/
│       └── lesson.ts             # TypeScript schemas (Lesson, Card, Quiz)
├── devpost/                      # Devpost Learn artifacts
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## External Services and Dependencies

- **Framework & Core:**
  - `react`, `react-dom` (^19.0.0 or ^18.3.1)
  - `@react-router/dev`, `@react-router/node`, `react-router` (v7)
  - `vite` (^6.0.0)
- **Zero Third-Party UI Ecosystems:** No Tailwind, no Radix/MUI, no external state libraries. 100% native platform CSS Modules and web standards.
- **Optional LLM API:** Google Gemini API (`@google/genai` or direct `fetch` to `https://generativelanguage.googleapis.com`) using an optional client/env key for live AI extraction, with deterministic fallback for the rich sample article.

## Important Failure Modes

- **Source Text Below Minimum Length:**
  - *Trigger:* User pastes fewer than 200 words.
  - *Fallback:* Form displays inline alert indicating minimum word count for structural extraction; "Generate" button remains disabled.
- **Generation Network / API Failure:**
  - *Trigger:* LLM API rate limit, network timeout, or invalid API key.
  - *Fallback:* Progress overlay flags the failed step with a clear "Retry" button or an option to use the high-fidelity built-in extraction engine.
- **Corrupted / Missing Local Storage:**
  - *Trigger:* User clears browser cache or opens incognito.
  - *Fallback:* Storage service automatically re-seeds default featured lessons so the Reader experience is never blank.

## What Was Simplified and Why

- **Client-Side Storage (`localStorage`) instead of Cloud PostgreSQL/Supabase:**
  - *Why:* Keeps the hackathon PoC 100% self-contained and runnable locally with zero external database provisioning or secret management.
- **Deterministic Intelligent Extraction Engine alongside Live API:**
  - *Why:* Guarantees the app can be run, reviewed, and recorded for the 60-second hackathon submission video even if an API key is not configured.
- **Native CSS Modules instead of UI Component Kits:**
  - *Why:* Eliminates dependency bloat, guarantees precise control over the three bespoke themes, and avoids generic AI-app aesthetics.

## Decisions and Open Issues

- **React Router Framework Mode Confirmed:** Eliminates custom router construction and provides production-ready routes (`/`, `/lessons/:id`, `/studio`).
- **CSS Modules + CSS Custom Properties Confirmed:** Ensures clean local scoping without class collision and instant theme toggling.
- **One Learner Uncertainty Discussed & Clarified:** The concern regarding building custom application plumbing in pure Vite vs. adopting framework conventions was resolved by selecting React Router Framework Mode, which handles route loaders, nested layouts, and code splitting out of the box.
