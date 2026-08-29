import { Search, Menu, X, Github, Eye, PencilLine, Settings, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useEditMode } from "../contexts/EditModeContext";
import { useAuth } from "../contexts/AuthContext";

interface TopBarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function TopBar({ onMobileMenuToggle, isMobileMenuOpen }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isEditing, setIsEditing } = useEditMode();
  const { session, profile, canEdit, isAdmin: isAdminUser, signOut } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-4"
      style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2.5 shrink-0 no-underline"
        style={{ color: "var(--foreground)" }}
      >
        <div
          className="w-7 h-7 flex items-center justify-center"
          style={{ background: "var(--primary)", borderRadius: "var(--radius)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" fill="white" />
            <rect x="9" y="2" width="5" height="5" fill="white" fillOpacity="0.5" />
            <rect x="2" y="9" width="5" height="5" fill="white" fillOpacity="0.5" />
            <rect x="9" y="9" width="5" height="5" fill="white" />
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.01em" }}>
          DS Docs
        </span>
      </Link>

      {/* Version badge */}
      <div
        className="shrink-0 px-2 py-0.5 hidden sm:flex items-center"
        style={{
          background: "var(--secondary)",
          borderRadius: "var(--radius)",
          fontSize: "0.6875rem",
          fontFamily: "var(--font-mono)",
          color: "var(--muted-foreground)",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        v2.4.0
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <div
          className="flex items-center gap-2 px-3 h-8 transition-all duration-150"
          style={{
            background: searchFocused ? "var(--card)" : "var(--muted)",
            border: `1px solid ${searchFocused ? "var(--primary)" : "transparent"}`,
            borderRadius: "var(--radius)",
            boxShadow: searchFocused ? `0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)` : "none",
          }}
        >
          <Search size={13} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search components, tokens…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent outline-none border-none"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8125rem",
              color: "var(--foreground)",
            }}
          />
          <kbd
            className="hidden lg:flex items-center gap-0.5 shrink-0"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              color: "var(--muted-foreground)",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "2px",
              padding: "1px 4px",
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Edit / Preview toggle — editors and admins only */}
        <div
          className="hidden sm:flex items-center p-0.5"
          style={{
            background: "var(--muted)",
            borderRadius: "calc(var(--radius) + 2px)",
            display: canEdit ? undefined : "none",
          }}
        >
          {(["preview", "edit"] as const).map(mode => {
            const active = mode === "edit" ? isEditing : !isEditing;
            return (
              <button
                key={mode}
                onClick={() => setIsEditing(mode === "edit")}
                className="flex items-center gap-1.5 px-2.5 h-7 transition-all duration-150"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  fontWeight: active ? 500 : 400,
                  color: active
                    ? mode === "edit" ? "var(--primary)" : "var(--foreground)"
                    : "var(--muted-foreground)",
                  background: active ? "var(--card)" : "transparent",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {mode === "preview"
                  ? <Eye size={12} />
                  : <PencilLine size={12} />
                }
                <span className="hidden md:inline">
                  {mode === "preview" ? "Preview" : "Edit"}
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            width: "1px",
            height: "16px",
            background: "var(--border)",
            flexShrink: 0,
            display: canEdit ? undefined : "none",
          }}
          className="hidden sm:block"
        />

        {/* Admin link — admins only */}
        {isAdminUser && (
          <Link
            to="/admin"
            title="Administration"
            className="w-8 h-8 flex items-center justify-center transition-colors duration-100"
            style={{
              color: isAdmin ? "var(--primary)" : "var(--muted-foreground)",
              borderRadius: "var(--radius)",
              background: isAdmin ? "color-mix(in srgb,var(--primary) 10%,transparent)" : "transparent",
            }}
            onMouseEnter={e => { if (!isAdmin) (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
            onMouseLeave={e => { if (!isAdmin) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <Settings size={15} />
          </Link>
        )}

        {/* Account */}
        {session ? (
          <button
            onClick={() => void signOut()}
            title={`Sign out${profile?.email ? ` (${profile.email})` : ""}`}
            className="flex items-center gap-1.5 h-8 px-2 transition-colors duration-100"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={15} />
            <span className="hidden lg:inline">
              {profile?.name || profile?.email?.split("@")[0] || "Sign out"}
            </span>
          </button>
        ) : (
          <Link
            to={`/login?next=${encodeURIComponent(location.pathname)}`}
            title="Sign in"
            className="flex items-center gap-1.5 h-8 px-2 no-underline transition-colors duration-100"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
              borderRadius: "var(--radius)",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--muted)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <LogIn size={15} />
            <span className="hidden lg:inline">Sign in</span>
          </Link>
        )}

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center transition-colors duration-100"
          style={{
            color: "var(--muted-foreground)",
            borderRadius: "var(--radius)",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Github size={15} />
        </a>

        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="w-8 h-8 flex items-center justify-center md:hidden transition-colors duration-100"
          style={{
            color: "var(--muted-foreground)",
            borderRadius: "var(--radius)",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
    </header>
  );
}
