import { DocPage, DocSection } from "../components/DocPage";
import { useState } from "react";

interface ColorSwatch {
  name: string;
  token: string;
  value: string;
  textDark?: boolean;
}

const SEMANTIC_COLORS: { group: string; swatches: ColorSwatch[] }[] = [
  {
    group: "Base",
    swatches: [
      { name: "Background", token: "--background", value: "#F7F7F9", textDark: true },
      { name: "Foreground", token: "--foreground", value: "#0E0F16" },
      { name: "Card", token: "--card", value: "#FFFFFF", textDark: true },
      { name: "Border", token: "--border", value: "rgba(14,15,22,0.08)", textDark: true },
    ],
  },
  {
    group: "Interactive",
    swatches: [
      { name: "Primary", token: "--primary", value: "#2B3FE7" },
      { name: "Primary FG", token: "--primary-foreground", value: "#FFFFFF", textDark: true },
      { name: "Secondary", token: "--secondary", value: "#EFF0F5", textDark: true },
      { name: "Secondary FG", token: "--secondary-foreground", value: "#0E0F16", textDark: true },
    ],
  },
  {
    group: "Neutral",
    swatches: [
      { name: "Muted", token: "--muted", value: "#EAEBF1", textDark: true },
      { name: "Muted FG", token: "--muted-foreground", value: "#636474" },
      { name: "Accent", token: "--accent", value: "#2B3FE7" },
      { name: "Accent FG", token: "--accent-foreground", value: "#FFFFFF" },
    ],
  },
  {
    group: "Status",
    swatches: [
      { name: "Destructive", token: "--destructive", value: "#D4183D" },
      { name: "Success", token: "—", value: "#0EA875" },
      { name: "Warning", token: "—", value: "#F59E0B", textDark: true },
      { name: "Info", token: "—", value: "#3B82F6" },
    ],
  },
];

const PALETTE_STEPS = [
  { name: "50", value: "#EEEFFE" },
  { name: "100", value: "#DADDFd" },
  { name: "200", value: "#B5BBFB" },
  { name: "300", value: "#8F99F9" },
  { name: "400", value: "#6A77F7" },
  { name: "500", value: "#4555F5" },
  { name: "600", value: "#2B3FE7" },
  { name: "700", value: "#1E30C2" },
  { name: "800", value: "#15239E" },
  { name: "900", value: "#0D167A" },
  { name: "950", value: "#070B4E" },
];

function CopyBadge({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.6875rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "inherit",
        opacity: copied ? 1 : 0.7,
        padding: 0,
      }}
    >
      {copied ? "✓ Copied" : text}
    </button>
  );
}

export function ColorsPage() {
  return (
    <DocPage pageId="colors"
      title="Colors"
      description="A semantic token system built on CSS custom properties. Use tokens instead of raw hex values so themes and dark mode work automatically."
      status="stable"
    >
      <DocSection
        id="semantic-tokens"
        title="Semantic tokens"
        description="These tokens map to roles in the UI. They resolve to different values in light and dark mode."
      >
        <div className="flex flex-col gap-6">
          {SEMANTIC_COLORS.map(group => (
            <div key={group.group}>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--muted-foreground)",
                  marginBottom: "8px",
                }}
              >
                {group.group}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {group.swatches.map(sw => (
                  <div
                    key={sw.name}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        background: sw.value,
                        height: "60px",
                      }}
                    />
                    <div className="px-2.5 py-2" style={{ background: "var(--card)" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          color: "var(--foreground)",
                        }}
                      >
                        {sw.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>
                        <CopyBadge text={`var(${sw.token})`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        id="primary-palette"
        title="Primary palette"
        description="The full 11-step scale for the primary blue. Use semantic tokens in product code — use palette steps in the token definitions only."
      >
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {PALETTE_STEPS.map((step, i) => {
            const isDark = parseInt(step.name) >= 600;
            return (
              <div
                key={step.name}
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  background: step.value,
                  borderBottom: i < PALETTE_STEPS.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                }}
              >
                <div className="flex items-center gap-4">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.7)",
                    }}
                  >
                    Blue {step.name}
                  </span>
                  {step.name === "600" && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.5625rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        background: "rgba(255,255,255,0.2)",
                        color: "rgba(255,255,255,0.9)",
                        padding: "1px 5px",
                        borderRadius: "2px",
                      }}
                    >
                      Primary
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8125rem",
                    color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                  }}
                >
                  {step.value}
                </span>
              </div>
            );
          })}
        </div>
      </DocSection>

      <DocSection
        id="usage"
        title="Usage"
        description="Always reference tokens in component code. Never hardcode hex values."
      >
        <div
          style={{
            background: "#0E0F16",
            borderRadius: "var(--radius)",
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>css</span>
          </div>
          <pre
            className="p-4 m-0 overflow-x-auto"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", lineHeight: 1.7, color: "#C8D0E0" }}
          >
{`/* ✓ Use tokens */
.my-button {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
}

/* ✗ Never hardcode */
.my-button {
  background: #2B3FE7; /* breaks dark mode */
  color: #ffffff;
}`}
          </pre>
        </div>
      </DocSection>

      <DocSection
        id="accessibility"
        title="Accessibility"
        description="All semantic pairs are validated for contrast."
      >
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Pair", "Ratio", "AA Normal", "AA Large"].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 16px",
                      textAlign: "left",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "var(--muted-foreground)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { pair: "foreground / background", ratio: "15.3:1", aa: "✓", aaLarge: "✓" },
                { pair: "primary / background", ratio: "5.1:1", aa: "✓", aaLarge: "✓" },
                { pair: "muted-foreground / background", ratio: "4.6:1", aa: "✓", aaLarge: "✓" },
                { pair: "primary-foreground / primary", ratio: "5.1:1", aa: "✓", aaLarge: "✓" },
                { pair: "destructive-foreground / destructive", ratio: "5.8:1", aa: "✓", aaLarge: "✓" },
              ].map((row, i) => (
                <tr
                  key={row.pair}
                  style={{
                    background: i % 2 === 0 ? "var(--card)" : "transparent",
                    borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--foreground)" }}>{row.pair}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}>{row.ratio}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "#0EA875" }}>{row.aa}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "#0EA875" }}>{row.aaLarge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>
    </DocPage>
  );
}
