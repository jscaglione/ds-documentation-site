import { DocPage, DocSection, CodeBlock } from "../components/DocPage";

export function ThemingPage() {
  return (
    <DocPage pageId="theming"
      title="Theming"
      description="Override CSS custom properties to apply your brand color, radius, and typography to all components instantly."
      status="stable"
    >
      <DocSection
        id="how-it-works"
        title="How it works"
        description="Every component reads from a flat set of CSS custom properties. Override them in your own stylesheet and the changes cascade everywhere."
      >
        <CodeBlock
          language="css"
          code={`/* src/styles/theme.css */
:root {
  /* Replace with your brand's primary color */
  --primary: #7C3AED;
  --primary-foreground: #FFFFFF;

  /* Tighten or loosen border radius */
  --radius: 0.5rem;

  /* Override background for a slightly warm feel */
  --background: #FDFCFB;
  --card: #FFFFFF;
}`}
        />
      </DocSection>

      <DocSection
        id="dark-mode"
        title="Dark mode"
        description="Add a .dark block to define dark-mode overrides. Apply the dark class to the html element to activate."
      >
        <CodeBlock
          language="css"
          code={`.dark {
  --background: #0D0D0D;
  --foreground: #F5F5F5;
  --card: #181818;
  --border: rgba(255, 255, 255, 0.08);
  --primary: #7C3AED;
  --primary-foreground: #FFFFFF;
  --muted: #242424;
  --muted-foreground: #8A8A8A;
}`}
        />
        <div style={{ marginTop: "16px" }}>
          <CodeBlock
            language="tsx"
            code={`// Toggle dark mode
document.documentElement.classList.toggle("dark");`}
          />
        </div>
      </DocSection>

      <DocSection
        id="typography"
        title="Typography overrides"
        description="Set your own font family by overriding the font variables."
      >
        <CodeBlock
          language="css"
          code={`/* src/styles/fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}`}
        />
      </DocSection>

      <DocSection
        id="token-reference"
        title="Token reference"
        description="All overridable tokens and their default values."
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
                {["Token", "Default", "Usage"].map(h => (
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
                { token: "--primary", default: "#2B3FE7", usage: "Main interactive color" },
                { token: "--background", default: "#F7F7F9", usage: "Page background" },
                { token: "--card", default: "#FFFFFF", usage: "Surface / card background" },
                { token: "--foreground", default: "#0E0F16", usage: "Primary text" },
                { token: "--muted-foreground", default: "#636474", usage: "Secondary text, labels" },
                { token: "--border", default: "rgba(14,15,22,0.08)", usage: "Dividers, input borders" },
                { token: "--radius", default: "0.25rem", usage: "Base border radius" },
                { token: "--font-sans", default: "'Plus Jakarta Sans'", usage: "UI text family" },
                { token: "--font-mono", default: "'JetBrains Mono'", usage: "Code, labels, tabular data" },
              ].map((row, i) => (
                <tr
                  key={row.token}
                  style={{
                    background: i % 2 === 0 ? "var(--card)" : "transparent",
                    borderBottom: i < 8 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <td style={{ padding: "10px 16px" }}>
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--primary)" }}>
                      {row.token}
                    </code>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                      {row.default}
                    </code>
                  </td>
                  <td style={{ padding: "10px 16px", fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--foreground)" }}>
                    {row.usage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>
    </DocPage>
  );
}
