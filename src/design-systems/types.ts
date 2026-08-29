import type { ComponentType } from "react";

export type ChangelogChangeType =
  | "added"
  | "changed"
  | "fixed"
  | "deprecated"
  | "removed"
  | "breaking";

export interface ChangelogEntry {
  version: string;
  date: string;
  tag: "major" | "minor" | "patch";
  summary: string;
  changes: {
    type: ChangelogChangeType;
    items: string[];
  }[];
}

/** One documented page inside a design system pack. */
export interface DesignSystemPage {
  slug: string;
  label: string;
  description?: string;
  /** If omitted, the platform renders PlaceholderPage. */
  Page?: ComponentType;
}

export interface DesignSystemGuide {
  slug: string;
  label: string;
  description?: string;
  /** If omitted, the platform renders PlaceholderPage. */
  Page?: ComponentType;
}

/**
 * A complete, importable design system: foundations + components + changelog.
 * Register it in `src/design-systems/index.ts` — the platform builds nav and routes from this.
 */
export interface DesignSystemDefinition {
  id: string;
  label: string;
  description: string;
  color: string;
  /**
   * URL prefix with no trailing slash. Use "" for the default system at the site root
   * so existing `/foundations/*` and `/components/*` URLs stay stable.
   */
  basePath: string;
  overview: {
    label?: string;
    Page: ComponentType;
  };
  guides?: DesignSystemGuide[];
  foundations: DesignSystemPage[];
  components: DesignSystemPage[];
  changelog: ChangelogEntry[];
}
