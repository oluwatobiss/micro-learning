---
doc: scope
status: approved
---

# MicroLearning Studio

A creator-first web application that turns long-form educational content into polished, source-grounded, interactive micro-learning lessons.

## The Unique Kernel

Instead of generic summaries or disconnected flashcards, the system extracts the source's natural structure to produce a coherent, unified narrative card deck with source-grounded comprehension checks and instant explanations. Creators retain full editorial control before publishing, and readers get an anti-doomscroll, high-retention learning experience in minutes without creating an account.

## Who It's For

Authors, educators, and subject-matter experts with published books, articles, newsletters, or technical writeups who want to give time-constrained readers a high-retention way to grasp their ideas without having to spend hours manually rebuilding their work into social carousels, slide decks, or quizzes.

## The Core Loop

- **Creator Loop:** Provide long-form source -> review adaptively generated narrative cards and comprehension checks -> edit / reorder / polish in studio -> publish.
- **Reader Loop:** Open lesson -> step through cards one at a time -> test understanding on grounded checkpoints with immediate explanations -> finish lesson with summary and source link.

## Inspiration & Identity

- **Inspiration:** Born from personal experience as an author repurposing published books and articles into social formats.
- **Look & Feel:** Clean, distraction-free, focused on clarity and readability. Native feel over heavy UI component libraries. Visible navigation controls (Next, Previous, Progress, Source) primary; gestures secondary.

## Why This Matters to the Learner

Direct personal stake as an author who has felt the friction of repurposing knowledge, coupled with the practical goal of building and shipping a viable, profitable product that solves real problems for both creators and learners.

## What "Working" Looks Like

A compelling 60-second demo:

1. Creator inputs an article excerpt (or loads a sample).
2. The system generates an adaptive interactive lesson (a narrative sequence of cards + grounded comprehension checkpoints with answer explanations).
3. Creator reviews and tweaks text in the Studio.
4. Creator clicks "Publish / View as Reader".
5. Reader mode displays the first card with progress indicator, navigates through the narrative, answers a comprehension check, sees instant feedback and explanation, and reaches the completion screen with attribution to the original source.

## The POC Boundary

- **In for Now (PoC):**
  - Creator input interface (paste text or load sample).
  - Adaptive generation logic: dynamically sizes card count (e.g. 4–10 cards) and checkpoint placement based on source density rather than a rigid template.
  - Source-grounded comprehension checks with answer explanations.
  - Creator Studio editor (edit text, reorder/remove cards, edit questions).
  - Reader View (one card at a time, clear controls, interactive question check, completion summary, link to source).
  - Lightweight, native styling (vanilla CSS / clean layout, no heavy UI framework bloat).

- **Later (Post-Hackathon):**
  - Creator authentication and account management.
  - Persistent multi-tenant database & custom vanity URLs.
  - Learning analytics dashboard (completion rates, drop-off, question accuracy).
  - Export tools (e.g. export cards as social media image carousels).

- **Explicitly Cut:**
  - AI generic bullet-point summarizers (lacks pedagogical narrative).
  - Disconnected flashcard generators (fails to teach a cohesive concept).
  - Infinite scroll / social feeds / gamified streaks (distracts from deep comprehension).

