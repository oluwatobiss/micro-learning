---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Reader Landing & Interactive Card Deck Player (Scaffold + Core Reading Experience)**
      Becomes usable: A running application with React Router Framework Mode, global design tokens (`clean-light`, `focused-dark`, `warm-editorial`), Header with theme switcher, Reader Landing showing a featured sample lesson, and clicking it opens the standalone Reader Player navigating through narrative cards with visible Next/Prev controls and progress bar.
      Why now: Bootstraps the project and delivers usable reader evidence immediately on slice 1, establishing our styling tokens and proving the card navigation architecture end to end.
      PRD ref: `prd.md > The Core Journey` (steps 1, 6), `prd.md > 1. Reader Experience & Showcase`, `prd.md > Look and Feel`
      Spec ref: `spec.md > Stack`, `spec.md > Look and Feel`, `spec.md > Components > RootLayout`, `spec.md > Components > ReaderPlayerRoute`, `spec.md > Components > LessonCard`
      Build: Initialize React Router Framework Mode with Vite + TypeScript, configure root layout with CSS custom properties for the 3 themes, create `storage.ts` seed data with a rich sample lesson, implement `Header` with theme switcher, `ReaderLanding` route, and `ReaderPlayer` with card transitions.
      Verify (mechanical): Run `npm run build` to confirm zero TypeScript/bundling errors, launch dev server and verify HTTP 200 on `/` and `/lessons/:id`, confirm theme toggle attribute switches on `<html>`.
      Learner check: Open `http://localhost:5173`, click into the featured sample lesson, step through the cards using Next/Previous, and toggle between the Clean Light, Focused Dark, and Warm Editorial themes.
      Commit: `Bootstrap app with reader showcase, theme engine, and interactive card player`

- [x] **2. Grounded Comprehension Checkpoint with Instant Explanation & Lesson Completion**
      Becomes usable: The Checkpoint Card in the Reader Player. When advancing to a comprehension check, the Next button is held until an answer is selected. Selection triggers immediate visual feedback (correct green / incorrect amber) and displays the grounded educational explanation. Completing the lesson reveals the Lesson Completion screen with key takeaways and link to original source.
      Why now: Delivers the unique kernel of our reading experience early—active, source-grounded retention rather than passive consumption—and completes the full Reader loop from arrival to completion.
      PRD ref: `prd.md > 5. Checkpoint & Feedback Mechanics`, `prd.md > The Core Journey` (steps 6-7)
      Spec ref: `spec.md > Components > CheckpointCard`, `spec.md > Components > LessonCompletion`, `spec.md > Data Model`
      Build: Implement `CheckpointCard` with interactive option selection, feedback animations, and explanation reveal; implement `LessonCompletion` with recap badges and source attribution link; wire into `ReaderPlayer`.
      Verify (mechanical): Run `npm run build`, programmatically test quiz state (answering correct and incorrect options, verifying explanation reveals and completion screen renders upon reaching the end).
      Learner check: Advance to the checkpoint card in the reader player, pick an answer to see the instant feedback and explanation, and finish the lesson to view the completion summary and original source link.
      Commit: `Implement grounded comprehension checkpoint with explanations and completion recap`

- [x] **3. Creator Studio Source Input, Validation & 5-Stage Adaptive Generation Engine**
      Becomes usable: The Creator Studio at `/studio`! Creator enters article text (or clicks "Load Sample Article"), supplies required attribution metadata, and checks authorization. Clicking "Generate Lesson" runs the 5-stage adaptive extraction pipeline (`Understanding source` -> `Planning lesson` -> `Creating cards` -> `Creating checks` -> `Checking quality`) with live visual progress.
      Why now: Solves the creator input and AI transformation engine, proving that lessons are adaptively planned from source structure and claims rather than a rigid fixed template.
      PRD ref: `prd.md > 2. Source Input & Validation`, `prd.md > 3. Adaptive Generation Pipeline`
      Spec ref: `spec.md > Components > CreatorStudioRoute`, `spec.md > Components > SourceInputForm`, `spec.md > Components > GenerationProgressOverlay`, `spec.md > Services > generator.ts`
      Build: Implement `SourceInputForm` with length validation and authorization checkbox, create `generator.ts` with the 5-stage extraction algorithm that analyzes text density and creates 4–8 narrative cards + grounded checks, and build `ProgressOverlay` with step animations.
      Verify (mechanical): Run `npm run build`, verify validation blocks short text (<200 words) and unconfirmed authorization, trigger generation and verify all 5 stages cycle cleanly to completion with generated lesson schema.
      Learner check: Navigate to `/studio`, click "Load Sample Article", verify the validation checkmarks, click "Generate Lesson", and watch the 5 extraction stages complete.
      Commit: `Add creator input validation and 5-stage adaptive extraction engine`

- [ ] **4. Creator Studio Card Deck Editor (Edit, Reorder, Lock, & Publish to Live Reader)**
      Becomes usable: The complete visual card deck editor! The creator can edit headlines and body text, reorder cards up/down, change card types, lock approved wording against regeneration, edit quiz questions/options/explanations, preview desktop/mobile, and click "Publish / View as Reader", which saves to `localStorage` and opens the live lesson in the reader.
      Why now: Closes the final loop of the product: Create once -> transform -> edit -> publish -> learn. The creator has complete editorial control before publishing.
      PRD ref: `prd.md > 4. Creator Studio Editor & Polish`, `prd.md > The Core Journey` (steps 4-5)
      Spec ref: `spec.md > Components > CardDeckEditor`, `spec.md > Services > storage.ts`
      Build: Implement `CardDeckEditor` with card reordering, text editing, card locking toggle, quiz editor, mobile/desktop preview frame, and publish action connecting to `storage.ts` and redirecting to the live reader route.
      Verify (mechanical): Run `npm run build`, verify editing a card updates state, verify locking a card persists, publish the lesson and verify it appears in the lesson catalog and plays in the reader.
      Learner check: In the Studio editor, tweak a card title, reorder a card, click "Publish / View as Reader", and experience your newly customized lesson live in the Reader player!
      Commit: `Complete creator studio deck editor with card locking and live publishing`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after Slice 2 (the complete Reader Player with grounded checkpoint and 3 themes)
- [ ] Final kick-the-tires exploration and feedback completed — after Slice 4 (the full Create -> Transform -> Edit -> Publish -> Learn loop)

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: not established
Route and stops: not established
Edit outcome: not established
Reflection: not established
Activity mode: not established

## Revisions

### Checkpoint 1 Follow-up: Responsive Illustration Fixes & Instructional Media Architecture

- **Date:** October 21, 2026
- **Status:** Verified & Complete
- **Scope & Implementation:**
  1. **Elimination of Duplicate Illustrations:**
     - Identified root cause of the duplicate illustration in previous screenshot: two separate `<svg>` elements (one desktop, one mobile) were simultaneously present in the DOM with hardcoded coordinates.
     - Replaced with a single, unified, semantic `<figure>` and `<ol>` layout in `InstructionalDiagram.tsx` driven by structured data (`ProcessFlowSpec`).
     - Screen readers now encounter exactly one logical representation in the accessibility tree with an accessible summary caption (`<figcaption className="srOnly">`).
  2. **Accurate & Responsive Diagram Connectors:**
     - Solved broken SVG marker orientation and connector alignment by shifting from brittle hard-coded coordinates to semantic in-flow connector vectors.
     - Desktop presents horizontal sequence with right-pointing arrow vectors (`display: flex; flex-direction: row;`).
     - Mobile presents vertical sequence (`flex-direction: column;`) with downward-pointing arrow vectors centered between node bottom and node top (`height: 32px; width: 100%;`).
     - Nodes dynamically adapt to wrapped descriptions without boundary collisions or detached arrows.
     - Reviewed technical accuracy: step 2 accurately describes scheduling a re-render without mutating current closure, and step 4 clarifies minimal DOM reconciliation.
  3. **Minimal Responsive Instructional-Media Architecture:**
     - Created `app/types/media.ts` providing validated specifications (`ProcessFlowSpec`, `ComparisonSpec`) separating AI-generated content models from visual component rendering.
     - Integrated `visualMedia` property onto `LessonCard` schema in `app/types/lesson.ts`.
     - Built validation function `validateMediaSpec` for automatic pre-render visual-quality checks.
  4. **Desktop Navigation Spacing:**
     - Refined `.btnGroup` in `ReaderPlayer.module.css` with a deliberate `gap: 1rem;` (16px spacing) between Previous and Next controls on desktop.
     - Maintained left alignment and visual hierarchy (secondary outline vs. primary filled accent).
  5. **Verification & Checks:**
     - `npm run typecheck`: 0 errors.
     - `npm test`: 6/6 tests passing in `tests_reader.mjs`, including encoding integrity and media spec validation.
     - `npm run build`: 100% successful production build.

### Final Reader Quality Pass: Responsive Navigation, Encoding, Illustrations & Accessibility

- **Date:** October 20, 2026
- **Status:** Verified & Complete
- **Scope & Implementation:**
  1. **Text Encoding & Mojibake Elimination:**
     - Traced root cause of `â€”` mojibake: UTF-8 em dash `—` (bytes `0xE2 0x80 0x94`) was previously interpreted/saved as Windows-1252.
     - Cleaned all 6 occurrences in `app/services/sampleLesson.ts` back to genuine UTF-8 em dash `—`.
     - Bumped `SAMPLE_LESSON.version` to 2 and storage key to `microlearning_lessons_v3`, adding auto-synchronization so cached seed lessons in `localStorage` seamlessly upgrade without manual cache wipes.
     - Added automated regression check in `tests_reader.mjs` asserting zero occurrences of mojibake patterns (`â€”`, `â€™`, `â€œ`, `â€`, `Ã`) across all lessons and cards.
  2. **Deliberate Mobile Reader Navigation:**
     - Refactored `ReaderPlayer.tsx` and `ReaderPlayer.module.css` to introduce an intentional mobile bottom navigation bar (`position: fixed; bottom: 0;`).
     - Added safe-area padding (`calc(0.75rem + env(safe-area-inset-bottom))`) and reserved bottom clearance on `.playerWrapper` (`padding-bottom: calc(5.5rem + env(safe-area-inset-bottom))`) so text, code blocks, diagrams, and checkpoint explanations are never obscured.
     - Retained the clean, in-flow inline navigation on desktop (`> 640px`).
     - Preserved accessible minimum 48px touch targets and distinct disabled states across all devices.
  3. **Simplified Source Attribution:**
     - Removed distracting, repeated "Original Source ↗" links from every reading card in `ReaderPlayer.tsx`.
     - Preserved the visible source attribution link exclusively on the dedicated `LessonCompletion` screen alongside author metadata with safe `target="_blank" rel="noopener noreferrer"` attributes.
  4. **Responsive & Legible Concept Diagram:**
     - Refactored `InstructionalDiagram.tsx` and created `InstructionalDiagram.module.css`.
     - Desktop retains a horizontal 4-step sequence (`740x160` viewBox) with corrected technical terminology (User Action -> setState Called -> React Re-renders -> DOM Sync).
     - Mobile introduces a bespoke vertical 4-step card stack (`340x430` viewBox) with downward connector arrows, large legible typography (14px title / 12.5px description), high contrast, and zero horizontal overflow.
  5. **WCAG 2.2 Level AA Contrast Audit & Optimization:**
     - Programmatically audited all color combinations across Clean Light, Focused Dark, and Warm Editorial.
     - Elevated Focused Dark `text-muted` from `#64748b` (3.73:1) to `#94a3b8` (6.92:1, solid AA/AAA).
     - Adjusted Clean Light `accent-primary` to `#0369a1` (5.93:1) and `feedback-success` to `#047857` (5.48:1).
     - Adjusted Warm Editorial `text-muted` to `#6b5e53` (6.27:1) and `text-secondary` to `#4a3f36` (10.22:1).
     - 100% of all normal text combinations across all 3 themes now achieve >= 4.5:1 contrast, with all large text and graphical components meeting >= 3.0:1.
  6. **Code Blocks & Focus Indicators:**
     - Added `:focus-visible` styling to copy button in `MarkdownContent.module.css`.
     - Verified code block containment with internal horizontal scrolling.
  7. **Comprehensive Verification:**
     - `npm run typecheck`: 0 errors.
     - `npm test`: 5/5 passing tests in `tests_reader.mjs`.
     - `npm run build`: successful production build.

### Checkpoint 1 Refinement: Reader UX, Persistence, Content Rendering & Environment Audit

- **Date:** October 20, 2026
- **Status:** Verified & Complete
- **Scope & Implementation:**
  1. **Reader State Persistence:**
     - Created `app/services/progress.ts` implementing versioned reader state persistence (`mls_progress_<lessonId>_v<version>`).
     - Persists card index, selected checkpoint answers, completion status, and timestamps.
     - Features safe bounds clamping, malformed JSON recovery, and content version change invalidation. Kept completely decoupled from theme settings.
     - Preserves completed status when learners revisit lesson cards.
  2. **Dedicated Lesson Completion Experience:**
     - Created `app/components/LessonCompletion.tsx` and `.module.css`.
     - Displays celebratory completion message, lesson title recap, key takeaways, primary action to "Explore Available Lessons →", configurable feedback URL ("Share Feedback"), and "Review Lesson Cards ↺".
     - Fixed `app/routes/lessons.$id.tsx` to display completion in-place without abrupt redirection to home.
  3. **Responsive Bespoke Reader Design:**
     - Refined `app/components/Header.tsx` and `.module.css` with nowrap badges and responsive font clamp to eliminate awkward mobile label wrapping.
     - Refined `LessonCard.module.css` removing rigid `min-height: 380px`, allowing natural content expansion while maintaining comfortable reading line lengths and preventing horizontal overflow.
     - Enhanced `CheckpointCard.tsx` with accessible 48px touch targets, non-color-only feedback badges (`✓ Correct`, `✕ Your Choice`), and persistent option state.
     - Added `@media (prefers-reduced-motion: reduce)` accessibility rules across all card transitions.
  4. **Markdown Rendering & Software Development Lesson:**
     - Integrated `react-markdown` (v10.1.0) and `remark-gfm` (v4.0.1) in `app/components/MarkdownContent.tsx`.
     - Custom renderers for fenced code blocks with language labels and clipboard copy button. No raw HTML execution or `dangerouslySetInnerHTML`.
     - Authored complete technical sample lesson: `React State & The Component Render Cycle` (6 cards, JSX code blocks, render snapshot mental model, grounded checkpoint, attributed to CodeSweetly).
  5. **Instructionally Justified Visual Illustrations:**
     - Created `app/components/InstructionalDiagram.tsx` rendering an accessible, responsive, theme-aware SVG diagram (`react-render-loop`) that visually communicates the state snapshot and re-render cycle.
  6. **Quiz Quality & Content Audit:**
     - Audited all checkpoints to guarantee self-contained wording, plausible options, single unambiguous correct answers, and constructive educational explanations.
  7. **Toolchain & WSL Environment Audit:**
     - Confirmed Node.js v24.15.0 and npm 11.14.1 on Windows runtime; 0 npm vulnerabilities.
     - Confirmed repository resides on WSL2 Ubuntu ext4 filesystem (`/home/oluwatobiss/projects/micro-learning`), accessed via Windows UNC / mapped `Z:` drive.
  8. **Automated Verification:**
     - Added `tests_reader.mjs` test suite and `"test"` script in `package.json`.
     - Verified: `npm run typecheck` (0 errors), `npm run build` (production build passes), and `npm test` (4/4 tests pass).

### Checkpoint 2 / Slice 3 Delivery: Creator Studio Source Input, Validation & 5-Stage Adaptive Generation Engine

Completed and verified the implementation of **Slice 3**:

1. **Creator Studio Source Input (`app/components/studio/SourceInputForm.tsx` & `.module.css`):**
   - Implemented dedicated creator authoring route at `/studio`.
   - Fields: Lesson Title, Original Author / Creator, Source Article URL, Source Article Text, and Ownership / Permission Acknowledgment.
   - Shared word-count utility (`app/utils/text.ts`) with strict boundaries: minimum 200 words, maximum 10,000 words.
   - Accessible validation feedback associating errors to form fields (`aria-required`, `aria-invalid`, `aria-describedby`, `role="alert"`), autofocusing the first invalid element upon submission failure.
   - Live word count and requirement status counter with visual and aria-live feedback.
   - "Load Sample Article" action pre-populating a comprehensive software-development article (_Optimistic UI and Mutation Resilience in Modern Web Apps_), keeping the permission checkbox intentionally unconfirmed to require explicit creator acknowledgment.

2. **Five-Stage Adaptive Generation Engine (`app/services/generator.ts`):**
   - **Stage 1 (Understanding Source):** Extracts central thesis, section structures, literal code snippets, key terminology, process flows, and comparison points without fabricating facts or citations.
   - **Stage 2 (Planning Lesson):** Dynamically blueprints an instructional progression of 4?8 cards tailored to the source structure rather than a fixed rigid template.
   - **Stage 3 (Creating Cards):** Generates narrative explanations, literal TypeScript code blocks, and structured visual diagram specifications (`ProcessFlowSpec`) validated through `validateMediaSpec`.
   - **Stage 4 (Creating Checks):** Formulates grounded comprehension checkpoints with exactly one unambiguous correct answer, plausible distractors, and educational explanations.
   - **Stage 5 (Checking Quality):** Executes deterministic quality audits verifying metadata, stable UUIDs, card count bounds, code block fence integrity, media specifications, checkpoint integrity, takeaways completeness, and factual grounding score.

3. **Truthful Progress Reporting (`app/components/studio/GenerationProgressOverlay.tsx` & `.module.css`):**
   - Real-time progress tracker reflecting truthful async progression across all 5 stages (`pending`, `in-progress`, `complete`, `failed`).
   - Distinct visual state badges, stage status descriptions, and error recovery handling with retry or return actions without losing creator input.
   - Fully supports `prefers-reduced-motion` and screen reader announcements (`role="status"`, `aria-live="polite"`).

4. **Generation Result & Slice 4 Handoff Interface (`app/components/studio/GenerationResultReview.tsx` & `.module.css`):**
   - Summary display featuring lesson metrics (title, author, source link, card count, estimated read time, source word count, quality score).
   - Deterministic Quality Audit report displaying all passed checks and warnings.
   - Read-only Card Deck Inspector allowing expandable review of card Markdown, diagrams, and checkpoint questions.
   - Direct integration with `storageService.saveLesson` allowing creators to test their newly generated lesson in the live Reader player (`/lessons/:id`).
   - Clean, typed handoff contract (`Slice4HandoffPayload`) delivering a valid `Lesson` instance to the downstream Slice 4 Card Deck Editor.

5. **Automated Verification:**
   - Authored `tests_slice3.mjs` covering word-count boundaries, URL validation, missing field detection, permission enforcement, sample article loading, 5-stage pipeline order, grounded analysis, card synthesis, checkpoint contract, quality audits, and Slice 4 handoff integrity.
   - Combined test suite runs via `npm test` (`tests_reader.mjs` + `tests_slice3.mjs`) -> **16/16 tests passing**.
   - Typecheck (`tsc --noEmit`) -> **0 errors**.
   - Production bundle (`npm run build`) -> **Succeeds cleanly** with client and SSR assets.
   - Browser Subagent verified the entire user journey end-to-end at `http://127.0.0.1:5173/studio` across Clean Light, Focused Dark, and Warm Editorial themes.

### Slice 3 Remediation: Creator Studio UX, Rendering, and Workflow Reliability Pass

Completed and verified the remediation of Slice 3 based on visual review and workflow testing:

1. **Symbol & Unicode Encoding Integrity Across System:**
   - **Root Cause:** In PowerShell piping into WSL, default console codepages silently converted non-ASCII characters into literal ?? symbols.
   - **Fix:** Enforced UTF-8 encoding across scripts and source files, eliminated mojibake and stray ?? symbols across all buttons, headings, and labels.
   - Converted key actions and badges to crisp, theme-aware inline SVG icons (document icon for sample loader, checkmark icons for stage completions, warning icons for validation errors).
   - Standardized typography with proper en-dashes (`from 200–10,000 words`), em-dashes (`Stage 1 — Understanding Source`), and arrows (`→`).
   - Added automated regression test `Symbol & Unicode Encoding Integrity Audit` to `tests_slice3.mjs`.

2. **Source Input Mobile Layout & Form Usability:**
   - Updated primary action button label to concise and intuitive **Generate Lesson**.
   - Added `.labelRow` flexbox container to `SourceInputForm.module.css` to prevent mobile collision between field labels (`Source Article Text`) and helper text (`Markdown & code fences supported`).
   - Enhanced `.actionBar` layout for mobile: buttons stack vertically with full width and touch targets >= 44px (primary button 48px).

3. **Isolated "Create Another Lesson" Reset Workflow:**
   - Added `handleCreateAnother` in `app/routes/studio.tsx`:
     - Clears local draft input, progress tracker, and generation result.
     - Increments `formResetCounter` so `<SourceInputForm key={formResetCounter} />` re-mounts fresh with completely reset state.
     - Unchecks permission confirmation, resets word counts and validation errors.
     - Programmatically smooth-scrolls to top and focuses `#lesson-title-input`.
     - Preserves all previously saved lessons in `storageService`.
   - Added automated regression test `Create Another Lesson Reset & Isolation Contract` to `tests_slice3.mjs`.

4. **Generation Review Experience & Card Deck Inspector:**
   - Header badge updated to clean affirmative state: `Lesson generated successfully` with SVG checkmark.
   - Quality status computed defensibly as `7/7 Checks Passed` (`100% Conformance`) based on `QualityAuditReport.checksPassed.length / totalChecksCount`.
   - Card deck inspector:
     - Collapsed preview strips markdown formatting symbols (`stripMarkdownPreview`) to prevent raw `**` asterisks.
     - Expanded preview renders rich, formatted markdown and syntax-highlighted code blocks with clipboard copy via `<MarkdownContent />`.
     - Card type badge displays a single, deduplicated badge (`Overview`, `Concept`, `Process Flow`, or `Checkpoint`), eliminating duplicate `checkpoint checkpoint` labels.
     - Checkpoint options display distinct SVG icons: checkmark for correct answers and circle for distractors.

5. **Automated Verification:**
   - `npm test`: **18/18 tests passing`** (6 reader tests + 12 Slice 3 tests).
   - `npm run typecheck` (`tsc --noEmit`): **0 errors**.
   - `npm run build`: Production build passes cleanly for both SPA and SSR targets.
   - Browser subagent verified full end-to-end journey on `http://127.0.0.1:5173/studio`.
