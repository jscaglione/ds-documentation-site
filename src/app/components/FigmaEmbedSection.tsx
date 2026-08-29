import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router";
import { useEditMode, FigmaBlock, FigmaComponentProp, FigmaVariantSpec, FigmaTextOverlay } from "../contexts/EditModeContext";
import { useAuth } from "../contexts/AuthContext";
import { figmaFetchNode, figmaFetchImage, aiGenerateDoc } from "../lib/api";
import { EditableText } from "./EditableText";

// ─── Constants ─────────────────────────────────────────────────────────────

const HEIGHT_PRESETS = [
  { label: "S", value: 360 },
  { label: "M", value: 560 },
  { label: "L", value: 720 },
  { label: "XL", value: 900 },
];

// ─── Utilities ──────────────────────────────────────────────────────────────

function isFigmaUrl(url: string) {
  return /https?:\/\/(www\.)?figma\.com\/(design|file|proto|board)\//.test(url);
}

function toEmbedUrl(url: string) {
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
}

function getFileKey(url: string): string | null {
  const m = url.match(/figma\.com\/(?:design|file|proto|board)\/([^/?#]+)/);
  return m?.[1] ?? null;
}

function getNodeId(url: string): string | null {
  const m = url.match(/node-id=([^&#]+)/);
  // URL uses dashes (1-23), API uses colons (1:23)
  return m ? decodeURIComponent(m[1]).replace(/-/g, ":") : null;
}

function truncateUrl(url: string, max = 58) {
  try {
    const u = new URL(url);
    const full = u.hostname + u.pathname;
    return full.length > max ? full.slice(0, max) + "…" : full;
  } catch { return url.slice(0, max); }
}

// ─── Figma API ───────────────────────────────────────────────────────────────
// All Figma calls go through the `figma-proxy` Edge Function. The personal
// access token lives in Supabase and is never sent to the browser, so there is
// no token argument here and no way for a page visitor to read the key.

async function apiFetchNodeData(url: string) {
  return figmaFetchNode(url);
}

/** Make an SVG scale to its container by dropping fixed dimensions. */
function makeResponsiveSvg(text: string): string {
  return text.replace(/<svg([^>]*)>/, (_m, attrs: string) => {
    const noFixed = attrs
      .replace(/\s+width="[^"]*"/, "")
      .replace(/\s+height="[^"]*"/, "");
    return `<svg${noFixed} width="100%" height="100%">`;
  });
}

/**
 * Rendered image for a node. For `svg` the proxy also returns the file body
 * inline — Figma's S3 URLs do not allow cross-origin reads from the browser.
 */
async function apiFetchVariantImage(
  fileKey: string,
  nodeId: string,
  format: "png" | "svg" = "png"
): Promise<{ url: string | null; svg: string | null }> {
  const res = await figmaFetchImage(fileKey, nodeId, format);
  return { url: res.url, svg: res.svg ? makeResponsiveSvg(res.svg) : null };
}

function applyTextOverridesToSvg(
  svgText: string,
  props: FigmaComponentProp[],
  selected: Record<string, string>
): string {
  let out = svgText;
  for (const prop of props) {
    if (prop.type !== "TEXT") continue;
    const override = selected[prop.name];
    if (override === undefined || override === prop.defaultValue) continue;
    const def = prop.defaultValue;
    if (!def) continue;
    // Replace text content between tags — handles direct text and tspan children
    const esc = def.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`(>\\s*)${esc}(\\s*<)`, "g"), `$1${override}$2`);
  }
  return out;
}

function parseNodeInfo(data: any, hasNodeId: boolean) {
  let doc: any;
  if (hasNodeId) {
    const entry = Object.values(data.nodes ?? {})[0] as any;
    doc = entry?.document;
  } else {
    doc = data.document;
  }
  if (!doc) return null;

  const name: string = doc.name ?? "Untitled";
  const type: string = doc.type ?? "FRAME";
  const description: string = doc.description ?? "";

  // Figma sometimes appends "#N" suffixes to prop names for uniqueness — strip them
  const cleanKey = (k: string) => k.replace(/#\d+$/, "");
  const defs: Record<string, any> = doc.componentPropertyDefinitions ?? {};

  const props: FigmaComponentProp[] = Object.entries(defs).map(([k, v]: [string, any]) => ({
    name: cleanKey(k),
    type: v.type,
    defaultValue: String(v.defaultValue ?? ""),
    options: v.variantOptions as string[] | undefined,
  }));

  // For COMPONENT_SET, extract each child as a variant spec.
  // Figma reliably encodes variant values in the child name ("BG Color=Slate, Size=Medium").
  // componentProperties may be absent in the nodes endpoint, so name-parsing is the primary source.
  const variantSpecs: FigmaVariantSpec[] = [];
  if (type === "COMPONENT_SET" && Array.isArray(doc.children)) {
    for (const child of doc.children) {
      if (child.type !== "COMPONENT") continue;
      const childProps: Record<string, string> = {};

      // Primary: parse "Key=Value, Key=Value" from child name
      for (const part of (child.name ?? "").split(",")) {
        const eqIdx = part.indexOf("=");
        if (eqIdx === -1) continue;
        const k = part.slice(0, eqIdx).trim();
        const v = part.slice(eqIdx + 1).trim();
        if (k) {
          // Normalize booleans to lowercase to match our toggle state
          childProps[k] = v === "True" ? "true" : v === "False" ? "false" : v;
        }
      }

      // Fallback / supplement: componentProperties (may be populated in some API responses)
      for (const [pk, pv] of Object.entries(child.componentProperties ?? {} as Record<string, any>)) {
        const cleanedKey = cleanKey(pk);
        if (!childProps[cleanedKey]) {
          const raw = String((pv as any).value ?? "");
          childProps[cleanedKey] = raw === "True" ? "true" : raw === "False" ? "false" : raw;
        }
      }

      if (Object.keys(childProps).length > 0) {
        variantSpecs.push({ nodeId: child.id, props: childProps });
      }
    }
  }

  // Extract text overlays: TEXT nodes whose characters are bound to a TEXT property.
  // We traverse the full tree to find nodes with componentPropertyReferences.characters.
  const textOverlays: FigmaTextOverlay[] = [];
  const rootBox = doc.absoluteBoundingBox as { x: number; y: number; width: number; height: number } | undefined;

  if (rootBox && rootBox.width > 0 && rootBox.height > 0) {
    function traverseForText(node: any) {
      if (node.type === "TEXT") {
        const ref: string | undefined = node.componentPropertyReferences?.characters;
        if (ref) {
          const propName = cleanKey(ref);
          const box = node.absoluteBoundingBox as { x: number; y: number; width: number; height: number } | undefined;
          if (box) {
            const style = node.style ?? {};
            // Convert Figma RGBA (0-1 floats) to CSS rgba
            const fill = (node.fills ?? [])[0];
            let color = "rgba(0,0,0,1)";
            if (fill?.type === "SOLID" && fill.color) {
              const { r, g, b, a = 1 } = fill.color;
              color = `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
            }
            textOverlays.push({
              propName,
              x: (box.x - rootBox.x) / rootBox.width,
              y: (box.y - rootBox.y) / rootBox.height,
              w: box.width / rootBox.width,
              h: box.height / rootBox.height,
              fontSize: style.fontSize ?? 14,
              textAlign: style.textAlignHorizontal ?? "LEFT",
              color,
              fontFamily: style.fontFamily ?? "Inter, sans-serif",
              fontWeight: style.fontWeight ?? 400,
              lineHeight: style.lineHeightPx,
              letterSpacing: style.letterSpacing != null
                ? style.letterSpacing / (style.fontSize ?? 14)
                : undefined,
            });
          }
        }
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) traverseForText(child);
      }
    }
    traverseForText(doc);
  }

  return {
    name, type, description, props, variantSpecs,
    textOverlays,
    rootWidth: rootBox?.width,
    rootHeight: rootBox?.height,
  };
}

function findMatchingVariant(
  specs: FigmaVariantSpec[],
  selected: Record<string, string>
): FigmaVariantSpec | undefined {
  // Score each spec: count how many selected props match exactly.
  // Require ALL selected props that exist in the spec to match.
  let bestSpec: FigmaVariantSpec | undefined;
  let bestScore = -1;

  for (const spec of specs) {
    let score = 0;
    let mismatch = false;
    for (const [k, v] of Object.entries(selected)) {
      if (spec.props[k] !== undefined) {
        if (spec.props[k] === v) {
          score++;
        } else {
          mismatch = true;
          break;
        }
      }
    }
    if (!mismatch && score > bestScore) {
      bestScore = score;
      bestSpec = spec;
    }
  }

  return bestSpec;
}

// ─── Small shared pieces ─────────────────────────────────────────────────────

function FigmaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 38 57" fill="none" style={{ flexShrink: 0 }}>
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0Z" fill="#1ABCFE"/>
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5A9.5 9.5 0 1 1 0 47.5Z" fill="#0ACF83"/>
      <path d="M19 0h9.5a9.5 9.5 0 1 1 0 19H19V0Z" fill="#FF7262"/>
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5Z" fill="#F24E1E"/>
      <path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5Z" fill="#A259FF"/>
    </svg>
  );
}

function Spinner({ size = 20, color = "var(--primary)" }: { size?: number; color?: string }) {
  return (
    <>
      <style>{`@keyframes figma-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{
        width: size, height: size, flexShrink: 0,
        border: `2px solid color-mix(in srgb, ${color} 20%, transparent)`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "figma-spin 0.7s linear infinite",
      }} />
    </>
  );
}

// ─── Component Playground ────────────────────────────────────────────────────

type PreviewState =
  | { kind: "no-token" }
  | { kind: "loading" }
  | { kind: "image"; url: string }
  | { kind: "no-match" }
  | { kind: "error"; msg?: string }
  | { kind: "static" }; // single COMPONENT, no variant set — show static image

/** The proxy answers with "no-token" when no Figma key is configured in /admin. */
function toPreviewState(err: unknown): PreviewState {
  const msg = err instanceof Error ? err.message : "Fetch failed";
  return msg === "no-token" ? { kind: "no-token" } : { kind: "error", msg };
}

/** Shown wherever a Figma key is required but not configured. */
function NeedsFigmaKey({ isAdmin, compact = false }: { isAdmin: boolean; compact?: boolean }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: compact ? "0.75rem" : "0.8125rem",
        color: compact ? "var(--muted-foreground)" : "rgba(0,0,0,0.45)",
        lineHeight: 1.5,
        margin: 0,
      }}
    >
      No Figma key is connected.{" "}
      {isAdmin ? (
        <Link to="/admin" style={{ color: "var(--primary)", textDecoration: "none" }}>
          Connect one in Administration →
        </Link>
      ) : (
        "Ask an admin to add one under Administration → API Keys."
      )}
    </p>
  );
}

function BooleanToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        width: "36px", height: "20px", borderRadius: "10px", flexShrink: 0,
        background: value ? "var(--primary)" : "var(--border)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "19px" : "3px",
          width: "14px", height: "14px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

function ComponentPlayground({ block }: { block: FigmaBlock }) {
  const { isEditing, removeFigmaBlock } = useEditMode();
  const { isAdmin } = useAuth();
  const fileKey = useMemo(() => getFileKey(block.url), [block.url]);
  const nodeIdFromUrl = useMemo(() => getNodeId(block.url), [block.url]);

  const isComponentSet = block.nodeType === "COMPONENT_SET";
  const hasVariants = (block.variantSpecs?.length ?? 0) > 0;

  const variantProps = useMemo(
    () => (block.componentProps ?? []).filter(p => p.type === "VARIANT"),
    [block.componentProps]
  );
  const booleanProps = useMemo(
    () => (block.componentProps ?? []).filter(p => p.type === "BOOLEAN"),
    [block.componentProps]
  );
  const textProps = useMemo(
    () => (block.componentProps ?? []).filter(p => p.type === "TEXT"),
    [block.componentProps]
  );

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of block.componentProps ?? []) {
      if (p.type === "VARIANT") init[p.name] = p.defaultValue || p.options?.[0] || "";
      else if (p.type === "BOOLEAN") init[p.name] = p.defaultValue === "true" ? "true" : "false";
      else if (p.type === "TEXT") init[p.name] = p.defaultValue || "";
    }
    return init;
  });
  const [previewState, setPreviewState] = useState<PreviewState>({ kind: "loading" });

  const imageCache = useRef<Record<string, string>>({});
  // SVG cache: nodeId → raw (responsive) SVG string, or null if unavailable
  const svgCache = useRef<Record<string, string | null>>({});
  const [baseSvg, setBaseSvg] = useState<string | null>(null);
  const [currentSvgNodeId, setCurrentSvgNodeId] = useState<string | null>(null);

  // The node ID that is currently being displayed (variant child or URL node)
  const activeNodeId = useMemo<string | null>(() => {
    if (isComponentSet && hasVariants) {
      const propSelection: Record<string, string> = {};
      for (const [k, v] of Object.entries(selected)) {
        const propType = block.componentProps?.find(p => p.name === k)?.type;
        if (propType === "VARIANT" || propType === "BOOLEAN") propSelection[k] = v;
      }
      return findMatchingVariant(block.variantSpecs ?? [], propSelection)?.nodeId ?? null;
    }
    return nodeIdFromUrl;
  }, [selected, block.variantSpecs, block.componentProps, isComponentSet, hasVariants, nodeIdFromUrl]);

  // SVG with text overrides applied — recomputed instantly when user types
  const displaySvg = useMemo(() => {
    if (!baseSvg) return null;
    return applyTextOverridesToSvg(baseSvg, block.componentProps ?? [], selected);
  }, [baseSvg, selected, block.componentProps]);

  // Fetch PNG for variant switching (fast initial display)
  useEffect(() => {
    if (!fileKey) return;

    if (!isComponentSet || !hasVariants) {
      // Single COMPONENT
      if (!nodeIdFromUrl) return;
      if (previewState.kind === "image") return;
      const cacheKey = nodeIdFromUrl;
      if (imageCache.current[cacheKey]) {
        setPreviewState({ kind: "image", url: imageCache.current[cacheKey] });
        return;
      }
      setPreviewState({ kind: "loading" });
      apiFetchVariantImage(fileKey, nodeIdFromUrl)
        .then(({ url }) => {
          if (url) { imageCache.current[cacheKey] = url; setPreviewState({ kind: "image", url }); }
          else setPreviewState({ kind: "error", msg: "Image not available" });
        })
        .catch(err => setPreviewState(toPreviewState(err)));
      return;
    }

    // COMPONENT_SET variant switching
    const propSelection: Record<string, string> = {};
    for (const [k, v] of Object.entries(selected)) {
      const propType = block.componentProps?.find(p => p.name === k)?.type;
      if (propType === "VARIANT" || propType === "BOOLEAN") propSelection[k] = v;
    }
    const variant = findMatchingVariant(block.variantSpecs ?? [], propSelection);
    if (!variant) { setPreviewState({ kind: "no-match" }); return; }

    if (imageCache.current[variant.nodeId]) {
      setPreviewState({ kind: "image", url: imageCache.current[variant.nodeId] });
      return;
    }
    setPreviewState({ kind: "loading" });
    apiFetchVariantImage(fileKey, variant.nodeId)
      .then(({ url }) => {
        if (url) { imageCache.current[variant.nodeId] = url; setPreviewState({ kind: "image", url }); }
        else setPreviewState({ kind: "error", msg: "No image returned for this variant" });
      })
      .catch(err => setPreviewState(toPreviewState(err)));
  }, [selected, block.variantSpecs, block.componentProps, fileKey, isComponentSet, hasVariants, nodeIdFromUrl]);

  // Fetch SVG in the background when text props exist — enables live text edits
  useEffect(() => {
    if (!textProps.length || !fileKey || !activeNodeId) return;
    if (currentSvgNodeId === activeNodeId) return; // already loaded for this node

    if (svgCache.current[activeNodeId] !== undefined) {
      setBaseSvg(svgCache.current[activeNodeId]);
      setCurrentSvgNodeId(activeNodeId);
      return;
    }

    apiFetchVariantImage(fileKey, activeNodeId, "svg")
      .then(({ svg }) => {
        svgCache.current[activeNodeId] = svg;
        setBaseSvg(svg);
        setCurrentSvgNodeId(activeNodeId);
      })
      .catch(() => { svgCache.current[activeNodeId] = null; });
  }, [activeNodeId, textProps.length, fileKey, currentSvgNodeId]);

  function setProp(name: string, value: string) {
    setSelected(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--card)" }}>

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}
      >
        <FigmaIcon size={12} />
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)", flex: 1 }}>
          {block.nodeName || "Component"}
        </span>
        {block.nodeType && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)", background: "color-mix(in srgb,var(--primary) 8%,transparent)", padding: "2px 6px", borderRadius: "2px" }}>
            {block.nodeType.replace(/_/g, " ")}
          </span>
        )}
        {hasVariants && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", color: "var(--muted-foreground)", background: "var(--background)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: "2px" }}>
            {block.variantSpecs!.length} variant{block.variantSpecs!.length !== 1 ? "s" : ""}
          </span>
        )}
        <a href={block.url} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.textDecoration = "underline")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.textDecoration = "none")}
        >
          Figma
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
        {isEditing && (
          <button
            onClick={() => removeFigmaBlock(block.id)}
            title="Remove this Figma import"
            style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--muted-foreground)", flexShrink: 0, transition: "all 0.1s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FEE2E2"; el.style.borderColor = "#D4183D"; el.style.color = "#D4183D"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "none"; el.style.borderColor = "var(--border)"; el.style.color = "var(--muted-foreground)"; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row" style={{ minHeight: "320px" }}>
        {/* Preview area */}
        <div
          className="flex-1 flex items-center justify-center relative"
          style={{
            minHeight: "280px",
            background: "color-mix(in srgb,#000 3%,#fff)",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23e5e5e5'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e5e5'/%3E%3C/svg%3E\")",
            borderRight: "1px solid var(--border)",
          }}
        >
          {previewState.kind === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Spinner size={24} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "rgba(0,0,0,0.35)" }}>
                Rendering…
              </span>
            </div>
          )}

          {previewState.kind === "no-token" && (
            <div className="flex flex-col items-center gap-3 px-8 text-center">
              <div style={{ opacity: 0.4 }}><FigmaIcon size={24} /></div>
              <NeedsFigmaKey isAdmin={isAdmin} />
            </div>
          )}

          {previewState.kind === "no-match" && (
            <div className="flex flex-col items-center gap-2 px-8 text-center">
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "rgba(0,0,0,0.4)", lineHeight: 1.5, margin: 0 }}>
                No variant matches this combination.
              </p>
            </div>
          )}

          {previewState.kind === "error" && (
            <div className="flex flex-col items-center gap-2 px-8 text-center">
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "#991B1B", lineHeight: 1.5, margin: 0 }}>
                {previewState.msg ?? "Could not render this variant."}
              </p>
              <button
                onClick={() => setPreviewState({ kind: "loading" })}
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
              >
                Retry
              </button>
            </div>
          )}

          {previewState.kind === "image" && (
            // When SVG is available, render it inline so text replacements take effect.
            // Fall back to <img> when SVG is unavailable (CORS issue, non-text component, etc.)
            displaySvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: displaySvg }}
                style={{
                  maxWidth: "90%",
                  maxHeight: "340px",
                  width: "100%",
                  filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.14))",
                  lineHeight: 0, // prevent extra spacing around inline SVG
                }}
              />
            ) : (
              <img
                src={previewState.url}
                alt={block.nodeName || "Component preview"}
                onError={() => {
                  const url = previewState.url;
                  for (const [k, v] of Object.entries(imageCache.current)) {
                    if (v === url) delete imageCache.current[k];
                  }
                  setPreviewState({ kind: "loading" });
                }}
                style={{
                  maxWidth: "90%",
                  maxHeight: "340px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.14))",
                }}
              />
            )
          )}
        </div>

        {/* Properties panel */}
        <div
          className="flex flex-col"
          style={{ width: "260px", flexShrink: 0 }}
        >
          <div
            className="px-4 py-2.5"
            style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}
          >
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)" }}>
              Properties
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {block.componentProps?.length === 0 && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: "16px", fontStyle: "italic" }}>
                No properties defined.
              </p>
            )}

            {variantProps.map(prop => (
              <PropertyRow key={prop.name} label={prop.name} type="VARIANT">
                <div className="flex flex-wrap gap-1">
                  {(prop.options ?? []).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setProp(prop.name, opt)}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        padding: "3px 8px",
                        borderRadius: "var(--radius)",
                        border: "1px solid",
                        cursor: "pointer",
                        transition: "all 0.1s",
                        background: selected[prop.name] === opt ? "var(--primary)" : "var(--background)",
                        borderColor: selected[prop.name] === opt ? "var(--primary)" : "var(--border)",
                        color: selected[prop.name] === opt ? "#fff" : "var(--foreground)",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </PropertyRow>
            ))}

            {booleanProps.map(prop => (
              <PropertyRow key={prop.name} label={prop.name} type="BOOLEAN">
                <div className="flex items-center gap-2">
                  <BooleanToggle
                    value={selected[prop.name] === "true"}
                    onChange={v => setProp(prop.name, String(v))}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                    {selected[prop.name] === "true" ? "True" : "False"}
                  </span>
                </div>
              </PropertyRow>
            ))}

            {textProps.map(prop => {
              const val = selected[prop.name] ?? "";
              const isDirty = val !== (prop.defaultValue ?? "");
              return (
                <PropertyRow key={prop.name} label={prop.name} type="TEXT">
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={val}
                      onChange={e => setProp(prop.name, e.target.value)}
                      placeholder={prop.defaultValue || "Text value"}
                      style={{
                        width: "100%",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        padding: "5px 8px",
                        paddingRight: isDirty ? "26px" : "8px",
                        background: isDirty
                          ? "color-mix(in srgb,var(--primary) 5%,var(--background))"
                          : "var(--background)",
                        border: "1px solid",
                        borderColor: isDirty ? "var(--primary)" : "var(--border)",
                        borderRadius: "var(--radius)",
                        outline: "none",
                        color: "var(--foreground)",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
                      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = isDirty ? "var(--primary)" : "var(--border)"; }}
                    />
                    {isDirty && (
                      <button
                        title="Reset to default"
                        onClick={() => setProp(prop.name, prop.defaultValue ?? "")}
                        style={{
                          position: "absolute",
                          right: "6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: "var(--muted-foreground)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </PropertyRow>
              );
            })}

            {(block.componentProps ?? []).filter(p => p.type === "INSTANCE_SWAP").map(prop => (
              <PropertyRow key={prop.name} label={prop.name} type="INSTANCE_SWAP">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>
                  Instance swap
                </span>
              </PropertyRow>
            ))}
          </div>

          {block.nodeDescription && (
            <div
              className="px-4 py-3"
              style={{ borderTop: "1px solid var(--border)", background: "var(--muted)" }}
            >
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", lineHeight: 1.55, margin: 0 }}>
                {block.nodeDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PROP_TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  VARIANT:       { bg: "color-mix(in srgb,var(--primary) 10%,transparent)", fg: "var(--primary)" },
  BOOLEAN:       { bg: "#FEF3C7", fg: "#92400E" },
  TEXT:          { bg: "#DCFCE7", fg: "#166534" },
  INSTANCE_SWAP: { bg: "#F3E8FF", fg: "#6B21A8" },
};

function PropertyRow({ label, type, children }: { label: string; type?: string; children: React.ReactNode }) {
  const colors = type ? PROP_TYPE_COLORS[type] : undefined;
  return (
    <div
      className="flex flex-col gap-1.5 px-4 py-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-1.5">
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 600, color: "var(--foreground)", flex: 1, textTransform: "capitalize" }}>
          {label}
        </span>
        {colors && type && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "1px 5px", borderRadius: "2px", background: colors.bg, color: colors.fg, flexShrink: 0 }}>
            {type.toLowerCase().replace("_", " ")}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Static iframe embed (for non-components or when playground isn't applicable) ──

function EmbedIframe({ block }: { block: FigmaBlock }) {
  const { isEditing, removeFigmaBlock, updateFigmaBlockHeight } = useEditMode();
  const [loaded, setLoaded] = useState(false);
  const captionId = `figma-caption-${block.id}`;

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--card)" }}>
      <div className="flex items-center gap-2.5 px-3 py-2" style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
        <FigmaIcon size={13} />
        <EditableText id={captionId} as="span" style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 500, color: "var(--foreground)" }}>
          {block.nodeName || "Figma frame"}
        </EditableText>
        {block.nodeType && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)", background: "var(--background)", border: "1px solid var(--border)", padding: "1px 6px", borderRadius: "2px", flexShrink: 0 }}>
            {block.nodeType.replace(/_/g, " ")}
          </span>
        )}
        {isEditing && (
          <div className="flex items-center" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0 }}>
            {HEIGHT_PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => updateFigmaBlockHeight(block.id, p.value)} title={`${p.value}px`}
                style={{ padding: "2px 7px", fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 600, background: block.height === p.value ? "var(--foreground)" : "var(--card)", color: block.height === p.value ? "var(--background)" : "var(--muted-foreground)", border: "none", borderRight: i < HEIGHT_PRESETS.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "all 0.1s" }}>
                {p.label}
              </button>
            ))}
          </div>
        )}
        {isEditing && (
          <button onClick={() => removeFigmaBlock(block.id)}
            style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--muted-foreground)", flexShrink: 0, transition: "all 0.1s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FEE2E2"; el.style.borderColor = "#D4183D"; el.style.color = "#D4183D"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "none"; el.style.borderColor = "var(--border)"; el.style.color = "var(--muted-foreground)"; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      <div style={{ position: "relative", height: block.height, background: "#1E1E1E" }}>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <Spinner size={24} color="#1ABCFE" />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Loading…</span>
          </div>
        )}
        <iframe src={toEmbedUrl(block.url)} style={{ width: "100%", height: "100%", border: "none", opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }} allowFullScreen allow="clipboard-write" onLoad={() => setLoaded(true)} title="Figma embed" />
      </div>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderTop: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>{truncateUrl(block.url)}</span>
        <a href={block.url} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", flexShrink: 0 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.textDecoration = "underline")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.textDecoration = "none")}
        >
          Open in Figma
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

// ─── Fetch state overlay (loading / error / no-token prompt) ──────────────────

function FetchStatePanel({ block }: { block: FigmaBlock }) {
  const { isEditing, updateFigmaBlock } = useEditMode();
  const { isAdmin } = useAuth();

  if (block.fetchState === "loading") {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 mt-3" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
        <Spinner size={14} />
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>
          Fetching component data from Figma API…
        </span>
      </div>
    );
  }

  if (block.fetchState === "error") {
    return (
      <div className="mt-3 px-4 py-3" style={{ border: "1px solid #FECACA", borderRadius: "var(--radius)", background: "#FFF5F5" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 600, color: "#991B1B", margin: "0 0 4px" }}>Could not fetch component data</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#B91C1C", margin: "0 0 8px" }}>{block.fetchError}</p>
        {isEditing && (
          <button onClick={() => updateFigmaBlock(block.id, { fetchState: undefined })}
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (block.fetchState === "no-token") {
    if (!isEditing) return null;
    return (
      <div className="mt-3 p-4" style={{ border: "1px dashed var(--border)", borderRadius: "var(--radius)", background: "var(--card)" }}>
        <div className="flex items-center gap-3">
          <div style={{ opacity: 0.5 }}><FigmaIcon size={14} /></div>
          <div style={{ flex: 1 }}>
            <NeedsFigmaKey isAdmin={isAdmin} compact />
          </div>
          <button onClick={() => updateFigmaBlock(block.id, { fetchState: undefined })}
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 500, color: "var(--primary)", background: "none", border: "1px solid var(--primary)", borderRadius: "var(--radius)", cursor: "pointer", padding: "5px 12px", flexShrink: 0 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── AI documentation generation ─────────────────────────────────────────────
// The prompt is built and the Anthropic call is made inside the `ai-generate`
// Edge Function, so the API key stays server-side. See supabase/functions/.

function AiDocSection({ block }: { block: FigmaBlock }) {
  const { isEditing, getContent, setContent } = useEditMode();
  const { isAdmin } = useAuth();
  const overviewId = `figma-overview-${block.id}`;
  const guidelinesId = `figma-guidelines-${block.id}`;

  const overview = getContent(overviewId, "");
  const guidelines = getContent(guidelinesId, "");
  const hasContent = !!(overview || guidelines);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  /** Set when the server reports that no Anthropic key is configured. */
  const [needsKey, setNeedsKey] = useState(false);

  async function generate() {
    if (!block.nodeName) return;
    setGenerating(true);
    setGenError(null);
    setNeedsKey(false);
    try {
      const { overview: ov, guidelines: gl } = await aiGenerateDoc({
        nodeName: block.nodeName,
        nodeType: block.nodeType,
        nodeDescription: block.nodeDescription,
        componentProps: block.componentProps,
      });
      setContent(overviewId, ov);
      setContent(guidelinesId, gl);
    } catch (e) {
      if (e instanceof Error && e.message === "no-key") {
        setNeedsKey(true);
        setGenerating(false);
        return;
      }
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (!hasContent && !isEditing) return null;

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* AI controls bar (edit mode only) */}
      {isEditing && (
        <div
          className="flex items-center gap-3"
          style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}
        >
          <button
            onClick={generate}
            disabled={generating}
                onMouseEnter={e => { if (!generating) (e.currentTarget as HTMLElement).style.background = "#2034CC"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = generating ? "var(--muted-foreground)" : "var(--primary)"; }}
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 500, color: "#fff", background: generating ? "var(--muted-foreground)" : "var(--primary)", border: "none", borderRadius: "var(--radius)", cursor: generating ? "default" : "pointer", padding: "6px 16px", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, transition: "background 0.15s" }}
              >
                {generating ? (
                  <><Spinner size={12} color="#fff" /> Generating…</>
                ) : hasContent ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.46-4.23"/>
                    </svg>
                    Regenerate draft
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Generate AI draft
                  </>
                )}
              </button>
          {hasContent && !generating && (
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>
              Click any text below to edit
            </span>
          )}
        </div>
      )}

      {needsKey && isEditing && (
        <div className="px-4 py-3" style={{ border: "1px dashed var(--border)", borderRadius: "var(--radius)", background: "var(--card)" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>
            No Anthropic key is connected.{" "}
            {isAdmin ? (
              <Link to="/admin" style={{ color: "var(--primary)", textDecoration: "none" }}>
                Connect one in Administration →
              </Link>
            ) : (
              "Ask an admin to add one under Administration → API Keys."
            )}
          </p>
        </div>
      )}

      {genError && (
        <div className="px-4 py-3" style={{ border: "1px solid #FECACA", borderRadius: "var(--radius)", background: "#FFF5F5" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 600, color: "#991B1B", margin: "0 0 2px" }}>
            Generation failed
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#B91C1C", margin: 0 }}>
            {genError}
          </p>
        </div>
      )}

      {/* Overview */}
      {(overview || isEditing) && (
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", margin: "0 0 10px" }}>
            Overview
          </p>
          <EditableText
            id={overviewId}
            as="p"
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", lineHeight: 1.65, color: "var(--foreground)", margin: 0 }}
          >
            {overview || "Click to write an overview of this component…"}
          </EditableText>
        </div>
      )}

      {/* Usage guidelines */}
      {(guidelines || isEditing) && (
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", margin: "0 0 10px" }}>
            Usage guidelines
          </p>
          <EditableText
            id={guidelinesId}
            as="p"
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", lineHeight: 1.75, color: "var(--foreground)", margin: 0, whiteSpace: "pre-wrap" }}
          >
            {guidelines || "• When to use: …\n• When not to use: …\n• Accessibility: …"}
          </EditableText>
        </div>
      )}
    </div>
  );
}

// ─── Single block (router: playground vs. embed) ─────────────────────────────

function FigmaEmbedBlock({ block }: { block: FigmaBlock }) {
  const { updateFigmaBlock } = useEditMode();
  const fetchedRef = useRef(false);

  // Auto-fetch component data on mount if needed
  useEffect(() => {
    if (fetchedRef.current) return;
    // Re-fetch if saved variantSpecs have empty props (stale data from old extraction logic)
    const hasStaleSpecs =
      block.fetchState === "done" &&
      block.variantSpecs?.length &&
      block.variantSpecs.every(s => Object.keys(s.props).length === 0);
    if (hasStaleSpecs) {
      updateFigmaBlock(block.id, { fetchState: undefined });
    }
    if (block.fetchState === "done" || block.fetchState === "error") return;
    fetchedRef.current = true;

    updateFigmaBlock(block.id, { fetchState: "loading" });
    const hasNodeId = !!getNodeId(block.url);

    apiFetchNodeData(block.url)
      .then(data => {
        const info = parseNodeInfo(data, hasNodeId);
        if (!info) {
          updateFigmaBlock(block.id, { fetchState: "error", fetchError: "Could not parse Figma node" });
          return;
        }
        updateFigmaBlock(block.id, {
          fetchState: "done",
          nodeName: info.name,
          nodeType: info.type,
          nodeDescription: info.description,
          componentProps: info.props,
          variantSpecs: info.variantSpecs.length ? info.variantSpecs : undefined,
          textOverlays: info.textOverlays.length ? info.textOverlays : undefined,
          rootWidth: info.rootWidth,
          rootHeight: info.rootHeight,
        });
      })
      .catch(err => {
        const message = err instanceof Error ? err.message : "Unknown error";
        updateFigmaBlock(block.id, message === "no-token"
          ? { fetchState: "no-token" }
          : { fetchState: "error", fetchError: message });
      });
  }, [block.id]);

  const isPlayground =
    block.fetchState === "done" &&
    (block.nodeType === "COMPONENT" || block.nodeType === "COMPONENT_SET") &&
    block.componentProps?.length;

  return (
    <div>
      {/* For components with props: show the playground; for everything else: embed iframe */}
      {isPlayground ? (
        <ComponentPlayground block={block} />
      ) : (
        <EmbedIframe block={block} />
      )}

      {/* Fetch state overlays (loading, error, no-token) */}
      <FetchStatePanel block={block} />

      {/* AI-generated documentation (overview + usage guidelines) */}
      {block.fetchState === "done" && block.nodeName && (
        <AiDocSection block={block} />
      )}
    </div>
  );
}

// ─── Import bar ───────────────────────────────────────────────────────────────

function FigmaImportBar({ pageId }: { pageId: string }) {
  const { addFigmaBlock } = useEditMode();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function doImport(rawUrl = url) {
    const trimmed = rawUrl.trim();
    if (!trimmed) { setError("Paste a Figma URL first"); return; }
    if (!isFigmaUrl(trimmed)) { setError("Needs a figma.com/design, /file, /proto, or /board URL"); return; }
    addFigmaBlock(pageId, trimmed);
    setUrl(""); setError(""); setFocused(false);
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").trim();
    if (isFigmaUrl(pasted)) { e.preventDefault(); setUrl(pasted); setTimeout(() => doImport(pasted), 60); }
  }

  return (
    <div>
      <div
        className="flex items-center gap-2.5"
        style={{ padding: "10px 14px", border: focused ? "1px solid var(--primary)" : "1px dashed var(--border)", borderRadius: "var(--radius)", background: focused ? "color-mix(in srgb,var(--primary) 3%,var(--card))" : "var(--card)", transition: "border-color 0.15s,background 0.15s", boxShadow: focused ? "0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent)" : "none" }}
      >
        <FigmaIcon size={14} />
        <input ref={inputRef} type="url" value={url} placeholder="Paste a Figma design or component URL…"
          onFocus={() => setFocused(true)}
          onBlur={() => { if (!url) setFocused(false); setError(""); }}
          onChange={e => { setUrl(e.target.value); setError(""); }}
          onKeyDown={e => { if (e.key === "Enter") doImport(); if (e.key === "Escape") { setUrl(""); setFocused(false); inputRef.current?.blur(); } }}
          onPaste={onPaste}
          style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.8125rem", background: "none", border: "none", outline: "none", color: "var(--foreground)" }}
        />
        <button onClick={() => doImport()}
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", background: url ? "var(--primary)" : "var(--muted-foreground)", border: "none", borderRadius: "var(--radius)", padding: "5px 14px", cursor: url ? "pointer" : "default", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.15s" }}
          onMouseEnter={e => { if (url) (e.currentTarget as HTMLElement).style.background = "#2034CC"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = url ? "var(--primary)" : "var(--muted-foreground)"; }}
        >
          Import
        </button>
      </div>
      {error && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#D4183D", margin: "6px 0 0" }}>{error}</p>}
      <div className="flex items-center justify-between mt-2">
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: "var(--muted-foreground)", margin: 0 }}>
          File must be <strong>Anyone with the link can view</strong>.
        </p>
      </div>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function FigmaEmbedSection({ pageId }: { pageId: string }) {
  const { isEditing, figmaBlocks } = useEditMode();
  const pageBlocks = figmaBlocks.filter(b => b.pageId === pageId);

  if (!isEditing && pageBlocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {pageBlocks.map(block => <FigmaEmbedBlock key={block.id} block={block} />)}

      {isEditing && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FigmaIcon size={12} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>
                Import from Figma
              </span>
            </div>
          </div>
          <FigmaImportBar pageId={pageId} />
        </div>
      )}
    </div>
  );
}
