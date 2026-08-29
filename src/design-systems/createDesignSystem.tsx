import type { ComponentType, ReactNode } from "react";
import type { NavSection } from "../app/components/nav-data";
import { PlaceholderPage } from "../app/pages/PlaceholderPage";
import { ChangelogPage } from "../app/pages/ChangelogPage";
import type { DesignSystemDefinition, DesignSystemPage } from "./types";

export interface DesignSystem extends DesignSystemDefinition {
  /** First page to open when switching into this system. */
  defaultPath: string;
  nav: NavSection[];
  /** Child routes for the docs Layout (paths relative to `/`). */
  routes: Array<{
    index?: boolean;
    path?: string;
    Component?: ComponentType;
    element?: ReactNode;
  }>;
}

export function dsPath(basePath: string, ...segments: string[]): string {
  const parts = [basePath, ...segments]
    .map(s => s.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
  return "/" + parts.join("/");
}

function toRoutePath(absolute: string): string | undefined {
  if (absolute === "/") return undefined;
  return absolute.replace(/^\//, "");
}

function pageRoute(absolutePath: string, page: DesignSystemPage) {
  const path = toRoutePath(absolutePath);
  if (page.Page) return { path, Component: page.Page };
  return {
    path,
    element: (
      <PlaceholderPage
        title={page.label}
        description={page.description ?? `${page.label} documentation.`}
      />
    ),
  };
}

export function createDesignSystem(def: DesignSystemDefinition): DesignSystem {
  const overviewPath = def.basePath ? dsPath(def.basePath) : "/";
  const changelogPath = dsPath(def.basePath, "changelog");

  const guideItems = (def.guides ?? []).map(g => ({
    label: g.label,
    path: dsPath(def.basePath, "getting-started", g.slug),
  }));

  const nav: NavSection[] = [
    {
      title: "Getting Started",
      items: [
        { label: def.overview.label ?? "Overview", path: overviewPath },
        ...guideItems,
      ],
    },
    ...(def.foundations.length
      ? [{
          title: "Foundations",
          items: def.foundations.map(p => ({
            label: p.label,
            path: dsPath(def.basePath, "foundations", p.slug),
          })),
        }]
      : []),
    ...(def.components.length
      ? [{
          title: "Components",
          items: def.components.map(p => ({
            label: p.label,
            path: dsPath(def.basePath, "components", p.slug),
          })),
        }]
      : []),
    {
      title: "Resources",
      items: [{ label: "Changelog", path: changelogPath }],
    },
  ];

  const overviewRoute = overviewPath === "/"
    ? { index: true as const, Component: def.overview.Page }
    : { path: toRoutePath(overviewPath), Component: def.overview.Page };

  const guideRoutes = (def.guides ?? []).map(g =>
    pageRoute(dsPath(def.basePath, "getting-started", g.slug), {
      slug: g.slug,
      label: g.label,
      description: g.description,
      Page: g.Page,
    }),
  );

  const foundationRoutes = def.foundations.map(p =>
    pageRoute(dsPath(def.basePath, "foundations", p.slug), p),
  );

  const componentRoutes = def.components.map(p =>
    pageRoute(dsPath(def.basePath, "components", p.slug), p),
  );

  const changelogRoute = {
    path: toRoutePath(changelogPath),
    element: (
      <ChangelogPage
        pageId={`changelog-${def.id}`}
        entries={def.changelog}
        systemLabel={def.label}
      />
    ),
  };

  return {
    ...def,
    defaultPath: overviewPath,
    nav,
    routes: [overviewRoute, ...guideRoutes, ...foundationRoutes, ...componentRoutes, changelogRoute],
  };
}
