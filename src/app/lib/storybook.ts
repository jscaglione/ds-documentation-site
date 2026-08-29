export type StorybookViewMode = "story" | "docs";

export interface ParsedStorybookRef {
  origin: string;
  storyId: string;
  viewMode: StorybookViewMode;
  sourceUrl: string;
}

export function getDefaultStorybookOrigin(): string {
  const raw = import.meta.env.VITE_STORYBOOK_URL as string | undefined;
  return raw ? raw.replace(/\/+$/, "") : "";
}

export function isComponentDocsPath(pathname: string): boolean {
  return /(?:^|\/)components\//.test(pathname);
}

function stripSlashes(id: string): string {
  return id.replace(/^\/+|\/+$/g, "").replace(/\//g, "-");
}

export function parseStorybookInput(
  raw: string,
  fallbackOrigin = getDefaultStorybookOrigin(),
): ParsedStorybookRef | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    if (!fallbackOrigin) return null;
    const storyId = stripSlashes(trimmed.replace(/^\?path=\/(story|docs)\//, ""));
    if (!storyId) return null;
    const viewMode: StorybookViewMode = trimmed.includes("/docs/") ? "docs" : "story";
    return {
      origin: fallbackOrigin,
      storyId,
      viewMode,
      sourceUrl: `${fallbackOrigin}/?path=/${viewMode}/${storyId}`,
    };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const origin = url.origin;
  const hashQuery = url.hash.startsWith("#") ? url.hash.slice(1).replace(/^\//, "") : "";
  const hashParams = new URLSearchParams(hashQuery.startsWith("?") ? hashQuery.slice(1) : hashQuery.includes("=") ? hashQuery : "");
  const idParam = url.searchParams.get("id") || hashParams.get("id");
  const pathParam = url.searchParams.get("path") || hashParams.get("path") || "";
  const viewFromQuery = url.searchParams.get("viewMode") || hashParams.get("viewMode");

  if (idParam) {
    const viewMode: StorybookViewMode =
      viewFromQuery === "docs" || pathParam.startsWith("/docs/") ? "docs" : "story";
    return { origin, storyId: stripSlashes(idParam), viewMode, sourceUrl: trimmed };
  }

  const pathMatch = pathParam.match(/^\/(story|docs)\/(.+)$/);
  if (pathMatch) {
    return {
      origin,
      storyId: stripSlashes(pathMatch[2]),
      viewMode: pathMatch[1] === "docs" ? "docs" : "story",
      sourceUrl: trimmed,
    };
  }

  return null;
}

export function storybookIframeSrc(
  origin: string,
  storyId: string,
  viewMode: StorybookViewMode,
): string {
  const url = new URL("iframe.html", `${origin}/`);
  url.searchParams.set("id", storyId);
  url.searchParams.set("viewMode", viewMode);
  url.searchParams.set("shortcuts", "false");
  url.searchParams.set("singleStory", "true");
  return url.toString();
}

export function storybookOpenUrl(
  origin: string,
  storyId: string,
  viewMode: StorybookViewMode,
): string {
  return `${origin}/?path=/${viewMode}/${storyId}`;
}
