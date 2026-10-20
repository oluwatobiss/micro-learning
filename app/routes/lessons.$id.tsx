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
    <ReaderPlayer
      lesson={lesson}
      onFinish={() => {
        // Can navigate back or show complete
        navigate("/");
      }}
    />
  );
}
