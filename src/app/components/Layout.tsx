import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { TableOfContents } from "./TableOfContents";
import { SegmentNav } from "./SegmentNav";
import { EditModeToolbar } from "./EditModeToolbar";
import { SegmentProvider, useSegment } from "../contexts/SegmentContext";
import { EditModeProvider, useEditMode } from "../contexts/EditModeContext";
import { FigmaEmbedSection } from "./FigmaEmbedSection";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

function getBreadcrumbs(pathname: string, nav: { title: string; items: { label: string; path: string }[] }[]) {
  for (const section of nav) {
    for (const item of section.items) {
      const isMatch = item.path === "/" ? pathname === "/" : pathname === item.path;
      if (isMatch) {
        const crumbs = [];
        if (item.path !== "/") crumbs.push({ label: section.title, path: "#" });
        crumbs.push({ label: item.label, path: item.path });
        return crumbs;
      }
    }
  }
  return [];
}

function LayoutInner() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { activeSegment } = useSegment();
  const { isEditing } = useEditMode();
  const breadcrumbs = getBreadcrumbs(location.pathname, activeSegment.nav);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* MARKER-MAKE-KIT-INVOKED */}

      {/* Top bar — 56px */}
      <TopBar
        onMobileMenuToggle={() => setMobileMenuOpen(v => !v)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* Segment nav — 40px, sits at top-14 */}
      <SegmentNav />

      {/* Sidebar — starts at top-24 (56 + 40) */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* TOC — starts at top-24 */}
      <TableOfContents />

      {/* Floating edit toolbar */}
      <EditModeToolbar />

      {/* Main content — padded top by 96px (pt-24) */}
      <div
        className="pt-24 md:ml-60 xl:mr-52"
        style={{
          minHeight: "100vh",
          // Subtle amber tint on the content area in edit mode
          background: isEditing
            ? "color-mix(in srgb, #F59E0B 2.5%, var(--background))"
            : "var(--background)",
          transition: "background 0.3s ease",
        }}
      >
        <main className="max-w-3xl mx-auto px-6 py-10">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 mb-6">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.path + i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={11} style={{ color: "var(--muted-foreground)" }} />}
                  {i === breadcrumbs.length - 1 ? (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8125rem",
                        color: "var(--foreground)",
                        fontWeight: 500,
                      }}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path === "#" ? location.pathname : crumb.path}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8125rem",
                        color: "var(--muted-foreground)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)")}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Page content */}
          <div id="doc-content">
            <Outlet />
          </div>

          {/* Figma import — always available in edit mode, shown below page content */}
          <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            <FigmaEmbedSection pageId={location.pathname} />
          </div>
        </main>

        {/* Prev / Next navigation */}
        <div
          className="max-w-3xl mx-auto px-6 py-8 mt-8"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <PageNavigation pathname={location.pathname} />
        </div>
      </div>
    </div>
  );
}

export function Layout() {
  return (
    <EditModeProvider>
      <SegmentProvider>
        <LayoutInner />
      </SegmentProvider>
    </EditModeProvider>
  );
}

function PageNavigation({ pathname }: { pathname: string }) {
  const { activeSegment } = useSegment();
  const allItems = activeSegment.nav.flatMap(s => s.items);
  const currentIdx = allItems.findIndex(item =>
    item.path === "/" ? pathname === "/" : pathname === item.path
  );

  const prev = currentIdx > 0 ? allItems[currentIdx - 1] : null;
  const next = currentIdx < allItems.length - 1 ? allItems[currentIdx + 1] : null;

  if (!prev && !next) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      {prev ? (
        <Link
          to={prev.path}
          className="group flex flex-col gap-1 no-underline"
          style={{ color: "inherit" }}
        >
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>
            ← Previous
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", fontWeight: 500, color: "var(--primary)" }}>
            {prev.label}
          </span>
        </Link>
      ) : <div />}

      {next ? (
        <Link
          to={next.path}
          className="group flex flex-col gap-1 no-underline text-right"
          style={{ color: "inherit" }}
        >
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>
            Next →
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", fontWeight: 500, color: "var(--primary)" }}>
            {next.label}
          </span>
        </Link>
      ) : <div />}
    </div>
  );
}
