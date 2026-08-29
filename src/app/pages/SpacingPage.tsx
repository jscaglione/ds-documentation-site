import { DocPage, DocSection } from "../components/DocPage";

const SPACING_SCALE = [
  { name: "0", px: "0px", rem: "0rem", use: "—" },
  { name: "0.5", px: "2px", rem: "0.125rem", use: "Micro gaps, border offsets" },
  { name: "1", px: "4px", rem: "0.25rem", use: "Icon-to-label gaps" },
  { name: "1.5", px: "6px", rem: "0.375rem", use: "Tight badge padding" },
  { name: "2", px: "8px", rem: "0.5rem", use: "Input inner padding (x)" },
  { name: "2.5", px: "10px", rem: "0.625rem", use: "Compact list item padding" },
  { name: "3", px: "12px", rem: "0.75rem", use: "Button padding (x/sm)" },
  { name: "4", px: "16px", rem: "1rem", use: "Card padding, button padding (x/md)" },
  { name: "5", px: "20px", rem: "1.25rem", use: "Section inner spacing" },
  { name: "6", px: "24px", rem: "1.5rem", use: "Layout column gap" },
  { name: "8", px: "32px", rem: "2rem", use: "Card-to-card vertical gap" },
  { name: "10", px: "40px", rem: "2.5rem", use: "Section vertical margin" },
  { name: "12", px: "48px", rem: "3rem", use: "Hero padding" },
  { name: "16", px: "64px", rem: "4rem", use: "Large section gap" },
  { name: "20", px: "80px", rem: "5rem", use: "Page-level top padding" },
];

export function SpacingPage() {
  return (
    <DocPage pageId="spacing"
      title="Spacing"
      description="An 8px base unit scale applied consistently throughout layouts, components, and between elements."
      status="stable"
    >
      <DocSection
        id="scale"
        title="Spacing scale"
        description="All values are multiples of 4px. Most component and layout spacing is a multiple of 8px."
      >
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {SPACING_SCALE.map((step, i) => (
            <div
              key={step.name}
              className="flex items-center gap-4 px-4 py-2.5"
              style={{
                background: i % 2 === 0 ? "var(--card)" : "transparent",
                borderBottom: i < SPACING_SCALE.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ width: "36px", flexShrink: 0 }}>
                <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--primary)" }}>
                  {step.name}
                </code>
              </div>
              <div
                style={{
                  width: `${parseInt(step.px)}px`,
                  height: "16px",
                  background: "var(--primary)",
                  opacity: 0.7,
                  flexShrink: 0,
                  minWidth: step.name === "0" ? "2px" : undefined,
                  borderRadius: "1px",
                }}
              />
              <div style={{ width: "52px", flexShrink: 0 }}>
                <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                  {step.px}
                </code>
              </div>
              <div style={{ width: "52px", flexShrink: 0 }}>
                <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                  {step.rem}
                </code>
              </div>
              <div style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>
                {step.use}
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        id="principles"
        title="Principles"
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
          <li>Prefer multiples of 8px for most spacing decisions.</li>
          <li>Use 4px values only for micro-adjustments inside components.</li>
          <li>Related items should sit closer together than unrelated items (proximity rule).</li>
          <li>Don't use arbitrary pixel values — use the named scale steps only.</li>
          <li>When in doubt, use more whitespace rather than less.</li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
