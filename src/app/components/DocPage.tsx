import { ReactNode, useState } from "react";
import { useLocation } from "react-router";
import { EditableText } from "./EditableText";
import { StorybookEmbedSection } from "./StorybookEmbedSection";
import { isComponentDocsPath } from "../lib/storybook";

interface DocPageProps {
  /** Stable slug used as the base for edit storage keys, e.g. "button". */
  pageId: string;
  title: string;
  description: string;
  status?: "stable" | "beta" | "deprecated" | "new";
  sourceLink?: string;
  children: ReactNode;
}

export function DocPage({ pageId, title, description, status, sourceLink, children }: DocPageProps) {
  const { pathname } = useLocation();
  const statusColors: Record<string, { bg: string; text: string }> = {
    stable: { bg: "#E8F5EE", text: "#166534" },
    beta: { bg: "#FFF7ED", text: "#9A3412" },
    deprecated: { bg: "#FEF2F2", text: "#991B1B" },
    new: { bg: "color-mix(in srgb, var(--primary) 10%, transparent)", text: "var(--primary)" },
  };
  const statusStyle = status ? statusColors[status] : null;

  return (
    <div>
      {/* Page header */}
      <div className="mb-10" style={{ paddingBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-start gap-3 flex-wrap mb-3">
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
            <EditableText id={`${pageId}-title`} as="span">
              {title}
            </EditableText>
          </h1>
          {status && statusStyle && (
            <span
              className="mt-1.5 px-2 py-0.5"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: statusStyle.bg,
                color: statusStyle.text,
                borderRadius: "var(--radius)",
              }}
            >
              {status}
            </span>
          )}
        </div>
        <EditableText
          id={`${pageId}-description`}
          as="p"
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
        </EditableText>
        {sourceLink && (
          <div className="mt-4 flex items-center gap-3">
            <a
              href={sourceLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8125rem",
                color: "var(--primary)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View source ↗
            </a>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-12">
        {isComponentDocsPath(pathname) && <StorybookEmbedSection />}
        {children}
      </div>
    </div>
  );
}

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function DocSection({ id, title, description, children }: SectionProps) {
  return (
    <section>
      <h2
        id={id}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1.25rem",
          fontWeight: 600,
          letterSpacing: "-0.015em",
          color: "var(--foreground)",
          margin: "0 0 0.5rem",
          scrollMarginTop: "80px",
        }}
      >
        <EditableText id={`section-${id}-title`} as="span">
          {title}
        </EditableText>
      </h2>
      {description && (
        <EditableText
          id={`section-${id}-description`}
          as="p"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            color: "var(--muted-foreground)",
            margin: "0 0 1.25rem",
            lineHeight: 1.6,
          }}
        >
          {description}
        </EditableText>
      )}
      {children}
    </section>
  );
}

interface PreviewBoxProps {
  children: ReactNode;
  label?: string;
  dark?: boolean;
}

export function PreviewBox({ children, label, dark }: PreviewBoxProps) {
  return (
    <div>
      {label && (
        <div
          className="px-3 py-1.5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            fontWeight: 500,
            color: "var(--muted-foreground)",
            letterSpacing: "0.03em",
            background: "var(--muted)",
            borderRadius: "var(--radius) var(--radius) 0 0",
            borderTop: "1px solid var(--border)",
            borderLeft: "1px solid var(--border)",
            borderRight: "1px solid var(--border)",
          }}
        >
          {label}
        </div>
      )}
      <div
        className="flex items-center justify-center flex-wrap gap-4 p-8"
        style={{
          background: dark ? "#0E0F16" : "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: label ? `0 0 var(--radius) var(--radius)` : "var(--radius)",
          minHeight: "120px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="relative group"
      style={{
        background: "#0E0F16",
        borderRadius: "var(--radius)",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="px-2 py-1 transition-all duration-150"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: copied ? "#0EA875" : "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: "pointer",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={e => {
            if (!copied) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto p-4 m-0"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.8125rem",
          lineHeight: "1.7",
          color: "#C8D0E0",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface PropsTableRow {
  prop: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

interface PropsTableProps {
  rows: PropsTableRow[];
}

export function PropsTable({ rows }: PropsTableProps) {
  return (
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
            {["Prop", "Type", "Default", "Description"].map(h => (
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
          {rows.map((row, i) => (
            <tr
              key={row.prop}
              style={{
                background: i % 2 === 0 ? "var(--card)" : "transparent",
                borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <td style={{ padding: "10px 16px" }}>
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8125rem",
                    color: "var(--primary)",
                  }}
                >
                  {row.prop}
                </code>
                {row.required && (
                  <span style={{ color: "#D4183D", marginLeft: "4px", fontSize: "0.75rem" }}>*</span>
                )}
              </td>
              <td style={{ padding: "10px 16px" }}>
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    background: "var(--muted)",
                    padding: "1px 5px",
                    borderRadius: "2px",
                  }}
                >
                  {row.type}
                </code>
              </td>
              <td style={{ padding: "10px 16px" }}>
                {row.default ? (
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {row.default}
                  </code>
                ) : (
                  <span style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>—</span>
                )}
              </td>
              <td
                style={{
                  padding: "10px 16px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8125rem",
                  color: "var(--foreground)",
                  lineHeight: 1.5,
                }}
              >
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

