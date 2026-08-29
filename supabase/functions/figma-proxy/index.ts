// Proxies the Figma REST API so the personal access token never reaches the browser.
//
// Anonymous callers are allowed, because rendered component previews appear on
// every public doc page. To stop this becoming an open proxy to the whole Figma
// account, an anonymous caller may only request a file key that already appears
// in the saved doc_state.figma_blocks. Editors (who are importing a brand-new
// block that has not been saved yet) may request any file key.

import {
  adminClient, canEdit, corsHeaders, fail, figmaFileKey, getCaller, getSecret, json,
} from "../_shared/util.ts";

interface Body {
  action: "node" | "image";
  /** Full figma.com URL — used for `node`, and to derive the file key. */
  url?: string;
  /** For `image`: the specific node to render (may differ from the URL's node). */
  fileKey?: string;
  nodeId?: string;
  format?: "png" | "svg";
}

/** File keys referenced by blocks that have already been saved. */
async function savedFileKeys(): Promise<Set<string>> {
  const { data } = await adminClient()
    .from("doc_state")
    .select("figma_blocks")
    .eq("id", "global")
    .single();

  const blocks = (data?.figma_blocks ?? []) as Array<{ url?: string }>;
  const keys = new Set<string>();
  for (const b of blocks) {
    const key = b.url ? figmaFileKey(b.url) : null;
    if (key) keys.add(key);
  }
  return keys;
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return fail(req, "Use POST", 405);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail(req, "Invalid JSON body");
  }

  const fileKey = body.fileKey ?? (body.url ? figmaFileKey(body.url) : null);
  if (!fileKey) return fail(req, "Could not parse Figma URL");

  const caller = await getCaller(req);
  if (!canEdit(caller) && !(await savedFileKeys()).has(fileKey)) {
    return fail(req, "This Figma file is not referenced by any published page", 403);
  }

  const token = await getSecret("figma");
  if (!token) return json(req, { error: "no-token" }, 503);

  const headers = { "X-Figma-Token": token };

  if (body.action === "node") {
    const nodeId = body.url ? nodeIdFromUrl(body.url) : body.nodeId ?? null;
    const apiUrl = nodeId
      ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`
      : `https://api.figma.com/v1/files/${fileKey}?depth=2`;

    const res = await fetch(apiUrl, { headers });
    if (res.status === 403) return fail(req, "Invalid or expired Figma token", 403);
    if (res.status === 404) return fail(req, "File not found — ensure it is shared publicly", 404);
    if (!res.ok) return fail(req, `Figma API error ${res.status}`, 502);
    return json(req, await res.json());
  }

  if (body.action === "image") {
    if (!body.nodeId) return fail(req, "nodeId is required for action=image");
    const format = body.format === "svg" ? "svg" : "png";
    const scale = format === "png" ? "&scale=2" : "";
    const res = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(body.nodeId)}&format=${format}${scale}`,
      { headers },
    );
    if (!res.ok) return json(req, { url: null });

    const data = await res.json() as { images?: Record<string, string | null> };
    const url =
      data.images?.[body.nodeId] ??
      data.images?.[body.nodeId.replace(/:/g, "-")] ??
      null;

    // SVGs are fetched and returned inline: the client rewrites them for text
    // overrides, and figma's S3 URLs do not send permissive CORS headers.
    if (url && format === "svg") {
      const svgRes = await fetch(url);
      if (svgRes.ok) return json(req, { url, svg: await svgRes.text() });
    }
    return json(req, { url });
  }

  return fail(req, `Unknown action: ${body.action}`);
});

function nodeIdFromUrl(url: string): string | null {
  const m = url.match(/node-id=([^&#]+)/);
  // URL uses dashes (1-23), API uses colons (1:23)
  return m ? decodeURIComponent(m[1]).replace(/-/g, ":") : null;
}
