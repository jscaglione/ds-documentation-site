# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm i          # install
npm run dev    # Vite dev server
npm run build  # production build

# Supabase (requires the Supabase CLI, and `supabase link` to a project)
supabase db push                          # apply supabase/migrations/
supabase functions deploy figma-proxy ai-generate admin-users
```

There are no tests, no linter, and **no `tsconfig.json`** — Vite/esbuild strips types without checking them, so type errors do not fail the build. Verify changes by running the dev server.

`.env.local` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`). Without them `isSupabaseConfigured` is false: the site still renders, but signed out and read-only, with content coming from the in-memory defaults.

This is a Figma Make code bundle (originally https://www.figma.com/design/HvCqncYEe3wp68w8St0mCt/Documentation-site-layout). `vite.config.ts` notes that the React and Tailwind plugins must not be removed even if Tailwind looks unused, and that `.css`/`.ts`/`.tsx` must never be added to `assetsInclude`.

## Architecture

React 18 + react-router v7 (`createBrowserRouter`) + Tailwind v4 + Supabase. Entry chain: `src/main.tsx` → `src/app/App.tsx` (wraps everything in `AuthProvider`) → `src/app/routes.tsx`.

### Two layouts, one route table

`routes.tsx` declares a flat list under two shells: `Layout` (the docs site) and `AdminLayout` (`/admin`), plus a bare `/login`. Both shells wrap their subtree in `EditModeProvider`; they are separate provider instances that stay in sync only because all state round-trips through the `doc_state` row in Supabase — an unsaved edit made under one shell is not visible under the other until it is saved and the other reloads.

### Segments own the navigation

`segment-data.ts` defines `SEGMENTS` (Web, Mobile, Marketing, Data, Internal), each carrying its **own** `nav: NavSection[]` tree, accent color, and `defaultPath`. `SegmentContext` holds the active segment (persisted under `ds-active-segment`); `SegmentNav` switches segments and navigates to `defaultPath`.

The sidebar, breadcrumbs, and prev/next footer all derive from `activeSegment.nav` — **not** from `routes.tsx`. Adding a page means editing both: a route in `routes.tsx` and an entry in the relevant segment's nav. `nav-data.ts` (`NAV_SECTIONS`) is a near-duplicate of the Web segment's nav and is only used for its `NavItem`/`NavSection` types plus the breadcrumb helper's shape.

### Auth and roles

`AuthContext` wraps the whole router and owns the Supabase session plus the caller's `profiles` row. Three roles: `admin`, `editor`, `viewer`.

- `RequireRole` gates a subtree; `/admin` is `allow={["admin"]}`. Signed-out visitors are redirected to `/login?next=…`.
- Edit mode is gated in two places that must agree: `TopBar` hides the Edit toggle when `!canEdit`, and `EditModeProvider.setIsEditing` refuses to turn on without `canEdit`. Losing the role mid-session drops you back to preview.
- **The docs themselves are public** — `doc_state` has an `anon` SELECT policy so signed-out readers see saved content.
- The first account to sign up becomes `admin` (`handle_new_user()` in the migration). Everyone after starts as `viewer`.

### Edit mode is a Supabase-backed CMS

`EditModeContext` is the largest piece of shared state. In edit mode any `EditableText` becomes `contentEditable`; committed text is stored in a flat `Record<string, string>` keyed by a caller-supplied id.

- **Stable ids matter.** `DocPage` derives `${pageId}-title` / `${pageId}-description`; `DocSection` and the Figma blocks follow the same pattern. Changing an id orphans a saved edit.
- **Two-copy save model.** Every editable slice keeps a live copy and a `saved*` copy; `saveEdits()` writes the whole snapshot to the single `doc_state` row (columns `edits`, `hidden_toc`, `hidden_nav`, `added_nav`, `figma_blocks`), `discardEdits()` re-reads it. Both are async and drive `saving` / `syncError`, which `EditModeToolbar` renders. New editable state must be added to `DocState` in `lib/api.ts`, to `applyState`/`saveEdits`, **and** to the `hasUnsaved`/`editCount` derivations, or the toolbar silently lies.
- **API keys are no longer in this context.** They live in `service_credentials` and are managed on `/admin`; see below.
- **Draft pages**: the sidebar's add-page flow calls `addNavItem()` → id → route `/drafts/:id`. `DraftPage` reads title from the edit key `nav-label-added-${id}`, which is the same key the sidebar label uses, so the two stay in sync by construction.
- `EditableText` sets DOM text imperatively on mount and remounts via `key` on mode switch, deliberately keeping React out of the contentEditable's way.

### Supabase schema (`supabase/migrations/`)

| Table | Purpose | RLS |
| --- | --- | --- |
| `profiles` | one row per `auth.users`, carries `role` | read own or any-as-admin; writes admin-only |
| `doc_state` | single `'global'` row, the edit-mode payload | `anon`+`authenticated` read; update requires `can_edit()` |
| `service_credentials` | Figma / Anthropic / OpenAI keys | admin-only, and `secret` has **column-level SELECT revoked** |

`service_credentials.secret` is write-only from the browser's point of view: `GRANT SELECT` names every column except `secret`, so PostgREST cannot return it regardless of policy. Only the Edge Functions (service-role key) read it. The UI shows `configured` + `last4`.

`auth_role()` is `SECURITY DEFINER` so policies on `profiles` can call it without recursing into their own check — don't inline `select role from profiles` into a policy.

### Edge Functions (`supabase/functions/`)

All third-party calls happen server-side. Shared helpers are in `_shared/util.ts` (`getCaller`, `canEdit`, `getSecret`, CORS).

- **`figma-proxy`** — `verify_jwt = false`, because component previews render on public doc pages. It does its own authorization instead: an editor/admin may request any file key, while an anonymous caller may only request a key already referenced by a saved `figma_blocks` entry. That's what stops it being an open proxy to the whole Figma account.
- **`ai-generate`** — editors/admins only. Builds the documentation prompt and calls Claude (`claude-opus-5`, `output_config.effort: "medium"`, `fallbacks: "default"`). Thinking is on by default on Opus 5, so it selects the `text` block rather than `content[0]`, and checks `stop_reason === "refusal"`.
- **`admin-users`** — invite and delete, which need `auth.admin` and therefore the service-role key. Role and name changes are plain table updates from the client under RLS.

Both `figma-proxy` and `ai-generate` answer a missing key with a 503 and `{"error": "no-token" | "no-key"}`; the client maps those strings to a "connect a key in /admin" state instead of an error.

### Table of contents is DOM-derived

`TableOfContents` queries `#doc-content h2[id], #doc-content h3[id]` after each route change and drives an `IntersectionObserver`. A heading without an explicit `id` will not appear in the TOC.

### FigmaEmbedSection (`~1200 lines`, the complex part)

Rendered below every doc page's content. It reaches Figma and Anthropic **only through the Edge Functions** — there is no API key in the browser and no token-entry UI in this file.

- `apiFetchNodeData` / `apiFetchVariantImage` wrap `figma-proxy`. `parseNodeInfo` flattens a `COMPONENT_SET` into `variantSpecs` (prop-value combinations → node ids) and `textOverlays` (TEXT nodes bound to TEXT props, positioned as 0–1 fractions of the root bbox).
- `ComponentPlayground` uses those to swap variant images as props change and overlay live text; `applyTextOverridesToSvg` rewrites the SVG in place. **SVG bodies come back inline from the proxy** (`{url, svg}`) because Figma's S3 URLs don't allow cross-origin reads — don't reintroduce a browser-side `fetch(svgUrl)`.
- `AiDocSection` calls `ai-generate`; the prompt lives in the function, not here.

## Styling conventions

- **Tailwind is for layout only** (`flex`, `gap-*`, `mb-*`, responsive prefixes). Every color, font, radius, and type scale is an inline `style` reading a CSS variable: `var(--foreground)`, `var(--primary)`, `var(--border)`, `var(--font-sans)`, `var(--radius)`, etc. Match this — do not introduce Tailwind color/typography utilities.
- Tokens live in `src/styles/theme.css`, fonts in `fonts.css`, both pulled in by `index.css`. Tailwind v4 has no config file; content sources come from `@source` in `tailwind.css`. A `.dark` block exists in `theme.css` but nothing in the app toggles the class.
- Hover/focus states are typically imperative `onMouseEnter`/`onMouseLeave` handlers mutating `e.currentTarget.style`.

## `src/app/components/ui/` is dead code

The ~45 shadcn/ui components are Figma Make scaffolding and are **not imported anywhere outside that directory**. Doc pages hand-roll their own demo components (see `Btn` in `ButtonPage.tsx`). Don't assume shadcn is the component library here; adding an import from `ui/` would be the first one in the codebase.

## Page building blocks

Doc pages compose the primitives exported from `src/app/components/DocPage.tsx`: `DocPage` (header, status badge, source link), `DocSection`, `PreviewBox`, `CodeBlock`, `PropsTable`. Follow `ButtonPage.tsx` as the reference for a fully-built page; `PlaceholderPage` covers the not-yet-written ones.

## Other notes

- `figma:asset/*` imports are rewritten by a Vite plugin to `src/assets/` (that directory does not currently exist).
- `guidelines/Guidelines.md` is an untouched Figma Make template — no real rules in it yet.
