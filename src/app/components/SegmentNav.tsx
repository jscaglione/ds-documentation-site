import { useNavigate } from "react-router";
import { SEGMENTS, Segment } from "./segment-data";
import { useSegment } from "../contexts/SegmentContext";

export function SegmentNav() {
  const { activeSegment, setActiveSegment } = useSegment();
  const navigate = useNavigate();

  function handleSelect(segment: Segment) {
    setActiveSegment(segment);
    navigate(segment.defaultPath);
  }

  return (
    <div
      className="fixed top-14 left-0 right-0 z-40 flex items-stretch px-3 md:px-5 overflow-x-auto"
      style={{
        height: "40px",
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {SEGMENTS.map(segment => {
        const isActive = segment.id === activeSegment.id;

        return (
          <button
            key={segment.id}
            onClick={() => handleSelect(segment)}
            title={segment.description}
            className="relative flex items-center gap-2 px-3 shrink-0 transition-all duration-150"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8125rem",
              fontWeight: isActive ? 500 : 400,
              color: isActive ? segment.color : "var(--muted-foreground)",
              background: "none",
              border: "none",
              cursor: "pointer",
              height: "100%",
              borderRadius: 0,
            }}
            onMouseEnter={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
            }}
            onMouseLeave={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
            }}
          >
            {/* Color dot */}
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isActive ? segment.color : "var(--muted-foreground)",
                flexShrink: 0,
                opacity: isActive ? 1 : 0.45,
                transition: "all 0.15s ease",
              }}
            />
            {segment.label}

            {/* Active underline */}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: "2px",
                  background: segment.color,
                  borderRadius: "1px 1px 0 0",
                }}
              />
            )}
          </button>
        );
      })}

      {/* Right side: active segment description */}
      <div
        className="hidden lg:flex items-center ml-auto pl-4 shrink-0"
        style={{ borderLeft: "1px solid var(--border)" }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            color: "var(--muted-foreground)",
          }}
        >
          {activeSegment.description}
        </span>
      </div>
    </div>
  );
}
