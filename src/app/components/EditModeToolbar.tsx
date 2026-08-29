import { useEditMode } from "../contexts/EditModeContext";

export function EditModeToolbar() {
  const { isEditing, editCount, hasUnsaved, saveEdits, discardEdits, setIsEditing, saving, syncError } = useEditMode();

  if (!isEditing) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-4 py-2.5"
      style={{
        transform: "translateX(-50%)",
        background: "#0E0F16",
        borderRadius: "calc(var(--radius) + 6px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)",
        // Slide up animation
        animation: "editbar-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes editbar-in {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Pulse dot */}
      <span className="relative flex items-center justify-center w-5 h-5 shrink-0">
        <span
          className="absolute"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#F59E0B",
            animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
          }}
        />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </span>

      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          whiteSpace: "nowrap",
        }}
      >
        Editing
      </span>

      {editCount > 0 && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: "rgba(255,255,255,0.4)",
            paddingLeft: "2px",
          }}
        >
          — {editCount} change{editCount !== 1 ? "s" : ""}
          {saving ? " · saving…" : hasUnsaved ? " · unsaved" : " · synced"}
        </span>
      )}

      {syncError && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.6875rem",
            color: "#FCA5A5",
            maxWidth: "22ch",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={syncError}
        >
          {syncError}
        </span>
      )}

      <div
        style={{
          width: "1px",
          height: "16px",
          background: "rgba(255,255,255,0.12)",
          margin: "0 2px",
        }}
      />

      {/* Discard */}
      <button
        onClick={() => {
          discardEdits();
        }}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "var(--radius)",
          transition: "color 0.1s, background 0.1s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
          (e.currentTarget as HTMLElement).style.background = "none";
        }}
      >
        Discard
      </button>

      {/* Save */}
      <button
        onClick={saveEdits}
        disabled={saving}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: hasUnsaved && !saving ? "#0E0F16" : "rgba(255,255,255,0.4)",
          background: hasUnsaved && !saving ? "#F5F5F7" : "rgba(255,255,255,0.08)",
          border: "none",
          cursor: hasUnsaved && !saving ? "pointer" : "default",
          padding: "5px 12px",
          borderRadius: "var(--radius)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={e => {
          if (hasUnsaved) (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
        }}
        onMouseLeave={e => {
          if (hasUnsaved) (e.currentTarget as HTMLElement).style.background = "#F5F5F7";
        }}
      >
        {saving ? "Saving…" : "Save"}
      </button>

      <div
        style={{
          width: "1px",
          height: "16px",
          background: "rgba(255,255,255,0.12)",
          margin: "0 2px",
        }}
      />

      {/* Exit edit mode */}
      <button
        onClick={() => setIsEditing(false)}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 6px",
          borderRadius: "var(--radius)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "color 0.1s",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
        title="Exit edit mode"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
