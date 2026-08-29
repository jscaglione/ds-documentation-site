import { useRef, useEffect, ElementType, CSSProperties, KeyboardEvent } from "react";
import { useEditMode } from "../contexts/EditModeContext";

// Single-line tags where Enter should be suppressed
const SINGLE_LINE_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "span", "label", "button"]);

interface EditableTextProps {
  /** Stable, unique id used as the storage key. */
  id: string;
  /** HTML element to render. Defaults to "span". */
  as?: ElementType;
  children: string;
  style?: CSSProperties;
  className?: string;
  /** Extra props forwarded to the element (e.g. id for scroll anchors). */
  domId?: string;
  /** Focus and place cursor at end on mount (edit mode only). */
  autoFocus?: boolean;
}

export function EditableText({
  id,
  as: Tag = "span",
  children,
  style,
  className,
  domId,
  autoFocus,
}: EditableTextProps) {
  const { isEditing, getContent, setContent } = useEditMode();
  const tagName = typeof Tag === "string" ? Tag : "span";
  const isSingleLine = SINGLE_LINE_TAGS.has(tagName);

  const content = getContent(id, children);

  // --- Preview mode ---
  if (!isEditing) {
    return (
      // @ts-ignore — dynamic tag
      <Tag id={domId} style={style} className={className}>
        {content}
      </Tag>
    );
  }

  // --- Edit mode ---
  // key forces a remount (and thus content reset) when switching modes,
  // so React never clobbers what the user is typing mid-session.
  return (
    <EditableNode
      key={`${id}-editing`}
      id={id}
      Tag={Tag}
      tagName={tagName}
      domId={domId}
      style={style}
      className={className}
      initialContent={content}
      isSingleLine={isSingleLine}
      onCommit={setContent}
      autoFocus={autoFocus}
    />
  );
}

// Isolated so the key trick triggers a clean remount.
function EditableNode({
  id,
  Tag,
  tagName,
  domId,
  style,
  className,
  initialContent,
  isSingleLine,
  onCommit,
  autoFocus,
}: {
  id: string;
  Tag: ElementType;
  tagName: string;
  domId?: string;
  style?: CSSProperties;
  className?: string;
  initialContent: string;
  isSingleLine: boolean;
  onCommit: (id: string, value: string) => void;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const isFocused = useRef(false);

  // Set DOM content imperatively — avoids React reconciliation stomping typed text.
  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = initialContent;
    if (autoFocus) {
      ref.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel) {
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, []); // Only on mount

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (isSingleLine && e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
    if (e.key === "Escape") {
      (e.currentTarget as HTMLElement).blur();
    }
  }

  function handleBlur() {
    isFocused.current = false;
    const text = ref.current?.textContent ?? "";
    onCommit(id, text);
    // Reset visual state
    if (ref.current) {
      ref.current.style.background = "transparent";
      ref.current.style.boxShadow = "none";
      ref.current.style.outline = "none";
    }
  }

  function handleFocus() {
    isFocused.current = true;
    if (ref.current) {
      ref.current.style.background = "color-mix(in srgb, var(--primary) 4%, transparent)";
      ref.current.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)";
      ref.current.style.borderRadius = "3px";
    }
  }

  function handleMouseEnter() {
    if (!isFocused.current && ref.current) {
      ref.current.style.outline = "1px dashed color-mix(in srgb, var(--primary) 35%, transparent)";
      ref.current.style.outlineOffset = "2px";
      ref.current.style.borderRadius = "3px";
    }
  }

  function handleMouseLeave() {
    if (!isFocused.current && ref.current) {
      ref.current.style.outline = "none";
    }
  }

  return (
    // @ts-ignore — dynamic tag + contentEditable
    <Tag
      ref={ref}
      id={domId}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      style={{
        ...style,
        cursor: "text",
        outline: "none",
        transition: "background 0.1s, box-shadow 0.1s",
        caretColor: "var(--primary)",
        minWidth: "1ch",
        // Preserve whitespace in blocks
        whiteSpace: tagName === "p" || tagName === "div" ? "pre-wrap" : undefined,
      }}
      className={className}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
