---
doc: prd
status: approved
---

# MicroLearning Studio — Product Requirements

A creator-first web application that turns long-form educational content into polished, source-grounded, interactive micro-learning lessons for authors, educators, and subject-matter experts.
Source: `scope.md > The Unique Kernel` and `scope.md > Who It's For`.

## The Core Journey

1. **Discovery (Reader Landing):** The user arrives at the responsive Reader Experience by default, immediately seeing featured/sample micro-learning lessons with an option to explore right away, or navigate via the top header to the Creator Studio.
2. **Entering the Creator Studio:** The creator opens the Creator Studio and supplies the source material: Title, Author Attribution, Source URL/Reference, checks the mandatory Authorization Acknowledgement, and pastes the long-form text (or clicks "Load Sample Article" for instant testing).
3. **Adaptive Generation:** The creator clicks "Generate Lesson". The system runs validation and displays a multi-stage generation progress indicator (`Understanding source` -> `Planning lesson` -> `Creating cards` -> `Creating checks` -> `Checking quality` -> `Ready for review`).
4. **Studio Editorial Polish:** The generated lesson opens in the visual Creator Studio editor. The creator reviews the adaptive card deck (e.g. 4–8 cards depending on source density), edits card text, reorders or adds cards, locks finalized cards, tweaks the grounded comprehension question and explanation, and checks desktop/mobile previews.
5. **Publish & Play:** The creator clicks "Publish / View as Reader". The app transitions to the standalone Reader Player.
6. **Active Learning:** The reader advances through the narrative cards one at a time using visible controls (Next, Previous, Progress bar), encounters a comprehension checkpoint, selects an answer, and receives instant feedback with a grounded explanation.
7. **Completion & Attribution:** Upon finishing the final card, the reader views a completion summary celebrating the key takeaway, with a direct link to the original long-form source.

## Screens and Layout

The application consists of two coordinated surfaces accessible via a clean, persistent top navigation bar:

1. **Reader Surface (Default Landing):**
   - **Header:** Brand mark, Theme Selector (Clean Light, Focused Dark, Warm Editorial), and "Creator Studio" button.
   - **Lesson Catalog / Hero:** Showcase of available lessons with topic tags, estimated read time (e.g., "4 min read"), and source attribution.
   - **Interactive Card Player:** Centered, distraction-free card container.
     - Top bar: Lesson title, progress bar / card counter (e.g. `Card 3 of 6`), source badge.
     - Card body: Headline, narrative body, optional conceptual visual/diagram with accessible alt text.
     - Bottom bar: Visible `Previous`, `Next`, and `Original Source` buttons. Keyboard arrow navigation supported.
     - Checkpoint Card: Single-question multiple choice with clear options, immediate correct/incorrect reveal, and educational explanation text before allowing the reader to continue.
     - Completion Screen: Key lesson recap, completion indicator, and link to read the full original source.

2. **Creator Studio Surface:**
   - **Input View:**
     - Fields: Source Title, Author / Attribution, Original Source URL / Citation.
     - Authorization checkbox: _"I own or have authorized permission to adapt this content."_
     - Body: Textarea for pasting long-form source, character/word count indicator, and a prominent "Load Sample Article" button for fast evaluation.
     - Action: "Generate Lesson" button (disabled if validation criteria are unmet).
   - **Generation Progress Modal/Overlay:**
     - Live stage indicators: `Understanding source` -> `Planning lesson` -> `Creating cards` -> `Creating checks` -> `Checking quality` -> `Ready for review`.
   - **Studio Editor View:**
     - Left / Top Panel: Lesson metadata editor (Title, Source link) and action bar (`Preview Desktop`, `Preview Mobile`, `Publish`).
     - Center Deck Editor: Scrollable or paginated list of cards. Each card card contains:
       - Card type selector (Narrative, Example, Comparison, Checkpoint).
       - Card headline and body text editor.
       - Lock toggle (protects card wording from regeneration).
       - Actions: Reorder up/down, Duplicate, Delete, Regenerate Card.
     - Checkpoint Editor (for Quiz cards): Question prompt, options (with correct answer selector), and grounded explanation field.

## Look and Feel

- **Themes:** Three bespoke visual modes switchable via a header toggle:
  1. **Clean Light:** Crisp white/neutral background (#f8fafc), dark slate typography (#0f172a), subtle cool-gray borders, vibrant cobalt accents.
  2. **Focused Dark:** Deep navy/charcoal background (#0b0f19), elevated card surfaces (#111827), high-contrast crisp text (#f8fafc), glowing cyan accents (#38bdf8).
  3. **Warm Editorial / Paper:** Soft cream/linen background (#fdfbf7), warm sepia ink typography (#2c2523), warm-stone card borders (#e7e2d9), burnt amber/terracotta accents.
- **Typography:** High-readability editorial typography:
  - Clean humanist sans-serif for UI and controls.
  - Elegant serif or editorial sans for card headlines and body to convey credibility and focus.
- **Interaction & Motion:** Smooth, intentional micro-transitions (subtle card slide/fade when advancing, pleasant reveal of quiz feedback). No dizzying animations or infinite scrolling.

## Features and Behavior

### 1. Reader Experience & Showcase

- Readers can browse and launch available lessons without an account or login.
  - [ ] Clicking a lesson launches the Interactive Card Player starting at Card 1.
  - [ ] Top progress bar accurately reflects current card position (e.g. 1/6).
  - [ ] Next button is enabled on reading cards; clicking it smoothly transitions to the next card.
  - [ ] Previous button navigates to the prior card; disabled on Card 1.
  - [ ] Source attribution link opens the creator's original publication in a new tab.

### 2. Source Input & Validation

- Creator provides source content with validation guardrails.
  - [ ] "Load Sample Article" automatically populates valid title, author, source link, and a rich sample article.
  - [ ] Input validation checks for minimum length (at least 200 words) and non-empty metadata.
  - [ ] Authorization checkbox must be checked to enable the "Generate Lesson" button.
  - [ ] Inline warning displayed if source text is too short or malformed.

### 3. Adaptive Generation Pipeline

- Multi-step extraction adaptively maps source structure into a coherent narrative.
  - [ ] Visual progress indicator highlights stages in sequence (`Understanding source`, `Planning lesson`, `Creating cards`, `Creating checks`, `Ready`).
  - [ ] Generates an adaptive number of narrative cards (4 to 8 cards depending on source length and density).
  - [ ] Generates at least one grounded comprehension checkpoint placed at a natural retention milestone.
  - [ ] Every checkpoint includes verified answer options and an educational explanation.

### 4. Creator Studio Editor & Polish

- Full editorial control over all generated content before publishing.
  - [ ] All card titles, body text, and question fields are directly editable.
  - [ ] Cards can be reordered up and down.
  - [ ] Individual cards can be deleted, duplicated, or added fresh.
  - [ ] Individual cards can be locked to prevent accidental overwriting.
  - [ ] "Publish / View as Reader" saves the edited lesson and opens it in the Reader Player.

### 5. Checkpoint & Feedback Mechanics

- Interactive learning verification embedded in the flow.
  - [ ] Comprehension check card requires the reader to select an answer before continuing.
  - [ ] Selecting an option immediately displays visual feedback (correct green / incorrect amber) and shows the grounded explanation.
  - [ ] "Continue" button unlocks upon answering.

## States and Boundaries

- **First Use (Reader):** Shows featured sample lessons ready to play immediately.
- **First Use (Creator):** Clean input form with empty state guidance and a prominent "Load Sample Article" quick-start button.
- **Generating State:** Animated multi-stage progress indicator with status messaging.
- **Validation Error State:** Clear inline helper text when text is under length limit or required fields are blank.
- **Saved / Published State:** Published lessons persist in local storage during the session so the reader can access both sample and custom-created lessons.
- **Responsive Boundary:** Fully optimized for mobile viewports (thumb-friendly Next/Prev buttons, readable typography) and desktop viewports.

## Product Decisions

- **Reader Landing First:** Placing the Reader Experience on the home screen proves the core value immediately to any visitor before asking them to create anything.
- **Pasting + Strict Validation over Web Scraping:** Scraping third-party URLs causes brittle failures with paywalls and anti-bot protections; direct paste with required metadata and authorization acknowledgement provides reliable, lawful creator onboarding.
- **Adaptive Card Count:** Avoids rigid cookie-cutter lessons; the number of cards and checkpoint placement reflect the source's natural density.
- **Three First-Class Themes:** Clean Light, Focused Dark, and Warm Editorial provide a bespoke reading experience tailored to different environments and reader preferences.

## What We're Building

- Complete Reader Surface with lesson showcase and distraction-free card player.
- Creator Studio with input validation, sample loader, and generation progress view.
- Complete visual card editor (text editing, reordering, card locking, quiz editing).
- Comprehension checkpoint card with instant feedback and source-grounded explanation.
- Lesson completion recap screen with original source attribution.
- Three selectable themes (Light, Dark, Warm Editorial).

## Deferred From the POC

- Multi-tenant user login and cloud database sync.
- Public URL hosting and DNS routing.
- Advanced learning analytics dashboard (drop-off heatmaps, accuracy analytics).
- Social media carousel image exports (PNG/PDF).

## Non-Goals

- Generic AI text summarizers or bulleted list generators.
- Disconnected flashcard drills without narrative continuity.
- Algorithmic feeds, endless scrolling, or gamified streaks.

## Open Questions

- None blocking spec: Technical architecture, state management, and generation orchestration will be finalized in `4-spec`.
