import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SEGMENTS, Segment } from "../components/segment-data";

interface SegmentContextValue {
  activeSegment: Segment;
  setActiveSegment: (segment: Segment) => void;
}

const SegmentContext = createContext<SegmentContextValue>({
  activeSegment: SEGMENTS[0],
  setActiveSegment: () => {},
});

export function SegmentProvider({ children }: { children: ReactNode }) {
  const [activeSegment, setActiveSegmentState] = useState<Segment>(() => {
    const saved = localStorage.getItem("ds-active-segment");
    return SEGMENTS.find(s => s.id === saved) ?? SEGMENTS[0];
  });

  function setActiveSegment(segment: Segment) {
    setActiveSegmentState(segment);
    localStorage.setItem("ds-active-segment", segment.id);
  }

  return (
    <SegmentContext.Provider value={{ activeSegment, setActiveSegment }}>
      {children}
    </SegmentContext.Provider>
  );
}

export function useSegment() {
  return useContext(SegmentContext);
}
