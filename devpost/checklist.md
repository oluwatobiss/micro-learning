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

- [ ] **3. Creator Studio Source Input, Validation & 5-Stage Adaptive Generation Engine**
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
