// Generates component documentation prose with Claude, server-side, so the
// Anthropic API key never reaches the browser. Editors and admins only.

import Anthropic from "npm:@anthropic-ai/sdk@0.70.0";
import { canEdit, corsHeaders, fail, getCaller, getSecret, json } from "../_shared/util.ts";

interface ComponentProp {
  name: string;
  type: string;
  defaultValue?: string;
  options?: string[];
}

interface Body {
  nodeName?: string;
  nodeType?: string;
  nodeDescription?: string;
  componentProps?: ComponentProp[];
}

function buildPrompt(b: Body): string {
  const propsText = b.componentProps?.length
    ? b.componentProps
        .map(p =>
          `- ${p.name} (${p.type.toLowerCase()}${
            p.options?.length ? `: ${p.options.join(", ")}` : ""
          })`,
        )
        .join("\n")
    : "No configurable properties";

  return `You are a design system documentation writer. Generate concise, professional documentation for a UI component.

Component name: ${b.nodeName}
Component type: ${(b.nodeType ?? "").replace(/_/g, " ").toLowerCase()}
${b.nodeDescription ? `Figma description: ${b.nodeDescription}` : ""}
Component properties:
${propsText}

Respond with EXACTLY this format (no markdown headers, no extra text):

OVERVIEW
[2-3 sentence description of what this component is, its purpose, and when it's used in a design system]

GUIDELINES
[4-6 bullet points. Each bullet starts with "• " and covers: when to use, when not to use, key behaviors, and accessibility considerations]`;
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return fail(req, "Use POST", 405);

  const caller = await getCaller(req);
  if (!canEdit(caller)) return fail(req, "Editor access required", 403);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail(req, "Invalid JSON body");
  }
  if (!body.nodeName) return fail(req, "nodeName is required");

  const apiKey = await getSecret("anthropic");
  if (!apiKey) return json(req, { error: "no-key" }, 503);

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 16000,
      output_config: { effort: "medium" },
      // Opus 5 safety classifiers can decline a request; `fallbacks: "default"`
      // re-runs it on Anthropic's recommended fallback model server-side.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{ role: "user", content: buildPrompt(body) }],
      // deno-lint-ignore no-explicit-any
    } as any);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Anthropic request failed";
    const status = (e as { status?: number })?.status ?? 502;
    return fail(req, message, status >= 400 && status < 600 ? status : 502);
  }

  if (response.stop_reason === "refusal") {
    return fail(req, "Claude declined to generate documentation for this component", 422);
  }

  // Thinking is on by default on Opus 5 — pick the text block, not content[0].
  const text = response.content
    .filter((b): b is { type: "text"; text: string } => b.type === "text")
    .map(b => b.text)
    .join("")
    .trim();

  const overview = text.match(/OVERVIEW\n([\s\S]+?)(?=\nGUIDELINES|$)/)?.[1]?.trim();
  const guidelines = text.match(/GUIDELINES\n([\s\S]+)/)?.[1]?.trim();

  return json(req, {
    overview: overview ?? text.split("\n\n")[0] ?? text,
    guidelines: guidelines ?? "",
  });
});
