# MicroLearning Studio — Devpost Hackathon Submission Package

**Hackathon:** Build With AI: Basics Hackathon  
**Track:** AI Applications / Educational Tools  
**Project Name:** MicroLearning Studio  
**Tagline:** Transform long-form educational content into source-grounded, interactive micro-learning card decks with active comprehension checkpoints.  
**Repository:** https://github.com/oluwatobiss/micro-learning

---

## 1. Project Overview & Problem Statement

### The Problem

Subject-matter experts, authors, educators, and technical newsletter writers produce in-depth, high-value educational content — books, whitepapers, long-form articles, and essays. However:

- **Reader Time Scarcity & Drop-Off:** Modern learners are severely time-constrained. Long articles (15—30 minute reads) suffer high drop-off rates and poor retention.
- **Flawed Alternatives:**
  - _Generic AI Summarizers_ collapse rich pedagogical nuance into passive, disconnected bullet lists that fail to teach a structured concept.
  - _Flashcard Generators_ isolate atomic facts from their narrative context.
  - _Social Feeds & Carousels_ prioritize superficial scrolling and engagement algorithms over deep understanding.
- **Creator Friction:** Transforming an article into an engaging interactive experience currently takes hours of manual rewriting, slide layout formatting, and quiz authoring.

### The Solution: MicroLearning Studio

MicroLearning Studio is a creator-first web application that bridges long-form knowledge and high-retention micro-learning:

1. **Grounded Adaptive Extraction:** Analyzes source structure, thesis, and claims to dynamically plan a unified narrative card deck (4—8 cards).
2. **Active Comprehension Checkpoints:** Embeds interactive questions that require learner engagement, providing immediate feedback and explanations grounded directly in source claims before unlocking continuation.
3. **Creator Editorial Control:** A 3-pane desktop workspace and mobile-first editor allows creators to refine headlines, edit markdown, reorder cards, lock finalized text, and adjust quizzes before saving.
4. **Distraction-Free Reader:** A focused, lightweight reader with 3 accessible themes (Clean Light, Focused Dark, Warm Editorial), zero mandatory account creation, and clear attribution back to the original source.

---

## 2. Intended Audience & Educational Value

- **Target Creators:** Authors, educators, technical writers, and domain experts who want to repurpose existing publications into high-retention micro-lessons without sacrificing depth or attribution.
- **Target Learners:** Professionals, students, and curious readers seeking focused, 3-to-5 minute lessons that reinforce core concepts through active recall rather than passive skimming.
- **Pedagogical Impact:** Grounded checkpoints enforce active recall (testing effect) while immediate source-anchored explanations clarify misunderstandings in context, driving measurably higher comprehension than passive reading.

---

## 3. The Core User Journey & Standout Features

### The Core Journey

1. **Explore Lessons (/):** The learner visits the showcase catalog, selects a theme, and picks a featured lesson (e.g., _Understanding React 19 Actions_).
2. **Read & Check Understanding (/lessons/:id):** The reader progresses through narrative cards, encounters an interactive checkpoint, selects an answer, receives immediate visual feedback with an explanation, and views the lesson completion summary celebrating key takeaways with a link to the original publication.
3. **Open Creator Studio (/studio):** The creator enters source attribution (Title, Author, Citation URL), checks the authorization acknowledgement, and inputs an article (or clicks "Load Sample Article").
4. **5-Stage Adaptive Generation:** The creator clicks "Generate Lesson", watching real-time progression through source analysis, lesson planning, card synthesis, checkpoint generation, and quality auditing.
5. **Editorial Customization (/editor/:id):** The creator reviews the deck outline, edits card text, reorders cards using accessible move buttons, toggles card locks (🔒), refines the quiz, and monitors the live Reader preview frame.
6. **Save & View in Reader:** The creator clicks "Save & View in Reader →", instantly persisting the lesson to local storage and launching into the live Reader Player.

### Standout Features

- **3-Pane Desktop Workspace & Mobile Tabs:** Deck outline on the left, primary card editor in the center, and live Reader preview on the right (collapsing into clean segmented tabs on mobile).
- **Card Locking (isLocked):** Creators can lock approved cards to protect their wording while continuing to refine other cards.
- **Zero-Dependency Native Design System:** Crafted with 100% native CSS Modules and CSS Custom Properties across three curated themes (Clean Light, Focused Dark, Warm Editorial) with zero UI framework bloat.
- **Dual Persistence Architecture:** Strict isolation between draft editing (microlearning_editor_draft_{id}) and published library storage (microlearning_lessons_v3), preventing draft corruption.
- **Full Keyboard & Screen Reader Accessibility:** Arrow navigation, ARIA live regions, 48px touch targets, and semantic diagram flows.

---

## 4. Honest Technical Explanation: The 5-Stage Adaptive Generation Engine

### How the Pipeline Works

MicroLearning Studio's pipeline (app/services/generator.ts) executes five sequential stages:

1. **Stage 1 — Understanding Source:** Analyzes word count, sentence count, paragraph structure, and conceptual density.
2. **Stage 2 — Adaptive Lesson Planning:** Dynamically sizes deck length (4—8 cards) based on content depth, determining card roles (Narrative, Process, Example, Checkpoint).
3. **Stage 3 — Creating Cards & Structured Media:** Synthesizes narrative markdown and structured instructional media (e.g., SVG-backed process flow diagrams).
4. **Stage 4 — Comprehension Checks:** Generates single-question checkpoints with 3—4 options, designated correct answer, and an educational explanation grounded in source text.
5. **Stage 5 — Quality Audit Rubric:** Runs deterministic scoring across 4 pillars (Narrative Continuity, Source Grounding, Checkpoint Validity, and Readability / Est. Time).

### Actual Implementation & Boundaries (Honest Disclosure)

- **Client-Side Deterministic & Seed Extraction:** To guarantee that judges, reviewers, and offline users can evaluate the entire application immediately without provisioning API keys or cloud services, the hackathon proof-of-concept executes high-fidelity client-side structural extraction and seed analysis.
- **Extensible LLM Integration:** The generation service is architected to accept live LLM provider hooks (e.g., Google Gemini API via @google/genai) for open-ended generative transformations.
- **Storage Scope:** Lessons are persisted in browser localStorage. No cloud database, multi-tenant user accounts, or remote publishing servers are claimed for this PoC.
- **Human-in-the-Loop Philosophy:** AI does not make the final publishing decision. The Card Deck Editor explicitly places the human creator in control to review, edit, lock, or reject cards before they are saved.

---

## 5. Verified Setup and Run Instructions

Tested and verified on Node.js v24.18.0 / v20+ in standard Linux/WSL environments.

### Prerequisites

- Node.js (v20.0.0 or higher recommended)
- npm (v10.0.0 or higher)

### Setup & Local Execution

#### 1. Clone the repository

```bash
git clone https://github.com/oluwatobiss/micro-learning.git
cd micro-learning
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Run automated tests (26 unit and integration tests)

```bash
npm test
```

#### 4. Run TypeScript typechecking

```bash
npm run typecheck
```

#### 5. Start development server

```bash
npm run dev
# Open http://localhost:5173 in your browser
```

### Production Build

```bash
# Build production bundle (client SPA + SSR bundle)
npm run build
```

---

## 6. Submission Assets & Inventory

| Requirement                  | Status / Destination                          | Description                                                           |
| :--------------------------- | :-------------------------------------------- | :-------------------------------------------------------------------- |
| **Public GitHub Repository** | https://github.com/oluwatobiss/micro-learning | Full source code, test suites, and documentation.                     |
| **Demo Video**               | https://youtu.be/ycEEP1eBtOc                  | 1—3 minute video demonstrating the core creator & reader journey.     |
| **Live App URL**             | https://micro-learning-brown.vercel.app       | Offline-first local web app; live deployment optional.                |
| **App Map & Guide**          | devpost/app-map.html                          | Self-contained 29KB interactive architectural guide and code tour.    |
| **Build Checklist**          | devpost/checklist.md                          | Complete verification record with learner sign-off and reflection.    |
| **Product Spec & PRD**       | devpost/prd.md, devpost/spec.md               | Formal product requirements and technical architecture specification. |
| **Automated Tests**          | tests/*.test.mjs                              | 26 automated unit and integration tests passing cleanly.              |

---

## 7. Submission Form Field Guide (For the Learner)

Use the following reference when completing the Devpost submission form:

1. **Project Name:** MicroLearning Studio
2. **Elevator Pitch (Under 200 characters):**  
   _Turn long-form articles into source-grounded, interactive micro-learning card decks with active comprehension checkpoints and full creator editorial control._
3. **Inspiration:** Personal experience as an author and educator seeing readers abandon long-form articles, and recognizing that generic AI summaries lose pedagogical structure while flashcards lose narrative context.
4. **What it does:** Outlined in Section 1 and Section 3 above.
5. **How we built it:** React Router v7 Framework Mode, TypeScript, pure CSS Modules, custom 5-stage extraction pipeline, and versioned local storage.
6. **Challenges we ran into:** Designing a responsive 3-pane editor that gracefully collapses on mobile devices, ensuring accessible diagram connectors across orientation changes, and isolating draft edits from published lesson storage.
7. **Accomplishments that we're proud of:** 26 automated tests passing with zero errors, 100% custom styling with 3 accessible themes, and an end-to-end working loop from raw text to interactive reader.
8. **What we learned:** Guided planning through the Devpost Learn Skill Pack, iterative slice verification, and the value of placing human editorial control at the center of AI workflows.
9. **What's next for MicroLearning Studio:** Multi-tenant cloud synchronization, custom sharing links, visual card export for social carousels, and reader comprehension analytics.
