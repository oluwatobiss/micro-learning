import React from 'react';
import styles from './InstructionalDiagram.module.css';

interface InstructionalDiagramProps {
  diagramId?: string;
}

export const InstructionalDiagram: React.FC<InstructionalDiagramProps> = ({ diagramId }) => {
  if (diagramId === 'react-render-loop') {
    return (
      <figure
        className={styles.diagramWrapper}
        role="group"
        aria-labelledby="diagram-title"
      >
        {/* Desktop Presentation: Horizontal 4-Stage Flow */}
        <svg
          className={styles.desktopSvg}
          viewBox="0 0 740 160"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-labelledby="diagram-title-desktop diagram-desc-desktop"
        >
          <title id="diagram-title-desktop">The React State & Render Loop (Desktop Flow)</title>
          <desc id="diagram-desc-desktop">
            A four-step horizontal sequence: 1. User Action triggers an event handler. 2. setState is called, scheduling a re-render. 3. React re-renders, evaluating the component and computing a new snapshot. 4. React commits minimal DOM diffs if the output changed.
          </desc>

          <defs>
            <marker
              id="diag-arrow-desktop"
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
            width="150"
            height="90"
            rx="10"
            fill="var(--bg-surface)"
            stroke="var(--border-subtle)"
            strokeWidth="1.5"
          />
          <text
            x="85"
            y="70"
            fill="var(--text-primary)"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            1. User Action
          </text>
          <text
            x="85"
            y="92"
            fill="var(--text-secondary)"
            fontSize="11"
            fontWeight="500"
            textAnchor="middle"
          >
            Triggers Event Handler
          </text>

          <path
            d="M 160 80 L 195 80"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            markerEnd="url(#diag-arrow-desktop)"
          />

          {/* Step 2 */}
          <rect
            x="200"
            y="35"
            width="165"
            height="90"
            rx="10"
            fill="var(--bg-surface)"
            stroke="var(--accent-primary)"
            strokeWidth="1.5"
          />
          <text
            x="282"
            y="70"
            fill="var(--accent-primary)"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            2. setState Called
          </text>
          <text
            x="282"
            y="92"
            fill="var(--text-secondary)"
            fontSize="11"
            fontWeight="500"
            textAnchor="middle"
          >
            Schedules Re-render
          </text>

          <path
            d="M 365 80 L 400 80"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            markerEnd="url(#diag-arrow-desktop)"
          />

          {/* Step 3 */}
          <rect
            x="405"
            y="35"
            width="165"
            height="90"
            rx="10"
            fill="var(--bg-surface)"
            stroke="var(--border-subtle)"
            strokeWidth="1.5"
          />
          <text
            x="487"
            y="70"
            fill="var(--text-primary)"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            3. React Re-renders
          </text>
          <text
            x="487"
            y="92"
            fill="var(--text-secondary)"
            fontSize="11"
            fontWeight="500"
            textAnchor="middle"
          >
            Calculates Next Snapshot
          </text>

          <path
            d="M 570 80 L 600 80"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            markerEnd="url(#diag-arrow-desktop)"
          />

          {/* Step 4 */}
          <rect
            x="605"
            y="35"
            width="125"
            height="90"
            rx="10"
            fill="var(--bg-surface)"
            stroke="var(--feedback-success)"
            strokeWidth="1.5"
          />
          <text
            x="667"
            y="70"
            fill="var(--feedback-success)"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            4. DOM Sync
          </text>
          <text
            x="667"
            y="92"
            fill="var(--text-secondary)"
            fontSize="11"
            fontWeight="500"
            textAnchor="middle"
          >
            Reconciles Minimal Diff
          </text>
        </svg>

        {/* Mobile Presentation: Vertical Responsive Stack */}
        <svg
          className={styles.mobileSvg}
          viewBox="0 0 340 430"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-labelledby="diagram-title-mobile diagram-desc-mobile"
        >
          <title id="diagram-title-mobile">The React State & Render Loop (Mobile Flow)</title>
          <desc id="diagram-desc-mobile">
            A four-step vertical sequence: 1. User Action triggers event handler. 2. setState Called schedules next snapshot. 3. React Re-renders and calculates snapshot. 4. DOM Sync reconciles minimal diff.
          </desc>

          <defs>
            <marker
              id="diag-arrow-mobile"
              viewBox="0 0 10 10"
              refX="5"
              refY="6"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 1 0 L 5 8 L 9 0 z" fill="var(--accent-primary)" />
            </marker>
          </defs>

          {/* Step 1 Mobile */}
          <rect
            x="10"
            y="10"
            width="320"
            height="75"
            rx="10"
            fill="var(--bg-surface)"
            stroke="var(--border-subtle)"
            strokeWidth="1.5"
          />
          <text
            x="170"
            y="40"
            fill="var(--text-primary)"
            fontSize="14"
            fontWeight="700"
            textAnchor="middle"
          >
            1. User Action
          </text>
          <text
            x="170"
            y="62"
            fill="var(--text-secondary)"
            fontSize="12.5"
            fontWeight="500"
            textAnchor="middle"
          >
            Click, keystroke, or form input triggers handler
          </text>

          {/* Arrow 1 -> 2 */}
          <path
            d="M 170 85 L 170 115"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            markerEnd="url(#diag-arrow-mobile)"
          />

          {/* Step 2 Mobile */}
          <rect
            x="10"
            y="120"
            width="320"
            height="75"
            rx="10"
            fill="var(--bg-surface)"
            stroke="var(--accent-primary)"
            strokeWidth="1.5"
          />
          <text
            x="170"
            y="150"
            fill="var(--accent-primary)"
            fontSize="14"
            fontWeight="700"
            textAnchor="middle"
          >
            2. setState Called
          </text>
          <text
            x="170"
            y="172"
            fill="var(--text-secondary)"
            fontSize="12.5"
            fontWeight="500"
            textAnchor="middle"
          >
            Schedules re-render; does not mutate current closure
          </text>

          {/* Arrow 2 -> 3 */}
          <path
            d="M 170 195 L 170 225"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            markerEnd="url(#diag-arrow-mobile)"
          />

          {/* Step 3 Mobile */}
          <rect
            x="10"
            y="230"
            width="320"
            height="75"
            rx="10"
            fill="var(--bg-surface)"
            stroke="var(--border-subtle)"
            strokeWidth="1.5"
          />
          <text
            x="170"
            y="260"
            fill="var(--text-primary)"
            fontSize="14"
            fontWeight="700"
            textAnchor="middle"
          >
            3. React Re-renders
          </text>
          <text
            x="170"
            y="282"
            fill="var(--text-secondary)"
            fontSize="12.5"
            fontWeight="500"
            textAnchor="middle"
          >
            Calls component function with frozen state snapshot
          </text>

          {/* Arrow 3 -> 4 */}
          <path
            d="M 170 305 L 170 335"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            markerEnd="url(#diag-arrow-mobile)"
          />

          {/* Step 4 Mobile */}
          <rect
            x="10"
            y="340"
            width="320"
            height="75"
            rx="10"
            fill="var(--bg-surface)"
            stroke="var(--feedback-success)"
            strokeWidth="1.5"
          />
          <text
            x="170"
            y="370"
            fill="var(--feedback-success)"
            fontSize="14"
            fontWeight="700"
            textAnchor="middle"
          >
            4. Commit &amp; DOM Sync
          </text>
          <text
            x="170"
            y="392"
            fill="var(--text-secondary)"
            fontSize="12.5"
            fontWeight="500"
            textAnchor="middle"
          >
            Reconciles virtual DOM and applies minimal diffs
          </text>
        </svg>
      </figure>
    );
  }

  return null;
};
