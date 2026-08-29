import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function Button({
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  children,
  onClick,
}: ButtonProps) {
  const inactive = disabled || loading;

  const base: CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontWeight: 500,
    borderRadius: "var(--radius)",
    border: "none",
    cursor: inactive ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.12s ease",
    whiteSpace: "nowrap",
  };

  const sizes: Record<ButtonSize, CSSProperties> = {
    sm: { fontSize: "0.75rem", padding: "5px 10px", height: "28px" },
    md: { fontSize: "0.875rem", padding: "7px 14px", height: "36px" },
    lg: { fontSize: "0.9375rem", padding: "10px 20px", height: "44px" },
    icon: { fontSize: "0.875rem", padding: "0", width: "36px", height: "36px", justifyContent: "center" },
  };

  const variants: Record<ButtonVariant, CSSProperties> = {
    default: { background: "var(--primary)", color: "#fff" },
    secondary: { background: "var(--secondary)", color: "var(--foreground)" },
    outline: { background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--foreground)" },
    destructive: { background: "#D4183D", color: "#fff" },
  };

  return (
    <button
      type="button"
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      disabled={inactive}
      aria-busy={loading || undefined}
      aria-disabled={inactive || undefined}
      onClick={inactive ? undefined : onClick}
      onMouseEnter={e => {
        if (inactive) return;
        const el = e.currentTarget;
        if (variant === "default") el.style.background = "#2034CC";
        if (variant === "secondary") el.style.background = "#E2E3EA";
        if (variant === "outline") el.style.background = "var(--muted)";
        if (variant === "ghost") el.style.background = "var(--muted)";
        if (variant === "destructive") el.style.background = "#B01433";
      }}
      onMouseLeave={e => {
        if (inactive) return;
        Object.assign(e.currentTarget.style, variants[variant]);
      }}
    >
      {loading && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      )}
      {children}
    </button>
  );
}
