import { setDesignSystems } from "./catalog";
import { web } from "./web";
import { mobile } from "./mobile";
import { marketing } from "./marketing";
import { data } from "./data";
import { internal } from "./internal";

/**
 * Registered design systems. To import a new one:
 *   1. Add `src/design-systems/<id>.ts` that calls `createDesignSystem({
 *        foundations, components, changelog, ... })`
 *   2. Import it here and add it to the array passed to `setDesignSystems`.
 *
 * Nav, routes, and the top-bar switcher are generated from this list.
 */
setDesignSystems([web, mobile, marketing, data, internal]);

export { DESIGN_SYSTEMS, matchDesignSystem } from "./catalog";
export type { DesignSystem } from "./createDesignSystem";
export type { DesignSystemDefinition, ChangelogEntry } from "./types";
export { createDesignSystem } from "./createDesignSystem";
