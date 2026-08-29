import { ReactNode } from "react";
import { Navigate, useLocation, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured } from "../lib/supabase";
import { Loader2, ShieldAlert } from "lucide-react";

/**
 * Gate a subtree behind a Supabase session and a minimum role.
 * Signed-out visitors are bounced to /login with a `next` param.
 */
export function RequireRole({
  allow,
  children,
}: {
  allow: ("admin" | "editor" | "viewer")[];
  children: ReactNode;
}) {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return (
      <Notice
        title="Supabase is not configured"
        body="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <Loader2 size={18} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
      </div>
    );
  }

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (!role || !allow.includes(role)) {
    return (
      <Notice
        title="You don't have access to this page"
        body={`This area is limited to ${allow.join(" and ")} accounts. Ask an admin to change your role.`}
      />
    );
  }

  return <>{children}</>;
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6" style={{ minHeight: "60vh" }}>
      <ShieldAlert size={22} style={{ color: "var(--muted-foreground)" }} />
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
        {title}
      </h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: 0, maxWidth: "38ch", textAlign: "center", lineHeight: 1.6 }}>
        {body}
      </p>
      <Link
        to="/"
        style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}
      >
        ← Back to the docs
      </Link>
    </div>
  );
}
