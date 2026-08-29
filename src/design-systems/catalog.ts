import type { DesignSystem } from "./createDesignSystem";

export const DESIGN_SYSTEMS: DesignSystem[] = [];

export function setDesignSystems(systems: DesignSystem[]) {
  DESIGN_SYSTEMS.length = 0;
  DESIGN_SYSTEMS.push(...systems);
}

export function matchDesignSystem(pathname: string): DesignSystem {
  const prefixed = DESIGN_SYSTEMS
    .filter(ds => ds.basePath)
    .sort((a, b) => b.basePath.length - a.basePath.length);
  const hit = prefixed.find(ds =>
    pathname === ds.basePath || pathname.startsWith(`${ds.basePath}/`),
  );
  return hit ?? DESIGN_SYSTEMS.find(ds => !ds.basePath) ?? DESIGN_SYSTEMS[0];
}
