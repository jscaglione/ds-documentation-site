import { DocPage, DocSection, PreviewBox, CodeBlock, PropsTable } from "../components/DocPage";
import { useState } from "react";

function Btn({
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  children,
}: {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontWeight: 500,
    borderRadius: "var(--radius)",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.12s ease",
    whiteSpace: "nowrap",
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { fontSize: "0.75rem", padding: "5px 10px", height: "28px" },
    md: { fontSize: "0.875rem", padding: "7px 14px", height: "36px" },
    lg: { fontSize: "0.9375rem", padding: "10px 20px", height: "44px" },
    icon: { fontSize: "0.875rem", padding: "0", width: "36px", height: "36px", justifyContent: "center" },
  };

  const variants: Record<string, React.CSSProperties> = {
    default: { background: "var(--primary)", color: "#fff" },
    secondary: { background: "var(--secondary)", color: "var(--foreground)" },
    outline: { background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--foreground)" },
    destructive: { background: "#D4183D", color: "#fff" },
  };

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      disabled={disabled}
      onMouseEnter={e => {
        if (!disabled) {
          const el = e.currentTarget;
          if (variant === "default") el.style.background = "#2034CC";
          if (variant === "secondary") el.style.background = "#E2E3EA";
          if (variant === "outline") el.style.background = "var(--muted)";
          if (variant === "ghost") el.style.background = "var(--muted)";
          if (variant === "destructive") el.style.background = "#B01433";
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          const el = e.currentTarget;
          Object.assign(el.style, variants[variant]);
        }
      }}
    >
      {loading && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      )}
      {children}
    </button>
  );
}

export function ButtonPage() {
  const [loading, setLoading] = useState(false);

  function simulateLoad() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2200);
  }

  return (
    <DocPage pageId="button"
      title="Button"
      description="Triggers an action or event. Supports multiple visual variants, sizes, loading and disabled states."
      status="stable"
      sourceLink="#"
    >
      <DocSection
        id="variants"
        title="Variants"
        description="Use the appropriate variant to communicate the action's intent and hierarchy."
      >
        <PreviewBox>
          <Btn variant="default">Primary</Btn>
          <Btn variant="secondary">Secondary</Btn>
          <Btn variant="outline">Outline</Btn>
          <Btn variant="ghost">Ghost</Btn>
          <Btn variant="destructive">Destructive</Btn>
        </PreviewBox>
        <CodeBlock
          code={`<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>`}
        />
      </DocSection>

      <DocSection
        id="sizes"
        title="Sizes"
        description="Three standard sizes plus an icon-only variant."
      >
        <PreviewBox>
          <Btn size="sm">Small</Btn>
          <Btn size="md">Medium</Btn>
          <Btn size="lg">Large</Btn>
          <Btn size="icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Btn>
        </PreviewBox>
        <CodeBlock
          code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon"><PlusIcon /></Button>`}
        />
      </DocSection>

      <DocSection
        id="states"
        title="States"
        description="Buttons support disabled and loading states."
      >
        <PreviewBox>
          <Btn disabled>Disabled</Btn>
          <Btn variant="secondary" disabled>Disabled</Btn>
          <Btn variant="outline" disabled>Disabled</Btn>
          <Btn loading={loading} onClick={simulateLoad}>
            {loading ? "Saving…" : "Save changes"}
          </Btn>
        </PreviewBox>
        <CodeBlock
          code={`<Button disabled>Disabled</Button>
<Button loading>Saving…</Button>`}
        />
      </DocSection>

      <DocSection
        id="with-icons"
        title="With icons"
        description="Pair a button label with a leading or trailing icon to reinforce meaning."
      >
        <PreviewBox>
          <Btn>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </Btn>
          <Btn variant="outline">
            Share
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </Btn>
          <Btn variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New item
          </Btn>
        </PreviewBox>
        <CodeBlock
          code={`<Button>
  <DownloadIcon />
  Download
</Button>
<Button variant="outline">
  Share
  <ShareIcon />
</Button>`}
        />
      </DocSection>

      <DocSection id="dark-surface" title="Dark surface">
        <PreviewBox dark>
          <Btn>Primary</Btn>
          <Btn variant="outline">Outline</Btn>
          <Btn variant="ghost">Ghost</Btn>
        </PreviewBox>
      </DocSection>

      <DocSection id="api" title="API Reference">
        <PropsTable
          rows={[
            {
              prop: "variant",
              type: '"default" | "secondary" | "outline" | "ghost" | "destructive"',
              default: '"default"',
              description: "Controls the visual style of the button.",
            },
            {
              prop: "size",
              type: '"sm" | "md" | "lg" | "icon"',
              default: '"md"',
              description: "Sets the button height, padding, and font size.",
            },
            {
              prop: "disabled",
              type: "boolean",
              default: "false",
              description: "Prevents interaction and dims the button.",
            },
            {
              prop: "loading",
              type: "boolean",
              default: "false",
              description: "Replaces the leading icon with a spinner. Implies disabled.",
            },
            {
              prop: "asChild",
              type: "boolean",
              default: "false",
              description: "Renders as a Slot, letting you pass any element as the root.",
            },
            {
              prop: "className",
              type: "string",
              default: "—",
              description: "Additional class names merged onto the root element.",
            },
            {
              prop: "onClick",
              type: "(e: MouseEvent) => void",
              default: "—",
              description: "Handler called on click when not disabled or loading.",
            },
          ]}
        />
      </DocSection>

      <DocSection
        id="accessibility"
        title="Accessibility"
        description="Guidelines for using buttons accessibly."
      >
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
          <li>Buttons render as <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--muted)", padding: "1px 4px", borderRadius: "2px" }}>&lt;button&gt;</code> by default — avoid swapping to <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--muted)", padding: "1px 4px", borderRadius: "2px" }}>&lt;div&gt;</code>.</li>
          <li>Loading state sets <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--muted)", padding: "1px 4px", borderRadius: "2px" }}>aria-busy="true"</code> and <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--muted)", padding: "1px 4px", borderRadius: "2px" }}>aria-disabled="true"</code> automatically.</li>
          <li>Icon-only buttons require an <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--muted)", padding: "1px 4px", borderRadius: "2px" }}>aria-label</code> describing the action.</li>
          <li>All variants meet WCAG AA contrast at every size.</li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
