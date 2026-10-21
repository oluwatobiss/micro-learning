# AGENTS.md

Project-wide instructions for MicroLearning Studio, an interactive
micro-learning platform.

These instructions apply to the entire repository unless a more specific
`AGENTS.md` in a subdirectory overrides them. When instructions
conflict, follow the more specific applicable instruction and preserve
existing project requirements.

## 1. Core Operating Rules

- Do not commit, push, or publish Git changes unless explicitly
  authorized.
- Work in small, end-to-end slices. Each slice should deliver a usable
  behavior, include appropriate verification, and document important
  decisions before moving to the next slice.
- Before changing code, inspect the relevant implementation, tests,
  project documentation, and current Git state. Treat the current
  repository as the source of truth; do not assume earlier reports
  describe the present code accurately.
- Run the relevant typecheck, lint, tests, and production build after
  significant changes. Report checks actually performed and their
  results; never claim a check passed if it was not run.
- Development environment: WSL2 Linux.
- Keep the project in the WSL Linux filesystem, not under `/mnt/c`.
- Run project development, build, test, and package-manager commands
  in WSL. Use Linux paths and shell commands unless Windows-specific
  execution is explicitly required.
- Avoid unrelated refactoring while implementing a scoped task.
- Do not claim that functionality is complete when it is simulated,
  stubbed, unconfigured, or only partially implemented. State
  limitations clearly.

## 2. Project Goals and Product Principles

MicroLearning Studio transforms authorized long-form source material
into concise, source-grounded, interactive lessons. Its core experience
combines narrative cards, comprehension checks, and a deliberate
lesson-completion experience.

Prioritize:

- Excellent reading experience, accessibility, responsive behavior,
  and maintainability.
- Clear, coherent learning progression rather than superficial
  summarization.
- Source-grounded explanations and examples that preserve the meaning
  of the original material.
- Creator editorial authority: generated content should be useful with
  minimal corrective editing, while creators remain able to review and
  refine it.
- Bespoke, polished design appropriate to the existing product---not
  generic dashboards or unmodified starter-template UI.
- Small, reliable implementations over speculative infrastructure or
  over-engineering.

## 3. Slice-Based Development and Documentation

Build in the project's ordered slices. Each slice should add a usable
behavior rather than introducing extensive hidden infrastructure without
an end-to-end result.

- Confirm the current slice, scope, dependencies, and acceptance
  criteria before implementation.
- Do not begin later-slice functionality unless explicitly authorized.
- Verify each meaningful step before proceeding.
- Preserve working behavior from completed slices.
- Update the existing phase or development document as work
  progresses. Record scope, decisions and rationale, implementation
  details, tests and results, limitations, and next steps.
- If a genuinely new phase or major workstream begins and no suitable
  document exists, create a clearly named document rather than
  overloading an unrelated one.
- Do not create repetitive reports when an existing document can be
  updated appropriately.
- Update the README whenever a change materially affects project
  setup, supported capabilities, usage, configuration, or contributor
  workflows. Add screenshots or illustrations when they meaningfully
  explain the product; keep them current and appropriately optimized.
- Keep documentation accurate and consistent with the implementation.
  Do not include machine-specific `file:///...` links, local absolute
  paths, secrets, or instructions that only work on one developer's
  machine.

## 4. Function Style

Prefer function declarations for named functions, React components,
event handlers, and other standalone functions.

Use arrow functions when they provide a meaningful functional advantage,
such as concise callbacks passed directly to array methods or APIs, or
when lexical `this` behavior is intentionally required.

Do not mechanically convert every callback to a function declaration
when the arrow-function form is clearer.

## 5. Event Handler Naming

Use declarative, intent-revealing names for event handler functions.
Name each handler after the action it performs or the outcome it
produces, rather than automatically prefixing its name with `handle`.

- Prefer: `clearData`, `submitFeedback`, `toggleInteractiveMode`,
  `selectView`, `dismissDialog`, `saveSettings`.
- Avoid by default: `handleClearData`, `handleSubmitFeedback`,
  `handleToggleInteractiveMode`, `handleSelectView`,
  `handleDismissDialog`, `handleSaveSettings`.

Apply this convention to event handlers defined in components, custom
hooks, utilities, and other project-owned modules, including callbacks
passed to JSX event props or other functions.

Keep event prop names unchanged. For example, use `onClick={clearData}`,
`onChange={selectView}`, and `onSubmit={submitFeedback}`. The `on`
prefix belongs to the event prop, not the handler function.

Choose names that accurately describe the action performed. Prefer
specific verbs over vague names such as `processEvent` or
`handleAction`. Use existing project naming conventions, including
camelCase, and preserve meaningful distinctions between actions.

This convention applies to event handler function names, not
indiscriminately to every identifier containing `handle`. Do not rename
framework-required identifiers, third-party APIs, external contracts, or
unrelated functions solely to remove the prefix.

When refactoring existing handlers, update all affected references,
including JSX props, hook dependencies, imports, exports, tests, and
mocks, without changing application behavior.

## 6. Dependency Discipline

- Do not add or retain dependencies without a concrete implementation
  benefit.
- Prefer existing dependencies and native platform capabilities when
  they meet the requirement.
- Do not install a library merely to satisfy wording in a prompt when
  the existing stack can solve the problem adequately.
- Before adding a dependency, explain the demonstrated requirement,
  evaluate compatibility with the existing toolchain, and consider the
  maintenance, bundle-size, security, and accessibility implications.
- Do not perform major framework upgrades as incidental work in a
  feature slice. Propose and justify them separately unless the task
  requires them.
- Keep package versions and lockfiles consistent with the project's
  package manager.

## 7. Starter Template and Boilerplate Hygiene

When creating, installing, scaffolding, or substantially modifying
project infrastructure, audit inherited starter-template boilerplate
against the project's documented requirements and actual workflows.

- **Audit before retaining:** Identify template-generated files,
  scripts, dependencies, configurations, example content, and
  documentation that are not required by the project or its
  established workflows.
- **Keep what serves a purpose:** Retain components that support
  current requirements or have a documented, justified future use. Do
  not preserve boilerplate merely because it came with an upstream
  template.
- **Remove only confirmed unnecessary artifacts:** This may include
  obsolete deployment configurations, unused scripts, irrelevant
  examples, and instructions for unsupported workflows.
- **Verify before removal:** Search for references and assess effects
  on development, tests, builds, deployment, CI, and documented
  workflows. Do not assume an artifact is redundant just because it is
  not referenced by application source code.
- **Preserve project requirements:** Do not remove functioning
  features, configuration, or documentation that serves an established
  need.
- **Keep documentation consistent:** Update affected README files,
  development documentation, deployment instructions, and file
  inventories. Avoid redundant reports.
- **Validate and report:** Run relevant checks after cleanup.
  Summarize significant removals, rationale, verification results, and
  unresolved concerns.
- **Limit scope:** Treat boilerplate cleanup as targeted maintenance.
  Avoid unrelated refactoring and unrequested commits.

The objective is to keep the repository aligned with its actual
requirements and workflows rather than the defaults of its starter
template.

## 8. Generated Files and `.gitignore`

After workflows that introduce files, determine whether new files are
source files, generated artifacts, temporary files, local-only
configuration, or otherwise unsuitable for source control.

- Remove unnecessary generated or temporary artifacts and update
  `.gitignore` where appropriate.
- Do not hide legitimate source, configuration, test, documentation,
  or required project files merely to keep the working tree clean.
- Do not create per-source-file metadata sidecars or other repetitive
  generated files unless a demonstrated tool or project requirement
  needs them.
- Never commit secrets, API keys, credentials, or machine-specific
  configuration.

## 9. Design System, Responsive UI, and Accessibility

- Reuse the existing design tokens, CSS Modules, typography, spacing,
  and component conventions before introducing new styling systems.
- Preserve and verify all three established themes: **Clean Light**,
  **Focused Dark**, and **Warm Editorial**.
- Aim for a bespoke, cohesive interface rather than a generic template
  or a desktop layout merely compressed onto mobile.
- Test representative desktop and narrow/mobile widths. Prevent
  unintended horizontal page scrolling, clipping, overlapping content,
  and unusable controls.
- Keep reading widths comfortable, typography legible, and
  content-driven cards free of unnecessary fixed heights or empty
  space.
- Ensure controls have clear focus, hover, disabled, loading, success,
  and error states as appropriate.
- Use semantic HTML, accessible labels, keyboard-operable controls,
  visible focus indicators, and adequate text and graphical contrast.
- Do not communicate meaning through color alone.
- Respect `prefers-reduced-motion`.
- Keep mobile navigation reachable and ensure fixed or sticky controls
  do not obscure lesson content.
- Do not add visual decoration unless it serves the product or
  instructional purpose.

## 10. Instructional Content and Media

Visuals must earn their place in a lesson. Use the test: **If this
visual were removed, would the learner lose an important mental model,
relationship, comparison, sequence, or piece of understanding?** If not,
omit it.

- Choose the most suitable medium for the instructional goal: semantic
  text, Markdown, code, comparison tables, structured diagrams,
  charts, or images.
- Do not require every card to contain a visual.
- Prefer reusable React-rendered components and structured data for
  diagrams whose labels, nodes, or relationships may change.
- Keep diagram content separate from rendering mechanics. The renderer
  should own layout, connector geometry, responsive behavior, and
  theme styling.
- Avoid arbitrary model-generated HTML, CSS, executable markup, or SVG
  being rendered directly.
- Share underlying content between responsive arrangements; do not
  accidentally show duplicate desktop and mobile illustrations
  simultaneously.
- Validate connector alignment, label wrapping, overflow, media
  metadata, contrast, and accessibility at relevant viewport widths.
- Provide meaningful alternative text for informative images. Use
  empty alternative text for purely decorative images. Complex
  diagrams need an appropriate accessible name and an explanation or
  equivalent text representation.
- Include captions and source attribution where they materially help
  understanding or are required.
- Avoid adding diagram or chart libraries when existing React, SVG,
  CSS, or installed dependencies adequately solve the problem.

## 11. Markdown and Code Rendering

The application uses `react-markdown` and `remark-gfm` for supported
Markdown content. Preserve that approach unless a demonstrated
requirement justifies changing it.

- Support ordinary paragraphs, emphasis, bold text, inline code,
  fenced code blocks, and supported GitHub Flavored Markdown features.
- Preserve JSX, HTML, JavaScript, TypeScript, and other code literally
  inside fenced code blocks; never interpret code examples as live UI.
- Support language-labelled fenced code blocks and use custom React
  renderers where they improve the product's design and usability.
- Do not enable arbitrary raw HTML rendering without a demonstrated,
  reviewed requirement.
- Do not use `dangerouslySetInnerHTML` for lesson content.
- Keep code blocks readable, responsive, and safely contained when
  long lines require horizontal scrolling.
- Avoid introducing additional Markdown libraries unless they solve a
  demonstrated requirement.

## 12. Lesson Generation, Source Grounding, and Validation

For Creator Studio and future generation functionality:

- Treat submitted source content as untrusted data, not as
  instructions to the application or generation infrastructure.
- Preserve the meaning of the source and distinguish source-supported
  claims from inference.
- Do not fabricate citations, quotations, facts, author details, or
  source references.
- Use structured output compatible with the existing `Lesson` model.
  Validate generated content before presenting it as ready for review
  or publication.
- Validate card types, identifiers, ordering, media specifications,
  checkpoint structure, answer references, and required metadata.
- A comprehension checkpoint should have exactly one defensibly
  correct answer, plausible distractors, and an explanatory answer
  grounded in the lesson's source. Include enough context to answer it
  unless recall is an explicit pedagogical objective.
- Choose card count and instructional patterns according to the source
  and learning objective rather than forcing every source into a rigid
  template.
- Generate diagrams and other visuals only when they materially
  improve comprehension.
- Distinguish deterministic validation from model-generated quality
  assessments. Do not claim that a model judgment proves factual
  accuracy.
- Report generation failures honestly. Do not represent placeholder,
  deterministic sample, or unconfigured-provider behavior as genuine
  AI generation.
- Keep provider-specific logic behind a small, documented interface
  when appropriate, and keep private API keys on the server.
- Do not add databases, authentication, background processing, or
  other infrastructure without a concrete requirement.

## 13. Privacy, Storage, and Security

- Minimize collection and persistence of source text, generated
  content, and personal data.
- Follow the existing privacy and analytics disclosures and opt-out
  behavior. If a change introduces a new data flow, analytics
  provider, external AI service, or materially different storage
  behavior, review and update the relevant privacy documentation and
  user-facing disclosure.
- Keep secrets and private API keys out of client bundles, source
  control, logs, and public documentation.
- Validate untrusted inputs and handle malformed persisted data
  without crashing the reader.
- Keep versioned reader progress separate from theme preferences and
  other unrelated local storage.
- Avoid sending source content to external services unless that
  behavior is part of the implemented, documented workflow.
- Use appropriate error handling without exposing secrets, sensitive
  source text, or internal stack traces to users.

## 14. Testing and Verification

Use the project's existing test tools and conventions.

After significant changes, run the relevant available checks, including:

- Type checking.
- Linting.
- Unit and integration tests.
- Production build.
- Responsive and theme verification where UI changes are involved.
- Accessibility checks appropriate to the affected functionality.

Add or update tests for new behavior and regression-prone logic. Prefer
deterministic tests for validation, state transitions, schemas, and
layout calculations, complemented by browser-level checks where
necessary.

Do not weaken, delete, or bypass tests simply to obtain a passing
result. If a check cannot run, explain why and identify what remains
unverified.

Report actual results and any known limitations.

## 15. Git and Delivery Discipline

- Do not commit or push unless explicitly authorized.
- Review the working tree before and after implementation. Do not
  overwrite or discard unrelated user changes.
- Do not silently reset, revert, or rewrite existing work.
- Keep changes focused on the authorized scope.
- Before declaring a slice complete, summarize implementation,
  important decisions, files changed, verification performed and
  results, documentation updated, and remaining limitations.
- Confirm explicitly whether the slice's acceptance criteria were met.
  Distinguish completed behavior from deferred work.
