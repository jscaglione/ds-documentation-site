import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Shield, Loader2 } from "lucide-react";

type Mode = "signin" | "signup" | "set-password";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: "0.875rem",
  padding: "9px 11px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  background: "var(--card)",
  color: "var(--foreground)",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--foreground)",
  marginBottom: "5px",
};

export function LoginPage() {
  const { session, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Invite and recovery links land here with a token in the URL hash;
  // supabase-js consumes it and creates a session, then a password is needed.
  useEffect(() => {
    const hash = window.location.hash;
    if (/type=(invite|recovery|signup)/.test(hash)) {
      setMode("set-password");
      setNotice("Choose a password to finish setting up your account.");
    }
  }, []);

  // Already signed in with nothing left to do — go where you were headed.
  useEffect(() => {
    if (!loading && session && mode !== "set-password") navigate(next, { replace: true });
  }, [loading, session, mode, next, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        navigate(next, { replace: true });
      } else if (mode === "signup") {
        const { needsConfirmation } = await signUp(email, password, name);
        if (needsConfirmation) {
          setNotice("Check your inbox for a confirmation link, then sign in.");
          setMode("signin");
        } else {
          navigate(next, { replace: true });
        }
      } else {
        if (!supabase) throw new Error("Supabase is not configured");
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) throw new Error(err.message);
        window.history.replaceState(null, "", window.location.pathname);
        navigate(next, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.6 }}>
          Supabase is not configured. Add <code style={{ fontFamily: "var(--font-mono)" }}>VITE_SUPABASE_URL</code> and{" "}
          <code style={{ fontFamily: "var(--font-mono)" }}>VITE_SUPABASE_ANON_KEY</code> to{" "}
          <code style={{ fontFamily: "var(--font-mono)" }}>.env.local</code> and restart the dev server.
        </p>
      </Shell>
    );
  }

  const title =
    mode === "signin" ? "Sign in"
    : mode === "signup" ? "Create an account"
    : "Set your password";

  return (
    <Shell>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
        {title}
      </h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: "0 0 20px" }}>
        {mode === "set-password"
          ? "This finishes your invitation."
          : "Editing and administration require an account."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div>
            <label style={labelStyle} htmlFor="name">Full name</label>
            <input id="name" style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
          </div>
        )}

        {mode !== "set-password" && (
          <div>
            <label style={labelStyle} htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        )}

        <div>
          <label style={labelStyle} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            style={inputStyle}
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={mode === "signin" ? undefined : 8}
            required
          />
        </div>

        {error && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "#991B1B", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius)", padding: "8px 10px", margin: 0 }}>
            {error}
          </p>
        )}
        {notice && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "#166534", background: "#DCFCE7", borderRadius: "var(--radius)", padding: "8px 10px", margin: 0 }}>
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 600,
            color: "#fff", background: busy ? "var(--muted-foreground)" : "var(--primary)",
            border: "none", borderRadius: "var(--radius)", padding: "9px 16px",
            cursor: busy ? "default" : "pointer",
          }}
        >
          {busy && <Loader2 size={13} className="animate-spin" />}
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Save password"}
        </button>
      </form>

      {mode !== "set-password" && (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: "16px 0 0", textAlign: "center" }}>
          {mode === "signin" ? "No account yet? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      )}

      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--muted-foreground)", margin: "20px 0 0", textAlign: "center" }}>
        <Link to="/" style={{ color: "var(--muted-foreground)" }}>← Back to the docs</Link>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <div
        style={{
          width: "100%", maxWidth: "380px", background: "var(--card)",
          border: "1px solid var(--border)", borderRadius: "calc(var(--radius) + 4px)",
          padding: "28px",
        }}
      >
        <div
          className="mb-5"
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "color-mix(in srgb,var(--primary) 10%,transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Shield size={18} style={{ color: "var(--primary)" }} />
        </div>
        {children}
      </div>
    </div>
  );
}
