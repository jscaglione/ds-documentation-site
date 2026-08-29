import { DocPage, DocSection, CodeBlock } from "../components/DocPage";

const TYPE_SCALE = [
  { name: "Display", size: "2.5rem", weight: 700, letterSpacing: "-0.03em", lineHeight: "1.15", sample: "Build with a consistent design language." },
  { name: "Heading 1", size: "1.875rem", weight: 600, letterSpacing: "-0.025em", lineHeight: "1.2", sample: "Component documentation" },
  { name: "Heading 2", size: "1.375rem", weight: 600, letterSpacing: "-0.015em", lineHeight: "1.3", sample: "API Reference" },
  { name: "Heading 3", size: "1.125rem", weight: 600, letterSpacing: "-0.01em", lineHeight: "1.4", sample: "Props & configuration" },
  { name: "Body Large", size: "1.0625rem", weight: 400, letterSpacing: "0", lineHeight: "1.65", sample: "A component library and token system built for product teams — designed for accessibility, theming, and developer ergonomics." },
  { name: "Body", size: "0.9375rem", weight: 400, letterSpacing: "0", lineHeight: "1.6", sample: "Use the appropriate variant to communicate the action's intent and visual hierarchy within a page." },
  { name: "Body Small", size: "0.875rem", weight: 400, letterSpacing: "0", lineHeight: "1.55", sample: "Controls the visual style of the button component." },
  { name: "Label", size: "0.8125rem", weight: 500, letterSpacing: "0", lineHeight: "1.5", sample: "Primary action" },
  { name: "Caption", size: "0.75rem", weight: 400, letterSpacing: "0", lineHeight: "1.5", sample: "Last updated Jul 22, 2026" },
  { name: "Overline", size: "0.6875rem", weight: 600, letterSpacing: "0.07em", lineHeight: "1.4", sample: "COMPONENTS — GETTING STARTED" },
  { name: "Code", size: "0.8125rem", weight: 400, letterSpacing: "0.01em", lineHeight: "1.7", mono: true, sample: "import { Button } from '@ds/ui'" },
];

export function TypographyPage() {
  return (
    <DocPage pageId="typography"
      title="Typography"
      description="A structured type scale using Plus Jakarta Sans for UI text and JetBrains Mono for code. Every step is defined as a named style, not a raw utility class."
      status="stable"
    >
      <DocSection
        id="fonts"
        title="Typefaces"
        description="Two families cover all text in the system."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              family: "Plus Jakarta Sans",
              role: "UI / display",
              variable: "--font-sans",
              weights: ["300", "400", "500", "600", "700"],
              sample: "AaBbCcDd 0123",
            },
            {
              family: "JetBrains Mono",
              role: "Code / labels",
              variable: "--font-mono",
              weights: ["400", "500"],
              sample: "const x = 42;",
              mono: true,
            },
          ].map(font => (
            <div
              key={font.family}
              className="p-5"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <div
                style={{
                  fontFamily: font.mono ? "var(--font-mono)" : "var(--font-sans)",
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  letterSpacing: "-0.02em",
                  marginBottom: "12px",
                  lineHeight: 1.1,
                }}
              >
                {font.sample}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "2px" }}>
                {font.family}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", marginBottom: "10px" }}>
                {font.role}
              </div>
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 8%, transparent)", padding: "2px 6px", borderRadius: "2px" }}>
                {font.variable}
              </code>
              <div className="flex gap-2 mt-3 flex-wrap">
                {font.weights.map(w => (
                  <span
                    key={w}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      background: "var(--muted)",
                      color: "var(--muted-foreground)",
                      padding: "2px 6px",
                      borderRadius: "2px",
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        id="scale"
        title="Type scale"
        description="Every text style in the design system. Apply these as named styles in Figma, not raw CSS values in components."
      >
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {TYPE_SCALE.map((style, i) => (
            <div
              key={style.name}
              className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4"
              style={{
                borderBottom: i < TYPE_SCALE.length - 1 ? "1px solid var(--border)" : "none",
                background: i % 2 === 0 ? "var(--card)" : "transparent",
              }}
            >
              <div className="sm:w-28 shrink-0">
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {style.name}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted-foreground)", opacity: 0.7 }}>
                  {style.size} / {style.weight}
                </div>
              </div>
              <div
                style={{
                  fontFamily: style.mono ? "var(--font-mono)" : "var(--font-sans)",
                  fontSize: style.size,
                  fontWeight: style.weight,
                  letterSpacing: style.letterSpacing,
                  lineHeight: style.lineHeight,
                  color: "var(--foreground)",
                  flex: 1,
                  wordBreak: "break-word",
                }}
              >
                {style.sample}
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        id="usage"
        title="Usage"
        description="Use CSS variable tokens and semantic HTML elements — not raw Tailwind font utilities."
      >
        <CodeBlock
          language="tsx"
          code={`// ✓ Semantic heading with token
<h2 style={{
  fontFamily: "var(--font-sans)",
  fontSize: "1.375rem",
  fontWeight: 600,
  letterSpacing: "-0.015em",
  color: "var(--foreground)",
}}>
  API Reference
</h2>

// ✓ Body text
<p style={{
  fontFamily: "var(--font-sans)",
  fontSize: "0.9375rem",
  lineHeight: 1.6,
  color: "var(--muted-foreground)",
}}>
  Component description here.
</p>

// ✓ Code block
<code style={{
  fontFamily: "var(--font-mono)",
  fontSize: "0.8125rem",
  background: "var(--muted)",
  padding: "1px 4px",
  borderRadius: "2px",
}}>
  variant="default"
</code>`}
        />
      </DocSection>

      <DocSection
        id="hierarchy"
        title="Hierarchy guidelines"
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
          <li>Use Display only for page heroes and splash screens — not for section headings.</li>
          <li>Keep body text at Body or Body Large. Avoid mixing sizes within a single paragraph block.</li>
          <li>Overline is for categorical labels above headings only — never as standalone text.</li>
          <li>Code/mono is reserved for technical content: prop values, token names, file paths, code samples.</li>
          <li>Don't exceed three font weights on a single screen.</li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
