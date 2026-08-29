import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { useSegment } from "../contexts/SegmentContext";
import { useEditMode } from "../contexts/EditModeContext";
import { EditableText } from "./EditableText";

/**
 * Inline rename input — mounts focused with cursor at end.
 * Stops click propagation so the parent nav-row doesn't navigate while typing.
 */
function RenameInput({
  initialValue,
  onCommit,
}: {
  initialValue: string;
  onCommit: (text: string) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = initialValue;
    ref.current.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel) {
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);
  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onClick={e => e.stopPropagation()}
      style={{
        flex: 1,
        fontFamily: "var(--font-sans)",
        fontSize: "0.8125rem",
        fontWeight: 400,
        outline: "none",
        caretColor: "var(--primary)",
        background: "color-mix(in srgb, var(--primary) 5%, transparent)",
        borderRadius: "3px",
        padding: "1px 3px",
        boxShadow: "0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)",
        minWidth: "1ch",
      }}
      onBlur={e => onCommit(e.currentTarget.textContent || "")}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}

/** Minus icon button — stops propagation so parent row click (navigate) doesn't fire. */
function DeleteButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={title}
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
  );
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

/** Stable key for a nav item's label edit. */
function navLabelId(path: string) {
  return `nav-label-${path}`;
}

/** Stable key for a section title edit. */
function navSectionId(segmentId: string, title: string) {
  return `nav-section-${segmentId}-${title.toLowerCase().replace(/\s+/g, "-")}`;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSegment } = useSegment();
  const {
    isEditing, getContent, setContent,
    hiddenNavItems, hideNavItem,
    addedNavItems, addNavItem, removeAddedNavItem,
  } = useEditMode();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // edit id of the item currently being renamed (double-click to rename)
  const [renamingEditId, setRenamingEditId] = useState<string | null>(null);

  useEffect(() => { setCollapsed({}); setRenamingEditId(null); }, [activeSegment.id]);

  function toggleSection(title: string) {
    setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));
  }

  function isSectionActive(sectionItems: { path: string }[]) {
    return sectionItems.some(item =>
      item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
    );
  }

  function isItemActive(path: string) {
    return path === "/" ? location.pathname === "/" : location.pathname === path;
  }

  const accentColor = activeSegment.color;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ top: "96px", background: "rgba(14,15,22,0.3)", backdropFilter: "blur(2px)" }}
          onClick={onMobileClose}
        />
      )}

      <aside
        className="fixed bottom-0 left-0 z-40 w-60 overflow-y-auto flex flex-col transition-transform duration-200 md:translate-x-0"
        style={{
          top: "96px",
          background: isEditing
            ? `color-mix(in srgb, #F59E0B 2.5%, var(--sidebar))`
            : "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
          transform: isMobileOpen ? "translateX(0)" : undefined,
          transition: "background 0.3s ease, transform 0.2s ease",
        }}
      >
        {/* Segment indicator strip */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            borderBottom: "1px solid var(--sidebar-border)",
            background: `color-mix(in srgb, ${accentColor} 5%, var(--sidebar))`,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: accentColor,
              flexShrink: 0,
            }}
          />
          <EditableText
            id={`segment-label-${activeSegment.id}`}
            as="span"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: accentColor,
            }}
          >
            {activeSegment.label}
          </EditableText>

          {/* Edit mode badge */}
          {isEditing && (
            <span
              className="ml-auto"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.5rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#92400E",
                background: "#FEF3C7",
                padding: "1px 5px",
                borderRadius: "2px",
              }}
            >
              Editing
            </span>
          )}
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-3 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div
            className="flex items-center gap-2 px-2.5 h-8"
            style={{ background: "var(--muted)", borderRadius: "var(--radius)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--muted-foreground)" }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search…"
              className="flex-1 bg-transparent outline-none border-none"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--foreground)" }}
            />
          </div>
        </div>

        <nav className="flex-1 py-4 px-2">
          {activeSegment.nav.map((section) => {
            const isOpen = !collapsed[section.title];
            const sectionKey = `${activeSegment.id}:${section.title}`;
            const sectionEditId = navSectionId(activeSegment.id, section.title);

            // Filter out hidden items for this section
            const visibleItems = section.items.filter(
              item => !hiddenNavItems.has(`${activeSegment.id}:${item.path}`)
            );
            const sectionAddedItems = addedNavItems.filter(
              item => item.sectionKey === sectionKey
            );
            const active = isSectionActive(visibleItems);

            return (
              <div key={section.title} className="mb-1">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-2.5 h-7 mb-0.5 transition-colors duration-100"
                  style={{ borderRadius: "var(--radius)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--sidebar-accent)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {isEditing ? (
                    <EditableText
                      id={sectionEditId}
                      as="span"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: active ? accentColor : "var(--muted-foreground)",
                      }}
                    >
                      {section.title}
                    </EditableText>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: active ? accentColor : "var(--muted-foreground)",
                      }}
                    >
                      {getContent(sectionEditId, section.title)}
                    </span>
                  )}
                  <ChevronDown
                    size={12}
                    style={{
                      color: "var(--muted-foreground)",
                      transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.15s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {isOpen && (
                  <ul className="mb-1">
                    {/* Existing items (filtered by hidden) */}
                    {visibleItems.map((item) => {
                      const itemActive = isItemActive(item.path);
                      const labelEditId = navLabelId(item.path);
                      const isRenaming = isEditing && renamingEditId === labelEditId;

                      if (isEditing) {
                        return (
                          <li key={item.path}>
                            <div
                              className="flex items-center gap-1 h-8 w-full cursor-pointer select-none"
                              style={{
                                paddingLeft: "10px",
                                paddingRight: "6px",
                                borderRadius: "var(--radius)",
                                background: itemActive
                                  ? `color-mix(in srgb, ${accentColor} 8%, transparent)`
                                  : "transparent",
                                borderLeft: itemActive ? `2px solid ${accentColor}` : "2px solid transparent",
                                transition: "background 0.1s",
                              }}
                              onClick={() => navigate(item.path)}
                              onMouseEnter={e => {
                                if (!itemActive)
                                  (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)";
                              }}
                              onMouseLeave={e => {
                                if (!itemActive)
                                  (e.currentTarget as HTMLElement).style.background = "transparent";
                              }}
                            >
                              {isRenaming ? (
                                <RenameInput
                                  initialValue={getContent(labelEditId, item.label)}
                                  onCommit={(text) => {
                                    setContent(labelEditId, text);
                                    setRenamingEditId(null);
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    flex: 1,
                                    fontFamily: "var(--font-sans)",
                                    fontSize: "0.8125rem",
                                    fontWeight: itemActive ? 500 : 400,
                                    color: itemActive ? accentColor : "var(--sidebar-foreground)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  onDoubleClick={e => {
                                    e.stopPropagation();
                                    setRenamingEditId(labelEditId);
                                  }}
                                  title="Double-click to rename"
                                >
                                  {getContent(labelEditId, item.label)}
                                </span>
                              )}
                              {!isRenaming && (
                                <DeleteButton
                                  onClick={() => hideNavItem(activeSegment.id, item.path)}
                                  title="Remove from sidebar"
                                />
                              )}
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li key={item.path}>
                          <NavLink
                            to={item.path}
                            end={item.path === "/"}
                            onClick={onMobileClose}
                            className="flex items-center gap-2 px-2.5 h-8 w-full no-underline transition-colors duration-100"
                            style={({ isActive }) => ({
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.8125rem",
                              fontWeight: isActive ? 500 : 400,
                              color: isActive ? accentColor : "var(--sidebar-foreground)",
                              background: isActive
                                ? `color-mix(in srgb, ${accentColor} 8%, transparent)`
                                : "transparent",
                              borderRadius: "var(--radius)",
                              borderLeft: isActive ? `2px solid ${accentColor}` : "2px solid transparent",
                              paddingLeft: "10px",
                            })}
                            onMouseEnter={e => {
                              if (!e.currentTarget.classList.contains("active"))
                                e.currentTarget.style.background = "var(--sidebar-accent)";
                            }}
                            onMouseLeave={e => {
                              if (!e.currentTarget.classList.contains("active"))
                                e.currentTarget.style.background = "transparent";
                            }}
                          >
                            {getContent(labelEditId, item.label)}
                            {item.badge && (
                              <span
                                className="ml-auto px-1.5 py-px"
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.5625rem",
                                  fontWeight: 500,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  background: accentColor,
                                  color: "#fff",
                                  borderRadius: "var(--radius)",
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        </li>
                      );
                    })}

                    {/* Added items for this section */}
                    {sectionAddedItems.map((addedItem) => {
                      const labelEditId = `nav-label-added-${addedItem.id}`;
                      const label = getContent(labelEditId, "New page");
                      const draftPath = `/drafts/${addedItem.id}`;
                      const draftActive = location.pathname === draftPath;
                      const isRenaming = isEditing && renamingEditId === labelEditId;

                      if (isEditing) {
                        return (
                          <li key={addedItem.id}>
                            <div
                              className="flex items-center gap-1 h-8 w-full cursor-pointer select-none"
                              style={{
                                paddingLeft: "10px",
                                paddingRight: "6px",
                                borderRadius: "var(--radius)",
                                background: draftActive
                                  ? `color-mix(in srgb, ${accentColor} 8%, transparent)`
                                  : "transparent",
                                borderLeft: draftActive ? `2px solid ${accentColor}` : "2px solid transparent",
                                transition: "background 0.1s",
                              }}
                              onClick={() => navigate(draftPath)}
                              onMouseEnter={e => {
                                if (!draftActive)
                                  (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)";
                              }}
                              onMouseLeave={e => {
                                if (!draftActive)
                                  (e.currentTarget as HTMLElement).style.background = "transparent";
                              }}
                            >
                              {isRenaming ? (
                                <RenameInput
                                  initialValue={label}
                                  onCommit={(text) => {
                                    setContent(labelEditId, text);
                                    setRenamingEditId(null);
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    flex: 1,
                                    fontFamily: "var(--font-sans)",
                                    fontSize: "0.8125rem",
                                    fontWeight: draftActive ? 500 : 400,
                                    color: draftActive ? accentColor : "var(--sidebar-foreground)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  onDoubleClick={e => {
                                    e.stopPropagation();
                                    setRenamingEditId(labelEditId);
                                  }}
                                  title="Double-click to rename"
                                >
                                  {label}
                                </span>
                              )}
                              {!isRenaming && (
                                <DeleteButton
                                  onClick={() => removeAddedNavItem(addedItem.id)}
                                  title="Remove this page"
                                />
                              )}
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li key={addedItem.id}>
                          <NavLink
                            to={draftPath}
                            onClick={onMobileClose}
                            className="flex items-center gap-2 px-2.5 h-8 w-full no-underline transition-colors duration-100"
                            style={({ isActive }) => ({
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.8125rem",
                              fontWeight: isActive ? 500 : 400,
                              color: isActive ? accentColor : "var(--sidebar-foreground)",
                              background: isActive
                                ? `color-mix(in srgb, ${accentColor} 8%, transparent)`
                                : "transparent",
                              borderRadius: "var(--radius)",
                              borderLeft: isActive ? `2px solid ${accentColor}` : "2px solid transparent",
                              paddingLeft: "10px",
                            })}
                            onMouseEnter={e => {
                              if (!e.currentTarget.classList.contains("active"))
                                e.currentTarget.style.background = "var(--sidebar-accent)";
                            }}
                            onMouseLeave={e => {
                              if (!e.currentTarget.classList.contains("active"))
                                e.currentTarget.style.background = "transparent";
                            }}
                          >
                            {label}
                          </NavLink>
                        </li>
                      );
                    })}

                    {/* Add page button — edit mode only */}
                    {isEditing && (
                      <li>
                        <button
                          onClick={() => {
                            const newId = addNavItem(activeSegment.id, section.title);
                            // Immediately open rename for the new item
                            setRenamingEditId(`nav-label-added-${newId}`);
                          }}
                          className="flex items-center gap-1.5 h-7 w-full transition-colors duration-100"
                          style={{
                            paddingLeft: "10px",
                            paddingRight: "6px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "var(--radius)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--muted-foreground)",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.color = accentColor;
                            (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${accentColor} 6%, transparent)`;
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
                            (e.currentTarget as HTMLElement).style.background = "none";
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add page
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>
            Design System v2.4.0
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.625rem", color: "var(--muted-foreground)", marginTop: "2px" }}>
            Last updated July 2026
          </div>
        </div>
      </aside>
    </>
  );
}
