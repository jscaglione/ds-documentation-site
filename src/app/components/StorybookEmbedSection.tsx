import { useState, useRef } from "react";
import { useLocation } from "react-router";
import { useEditMode, StorybookBlock } from "../contexts/EditModeContext";
import { EditableText } from "./EditableText";
import {
  getDefaultStorybookOrigin,
  isComponentDocsPath,
  parseStorybookInput,
  storybookIframeSrc,
  storybookOpenUrl,
} from "../lib/storybook";

const HEIGHT_PRESETS = [
  { label: "S", value: 280 },
  { label: "M", value: 420 },
  { label: "L", value: 560 },
  { label: "XL", value: 720 },
];

function StorybookMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FF4785" d="M16.72 0l-2.2 20.07-11.07 1.86L2.23 1.9 16.72 0z" />
      <path fill="#fff" d="M13.16 5.18l-.3 3.02s-.96-.46-2.05-.46c-1.6 0-1.77.99-1.77 1.24 0 1.34 3.62 1.86 3.62 4.47 0 2.2-1.76 3.5-4.14 3.5-2.02 0-3.17-.97-3.17-.97l.42-3.15s1.12.86 2.2.86c.86 0 1.22-.54 1.22-1.12 0-1.56-3.66-1.63-3.66-4.5 0-2.27 1.62-3.74 4.02-3.74 1.22 0 1.81.38 1.81.38l.2 2.47z" />
    </svg>
  );
}

function StorybookFrame({ block }: { block: StorybookBlock }) {
  const { isEditing, removeStorybookBlock, updateStorybookBlockHeight } = useEditMode();
  const [loaded, setLoaded] = useState(false);
  const captionId = `storybook-caption-${block.id}`;
  const iframeSrc = storybookIframeSrc(block.origin, block.storyId, block.viewMode);
  const openUrl = storybookOpenUrl(block.origin, block.storyId, block.viewMode);

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--card)" }}>
      <div className="flex items-center gap-2.5 px-3 py-2" style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
        <StorybookMark size={13} />
        <EditableText
          id={captionId}
          as="span"
          style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 500, color: "var(--foreground)" }}
        >
          {block.storyId}
        </EditableText>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)", background: "var(--background)", border: "1px solid var(--border)", padding: "1px 6px", borderRadius: "2px", flexShrink: 0 }}>
          {block.viewMode}
        </span>
        {isEditing && (
          <div className="flex items-center" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0 }}>
            {HEIGHT_PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => updateStorybookBlockHeight(block.id, p.value)}
                title={`${p.value}px`}
                style={{
                  padding: "2px 7px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  background: block.height === p.value ? "var(--foreground)" : "var(--card)",
                  color: block.height === p.value ? "var(--background)" : "var(--muted-foreground)",
                  border: "none",
                  borderRight: i < HEIGHT_PRESETS.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        {isEditing && (
          <button
            onClick={() => removeStorybookBlock(block.id)}
            style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--muted-foreground)", flexShrink: 0, transition: "all 0.1s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FEE2E2"; el.style.borderColor = "#D4183D"; el.style.color = "#D4183D"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "none"; el.style.borderColor = "var(--border)"; el.style.color = "var(--muted-foreground)"; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <div style={{ position: "relative", height: block.height, background: "var(--background)" }}>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Loading story…</span>
          </div>
        )}
        <iframe
          src={iframeSrc}
          title={`Storybook ${block.storyId}`}
          style={{ width: "100%", height: "100%", border: "none", opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderTop: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {block.storyId}
        </span>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", flexShrink: 0 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.textDecoration = "underline")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.textDecoration = "none")}
        >
          Open in Storybook
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function StorybookImportBar({ pageId }: { pageId: string }) {
  const { addStorybookBlock } = useEditMode();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const defaultOrigin = getDefaultStorybookOrigin();

  function doImport(rawUrl = url) {
    const parsed = parseStorybookInput(rawUrl);
    if (!parsed) {
      setError(defaultOrigin
        ? "Paste a Storybook story URL, or a story id like components-button--primary"
        : "Paste a full Storybook URL (…/?path=/story/…), or set VITE_STORYBOOK_URL to use story ids");
      return;
    }
    addStorybookBlock(pageId, parsed);
    setUrl("");
    setError("");
    setFocused(false);
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").trim();
    if (parseStorybookInput(pasted)) {
      e.preventDefault();
      setUrl(pasted);
      setTimeout(() => doImport(pasted), 60);
    }
  }

  return (
    <div>
      <div
        className="flex items-center gap-2.5"
        style={{
          padding: "10px 14px",
          border: focused ? "1px solid var(--primary)" : "1px dashed var(--border)",
          borderRadius: "var(--radius)",
          background: focused ? "color-mix(in srgb,var(--primary) 3%,var(--card))" : "var(--card)",
          transition: "border-color 0.15s,background 0.15s",
          boxShadow: focused ? "0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent)" : "none",
        }}
      >
        <StorybookMark size={14} />
        <input
          ref={inputRef}
          type="text"
          value={url}
          placeholder={defaultOrigin
            ? "Paste a story URL or story id…"
            : "Paste a Storybook story URL…"}
          onFocus={() => setFocused(true)}
          onBlur={() => { if (!url) setFocused(false); setError(""); }}
          onChange={e => { setUrl(e.target.value); setError(""); }}
          onKeyDown={e => {
            if (e.key === "Enter") doImport();
            if (e.key === "Escape") { setUrl(""); setFocused(false); inputRef.current?.blur(); }
          }}
          onPaste={onPaste}
          style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.8125rem", background: "none", border: "none", outline: "none", color: "var(--foreground)" }}
        />
        <button
          onClick={() => doImport()}
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", background: url ? "var(--primary)" : "var(--muted-foreground)", border: "none", borderRadius: "var(--radius)", padding: "5px 14px", cursor: url ? "pointer" : "default", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.15s" }}
          onMouseEnter={e => { if (url) (e.currentTarget as HTMLElement).style.background = "#2034CC"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = url ? "var(--primary)" : "var(--muted-foreground)"; }}
        >
          Embed
        </button>
      </div>
      {error && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#D4183D", margin: "6px 0 0" }}>{error}</p>}
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: "var(--muted-foreground)", margin: "8px 0 0" }}>
        {defaultOrigin
          ? <>Default Storybook: <strong>{defaultOrigin}</strong></>
          : <>Copy the story URL from Storybook’s address bar (it contains <code style={{ fontFamily: "var(--font-mono)" }}>?path=/story/</code>).</>}
      </p>
    </div>
  );
}

export function StorybookEmbedSection() {
  const location = useLocation();
  const { isEditing, storybookBlocks } = useEditMode();
  const pageId = location.pathname;
  const pageBlocks = storybookBlocks.filter(b => b.pageId === pageId);

  if (!isComponentDocsPath(pageId)) return null;
  if (!isEditing && pageBlocks.length === 0) return null;

  return (
    <section>
      <h2
        id="storybook"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1.25rem",
          fontWeight: 600,
          letterSpacing: "-0.015em",
          color: "var(--foreground)",
          margin: "0 0 0.5rem",
          scrollMarginTop: "80px",
        }}
      >
        Storybook
      </h2>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.9375rem",
          color: "var(--muted-foreground)",
          margin: "0 0 1.25rem",
          lineHeight: 1.6,
        }}
      >
        Live canvas from the component library’s Storybook — interact with the story here, or open it in Storybook for the full controls panel.
      </p>
      <div className="flex flex-col gap-6">
        {pageBlocks.map(block => <StorybookFrame key={block.id} block={block} />)}
        {isEditing && <StorybookImportBar pageId={pageId} />}
      </div>
    </section>
  );
}
