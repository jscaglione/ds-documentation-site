import { useParams } from "react-router";
import { useEditMode } from "../contexts/EditModeContext";
import { EditableText } from "../components/EditableText";

export function DraftPage() {
  const { id = "" } = useParams<{ id: string }>();
  const labelEditId = `nav-label-added-${id}`;
  const { getContent } = useEditMode();
  const title = getContent(labelEditId, "New page");

  return (
    <div>
      <div style={{ paddingBottom: "2rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            color: "var(--foreground)",
            margin: "0 0 0.75rem",
          }}
        >
          {/* Shares the same edit key as the sidebar label — they stay in sync */}
          <EditableText id={labelEditId} as="span">
            {title}
          </EditableText>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          <EditableText id={`draft-${id}-description`} as="span">
            This page was created in edit mode. Switch to edit mode to add a description and content.
          </EditableText>
        </p>
      </div>

      <div
        style={{
          padding: "2rem",
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius)",
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            color: "var(--muted-foreground)",
            margin: 0,
          }}
        >
          Content area — switch to <strong>Edit mode</strong> to add sections and body copy.
        </p>
      </div>
    </div>
  );
}
