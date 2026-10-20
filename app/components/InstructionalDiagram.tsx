import React from "react";

interface InstructionalDiagramProps {
  diagramId?: string;
}

export const InstructionalDiagram: React.FC<InstructionalDiagramProps> = ({
  diagramId,
}) => {
  if (diagramId === "react-render-loop") {
    return (
      <svg
        viewBox="0 0 700 160"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-labelledby="diagram-title diagram-desc"
      >
        <title id="diagram-title">The React State & Render Loop</title>
        <desc id="diagram-desc">
          Four-step cycle: 1. User Action triggers event handler. 2. setState
          schedules re-render. 3. React executes function creating new Snapshot.
          4. React reconciles and updates DOM.
        </desc>
        <defs>
          <marker
            id="diag-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--accent-primary)" />
          </marker>
        </defs>

        {/* Step 1 */}
        <rect
          x="10"
          y="35"
          width="145"
          height="85"
          rx="8"
          fill="var(--bg-surface-elevated)"
          stroke="var(--border-color)"
          strokeWidth="1.5"
        />
        <text
          x="82"
          y="68"
          fill="var(--text-primary)"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          1. User Action
        </text>
        <text
          x="82"
          y="88"
          fill="var(--text-secondary)"
          fontSize="10.5"
          textAnchor="middle"
        >
          Click or Input Event
        </text>

        <path
          d="M 155 77 L 185 77"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          markerEnd="url(#diag-arrow)"
        />

        {/* Step 2 */}
        <rect
          x="190"
          y="35"
          width="150"
          height="85"
          rx="8"
          fill="var(--bg-surface-elevated)"
          stroke="var(--accent-border)"
          strokeWidth="1.5"
        />
        <text
          x="265"
          y="68"
          fill="var(--accent-primary)"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          2. setState Called
        </text>
        <text
          x="265"
          y="88"
          fill="var(--text-secondary)"
          fontSize="10.5"
          textAnchor="middle"
        >
          Schedules Re-render
        </text>

        <path
          d="M 340 77 L 370 77"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          markerEnd="url(#diag-arrow)"
        />

        {/* Step 3 */}
        <rect
          x="375"
          y="35"
          width="150"
          height="85"
          rx="8"
          fill="var(--bg-surface-elevated)"
          stroke="var(--border-color)"
          strokeWidth="1.5"
        />
        <text
          x="450"
          y="68"
          fill="var(--text-primary)"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          3. New Snapshot
        </text>
        <text
          x="450"
          y="88"
          fill="var(--text-secondary)"
          fontSize="10.5"
          textAnchor="middle"
        >
          Evaluates Function
        </text>

        <path
          d="M 525 77 L 555 77"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          markerEnd="url(#diag-arrow)"
        />

        {/* Step 4 */}
        <rect
          x="560"
          y="35"
          width="130"
          height="85"
          rx="8"
          fill="var(--bg-surface-elevated)"
          stroke="var(--feedback-success)"
          strokeWidth="1.5"
        />
        <text
          x="625"
          y="68"
          fill="var(--feedback-success)"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          4. DOM Updated
        </text>
        <text
          x="625"
          y="88"
          fill="var(--text-secondary)"
          fontSize="10.5"
          textAnchor="middle"
        >
          Reconciles Diff
        </text>
      </svg>
    );
  }

  return null;
};
