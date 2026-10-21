import React from "react";
import type { InstructionalMediaSpec, ProcessFlowSpec } from "../types/media";
import { REACT_RENDER_LOOP_SPEC } from "../types/media";
import styles from "./InstructionalDiagram.module.css";

export { REACT_RENDER_LOOP_SPEC };

interface InstructionalDiagramProps {
  diagramId?: string;
  mediaSpec?: InstructionalMediaSpec;
}

export const InstructionalDiagram: React.FC<InstructionalDiagramProps> = ({
  diagramId,
  mediaSpec,
}) => {
  // Resolve media specification from props or registered presets
  const spec: ProcessFlowSpec | null =
    (mediaSpec as ProcessFlowSpec) ||
    (diagramId === "react-render-loop" ? REACT_RENDER_LOOP_SPEC : null);

  if (!spec || spec.type !== "process-flow") {
    return null;
  }

  return (
    <figure
      className={styles.diagramWrapper}
      role="group"
      aria-label={spec.title || "Instructional Diagram"}
    >
      {/* Screen reader accessible summary */}
      {spec.accessibleDescription && (
        <figcaption className={styles.srOnly}>
          {spec.accessibleDescription}
        </figcaption>
      )}

      {/* Visual Title */}
      {spec.title && (
        <div className={styles.diagramTitle} aria-hidden="true">
          <span>🔄</span> {spec.title}
        </div>
      )}

      {/* Single Responsive Flow: Row on Desktop, Column on Mobile */}
      <ol className={styles.flowList}>
        {spec.steps.map((step, idx) => {
          const isLast = idx === spec.steps.length - 1;
          const variantClass =
            styles[`node_${step.variant || "default"}`] || "";

          return (
            <li key={step.id} className={styles.stepItem}>
              <div className={`${styles.stepNode} ${variantClass}`}>
                <span className={styles.stepTitle}>{step.label}</span>
                <span className={styles.stepDesc}>{step.description}</span>
              </div>

              {!isLast && (
                <div className={styles.connector} aria-hidden="true">
                  <svg
                    className={styles.arrowSvg}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <polyline points="14 6 20 12 14 18" />
                  </svg>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </figure>
  );
};
