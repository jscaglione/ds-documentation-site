import { DocPage } from "../components/DocPage";
import type { ChangelogEntry } from "../../design-systems/types";

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  added: { label: "Added", color: "#166534", bg: "#E8F5EE" },
  changed: { label: "Changed", color: "#1D4ED8", bg: "#EFF3FF" },
  fixed: { label: "Fixed", color: "#6B21A8", bg: "#F5F0FF" },
  deprecated: { label: "Deprecated", color: "#9A3412", bg: "#FFF7ED" },
  removed: { label: "Removed", color: "#991B1B", bg: "#FEF2F2" },
  breaking: { label: "Breaking", color: "#7F1D1D", bg: "#FEE2E2" },
};

const TAG_STYLES: Record<string, { color: string; bg: string }> = {
  major: { color: "#7F1D1D", bg: "#FEE2E2" },
  minor: { color: "#1E3A6E", bg: "#DBEAFE" },
  patch: { color: "#166534", bg: "#DCFCE7" },
};

export function ChangelogPage({
  pageId = "changelog",
  entries,
  systemLabel,
}: {
  pageId?: string;
  entries: ChangelogEntry[];
  systemLabel?: string;
}) {

  return (
    <DocPage pageId={pageId}
      title="Changelog"
      description={systemLabel
        ? `Release history for ${systemLabel}. Breaking changes are flagged explicitly.`
        : "Every release, in reverse chronological order. Breaking changes are flagged explicitly."}
    >
      {entries.length === 0 ? (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", color: "var(--muted-foreground)", margin: 0 }}>
          No releases published yet.
        </p>
      ) : (
      <div className="flex flex-col gap-0">
        {entries.map((entry, entryIdx) => {
          const tagStyle = TAG_STYLES[entry.tag];
          const isLast = entryIdx === entries.length - 1;

          return (
            <div key={entry.version} className="relative flex gap-6">
              {/* Timeline spine */}
              <div className="flex flex-col items-center" style={{ width: "20px", flexShrink: 0 }}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: entry.tag === "major" ? "var(--foreground)" : entry.tag === "minor" ? "var(--primary)" : "var(--muted-foreground)",
                    flexShrink: 0,
                    marginTop: "6px",
                    boxShadow: entry.tag === "major" ? "0 0 0 3px color-mix(in srgb, var(--foreground) 15%, transparent)" : undefined,
                  }}
                />
                {!isLast && (
                  <div
                    style={{
                      width: "1px",
                      flex: 1,
                      background: "var(--border)",
                      marginTop: "6px",
                    }}
                  />
                )}
              </div>

              {/* Entry content */}
              <div className="flex-1 pb-10">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2
                    id={`v${entry.version.replace(/\./g, "-")}`}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "1.0625rem",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      margin: 0,
                      scrollMarginTop: "80px",
                    }}
                  >
                    v{entry.version}
                  </h2>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.5625rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      background: tagStyle.bg,
                      color: tagStyle.color,
                      padding: "2px 6px",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    {entry.tag}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8125rem",
                      color: "var(--muted-foreground)",
                      marginLeft: "4px",
                    }}
                  >
                    {entry.date}
                  </span>
                </div>

                {/* Summary */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9375rem",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                    margin: "4px 0 16px",
                  }}
                >
                  {entry.summary}
                </p>

                {/* Change groups */}
                <div className="flex flex-col gap-4">
                  {entry.changes.map((group) => {
                    const typeStyle = TYPE_LABELS[group.type];
                    return (
                      <div key={group.type}>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              background: typeStyle.bg,
                              color: typeStyle.color,
                              padding: "2px 7px",
                              borderRadius: "var(--radius)",
                            }}
                          >
                            {typeStyle.label}
                          </span>
                        </div>
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: "1.1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {group.items.map((item, i) => (
                            <li
                              key={i}
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.875rem",
                                color: "var(--foreground)",
                                lineHeight: 1.6,
                              }}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </DocPage>
  );
}
