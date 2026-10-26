import type { ActionFunctionArgs } from "react-router";
import { generateLessonWithGeminiServer } from "../services/gemini.server.ts";
import { validateSourceInput } from "../utils/text.ts";
import { isBuiltInSampleArticle } from "../services/sampleArticle.ts";
import type { SourceInputData } from "../types/generator.ts";

export async function action({ request }: ActionFunctionArgs) {
  const correlationId =
    "gen-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 6);

  if (request.method !== "POST") {
    return Response.json(
      {
        success: false,
        error: "Method not allowed. Use POST.",
        code: "METHOD_NOT_ALLOWED",
        correlationId,
      },
      { status: 405 },
    );
  }

  let body: SourceInputData;
  try {
    body = await request.json();
  } catch {
    console.error(
      `[Gemini Route] [${correlationId}] Invalid JSON request body.`,
    );
    return Response.json(
      {
        success: false,
        error: "Invalid JSON request body.",
        code: "BAD_REQUEST",
        correlationId,
      },
      { status: 400 },
    );
  }

  const validation = validateSourceInput(body);
  if (!validation.isValid) {
    const errorMsg =
      "Validation failed: " +
      Object.values(validation.errors).filter(Boolean).join("; ");
    console.warn(
      `[Gemini Route] [${correlationId}] Source input validation failed: ${errorMsg}`,
    );
    return Response.json(
      {
        success: false,
        error: errorMsg,
        code: "VALIDATION_ERROR",
        details: validation.errors,
        correlationId,
      },
      { status: 400 },
    );
  }

  console.log(
    `[Gemini Route] [${correlationId}] Received generation request: title="${(body.title || "").slice(0, 40)}", words=${(body.sourceText || "").split(/\s+/).length}`,
  );

  try {
    const result = await generateLessonWithGeminiServer(body, correlationId);
    console.log(
      `[Gemini Route] [${correlationId}] Generation succeeded: cards=${result.lesson.cards.length}, groundingScore=${result.qualityReport.groundingScore}`,
    );
    return Response.json(
      { success: true, result, correlationId },
      { status: 200 },
    );
  } catch (error: any) {
    const status = typeof error?.status === "number" ? error.status : 500;
    const message =
      error?.message ||
      "An unexpected error occurred during AI lesson generation.";
    const code = error?.code || "GENERATION_ERROR";
    const upstreamStatus = error?.upstreamStatus;

    console.error(
      `[Gemini Route Error] [${correlationId}] Failed: status=${status}, code=${code}, upstream=${upstreamStatus || "N/A"} - "${message}"`,
    );

    return Response.json(
      {
        success: false,
        error: message,
        code,
        correlationId,
        isSampleArticle: isBuiltInSampleArticle(body),
        ...(upstreamStatus ? { upstreamStatus } : {}),
      },
      { status },
    );
  }
}
