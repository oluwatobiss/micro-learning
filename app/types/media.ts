/**
 * Structured Instructional Media Specifications
 *
 * Separates instructional content generation from visual component rendering.
 * Slice 3 generation engine will produce these validated specifications,
 * while the React renderer determines responsive geometry, connectors,
 * typography, and theme styling.
 */

export type InstructionalMediaType = "process-flow" | "comparison" | "timeline";

export type StepVariant = "default" | "accent" | "success" | "warning";

export interface ProcessFlowStep {
  id: string;
  stepNumber: number;
  label: string;
  description: string;
  variant?: StepVariant;
}

export interface ProcessFlowSpec {
  type: "process-flow";
  id: string;
  title?: string;
  accessibleDescription?: string;
  steps: ProcessFlowStep[];
}

export interface ComparisonCriterion {
  aspect: string;
  leftValue: string;
  rightValue: string;
}

export interface ComparisonSpec {
  type: "comparison";
  id: string;
  title?: string;
  accessibleDescription?: string;
  leftEntity: string;
  rightEntity: string;
  criteria: ComparisonCriterion[];
}

export type InstructionalMediaSpec = ProcessFlowSpec | ComparisonSpec;

/**
 * Validates whether an object conforms to a safe, renderable instructional media specification.
 */
export function validateMediaSpec(spec: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!spec || typeof spec !== "object") {
    return {
      valid: false,
      errors: ["Media specification must be a non-null object."],
    };
  }

  const candidate = spec as Record<string, unknown>;

  if (typeof candidate.type !== "string") {
    errors.push("Media specification must contain a valid string type.");
  }

  if (candidate.type === "process-flow") {
    if (!Array.isArray(candidate.steps) || candidate.steps.length < 2) {
      errors.push("Process flow diagram must contain at least 2 steps.");
    } else {
      candidate.steps.forEach((step: unknown, idx: number) => {
        if (!step || typeof step !== "object") {
          errors.push(`Step at index ${idx} is invalid.`);
          return;
        }
        const s = step as Record<string, unknown>;
        if (typeof s.label !== "string" || s.label.trim().length === 0) {
          errors.push(`Step ${idx + 1} must have a non-empty label.`);
        }
        if (
          typeof s.description !== "string" ||
          s.description.trim().length === 0
        ) {
          errors.push(`Step ${idx + 1} must have a non-empty description.`);
        }
      });
    }
  } else if (candidate.type === "comparison") {
    if (!Array.isArray(candidate.criteria) || candidate.criteria.length < 1) {
      errors.push("Comparison must contain at least 1 criterion.");
    }
  } else {
    errors.push(`Unsupported instructional media type: "${candidate.type}".`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const REACT_RENDER_LOOP_SPEC: ProcessFlowSpec = {
  type: "process-flow",
  id: "react-render-loop",
  title: "The React State-to-DOM Render Loop",
  accessibleDescription:
    "A four-step cycle: 1. User Action triggers an event handler. 2. setState is called, scheduling a re-render without mutating the current closure. 3. React re-renders, calculating a new component snapshot. 4. React commits minimal DOM diffs if the output changed.",
  steps: [
    {
      id: "step-1",
      stepNumber: 1,
      label: "1. User Action",
      description: "Click, keystroke, or form input triggers event handler",
      variant: "default",
    },
    {
      id: "step-2",
      stepNumber: 2,
      label: "2. setState Called",
      description: "Schedules re-render; does not mutate current closure",
      variant: "accent",
    },
    {
      id: "step-3",
      stepNumber: 3,
      label: "3. React Re-renders",
      description: "Calls component function with frozen state snapshot",
      variant: "default",
    },
    {
      id: "step-4",
      stepNumber: 4,
      label: "4. Commit & DOM Sync",
      description: "Reconciles virtual DOM and applies minimal diffs",
      variant: "success",
    },
  ],
};
