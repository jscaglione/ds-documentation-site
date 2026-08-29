import { supabase, isSupabaseConfigured, Profile, UserRole } from "./supabase";
import type { AddedNavItem, FigmaBlock, StorybookBlock } from "../contexts/EditModeContext";

// ─── Edge function plumbing ──────────────────────────────────────────────────

/**
 * supabase.functions.invoke() surfaces non-2xx responses as an opaque
 * FunctionsHttpError; the useful message is in the un-read response body.
 */
async function invoke<T>(name: string, body: unknown): Promise<T> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return data as T;

  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const payload = await ctx.json() as { error?: string };
      if (payload?.error) throw new Error(payload.error);
    } catch (e) {
      if (e instanceof Error && e.message) throw e;
    }
  }
  throw new Error(error.message);
}

// ─── Doc state (the edit-mode CMS payload) ───────────────────────────────────

export interface DocState {
  edits: Record<string, string>;
  hiddenToc: string[];
  hiddenNav: string[];
  addedNav: AddedNavItem[];
  figmaBlocks: FigmaBlock[];
  storybookBlocks: StorybookBlock[];
}

export const EMPTY_DOC_STATE: DocState = {
  edits: {},
  hiddenToc: [],
  hiddenNav: [],
  addedNav: [],
  figmaBlocks: [],
  storybookBlocks: [],
};

function mapDocRow(data: {
  edits?: DocState["edits"];
  hidden_toc?: string[];
  hidden_nav?: string[];
  added_nav?: AddedNavItem[];
  figma_blocks?: FigmaBlock[];
  storybook_blocks?: StorybookBlock[];
}): DocState {
  return {
    edits: data.edits ?? {},
    hiddenToc: data.hidden_toc ?? [],
    hiddenNav: data.hidden_nav ?? [],
    addedNav: data.added_nav ?? [],
    figmaBlocks: data.figma_blocks ?? [],
    storybookBlocks: data.storybook_blocks ?? [],
  };
}

export async function loadDocState(): Promise<DocState> {
  if (!supabase) return EMPTY_DOC_STATE;

  const full = await supabase
    .from("doc_state")
    .select("edits, hidden_toc, hidden_nav, added_nav, figma_blocks, storybook_blocks")
    .eq("id", "global")
    .single();

  if (!full.error && full.data) return mapDocRow(full.data);

  // Column missing until the storybook_blocks migration is applied.
  const legacy = await supabase
    .from("doc_state")
    .select("edits, hidden_toc, hidden_nav, added_nav, figma_blocks")
    .eq("id", "global")
    .single();

  if (legacy.error || !legacy.data) return EMPTY_DOC_STATE;
  return mapDocRow(legacy.data);
}

export async function saveDocState(state: DocState): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase
    .from("doc_state")
    .update({
      edits: state.edits,
      hidden_toc: state.hiddenToc,
      hidden_nav: state.hiddenNav,
      added_nav: state.addedNav,
      figma_blocks: state.figmaBlocks,
      storybook_blocks: state.storybookBlocks,
    })
    .eq("id", "global");

  if (error) throw new Error(error.message);
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function listProfiles(): Promise<Profile[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, role, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export async function updateProfile(
  id: string,
  patch: { name?: string; role?: UserRole },
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export function inviteUser(input: { email: string; name: string; role: UserRole }) {
  return invoke<{ id: string }>("admin-users", {
    action: "invite",
    ...input,
    redirectTo: `${window.location.origin}/login`,
  });
}

export function deleteUser(id: string) {
  return invoke<{ ok: true }>("admin-users", { action: "delete", id });
}

// ─── Service credentials ─────────────────────────────────────────────────────

export interface CredentialStatus {
  service: string;
  last4: string;
  configured: boolean;
  updated_at: string;
}

export async function listCredentials(): Promise<Record<string, CredentialStatus>> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("service_credentials")
    .select("service, last4, configured, updated_at");
  if (error) throw new Error(error.message);

  return Object.fromEntries(
    (data ?? []).map(row => [row.service, row as CredentialStatus]),
  );
}

export async function setCredential(service: string, secret: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase
    .from("service_credentials")
    .update({ secret, last4: secret.slice(-4) })
    .eq("service", service);
  if (error) throw new Error(error.message);
}

export function revokeCredential(service: string) {
  return setCredential(service, "");
}

// ─── Figma (via the figma-proxy Edge Function) ───────────────────────────────

export function figmaFetchNode(url: string) {
  return invoke<unknown>("figma-proxy", { action: "node", url });
}

export function figmaFetchImage(
  fileKey: string,
  nodeId: string,
  format: "png" | "svg" = "png",
) {
  return invoke<{ url: string | null; svg?: string }>("figma-proxy", {
    action: "image",
    fileKey,
    nodeId,
    format,
  });
}

// ─── AI documentation drafts ─────────────────────────────────────────────────

export function aiGenerateDoc(block: {
  nodeName?: string;
  nodeType?: string;
  nodeDescription?: string;
  componentProps?: { name: string; type: string; defaultValue?: string; options?: string[] }[];
}) {
  return invoke<{ overview: string; guidelines: string }>("ai-generate", block);
}

export { isSupabaseConfigured };
