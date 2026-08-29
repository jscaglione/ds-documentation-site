import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useEditMode } from "../contexts/EditModeContext";
import { EditableText } from "./EditableText";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const location = useLocation();
  const { isEditing, hiddenTocIds, hideTocItem, restoreAllTocItems } = useEditMode();

  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("#doc-content h2[id], #doc-content h3[id]")
      );
      setHeadings(
        elements.map(el => ({
          id: el.id,
          text: el.textContent || "",
          level: parseInt(el.tagName[1]),
        }))
      );
      setActiveId(elements[0]?.id || "");
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Re-read heading text after edits settle (heading text may have changed)
  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => {
      setHeadings(prev =>
        prev.map(h => {
          const el = document.getElementById(h.id);
          return el ? { ...h, text: el.textContent || h.text } : h;
        })
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [isEditing]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      "#doc-content h2[id], #doc-content h3[id]"
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-56px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const visibleHeadings = headings.filter(h => !hiddenTocIds.has(h.id));

  if (headings.length === 0) return null;

  return (
    <aside
      className="hidden xl:block fixed right-0 w-52 bottom-0 overflow-y-auto py-6 px-4"
      style={{
        top: "96px",
        borderLeft: "1px solid var(--border)",
        // Subtle amber tint in edit mode to match content area
        background: isEditing
          ? "color-mix(in srgb, #F59E0B 2.5%, var(--background))"
          : "var(--background)",
        transition: "background 0.3s ease",
      }}
    >
      {/* "On this page" header */}
      <div className="flex items-center justify-between mb-3">
        <EditableText
          id="toc-header-label"
          as="p"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.6875rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--muted-foreground)",
            margin: 0,
          }}
        >
          On this page
        </EditableText>

        {/* Hidden count badge in edit mode */}
        {isEditing && hiddenTocIds.size > 0 && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.5625rem",
              fontWeight: 600,
              background: "#FFF7ED",
              color: "#9A3412",
              padding: "1px 5px",
              borderRadius: "2px",
            }}
          >
            {hiddenTocIds.size} hidden
          </span>
        )}
      </div>

      <nav>
        {visibleHeadings.length === 0 && isEditing ? (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
              fontStyle: "italic",
            }}
          >
            All sections hidden
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {visibleHeadings.map(heading => {
              const isActive = activeId === heading.id;
              const indented = heading.level === 3;

              return (
                <li key={heading.id} className="group/toc-item flex items-center gap-1">
                  {/* Delete button — edit mode only */}
                  {isEditing && (
                    <button
                      onClick={() => hideTocItem(heading.id)}
                      title="Remove from table of contents"
                      style={{
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "none",
                        border: "1px solid var(--border)",
                        borderRadius: "2px",
                        cursor: "pointer",
                        flexShrink: 0,
                        color: "var(--muted-foreground)",
                        padding: 0,
                        transition: "all 0.1s ease",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "#FEE2E2";
                        el.style.borderColor = "#D4183D";
                        el.style.color = "#D4183D";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "none";
                        el.style.borderColor = "var(--border)";
                        el.style.color = "var(--muted-foreground)";
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  )}

                  <a
                    href={`#${heading.id}`}
                    onClick={e => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
                      setActiveId(heading.id);
                    }}
                    className="flex-1 block py-1 transition-colors duration-100"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8125rem",
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                      textDecoration: "none",
                      lineHeight: "1.4",
                      paddingLeft: indented ? "10px" : "6px",
                      borderLeft: isActive
                        ? "2px solid var(--primary)"
                        : "2px solid transparent",
                    }}
                    onMouseEnter={e => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
                    }}
                    onMouseLeave={e => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Restore all — edit mode when items are hidden */}
      {isEditing && hiddenTocIds.size > 0 && (
        <button
          onClick={restoreAllTocItems}
          style={{
            marginTop: "12px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.6875rem",
            color: "var(--primary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            textUnderlineOffset: "2px",
          }}
        >
          Restore all
        </button>
      )}
    </aside>
  );
}
