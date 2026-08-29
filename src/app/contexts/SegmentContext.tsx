import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router";
import { DESIGN_SYSTEMS, matchDesignSystem } from "../../design-systems/catalog";
import type { Segment } from "../components/segment-data";

interface SegmentContextValue {
  activeSegment: Segment;
  setActiveSegment: (segment: Segment) => void;
}

const SegmentContext = createContext<SegmentContextValue>({
  activeSegment: DESIGN_SYSTEMS[0],
  setActiveSegment: () => {},
});

export function SegmentProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const fromUrl = matchDesignSystem(pathname);

  const [activeSegment, setActiveSegmentState] = useState<Segment>(() => {
    const saved = localStorage.getItem("ds-active-segment");
    return DESIGN_SYSTEMS.find(s => s.id === saved) ?? DESIGN_SYSTEMS[0];
  });

  useEffect(() => {
    if (!fromUrl) return;
    setActiveSegmentState(fromUrl);
    localStorage.setItem("ds-active-segment", fromUrl.id);
  }, [fromUrl]);

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
