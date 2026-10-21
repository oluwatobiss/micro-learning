import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, type MetaFunction } from "react-router";
import type { Lesson } from "../types/lesson";
import type { Slice4HandoffPayload } from "../types/generator";
import { storageService } from "../services/storage";
import { draftService } from "../services/draft";
import { CardDeckEditor } from "../components/editor/CardDeckEditor";

export const meta: MetaFunction = () => {
  return [
    { title: "Card Deck Editor — MicroLearning Studio" },
    {
      name: "description",
      content:
        "Review and refine lesson card decks, manage cards, edit checkpoints, and preview reader experience.",
    },
  ];
};

export default function EditorRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payload, setPayload] = useState<Slice4HandoffPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // First check storageService
    const storedLesson = storageService.getLessonById(id);
    if (storedLesson) {
      setPayload({
        lesson: storedLesson,
        provider: "manual-authoring",
      });
      setLoading(false);
      return;
    }

    // Then check if draft exists in localStorage
    const draft = draftService.getDraft(id);
    if (draft) {
      setPayload({
        lesson: draft,
        provider: "manual-authoring",
      });
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 1rem",
          color: "var(--text-muted)",
        }}
      >
        Loading Card Deck Editor...
      </div>
    );
  }

  if (!payload) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 1rem",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>
          Lesson Not Found
        </h2>
        <p
          style={{
            marginBottom: "1.5rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          The lesson you are attempting to edit does not exist in local storage
          or draft memory.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link
            to="/studio"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "#ffffff",
              padding: "0.65rem 1.25rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create Lesson in Studio →
          </Link>
          <Link
            to="/"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              padding: "0.65rem 1.25rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Browse Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CardDeckEditor
      initialPayload={payload}
      onPublish={(publishedLesson) => {
        navigate(`/lessons/${publishedLesson.id}`);
      }}
      onBack={() => {
        navigate("/studio");
      }}
    />
  );
}
