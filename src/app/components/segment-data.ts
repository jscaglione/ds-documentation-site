import { DESIGN_SYSTEMS, type DesignSystem } from "../../design-systems";

/** @deprecated Use DesignSystem — kept so existing Segment* imports keep working. */
export type Segment = DesignSystem;

export const SEGMENTS: Segment[] = DESIGN_SYSTEMS;
