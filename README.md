# MicroLearning Studio

> Transform long-form educational content into focused, source-grounded interactive micro-learning card decks with active comprehension checkpoints. Built for the [Build With AI: Basics Hackathon](https://learn-ai-basics.devpost.com).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests: 37 passed](https://img.shields.io/badge/tests-37%20passed-2ea44f.svg)](tests/)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](tsconfig.json)
[![Framework: React Router v7](https://img.shields.io/badge/React%20Router-v7%20Framework%20Mode-ea580c.svg)](react-router.config.ts)
[![AI: Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20API-4285F4.svg)](app/services/gemini.server.ts)
[![Styling: CSS Modules](https://img.shields.io/badge/styling-CSS%20Modules-0284c7.svg)](app/root.css)

---

## What is MicroLearning Studio?

**MicroLearning Studio** is a creator-first web application designed to help authors, educators, technical writers, and domain experts turn lengthy publications—articles, documentation, essays, and book chapters—into structured, bite-sized micro-learning experiences.

Rather than producing a generic text summary or disconnected flashcards, MicroLearning Studio adaptively extracts the core concepts and narrative flow of a source into a cohesive sequence of cards powered by **Google Gemini AI**. It embeds active comprehension checkpoints that test reader understanding with immediate feedback, while giving creators full editorial control to review, modify, reorder, lock, and customize cards before saving them to their library.

## Live Demo

- [Try MicroLearning Studio](https://micro-learning-brown.vercel.app)
- [Watch the DApp's Demo on YouTube](https://youtu.be/ycEEP1eBtOc)

---

## Problem and Approach

### The Problem

Long-form educational material contains immense depth, but modern readers often face severe time constraints and attention fatigue. A 20-minute technical essay frequently suffers from high abandonment rates and passive skimming with poor retention.

Existing alternatives fall short:

- **Generic AI Summarizers** flatten nuanced explanations into dry, passive bullet lists that strip out pedagogical progression.
- **Flashcard Generators** isolate atomic facts from their original context, weakening conceptual understanding.
- **Social Carousels** focus on visual engagement rather than deliberate learning and retention.
- **Manual Adaptation** requires creators to spend hours reformatting text into slides and drafting quizzes.

### The Approach

MicroLearning Studio combines structured content transformation with active learning science:

1. **Adaptive Card Architecture:** Organizes content into focused narrative units (4–8 cards) adaptively sized according to the density and complexity of the source text.
2. **Source-Grounded Generative AI:** Uses the official Google GenAI SDK (`@google/genai`) with Gemini structured outputs to synthesize cards directly from the supplied article text without topic substitution.
3. **Active Recall with Grounded Explanations:** Embeds single-concept checkpoints with instant visual feedback and educational explanations anchored directly in source claims.
4. **Creator-in-the-Loop Control:** Provides a visual editor where creators can refine text, lock finalized cards against regeneration, reorder topics, and adjust questions before saving.
5. **Distraction-Free Reading:** Delivers a lightweight, clean reading experience with visible navigation controls, progress tracking, and zero mandatory account barriers.

---

## Key Features

- **Lesson Showcase & Discovery:** Explore curated lessons with topic tags, reading times, and source attribution.
- **Distraction-Free Reader Player:** Step through cards one at a time with visible navigation controls, keyboard arrow support, and dynamic progress indicators.
- **Comprehension Checkpoints:** Active recall checks with immediate correct/incorrect feedback and detailed educational explanations before continuing.
- **Lesson Completion Experience:** Celebrates key takeaways and provides direct links to the author's original source publication.
- **Creator Studio & Source Ingestion:** Paste long-form text or load built-in sample articles, specify author attribution and citation links, and confirm authorization.
- **Source-Grounded Gemini AI Generation:** Generates coherent, adaptive card decks strictly grounded in submitted source text via Google Gemini structured output schemas.
- **5-Stage Adaptive Generation Engine:** Cycles through source understanding, lesson planning, card creation, checkpoint synthesis, and quality auditing with real-time visual progress and robust error handling.
- **Generation Results Review & Quality Rubric:** Evaluates generated decks across narrative continuity, source grounding, checkpoint validity, and readability.
- **3-Pane Card Deck Editor:** Desktop outline rail, central card editor, and live Reader preview frame (collapsing into clean segmented tabs on mobile).
- **Card Reordering & Locking:** Reorder cards up or down and lock approved cards (`🔒`) to protect finalized wording while continuing edits.
- **Local Persistence & JSON Export:** Lessons and draft edits persist locally in browser storage, with one-click JSON export for sharing and backup.

---

## Visual Walkthrough

### 1. The Reader Experience

Experience a clean, distraction-free player that focuses entirely on comprehension. Readers can navigate narrative cards, inspect interactive diagrams, engage with comprehension checkpoints, and toggle between Clean Light, Focused Dark, and Warm Editorial themes.

### 2. Creator Studio & Generation Review

Transform long-form engineering articles or guides into structured lessons. Ingest source text, monitor truthful five-stage generation progress, and review pedagogical grounding metrics before entering the editor.

### 3. The Card Deck Editor

Refine generated decks with complete editorial control. Select and reorder cards, modify card content and titles, lock finalized cards against regeneration, edit multiple-choice checkpoints, and switch between desktop and mobile previews.

---

## How It Works: The 5-Stage Adaptive Generation Engine

The application processes source material through five sequential stages:

```text
Source Text ───► [Stage 1: Source Analysis]
                      │
                      ▼
                 [Stage 2: Adaptive Planning]
                      │
                      ▼
                 [Stage 3: Grounded Card Construction (Gemini AI)]
                      │
                      ▼
                 [Stage 4: Checkpoint Synthesis]
                      │
                      ▼
                 [Stage 5: Quality Rubric Evaluation] ───► Card Deck Editor
```

1. **Stage 1 — Understanding Source:** Analyzes word count, sentence density, paragraph structure, and conceptual clusters from the input text.
2. **Stage 2 — Adaptive Lesson Planning:** Determines optimal deck size (4–8 cards) and card roles (Narrative, Example, Comparison, Checkpoint) based on source depth.
3. **Stage 3 — Grounded Card Construction (Google Gemini AI):** Communicates securely via a server-side route with Google Gemini (`gemini-3.8-flash`), enforcing strict JSON schemas to generate narrative cards, literal code blocks, and structured visual media (process flows or comparisons) strictly anchored in the submitted article.
4. **Stage 4 — Comprehension Checkpoint Synthesis:** Constructs interactive multiple-choice questions with exactly one unambiguous correct answer, plausible distractors, and an educational explanation grounded in source claims.
5. **Stage 5 — Quality Rubric Evaluation:** Computes an objective quality score based on seven deterministic verification audits: metadata completeness, card count bounds (4–8), code fence balance, media spec validation, checkpoint strict contract, unique identifier isolation, and takeaway sufficiency.

### Implementation Safeguards and Technical Boundaries

- **Authoritative Grounding:** The user's submitted source article is the sole ground truth. All technical explanations, code snippets, and checkpoints are derived from that text without external topic substitution.
- **Untrusted Source Handling:** Prompt directives instruct Gemini to treat article text strictly as passive reference data, ignoring any embedded instructions or prompt injections.
- **Server-Side API Security:** The Gemini API key is kept exclusively on the server (`GEMINI_API_KEY`) and accessed via the React Router server route `/api/generate`. It is never exposed in client bundles, browser requests, or version control.
- **Application-Normalized Data Contracts:** Model output is validated and normalized by application code before presentation. Application code assigns stable IDs (`c1`, `c2`, ...), sanitizes raw HTML, balances code fences, and guarantees checkpoint contracts.
- **Human-in-the-Loop Safeguard:** Automated quality audit scores verify structural criteria, but cannot guarantee pedagogical perfection. The Card Deck Editor explicitly keeps the human creator in control to review, edit, lock, or discard generated cards before saving.

---

## Environment Variables & Setup

### Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables:

```bash
# Server-only Google Gemini API Key (Required for live AI generation)
# Obtain from Google AI Studio: https://aistudio.google.com/app/api-keys
GEMINI_API_KEY=your_gemini_api_key_here

# Configurable Gemini Model (Optional, defaults to gemini-3.8-flash)
# Supported models: gemini-3.8-flash (flagship stable), gemini-3.6-flash (stable), gemini-3.5-flash-lite, gemini-4-argon
GEMINI_MODEL=gemini-3.8-flash
```

> **Security Note:** `GEMINI_API_KEY` is a server-only environment variable. It is never exposed to the client browser, never prefixed with `VITE_`, and never included in committed files.

### Vercel Deployment Configuration

When deploying to Vercel:

1. Open your project dashboard on [Vercel](https://vercel.com).
2. Navigate to **Settings** > **Environment Variables**.
3. Add `GEMINI_API_KEY` with your API key from Google AI Studio.
4. Select environments: **Production**, **Preview**, and **Development**.
5. Save and redeploy. The React Router v7 Vercel preset (`@vercel/react-router`) automatically bundles server functions with access to your server-side environment variables.

---

## Getting Started

### Prerequisites

- **Node.js:** v20.0.0 or higher (tested on Node.js v24.18.0)
- **npm:** v10.0.0 or higher

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/oluwatobiss/micro-learning.git
cd micro-learning

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY

# 4. Start the local development server
npm run dev
```

Open your browser to **[http://localhost:5173](http://localhost:5173)** to explore the application.

### Verification and Quality Commands

```bash
# Run the automated test suite (33 unit & integration tests)
npm test

# Run TypeScript strict typechecking
npm run typecheck

# Build production bundle (client SPA + SSR bundle)
npm run build
```

---

## Privacy and Data Disclosure

- **Source Article Processing:** When a creator initiates lesson generation in Creator Studio, the submitted article text and metadata are securely forwarded by the server-side endpoint (`/api/generate`) to the Google Gemini API using the official `@google/genai` SDK for the purpose of instructional extraction and card synthesis.
- **Credential Protection:** The `GEMINI_API_KEY` remains strictly confidential on the server and is never transmitted to the browser or stored in client storage.
- **Local Persistence:** Generated lessons, drafts, reader progress, and theme preferences are stored locally in the user's browser `localStorage`. No personal data, submitted articles, or user accounts are stored in external databases.

---

## Persistence and Current Limitations

- **Browser-Local Storage:** Lessons are persisted in browser `localStorage` using versioned keys (`microlearning_lessons_v3`). Editor drafts use isolated keys (`microlearning_editor_draft_{id}`) so that in-progress edits do not overwrite saved lessons until explicitly committed.
- **Device & Browser Scope:** Lessons created in the studio remain on the local machine and browser profile where they were authored.
- **Portability via JSON Export:** Creators can use the **Export JSON** feature in the editor to download a standardized `${lesson.id}.json` file for backup or inspection.
- **Proof-of-Concept Boundary:** The application currently focuses on the core author-to-reader loop. It does not include remote user accounts, multi-tenant cloud databases, or public cloud URL publishing.

---

## Project Documentation

For in-depth architectural details, developer guides, and planning history, refer to:

- **Interactive Application Map:** A self-contained, interactive architecture guide (`devpost/app-map.html`) with route maps, component catalogs, data contracts, and a project-grounded practice activity.
- **Build & Verification Checklist:** The complete slice-by-slice implementation log (`devpost/checklist.md`), automated test records, learner sign-off, and personal reflection.
- **Product Requirements Document (PRD):** The core user journey, screen layouts, design tokens, and functional specifications (`devpost/prd.md`).
- **Technical Specification:** Technical architecture, data schemas (`Lesson`, `LessonCard`, `CheckpointData`), storage isolation, and failure modes (`devpost/spec.md`).

---

## Technology Stack

- **Framework:** [React Router v7 (Framework Mode)](https://reactrouter.com/) with Vite and `@vercel/react-router` preset
- **Generative AI:** [Google GenAI SDK](https://github.com/googleapis/genai-js) (`@google/genai`) with Gemini structured JSON outputs (`gemini-3.8-flash`)
- **UI Library:** [React 19](https://react.dev/) (`react`, `react-dom`)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict mode, zero type errors)
- **Styling:** Vanilla CSS Modules (`*.module.css`) + CSS Custom Properties (zero external UI framework dependencies)
- **Content Rendering:** [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- **Automated Testing:** Node.js built-in test runner (`node --test`) with `--experimental-strip-types`

---

## Hackathon Context

MicroLearning Studio was built for the **[Build With AI: Basics Hackathon](https://learn-ai-basics.devpost.com)** hosted on Devpost. The application was scoped, planned, and implemented using the **Devpost Learn Skill Pack**, following a structured phase-based workflow from initial interview through design, sliced implementation, testing, hands-on review, and final packaging.

---

## License

This project is licensed under the [MIT License](./LICENSE).
