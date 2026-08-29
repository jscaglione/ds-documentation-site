import { Link } from "react-router";
import { ArrowRight, Layers, Palette, Type, Grid3x3 } from "lucide-react";
import { EditableText } from "../components/EditableText";

const STATS = [
  { label: "Components", value: "48" },
  { label: "Design tokens", value: "210+" },
  { label: "Figma frames", value: "320+" },
  { label: "Accessibility score", value: "AA" },
];

const QUICK_LINKS = [
  {
    icon: Grid3x3,
    title: "Components",
    description: "Browse all 48 production-ready components",
    path: "/components/button",
    accent: "#2B3FE7",
  },
  {
    icon: Palette,
    title: "Colors",
    description: "Semantic color tokens and usage guidelines",
    path: "/foundations/colors",
    accent: "#0EA875",
  },
  {
    icon: Type,
    title: "Typography",
    description: "Type scale, font families, and text styles",
    path: "/foundations/typography",
    accent: "#F59E0B",
  },
  {
    icon: Layers,
    title: "Getting Started",
    description: "Install and configure the design system",
    path: "/getting-started/installation",
    accent: "#8B5CF6",
  },
];

const RECENT_UPDATES = [
  { label: "Dialog", tag: "Updated", date: "Jul 22, 2026", note: "Added controlled open state" },
  { label: "Button", tag: "Updated", date: "Jul 18, 2026", note: "New loading spinner variant" },
  { label: "Combobox", tag: "New", date: "Jul 10, 2026", note: "Searchable dropdown with async support" },
  { label: "Slider", tag: "Updated", date: "Jul 3, 2026", note: "Range mode and step labels" },
  { label: "Color tokens", tag: "Breaking", date: "Jun 28, 2026", note: "Renamed semantic surface tokens" },
];

export function OverviewPage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12" style={{ paddingBottom: "3rem", borderBottom: "1px solid var(--border)" }}>
        <div
          className="inline-flex items-center gap-1.5 mb-5 px-2.5 py-1"
          style={{
            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
            borderRadius: "var(--radius)",
          }}
        >
          <EditableText
            id="overview-version-badge"
            as="span"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "var(--primary)",
            }}
          >
            Version 2.4.0
          </EditableText>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "2.5rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "var(--foreground)",
            margin: "0 0 1rem",
            maxWidth: "20ch",
          }}
        >
          <EditableText id="overview-hero-title" as="span">
            Build with a consistent design language.
          </EditableText>
        </h1>
        <EditableText
          id="overview-hero-description"
          as="p"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.0625rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.65,
            margin: "0 0 1.75rem",
            maxWidth: "52ch",
          }}
        >
          A component library and token system built for product teams — designed for accessibility, theming, and developer ergonomics.
        </EditableText>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/getting-started/installation"
            className="inline-flex items-center gap-2 px-4 py-2 no-underline transition-all duration-150"
            style={{
              background: "var(--primary)",
              color: "#fff",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#2034CC")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary)")}
          >
            Get started
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/components/button"
            className="inline-flex items-center gap-2 px-4 py-2 no-underline transition-all duration-150"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--secondary)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--card)")}
          >
            Browse components
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {STATS.map(stat => (
          <div
            key={stat.label}
            className="p-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.875rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
                lineHeight: 1,
                marginBottom: "4px",
              }}
            >
              <EditableText
                id={`overview-stat-value-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
                as="span"
              >
                {stat.value}
              </EditableText>
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8125rem",
                color: "var(--muted-foreground)",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-12">
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.125rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--foreground)",
            margin: "0 0 1rem",
          }}
        >
          Explore
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="group flex items-start gap-4 p-4 no-underline transition-all duration-150"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "inherit",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = link.accent;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${link.accent}18`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div
                  className="mt-0.5 w-8 h-8 flex items-center justify-center shrink-0"
                  style={{
                    background: link.accent + "14",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <Icon size={16} style={{ color: link.accent }} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9375rem",
                      fontWeight: 500,
                      color: "var(--foreground)",
                      marginBottom: "2px",
                    }}
                  >
                    {link.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8125rem",
                      color: "var(--muted-foreground)",
                      lineHeight: 1.5,
                    }}
                  >
                    {link.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent updates */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.125rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--foreground)",
            margin: "0 0 1rem",
          }}
        >
          Recent updates
        </h2>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {RECENT_UPDATES.map((update, i) => {
            const tagColors: Record<string, { bg: string; text: string }> = {
              New: { bg: "color-mix(in srgb, var(--primary) 10%, transparent)", text: "var(--primary)" },
              Updated: { bg: "#E8F5EE", text: "#166534" },
              Breaking: { bg: "#FEF2F2", text: "#991B1B" },
            };
            const tc = tagColors[update.tag] || tagColors["Updated"];
            return (
              <div
                key={update.label + i}
                className="flex items-start gap-4 px-4 py-3"
                style={{
                  background: i % 2 === 0 ? "var(--card)" : "transparent",
                  borderBottom: i < RECENT_UPDATES.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--foreground)",
                      }}
                    >
                      {update.label}
                    </span>
                    <span
                      className="px-1.5 py-px"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.5625rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        background: tc.bg,
                        color: tc.text,
                        borderRadius: "var(--radius)",
                      }}
                    >
                      {update.tag}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8125rem",
                      color: "var(--muted-foreground)",
                      marginTop: "2px",
                    }}
                  >
                    {update.note}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {update.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
