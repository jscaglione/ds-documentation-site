import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Users, Key, ChevronRight, Plus, Pencil, Trash2,
  Check, X, Shield, RefreshCw, Loader2,
} from "lucide-react";
import {
  listProfiles, updateProfile, inviteUser, deleteUser,
  listCredentials, setCredential, revokeCredential, CredentialStatus,
} from "../lib/api";
import { Profile, UserRole } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

// ─── Constants ─────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { label: string; bg: string; fg: string }> = {
  admin:  { label: "Admin",  bg: "color-mix(in srgb,var(--primary) 10%,transparent)", fg: "var(--primary)" },
  editor: { label: "Editor", bg: "#FEF3C7", fg: "#92400E" },
  viewer: { label: "Viewer", bg: "var(--muted)", fg: "var(--muted-foreground)" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function maskKey(last4: string): string {
  return last4 ? "•".repeat(16) + last4 : "•".repeat(16);
}

function initials(name: string): string {
  return name.split(" ").map(w => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

function avatarColor(name: string): string {
  const palette = ["#2B3FE7","#059669","#D97706","#7C3AED","#DB2777","#0284C7","#DC2626"];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      className="flex items-start gap-3 p-3 mb-4"
      style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius)" }}
    >
      <p style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "#991B1B", margin: 0, lineHeight: 1.5 }}>
        {message}
      </p>
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#991B1B", padding: 0, lineHeight: 0 }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={18} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
    </div>
  );
}

// ─── User Avatar ──────────────────────────────────────────────────────────────

function UserAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: avatarColor(name),
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: "var(--font-sans)", fontSize: size * 0.34, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
        {initials(name)}
      </span>
    </div>
  );
}

// ─── Role Badge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const c = ROLE_CONFIG[role];
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 7px", borderRadius: "99px", background: c.bg, color: c.fg, flexShrink: 0 }}>
      {c.label}
    </span>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const { profile: me } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name?: string; role?: UserRole }>({});
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState({ name: "", email: "", role: "viewer" as UserRole });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const addNameRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setUsers(await listProfiles());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  /** Run a mutation, surface its error, and refresh from the server. */
  async function mutate(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function startEdit(user: Profile) {
    setEditingId(user.id);
    setEditDraft({ name: user.name, role: user.role });
  }

  async function commitEdit(id: string) {
    if (await mutate(() => updateProfile(id, editDraft))) setEditingId(null);
  }

  async function removeUser(id: string) {
    if (await mutate(() => deleteUser(id))) setDeleteConfirmId(null);
  }

  async function addUser() {
    if (!newDraft.email.trim()) return;
    const ok = await mutate(() => inviteUser({
      email: newDraft.email.trim(),
      name: newDraft.name.trim(),
      role: newDraft.role,
    }));
    if (ok) {
      setNewDraft({ name: "", email: "", role: "viewer" });
      setAdding(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)", fontSize: "0.8125rem", padding: "5px 8px",
    border: "1px solid var(--border)", borderRadius: "var(--radius)",
    background: "var(--card)", color: "var(--foreground)", outline: "none", width: "100%",
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center gap-2 flex-1 max-w-xs px-3 h-9"
          style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: "0.8125rem", background: "none", border: "none", outline: "none", color: "var(--foreground)" }}
          />
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>
          {users.length} user{users.length !== 1 ? "s" : ""}
        </div>
        <button
          onClick={() => { setAdding(true); setTimeout(() => addNameRef.current?.focus(), 50); }}
          className="flex items-center gap-1.5 px-3 h-9"
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 500, color: "#fff", background: "var(--primary)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = "#2034CC")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--primary)")}
        >
          <Plus size={14} /> Invite user
        </button>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", opacity: busy ? 0.6 : 1, transition: "opacity 0.1s" }}>
        {/* Header */}
        <div
          className="grid gap-4 px-4 py-2.5"
          style={{ gridTemplateColumns: "1fr 1fr 120px 80px", background: "var(--muted)", borderBottom: "1px solid var(--border)" }}
        >
          {["User", "Email", "Role", ""].map(h => (
            <span key={h} style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 && !adding && (
          <div className="flex flex-col items-center gap-2 py-12">
            <Users size={24} style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--muted-foreground)", margin: 0 }}>
              {search ? "No users match that search" : "No users yet"}
            </p>
          </div>
        )}

        {filtered.map((user, i) => {
          const isEditing = editingId === user.id;
          const isDeleteConfirm = deleteConfirmId === user.id;
          const isSelf = user.id === me?.id;
          return (
            <div
              key={user.id}
              className="grid gap-4 px-4 py-3 items-center"
              style={{
                gridTemplateColumns: "1fr 1fr 120px 80px",
                borderBottom: i < filtered.length - 1 || adding ? "1px solid var(--border)" : "none",
                background: isEditing ? "color-mix(in srgb,var(--primary) 2%,var(--card))" : "var(--card)",
                transition: "background 0.1s",
              }}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar name={isEditing && editDraft.name ? editDraft.name : user.name || user.email} />
                {isEditing ? (
                  <input
                    value={editDraft.name ?? ""}
                    onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))}
                    style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                  />
                ) : (
                  <div className="min-w-0">
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name || "—"}{isSelf && " (you)"}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted-foreground)", margin: 0 }}>
                      Since {user.created_at.slice(0, 10)}
                    </p>
                  </div>
                )}
              </div>

              {/* Email — the auth identity, so it is never editable here */}
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </span>

              {/* Role */}
              {isEditing ? (
                <select
                  value={editDraft.role ?? user.role}
                  onChange={e => setEditDraft(d => ({ ...d, role: e.target.value as UserRole }))}
                  style={{ ...inputStyle, paddingRight: "8px" }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              ) : (
                <RoleBadge role={user.role} />
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 justify-end">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => void commitEdit(user.id)}
                      title="Save"
                      style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "#DCFCE7", border: "none", borderRadius: "var(--radius)", cursor: "pointer", color: "#166534" }}
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      title="Cancel"
                      style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--muted)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--muted-foreground)" }}
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : isDeleteConfirm ? (
                  <>
                    <button
                      onClick={() => void removeUser(user.id)}
                      style={{ padding: "3px 8px", fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 600, color: "#fff", background: "#D4183D", border: "none", borderRadius: "var(--radius)", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--muted)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--muted-foreground)" }}
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(user)}
                      title="Edit"
                      style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--muted-foreground)", transition: "all 0.1s" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--muted)"; el.style.color = "var(--foreground)"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "none"; el.style.color = "var(--muted-foreground)"; }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(user.id)}
                      disabled={isSelf}
                      title={isSelf ? "You cannot delete your own account" : "Delete"}
                      style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: isSelf ? "default" : "pointer", color: "var(--muted-foreground)", opacity: isSelf ? 0.4 : 1, transition: "all 0.1s" }}
                      onMouseEnter={e => { if (isSelf) return; const el = e.currentTarget as HTMLElement; el.style.background = "#FEE2E2"; el.style.borderColor = "#D4183D"; el.style.color = "#D4183D"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "none"; el.style.borderColor = "var(--border)"; el.style.color = "var(--muted-foreground)"; }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Invite user inline row */}
        {adding && (
          <div
            className="grid gap-4 px-4 py-3 items-center"
            style={{ gridTemplateColumns: "1fr 1fr 120px 80px", background: "color-mix(in srgb,var(--primary) 3%,var(--card))", borderTop: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar name={newDraft.name || "New User"} />
              <input
                ref={addNameRef}
                value={newDraft.name}
                onChange={e => setNewDraft(d => ({ ...d, name: e.target.value }))}
                placeholder="Full name"
                onKeyDown={e => { if (e.key === "Enter") void addUser(); if (e.key === "Escape") { setAdding(false); } }}
                style={{ ...inputStyle, flex: 1, minWidth: 0 }}
              />
            </div>
            <input
              value={newDraft.email}
              onChange={e => setNewDraft(d => ({ ...d, email: e.target.value }))}
              placeholder="email@company.com"
              type="email"
              onKeyDown={e => { if (e.key === "Enter") void addUser(); if (e.key === "Escape") setAdding(false); }}
              style={{ ...inputStyle }}
            />
            <select
              value={newDraft.role}
              onChange={e => setNewDraft(d => ({ ...d, role: e.target.value as UserRole }))}
              style={{ ...inputStyle }}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <div className="flex items-center gap-1 justify-end">
              <button
                onClick={() => void addUser()}
                disabled={!newDraft.email.trim() || busy}
                title="Send invitation"
                style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: newDraft.email ? "#DCFCE7" : "var(--muted)", border: "none", borderRadius: "var(--radius)", cursor: newDraft.email ? "pointer" : "default", color: newDraft.email ? "#166534" : "var(--muted-foreground)" }}
              >
                <Check size={13} />
              </button>
              <button
                onClick={() => { setAdding(false); setNewDraft({ name: "", email: "", role: "viewer" }); }}
                title="Cancel"
                style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--muted)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--muted-foreground)" }}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--muted-foreground)", margin: "10px 0 0" }}>
        Inviting a user emails them a link to set a password. They can also sign up themselves — new
        self-service accounts start as viewers.
      </p>

      {/* Role legend */}
      <div className="flex items-center gap-4 mt-4">
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>Roles:</span>
        {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([role, c]) => (
          <span key={role} className="flex items-center gap-1.5">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 7px", borderRadius: "99px", background: c.bg, color: c.fg }}>
              {c.label}
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>
              {role === "admin" ? "Full access" : role === "editor" ? "Can edit content" : "Read-only"}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── API Key Card ─────────────────────────────────────────────────────────────

interface ApiKeyCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  docsUrl?: string;
  status?: CredentialStatus;
  onSave: (v: string) => void;
  onRevoke: () => void;
  placeholder?: string;
}

function ApiKeyCard({ icon, name, description, docsUrl, status, onSave, onRevoke, placeholder = "Paste your API key…" }: ApiKeyCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const connected = !!status?.configured;

  function handleSave() {
    if (!draft.trim()) return;
    onSave(draft.trim());
    setDraft("");
    setEditing(false);
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--card)" }}>
      {/* Header row */}
      <div className="flex items-start gap-4 p-5" style={{ borderBottom: connected || editing ? "1px solid var(--border)" : "none" }}>
        {/* Service icon */}
        <div
          style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "var(--muted)" }}
        >
          {icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)" }}>
              {name}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.05em",
              padding: "2px 6px", borderRadius: "99px",
              background: connected ? "#DCFCE7" : "var(--muted)",
              color: connected ? "#166534" : "var(--muted-foreground)",
            }}>
              {connected ? "Connected" : "Not configured"}
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>
            {description}
            {docsUrl && (
              <> — <a href={docsUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.textDecoration = "underline")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.textDecoration = "none")}
              >Get API key ↗</a></>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {connected && !editing && (
            <>
              <button
                onClick={() => { setDraft(""); setEditing(true); }}
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 500, color: "var(--foreground)", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", padding: "5px 12px", display: "flex", alignItems: "center", gap: "5px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <RefreshCw size={12} /> Update
              </button>
              <button
                onClick={onRevoke}
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 500, color: "#991B1B", background: "none", border: "1px solid #FECACA", borderRadius: "var(--radius)", cursor: "pointer", padding: "5px 12px" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FEF2F2"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
              >
                Revoke
              </button>
            </>
          )}
          {!connected && !editing && (
            <button
              onClick={() => { setDraft(""); setEditing(true); }}
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 500, color: "#fff", background: "var(--primary)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", padding: "5px 14px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2034CC")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--primary)")}
            >
              Connect
            </button>
          )}
          {editing && (
            <button
              onClick={() => setEditing(false)}
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", padding: "5px 8px" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Masked current value — the key itself is write-only and never leaves the server */}
      {connected && !editing && (
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ background: "var(--muted)" }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--muted-foreground)", flex: 1, letterSpacing: "0.05em" }}>
            {maskKey(status?.last4 ?? "")}
          </span>
          {status?.updated_at && (
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>
              Updated {status.updated_at.slice(0, 10)}
            </span>
          )}
        </div>
      )}

      {/* Edit / connect form */}
      {editing && (
        <div className="flex items-center gap-2 px-5 py-4" style={{ background: "var(--muted)" }}>
          <input
            type="password"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={placeholder}
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
            style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.8125rem", padding: "7px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius)", outline: "none", background: "var(--card)", color: "var(--foreground)" }}
          />
          <button
            onClick={handleSave}
            disabled={!draft.trim()}
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", background: draft.trim() ? "var(--primary)" : "var(--muted-foreground)", border: "none", borderRadius: "var(--radius)", cursor: draft.trim() ? "pointer" : "default", padding: "7px 16px", flexShrink: 0, transition: "background 0.1s" }}
          >
            Save key
          </button>
        </div>
      )}
    </div>
  );
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────

function FigmaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5Z" fill="#1ABCFE"/>
      <path d="M9.5 57A9.5 9.5 0 0 1 9.5 38H19V57Z" fill="#0ACF83"/>
      <path d="M0 19A9.5 9.5 0 0 1 9.5 9.5H19V28.5H9.5A9.5 9.5 0 0 1 0 19Z" fill="#FF7262"/>
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19V19H9.5A9.5 9.5 0 0 1 0 9.5Z" fill="#F24E1E"/>
      <path d="M19 0H28.5A9.5 9.5 0 0 1 28.5 19H19Z" fill="#FF7262"/>
    </svg>
  );
}

function AnthropicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#D97706" }}>
      <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-3.654 0H6.57L0 20h3.603l1.498-3.817h6.807l1.498 3.817h3.604l-6.437-16.48zm-1.35 9.566l2.175-5.559 2.175 5.56H8.823z"/>
    </svg>
  );
}

function OpenAiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#059669" }}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.372L15.115 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.403-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  );
}

function ApiKeysTab() {
  const [creds, setCreds] = useState<Record<string, CredentialStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setCreds(await listCredentials());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load credentials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function save(service: string, secret: string) {
    setError(null);
    try {
      await setCredential(service, secret);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the key");
    }
  }

  async function revoke(service: string) {
    setError(null);
    try {
      await revokeCredential(service);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not revoke the key");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-8">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Design Tools */}
      <section>
        <div className="mb-4">
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", margin: "0 0 2px" }}>
            Design Tools
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: 0 }}>
            Connect your design tool accounts to enable live component previews and metadata sync.
          </p>
        </div>
        <ApiKeyCard
          icon={<FigmaIcon />}
          name="Figma"
          description="Enables live component playground previews, variant exploration, and auto-extracted property documentation from your Figma files"
          docsUrl="https://www.figma.com/developers/api#access-tokens"
          status={creds.figma}
          onSave={v => void save("figma", v)}
          onRevoke={() => void revoke("figma")}
          placeholder="figd_…"
        />
      </section>

      {/* AI Models */}
      <section>
        <div className="mb-4">
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", margin: "0 0 2px" }}>
            AI Models
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: 0 }}>
            AI integrations power documentation drafts, content suggestions, and component analysis throughout the app.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <ApiKeyCard
            icon={<AnthropicIcon />}
            name="Anthropic Claude"
            description="Used to generate AI documentation drafts for imported Figma components — overview paragraphs and usage guidelines"
            docsUrl="https://console.anthropic.com/account/keys"
            status={creds.anthropic}
            onSave={v => void save("anthropic", v)}
            onRevoke={() => void revoke("anthropic")}
            placeholder="sk-ant-…"
          />
          <ApiKeyCard
            icon={<OpenAiIcon />}
            name="OpenAI"
            description="Available for GPT-powered features — alternative AI documentation generation and content analysis"
            docsUrl="https://platform.openai.com/api-keys"
            status={creds.openai}
            onSave={v => void save("openai", v)}
            onRevoke={() => void revoke("openai")}
            placeholder="sk-…"
          />
        </div>
      </section>

      {/* Security note */}
      <div
        className="flex items-start gap-3 p-4"
        style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--muted)" }}
      >
        <Shield size={15} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: "1px" }} />
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.6 }}>
          Keys are stored in Supabase and are write-only: once saved, the value is never sent back to
          any browser — only the last four characters are shown. Requests to Figma and Anthropic are
          made by Edge Functions on the server, so the key is never exposed to page visitors. Revoking
          clears the stored value immediately.
        </p>
      </div>
    </div>
  );
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: "users",   label: "Users",    icon: Users },
  { id: "apikeys", label: "API Keys", icon: Key   },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Admin Page ───────────────────────────────────────────────────────────────

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("users");

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--background)" }}>
      {/* Page header */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 pt-5 pb-1">
            <Link
              to="/"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", textDecoration: "none" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)")}
            >
              DS Docs
            </Link>
            <ChevronRight size={12} style={{ color: "var(--muted-foreground)" }} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--foreground)", fontWeight: 500 }}>
              Administration
            </span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 py-4">
            <div
              style={{ width: "36px", height: "36px", borderRadius: "10px", background: "color-mix(in srgb,var(--primary) 10%,transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <Shield size={18} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", margin: 0, letterSpacing: "-0.02em" }}>
                Administration
              </h1>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--muted-foreground)", margin: 0 }}>
                Manage users, roles, and service integrations
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-end gap-0 -mb-px">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2.5"
                  style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: active ? 600 : 400,
                    color: active ? "var(--primary)" : "var(--muted-foreground)",
                    background: "none", border: "none",
                    borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                    cursor: "pointer", transition: "all 0.1s", marginBottom: "-1px",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === "users"   && <UsersTab />}
        {activeTab === "apikeys" && <ApiKeysTab />}
      </div>
    </div>
  );
}
