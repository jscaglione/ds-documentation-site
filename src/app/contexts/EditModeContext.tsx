import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { loadDocState, saveDocState, EMPTY_DOC_STATE, DocState } from "../lib/api";
import { isSupabaseConfigured } from "../lib/supabase";

export interface AddedNavItem {
  id: string;
  sectionKey: string; // `${segmentId}:${sectionTitle}`
}

export interface FigmaComponentProp {
  name: string;
  type: "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT" | string;
  defaultValue: string;
  options?: string[];
}

/** One resolved variant/instance inside a COMPONENT_SET */
export interface FigmaVariantSpec {
  nodeId: string;
  /** Property name → value for this specific variant (e.g. {Size:"Medium", State:"Default"}) */
  props: Record<string, string>;
}

/**
 * Position + style of a TEXT node bound to a TEXT component property.
 * Coordinates are fractions of the root component's bounding box (0–1).
 */
export interface FigmaTextOverlay {
  propName: string;
  x: number; y: number; w: number; h: number;
  fontSize: number;
  textAlign: string;        // "LEFT" | "CENTER" | "RIGHT"
  color: string;            // CSS rgba string
  fontFamily: string;
  fontWeight: number;
  lineHeight?: number;      // px
  letterSpacing?: number;   // em
}

export interface FigmaBlock {
  id: string;
  pageId: string;
  url: string;
  height: number; // px
  // Populated by the figma-proxy Edge Function after import
  fetchState?: "loading" | "done" | "error" | "no-token";
  nodeName?: string;
  nodeType?: string;
  nodeDescription?: string;
  componentProps?: FigmaComponentProp[];
  /** Variant child nodes extracted from COMPONENT_SET children */
  variantSpecs?: FigmaVariantSpec[];
  /** Text nodes bound to TEXT properties — used for live preview overlays */
  textOverlays?: FigmaTextOverlay[];
  /** Root component bounding box in design pixels — used to map overlay fractions to px */
  rootWidth?: number;
  rootHeight?: number;
  fetchError?: string;
}

interface EditModeContextValue {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  getContent: (id: string, defaultContent: string) => string;
  setContent: (id: string, content: string) => void;
  editCount: number;
  saveEdits: () => void;
  discardEdits: () => void;
  hasUnsaved: boolean;
  /** True until the first read from Supabase settles. */
  loading: boolean;
  saving: boolean;
  /** Message from the last failed save/discard, or null. */
  syncError: string | null;
  // TOC
  hiddenTocIds: Set<string>;
  hideTocItem: (id: string) => void;
  restoreAllTocItems: () => void;
  // Sidebar nav
  hiddenNavItems: Set<string>; // "segmentId:path"
  hideNavItem: (segmentId: string, path: string) => void;
  addedNavItems: AddedNavItem[];
  addNavItem: (segmentId: string, sectionTitle: string) => string;
  removeAddedNavItem: (id: string) => void;
  // Figma embeds
  figmaBlocks: FigmaBlock[];
  addFigmaBlock: (pageId: string, url: string) => string;
  removeFigmaBlock: (id: string) => void;
  updateFigmaBlockHeight: (id: string, height: number) => void;
  updateFigmaBlock: (id: string, updates: Partial<FigmaBlock>) => void;
}

const EditModeContext = createContext<EditModeContextValue>({
  isEditing: false,
  setIsEditing: () => {},
  getContent: (_, d) => d,
  setContent: () => {},
  editCount: 0,
  saveEdits: () => {},
  discardEdits: () => {},
  hasUnsaved: false,
  loading: false,
  saving: false,
  syncError: null,
  hiddenTocIds: new Set(),
  hideTocItem: () => {},
  restoreAllTocItems: () => {},
  hiddenNavItems: new Set(),
  hideNavItem: () => {},
  addedNavItems: [],
  addNavItem: () => "",
  removeAddedNavItem: () => {},
  figmaBlocks: [],
  addFigmaBlock: () => "",
  removeFigmaBlock: () => {},
  updateFigmaBlockHeight: () => {},
  updateFigmaBlock: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { canEdit } = useAuth();

  const [isEditing, setIsEditingState] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Every editable slice keeps a live copy and a `saved*` copy. saveEdits()
  // flushes live → Supabase; discardEdits() re-reads Supabase → live.
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savedEdits, setSavedEdits] = useState<Record<string, string>>({});

  const [hiddenTocIds, setHiddenTocIds] = useState<Set<string>>(new Set());
  const [savedHiddenTocIds, setSavedHiddenTocIds] = useState<Set<string>>(new Set());

  const [hiddenNavItems, setHiddenNavItems] = useState<Set<string>>(new Set());
  const [savedHiddenNavItems, setSavedHiddenNavItems] = useState<Set<string>>(new Set());

  const [addedNavItems, setAddedNavItems] = useState<AddedNavItem[]>([]);
  const [savedAddedNavItems, setSavedAddedNavItems] = useState<AddedNavItem[]>([]);

  const [figmaBlocks, setFigmaBlocks] = useState<FigmaBlock[]>([]);
  const [savedFigmaBlocks, setSavedFigmaBlocks] = useState<FigmaBlock[]>([]);

  const applyState = useCallback((s: DocState) => {
    setEdits(s.edits);
    setSavedEdits(s.edits);
    setHiddenTocIds(new Set(s.hiddenToc));
    setSavedHiddenTocIds(new Set(s.hiddenToc));
    setHiddenNavItems(new Set(s.hiddenNav));
    setSavedHiddenNavItems(new Set(s.hiddenNav));
    setAddedNavItems(s.addedNav);
    setSavedAddedNavItems(s.addedNav);
    setFigmaBlocks(s.figmaBlocks);
    setSavedFigmaBlocks(s.figmaBlocks);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    loadDocState()
      .then(state => { if (!cancelled) applyState(state); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [applyState]);

  // Losing edit rights (sign-out, role change) drops you back to preview.
  useEffect(() => {
    if (!canEdit) setIsEditingState(false);
  }, [canEdit]);

  const setIsEditing = useCallback((v: boolean) => {
    if (v && !canEdit) return;
    setIsEditingState(v);
  }, [canEdit]);

  const getContent = useCallback(
    (id: string, defaultContent: string) => edits[id] ?? defaultContent,
    [edits]
  );

  const setContent = useCallback((id: string, content: string) => {
    setEdits(prev => ({ ...prev, [id]: content }));
  }, []);

  const hideTocItem = useCallback((id: string) => {
    setHiddenTocIds(prev => new Set([...prev, id]));
  }, []);

  const restoreAllTocItems = useCallback(() => {
    setHiddenTocIds(new Set());
  }, []);

  const hideNavItem = useCallback((segmentId: string, path: string) => {
    setHiddenNavItems(prev => new Set([...prev, `${segmentId}:${path}`]));
  }, []);

  const addNavItem = useCallback((segmentId: string, sectionTitle: string): string => {
    const id = `added-${Date.now()}`;
    setAddedNavItems(prev => [...prev, { id, sectionKey: `${segmentId}:${sectionTitle}` }]);
    return id;
  }, []);

  const removeAddedNavItem = useCallback((id: string) => {
    setAddedNavItems(prev => prev.filter(item => item.id !== id));
    setEdits(prev => {
      const next = { ...prev };
      delete next[`nav-label-added-${id}`];
      return next;
    });
  }, []);

  const addFigmaBlock = useCallback((pageId: string, url: string): string => {
    const id = `figma-${Date.now()}`;
    setFigmaBlocks(prev => [...prev, { id, pageId, url, height: 560 }]);
    return id;
  }, []);

  const removeFigmaBlock = useCallback((id: string) => {
    setFigmaBlocks(prev => prev.filter(b => b.id !== id));
    setEdits(prev => {
      const next = { ...prev };
      delete next[`figma-caption-${id}`];
      return next;
    });
  }, []);

  const updateFigmaBlockHeight = useCallback((id: string, height: number) => {
    setFigmaBlocks(prev => prev.map(b => b.id === id ? { ...b, height } : b));
  }, []);

  const updateFigmaBlock = useCallback((id: string, updates: Partial<FigmaBlock>) => {
    setFigmaBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const saveEdits = useCallback(() => {
    const snapshot: DocState = {
      edits,
      hiddenToc: [...hiddenTocIds],
      hiddenNav: [...hiddenNavItems],
      addedNav: addedNavItems,
      figmaBlocks,
    };
    setSaving(true);
    setSyncError(null);
    saveDocState(snapshot)
      .then(() => {
        setSavedEdits({ ...snapshot.edits });
        setSavedHiddenTocIds(new Set(snapshot.hiddenToc));
        setSavedHiddenNavItems(new Set(snapshot.hiddenNav));
        setSavedAddedNavItems([...snapshot.addedNav]);
        setSavedFigmaBlocks([...snapshot.figmaBlocks]);
      })
      .catch(e => setSyncError(e instanceof Error ? e.message : "Save failed"))
      .finally(() => setSaving(false));
  }, [edits, hiddenTocIds, hiddenNavItems, addedNavItems, figmaBlocks]);

  const discardEdits = useCallback(() => {
    if (!isSupabaseConfigured) {
      applyState(EMPTY_DOC_STATE);
      return;
    }
    setSaving(true);
    setSyncError(null);
    loadDocState()
      .then(applyState)
      .catch(e => setSyncError(e instanceof Error ? e.message : "Reload failed"))
      .finally(() => setSaving(false));
  }, [applyState]);

  const textUnsaved =
    Object.keys(edits).some(k => edits[k] !== savedEdits[k]) ||
    Object.keys(savedEdits).some(k => savedEdits[k] !== edits[k]);

  const tocUnsaved =
    hiddenTocIds.size !== savedHiddenTocIds.size ||
    [...hiddenTocIds].some(id => !savedHiddenTocIds.has(id));

  const navHiddenUnsaved =
    hiddenNavItems.size !== savedHiddenNavItems.size ||
    [...hiddenNavItems].some(id => !savedHiddenNavItems.has(id));

  const navAddedUnsaved = addedNavItems.length !== savedAddedNavItems.length;

  const figmaUnsaved = figmaBlocks.length !== savedFigmaBlocks.length ||
    figmaBlocks.some((b, i) => b.height !== savedFigmaBlocks[i]?.height);

  const hasUnsaved = textUnsaved || tocUnsaved || navHiddenUnsaved || navAddedUnsaved || figmaUnsaved;

  const editCount =
    Object.keys(edits).length +
    hiddenTocIds.size +
    hiddenNavItems.size +
    addedNavItems.length +
    figmaBlocks.length;

  return (
    <EditModeContext.Provider
      value={{
        isEditing, setIsEditing,
        getContent, setContent,
        editCount,
        saveEdits, discardEdits, hasUnsaved,
        loading, saving, syncError,
        hiddenTocIds, hideTocItem, restoreAllTocItems,
        hiddenNavItems, hideNavItem,
        addedNavItems, addNavItem, removeAddedNavItem,
        figmaBlocks, addFigmaBlock, removeFigmaBlock, updateFigmaBlockHeight, updateFigmaBlock,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
