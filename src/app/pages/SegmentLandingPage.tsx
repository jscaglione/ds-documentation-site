import { useSegment } from "../contexts/SegmentContext";
import { Link } from "react-router";

export function SegmentLandingPage() {
  const { activeSegment } = useSegment();
  const color = activeSegment.color;

  // First non-overview nav items across all sections for quick links
  const quickLinks = activeSegment.nav
    .flatMap(s => s.items)
    .filter(item => item.path !== activeSegment.defaultPath)
    .slice(0, 6);

  return (
    <div>
      {/* Header */}
      <div className="mb-10" style={{ paddingBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
        <div
          className="inline-flex items-center gap-2 mb-5 px-2.5 py-1"
          style={{
            background: `color-mix(in srgb, ${color} 10%, transparent)`,
            borderRadius: "var(--radius)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color,
            }}
          >
            {activeSegment.label} Platform
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "2.25rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "var(--foreground)",
            margin: "0 0 1rem",
          }}
        >
          {activeSegment.label} Design System
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.0625rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.65,
            margin: 0,
            maxWidth: "52ch",
          }}
        >
          {activeSegment.description}. Browse the sidebar to explore components, foundations, and guidelines specific to this platform.
        </p>
      </div>

      {/* Quick links */}
      <div className="mb-10">
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--foreground)",
            margin: "0 0 12px",
          }}
        >
          Jump in
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickLinks.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 no-underline transition-all duration-100"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "inherit",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = color;
                (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${color} 4%, var(--card))`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.background = "var(--card)";
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                }}
              >
                {item.label}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="ml-auto"
                style={{ color: "var(--muted-foreground)" }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Sections overview */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--foreground)",
            margin: "0 0 12px",
          }}
        >
          Sections
        </h2>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {activeSegment.nav.map((section, i) => (
            <div
              key={section.title}
              className="flex items-start gap-4 px-4 py-3"
              style={{
                borderBottom: i < activeSegment.nav.length - 1 ? "1px solid var(--border)" : "none",
                background: i % 2 === 0 ? "var(--card)" : "transparent",
              }}
            >
              <div style={{ width: "136px", flexShrink: 0, paddingTop: "2px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "var(--foreground)",
                  }}
                >
                  {section.title}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.items.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8125rem",
                      color,
                      textDecoration: "none",
                      background: `color-mix(in srgb, ${color} 8%, transparent)`,
                      padding: "2px 8px",
                      borderRadius: "var(--radius)",
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${color} 16%, transparent)`)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${color} 8%, transparent)`)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
