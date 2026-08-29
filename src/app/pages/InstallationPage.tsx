import { DocPage, DocSection, CodeBlock } from "../components/DocPage";

export function InstallationPage() {
  return (
    <DocPage pageId="installation"
      title="Installation"
      description="Add the design system to your React project in three steps."
      status="stable"
    >
      <DocSection
        id="requirements"
        title="Requirements"
        description="The design system requires these peer dependencies."
      >
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {[
            { dep: "react", version: "^18.0.0" },
            { dep: "react-dom", version: "^18.0.0" },
            { dep: "tailwindcss", version: "^4.0.0" },
          ].map((row, i) => (
            <div
              key={row.dep}
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: i % 2 === 0 ? "var(--card)" : "transparent",
                borderBottom: i < 2 ? "1px solid var(--border)" : "none",
              }}
            >
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--foreground)" }}>
                {row.dep}
              </code>
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>
                {row.version}
              </code>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="install" title="1. Install the package">
        <CodeBlock language="bash" code={`pnpm add @your-org/design-system`} />
      </DocSection>

      <DocSection id="css" title="2. Import the styles">
        <CodeBlock
          language="tsx"
          code={`// src/main.tsx
import "@your-org/design-system/dist/style.css";
import "./styles/fonts.css";`}
        />
      </DocSection>

      <DocSection id="provider" title="3. Wrap with the provider">
        <CodeBlock
          language="tsx"
          code={`import { ThemeProvider } from "@your-org/design-system";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      {/* your app */}
    </ThemeProvider>
  );
}`}
        />
      </DocSection>

      <DocSection
        id="using-components"
        title="Using components"
        description="Import any component from the package root."
      >
        <CodeBlock
          language="tsx"
          code={`import { Button, Input, Card } from "@your-org/design-system";

export function LoginForm() {
  return (
    <Card>
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input label="Password" type="password" />
      <Button variant="default">Sign in</Button>
    </Card>
  );
}`}
        />
      </DocSection>

      <DocSection id="next-steps" title="Next steps">
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
          <li>Read the <strong>Theming</strong> guide to customize tokens for your brand.</li>
          <li>Browse the <strong>Components</strong> section to explore available UI building blocks.</li>
          <li>Check out <strong>Foundations</strong> for color, typography, and spacing guidance.</li>
        </ul>
      </DocSection>
    </DocPage>
  );
}
