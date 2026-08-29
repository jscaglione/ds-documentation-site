import { DocPage, DocSection, CodeBlock } from "../components/DocPage";
import {
  ArrowRight, Check, ChevronDown, ChevronRight, Copy, Download, Edit,
  ExternalLink, Eye, EyeOff, Filter, Grid, Info, Link, Lock, Menu,
  Moon, MoreHorizontal, Plus, Search, Settings, Share, Star, Sun,
  Trash, Upload, User, X, AlertCircle, Bell, Calendar, Clock,
  Heart, Home, Mail, Phone, Tag, Zap
} from "lucide-react";
import { useState } from "react";

const ICONS = [
  { name: "ArrowRight", component: ArrowRight },
  { name: "Check", component: Check },
  { name: "ChevronDown", component: ChevronDown },
  { name: "ChevronRight", component: ChevronRight },
  { name: "Copy", component: Copy },
  { name: "Download", component: Download },
  { name: "Edit", component: Edit },
  { name: "ExternalLink", component: ExternalLink },
  { name: "Eye", component: Eye },
  { name: "EyeOff", component: EyeOff },
  { name: "Filter", component: Filter },
  { name: "Grid", component: Grid },
  { name: "Info", component: Info },
  { name: "Link", component: Link },
  { name: "Lock", component: Lock },
  { name: "Menu", component: Menu },
  { name: "Moon", component: Moon },
  { name: "MoreHorizontal", component: MoreHorizontal },
  { name: "Plus", component: Plus },
  { name: "Search", component: Search },
  { name: "Settings", component: Settings },
  { name: "Share", component: Share },
  { name: "Star", component: Star },
  { name: "Sun", component: Sun },
  { name: "Trash", component: Trash },
  { name: "Upload", component: Upload },
  { name: "User", component: User },
  { name: "X", component: X },
  { name: "AlertCircle", component: AlertCircle },
  { name: "Bell", component: Bell },
  { name: "Calendar", component: Calendar },
  { name: "Clock", component: Clock },
  { name: "Heart", component: Heart },
  { name: "Home", component: Home },
  { name: "Mail", component: Mail },
  { name: "Phone", component: Phone },
  { name: "Tag", component: Tag },
  { name: "Zap", component: Zap },
];

export function IconsPage() {
  const [search, setSearch] = useState("");
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const filtered = ICONS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  function handleCopy(name: string) {
    navigator.clipboard.writeText(`<${name} size={16} />`);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 1500);
  }

  return (
    <DocPage pageId="icons"
      title="Icons"
      description="The design system uses Lucide React — an open-source icon library with 1400+ icons. Icons are always used at consistent sizes with color inherited from context."
      status="stable"
    >
      <DocSection id="library" title="Icon library">
        <div className="mb-3">
          <div
            className="flex items-center gap-2 px-3 h-9"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              maxWidth: "280px",
            }}
          >
            <Search size={13} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search icons…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none border-none"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--foreground)" }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {filtered.map(icon => {
            const Icon = icon.component;
            const isCopied = copiedName === icon.name;
            return (
              <button
                key={icon.name}
                onClick={() => handleCopy(icon.name)}
                className="group flex flex-col items-center gap-2 p-3 transition-all duration-100"
                style={{
                  background: isCopied ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--card)",
                  border: `1px solid ${isCopied ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  if (!isCopied) {
                    (e.currentTarget as HTMLElement).style.background = "var(--secondary)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isCopied) {
                    (e.currentTarget as HTMLElement).style.background = "var(--card)";
                  }
                }}
              >
                <Icon size={18} style={{ color: isCopied ? "var(--primary)" : "var(--foreground)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5625rem",
                    color: isCopied ? "var(--primary)" : "var(--muted-foreground)",
                    textAlign: "center",
                    lineHeight: 1.3,
                    wordBreak: "break-all",
                  }}
                >
                  {isCopied ? "Copied!" : icon.name}
                </span>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div
            className="py-12 text-center"
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", color: "var(--muted-foreground)" }}
          >
            No icons found for "{search}"
          </div>
        )}
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", marginTop: "8px" }}>
          Click any icon to copy its JSX. Browse the full set at{" "}
          <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>lucide.dev ↗</a>
        </p>
      </DocSection>

      <DocSection id="sizing" title="Sizing" description="Icons use explicit size props, never CSS transforms.">
        <div className="flex items-end gap-6 py-6 px-8" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
          {[12, 14, 16, 20, 24].map(s => (
            <div key={s} className="flex flex-col items-center gap-2">
              <Star size={s} style={{ color: "var(--foreground)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--muted-foreground)" }}>{s}px</span>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <CodeBlock
          code={`import { Download, ArrowRight } from "lucide-react";

// Inline with text — match the font size
<span className="flex items-center gap-1.5">
  <Download size={14} />
  Download
</span>

// Icon button — always add aria-label
<button aria-label="Close dialog">
  <X size={16} />
</button>

// Colored icon — inherit or explicit token
<Info size={16} style={{ color: "var(--primary)" }} />`}
        />
      </DocSection>

      <DocSection id="guidelines" title="Guidelines">
        <ul
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            lineHeight: 1.7,
            color: "var(--foreground)",
            paddingLeft: "1.25rem",
            margin: 0,
          }}
        >
          <li>Use 16px for inline icons paired with body text.</li>
          <li>Use 20–24px for standalone action icons and empty states.</li>
          <li>Never use icon-only buttons without an <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--muted)", padding: "1px 4px", borderRadius: "2px" }}>aria-label</code>.</li>
          <li>Icons inherit color by default — use <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--muted)", padding: "1px 4px", borderRadius: "2px" }}>style color</code> only when the icon color differs from adjacent text.</li>
          <li>Don't mix icon families. Stick to Lucide throughout the product.</li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
