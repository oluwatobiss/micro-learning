import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import type { Lesson } from "../types/lesson";
import { storageService } from "../services/storage";
import { ReaderPlayer } from "../components/ReaderPlayer";

export default function LessonPlayerRoute() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const found = storageService.getLessonById(id);
      setLesson(found || null);
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
        Loading lesson...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>
          Lesson Not Found
        </h2>
        <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
          The requested micro-learning lesson does not exist or has been
          removed.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            backgroundColor: "var(--accent-primary)",
            color: "var(--text-inverted)",
            padding: "0.65rem 1.25rem",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
          }}
        >
          Return to Lesson Showcase
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0.75rem 1rem 0 1rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Link
          to={`/editor/${lesson.id}`}
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-surface)",
            transition: "all var(--transition-fast)",
          }}
          title="Customize this lesson in Card Deck Editor"
          id="reader-edit-deck-link"
        >
          <span>✏️ Edit Deck</span>
        </Link>
      </div>
      <ReaderPlayer lesson={lesson} />
    </div>
  );
}
