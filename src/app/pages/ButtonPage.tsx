import { DocPage, DocSection, PreviewBox, CodeBlock, PropsTable } from "../components/DocPage";
import { Button } from "../components/Button";
import { useState } from "react";

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
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
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
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Button>
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
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="outline" disabled>Disabled</Button>
          <Button loading={loading} onClick={simulateLoad}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
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
          <Button>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </Button>
          <Button variant="outline">
            Share
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </Button>
          <Button variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New item
          </Button>
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
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
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
