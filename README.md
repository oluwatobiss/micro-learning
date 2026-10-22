# MicroLearning Studio

> A creator-first web application that turns long-form educational content into polished, source-grounded, interactive micro-learning card decks. Built for the **Build With AI: Basics Hackathon**.

[![Tests](https://img.shields.io/badge/tests-26%20passed-success)](tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.json)
[![Framework](https://img.shields.io/badge/React%20Router-v7%20Framework%20Mode-red)](react-router.config.ts)

---

## Overview

MicroLearning Studio bridges long-form knowledge and high-retention micro-learning. It enables authors, educators, and subject-matter experts to transform existing publications (articles, book chapters, essays) into concise, narrative card decks with embedded active comprehension checkpoints.

### Key Capabilities

- **Grounded 5-Stage Adaptive Extraction:** Analyzes source structure to adaptively size card count (4?8 cards) rather than using a rigid template.
- **Active Comprehension Checkpoints:** Embedded questions with instant green/amber visual feedback and explanations grounded directly in source claims.
- **Creator Studio & 3-Pane Deck Editor:** Full editorial control to edit titles, modify markdown, reorder cards, lock finalized text (??), customize quizzes, and preview mobile/desktop layouts.
- **Distraction-Free Reader:** Standalone player with visible navigation controls, progress tracking, and 3 accessible themes (**Clean Light**, **Focused Dark**, and **Warm Editorial**).
- **Zero UI Framework Bloat:** Crafted with 100% native CSS Modules and CSS Custom Properties.
- **Self-Contained & Offline-First:** Persists custom-created lessons and reader progress via versioned browser localStorage.

---

## Quick Start

### Prerequisites

- Node.js (v20.0.0 or higher)
- npm (v10.0.0 or higher)

### Installation & Local Run

#### Clone the repository

```bash
git clone https://github.com/oluwatobiss/micro-learning.git
cd micro-learning
```

#### Install dependencies

```bash
npm install
```

#### Run automated tests

```bash
npm test
```

#### Run TypeScript typecheck

```bash
npm run typecheck
```

#### Start local development server

```bash
npm run dev

# Open **[http://localhost:5173](http://localhost:5173)** in your browser.
```

### Production Build

```bash
npm run build
```

---

## Verification & Test Suite

The project includes 26 automated unit and integration tests across three test suites:

- ests/reader.test.mjs: Reader player navigation, checkpoint mechanics, theme switches, state persistence, completion recap.
- ests/generation.test.mjs: Input validation, 5-stage extraction pipeline, adaptive planning, grounded checks, deterministic quality audit.
- ests/card-deck-editor.test.mjs: Card CRUD, reordering, card locking, read-time recalculation, draft isolation, JSON export.

Run all tests:

```bash
npm test
```

---

## Architectural Tour & Documentation

For a complete deep dive into the application architecture, data contracts, and code tour:

- **Interactive App Map:** Open devpost/app-map.html in any browser for a responsive architecture guide, component catalog, and data flow map.
- **Build Checklist & History:** Inspect devpost/checklist.md for the complete slice-by-slice verification log, learner reflection, and sign-off record.
- **PRD & Technical Spec:** See devpost/prd.md and devpost/spec.md.
- **Hackathon Submission Package:** See devpost/submission.md.

---

## License & Attribution

Built for the **Build With AI: Basics Hackathon** using the **Devpost Learn Skill Pack**.
