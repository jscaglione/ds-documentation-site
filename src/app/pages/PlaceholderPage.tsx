import { Link, useLocation } from "react-router";
import { StorybookEmbedSection } from "../components/StorybookEmbedSection";
import { isComponentDocsPath } from "../lib/storybook";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const SUGGESTIONS = [
  "Overview with usage guidelines",
  "Interactive preview with all variants",
  "Props / API reference table",
  "Accessibility notes",
  "Code examples",
];

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const { pathname } = useLocation();

  return (
    <div>
      {/* Page header */}
      <div className="mb-10" style={{ paddingBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-start gap-3 mb-3">
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.875rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "var(--foreground)",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h1>
          <span
            className="mt-1.5 px-2 py-0.5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: "#FFF7ED",
              color: "#9A3412",
              borderRadius: "var(--radius)",
            }}
          >
            Coming soon
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.0625rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.65,
            margin: 0,
            maxWidth: "56ch",
          }}
        >
          {description}
        </p>
      </div>

      {isComponentDocsPath(pathname) && (
        <div className="mb-12">
          <StorybookEmbedSection />
        </div>
      )}

      {/* Placeholder content */}
      <div
        className="flex flex-col items-center justify-center py-16 px-8 text-center"
        style={{
          background: "var(--card)",
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius)",
        }}
      >
        <div
          className="w-12 h-12 flex items-center justify-center mb-4"
          style={{
            background: "color-mix(in srgb, var(--primary) 8%, transparent)",
            borderRadius: "var(--radius)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--primary)" }}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--foreground)",
            margin: "0 0 6px",
          }}
        >
          This page is in progress
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            color: "var(--muted-foreground)",
            maxWidth: "36ch",
            lineHeight: 1.6,
            margin: "0 0 20px",
          }}
        >
          Documentation for <strong>{title}</strong> will include:
        </p>
        <ul
          className="text-left"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.7,
            margin: "0 0 24px",
          }}
        >
          {SUGGESTIONS.map(s => (
            <li key={s}>— {s}</li>
          ))}
        </ul>
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--primary)",
            textDecoration: "none",
          }}
        >
          ← Back to overview
        </Link>
      </div>
    </div>
  );
}
