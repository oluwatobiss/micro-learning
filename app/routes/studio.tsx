import React, { useState } from "react";
import { useNavigate, type MetaFunction } from "react-router";
import type {
  SourceInputData,
  GenerationProgressState,
  GenerationResult,
} from "../types/generator";
import { generateLesson } from "../services/generator";
import { SourceInputForm } from "../components/studio/SourceInputForm";
import { GenerationProgressOverlay } from "../components/studio/GenerationProgressOverlay";
import { GenerationResultReview } from "../components/studio/GenerationResultReview";
import { CardDeckEditor } from "../components/editor/CardDeckEditor";
import styles from "./studio.module.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Creator Studio — MicroLearning Studio" },
    {
      name: "description",
      content:
        "Transform long-form engineering articles and technical guides into interactive micro-learning card decks using our 5-stage adaptive generation engine.",
    },
  ];
};

type StudioViewMode = "input" | "generating" | "review" | "editor";

const INITIAL_PROGRESS: GenerationProgressState = {
  stages: {
    understanding: {
      id: "understanding",
      label: "Stage 1 — Understanding Source",
      description:
        "Extracting thesis, terminology, code patterns, and relationships from source.",
      status: "pending",
    },
    planning: {
      id: "planning",
      label: "Stage 2 — Planning Lesson",
      description: "Formulating adaptive 4–8 card pedagogical progression.",
      status: "pending",
    },
    cards: {
      id: "cards",
      label: "Stage 3 — Creating Cards",
      description:
        "Drafting grounded narrative cards, code blocks, and structured diagrams.",
      status: "pending",
    },
    checks: {
      id: "checks",
      label: "Stage 4 — Creating Checks",
      description:
        "Formulating grounded comprehension checkpoints with distractors and explanations.",
      status: "pending",
    },
    quality: {
      id: "quality",
      label: "Stage 5 — Checking Quality",
      description:
        "Verifying schema integrity, media specifications, and pedagogical balance.",
      status: "pending",
    },
    ready: {
      id: "ready",
      label: "Lesson Ready",
      description: "Generation and quality verification complete.",
      status: "pending",
    },
  },
  currentStageId: null,
  overallStatus: "idle",
};

export default function StudioRoute() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<StudioViewMode>("input");
  const [lastInput, setLastInput] = useState<SourceInputData | null>(null);
  const [progress, setProgress] =
    useState<GenerationProgressState>(INITIAL_PROGRESS);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [formResetCounter, setFormResetCounter] = useState(0);

  const handleStartGeneration = async (input: SourceInputData) => {
    setLastInput(input);
    setViewMode("generating");
    setProgress(INITIAL_PROGRESS);

    try {
      const generated = await generateLesson(input, (updatedProgress) => {
        setProgress({ ...updatedProgress });
      });

      setResult(generated);
      setViewMode("review");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during generation.";
      setProgress((prev) => ({
        ...prev,
        overallStatus: "failed",
        errorMessage: message,
      }));
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      handleStartGeneration(lastInput);
    }
  };

  const handleCancel = () => {
    setViewMode("input");
  };

  const handleCreateAnother = () => {
    // Reset all transient state from the previous generation
    setResult(null);
    setLastInput(null);
    setProgress(INITIAL_PROGRESS);
    setViewMode("input");
    setFormResetCounter((c) => c + 1);

    // Scroll back to top smoothly and focus the lesson title input
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        const titleInput = document.getElementById("lesson-title-input");
        titleInput?.focus();
      }, 60);
    }
  };

  return (
    <div className={styles.studioPage}>
      {viewMode === "input" && (
        <SourceInputForm
          key={formResetCounter}
          initialData={lastInput || undefined}
          onSubmit={handleStartGeneration}
        />
      )}

      {viewMode === "generating" && (
        <GenerationProgressOverlay
          progress={progress}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      )}

      {viewMode === "review" && result && (
        <GenerationResultReview
          result={result}
          onCreateAnother={handleCreateAnother}
          onOpenEditor={() => setViewMode("editor")}
        />
      )}

      {viewMode === "editor" && result && (
        <CardDeckEditor
          initialPayload={result}
          onBack={() => setViewMode("review")}
          onPublish={(published) => navigate(`/lessons/${published.id}`)}
        />
      )}
    </div>
  );
}
