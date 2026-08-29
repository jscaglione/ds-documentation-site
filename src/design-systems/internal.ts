import { createDesignSystem } from "./createDesignSystem";
import { SegmentLandingPage } from "../app/pages/SegmentLandingPage";

export const internal = createDesignSystem({
  id: "internal",
  label: "Internal Tools",
  description: "Admin interfaces, forms, and tooling components",
  color: "#475569",
  basePath: "/internal",
  overview: { Page: SegmentLandingPage },
  guides: [
    { slug: "setup", label: "Setup", description: "Install the internal-tools package." },
    { slug: "permissions", label: "Permissions", description: "Role-aware UI and route gates." },
  ],
  foundations: [],
  components: [
    { slug: "form-builder", label: "FormBuilder", description: "Schema-driven form builder." },
    { slug: "dynamic-field", label: "DynamicField", description: "Field renderer for form schemas." },
    { slug: "multistep", label: "MultiStep Form", description: "Wizard with steps and validation." },
    { slug: "validation", label: "Validation Summary", description: "Aggregated form errors." },
    { slug: "file-upload", label: "FileUpload", description: "File picker and upload progress." },
    { slug: "rich-text", label: "RichTextEditor", description: "Formatted text editor." },
    { slug: "app-shell", label: "AppShell", description: "Admin app chrome." },
    { slug: "split-pane", label: "SplitPane", description: "Two-pane layout." },
    { slug: "resizable", label: "ResizablePanel", description: "Drag-to-resize panel." },
    { slug: "command", label: "CommandPalette", description: "Keyboard command palette." },
    { slug: "breadcrumbs", label: "Breadcrumbs", description: "Hierarchy trail." },
    { slug: "alert-banner", label: "Alert Banner", description: "Page-level alert." },
    { slug: "loading", label: "Loading Overlay", description: "Blocking loading state." },
    { slug: "confirm", label: "Confirm Dialog", description: "Destructive-action confirm." },
    { slug: "activity", label: "Activity Feed", description: "Audit / activity stream." },
  ],
  changelog: [],
});
