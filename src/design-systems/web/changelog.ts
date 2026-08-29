import type { ChangelogEntry } from "../types";

export const WEB_CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.4.0",
    date: "Jul 22, 2026",
    tag: "minor",
    summary: "Dialog improvements, new loading state for Button, and a Combobox component.",
    changes: [
      {
        type: "added",
        items: [
          "Combobox — searchable dropdown with async data support and keyboard navigation.",
          "Button: loading prop now sets aria-busy and aria-disabled automatically.",
          "Dialog: new controlled open prop with onOpenChange callback.",
          "Toast: support for promise-based toasts via toast.promise().",
        ],
      },
      {
        type: "changed",
        items: [
          "Slider: range mode now renders two thumb handles instead of a single fill.",
          "Select: dropdown width now matches trigger width by default.",
          "TableOfContents: scroll-spy threshold tightened from 50% to 30% viewport.",
        ],
      },
      {
        type: "fixed",
        items: [
          "Dialog: focus trap no longer leaks to elements behind the overlay on iOS Safari.",
          "Checkbox: indeterminate state now correctly resets on form reset.",
          "Avatar: fallback initials now truncate at two characters rather than overflowing.",
        ],
      },
    ],
  },
  {
    version: "2.3.1",
    date: "Jul 10, 2026",
    tag: "patch",
    summary: "Patch fixing three edge-case regressions from 2.3.0.",
    changes: [
      {
        type: "fixed",
        items: [
          "Tabs: keyboard arrow navigation no longer skips disabled tab panels.",
          "Input: suffix icon alignment off by 1px on Firefox — corrected.",
          "Tooltip: z-index now stacks correctly inside Dialog overlays.",
        ],
      },
    ],
  },
  {
    version: "2.3.0",
    date: "Jul 3, 2026",
    tag: "minor",
    summary: "Slider range mode, step labels, and foundational spacing token updates.",
    changes: [
      {
        type: "added",
        items: [
          "Slider: range mode with dual thumb handles.",
          "Slider: step labels rendered below the track.",
          "Progress: indeterminate animation variant.",
          "Spacing page added to Foundations documentation.",
        ],
      },
      {
        type: "changed",
        items: [
          "Spacing scale: steps 0.5–1.5 tightened to align with 4px base unit.",
          "Card: default padding increased from 16px to 20px.",
        ],
      },
    ],
  },
  {
    version: "2.2.0",
    date: "Jun 28, 2026",
    tag: "minor",
    summary: "Semantic surface token rename — a breaking change to align naming with W3C design token spec.",
    changes: [
      {
        type: "breaking",
        items: [
          "--surface renamed to --card. Update all references in your theme overrides.",
          "--surface-foreground renamed to --card-foreground.",
          "--subtle renamed to --muted; --subtle-foreground renamed to --muted-foreground.",
        ],
      },
      {
        type: "added",
        items: [
          "New --sidebar-* token family for sidebar-specific theming without affecting card surfaces.",
          "Colors foundation page with contrast table and full palette documentation.",
        ],
      },
      {
        type: "deprecated",
        items: [
          "ThemeProvider colorScheme prop — use the .dark class on html instead. Will be removed in v3.",
        ],
      },
    ],
  },
  {
    version: "2.1.2",
    date: "Jun 14, 2026",
    tag: "patch",
    summary: "Security and accessibility patch.",
    changes: [
      {
        type: "fixed",
        items: [
          "Avatar: image src is now validated against an allowlist to prevent XSS via data URIs.",
          "Button: focus-visible ring now meets 3:1 contrast in all variants.",
          "Select: screen reader now announces the selected option on change.",
        ],
      },
    ],
  },
  {
    version: "2.1.1",
    date: "Jun 6, 2026",
    tag: "patch",
    summary: "Minor visual refinements and a Dropdown keyboard regression fix.",
    changes: [
      {
        type: "fixed",
        items: [
          "Dropdown Menu: Escape key now correctly closes the menu when focus is inside a sub-menu.",
          "Badge: line-height normalised across all size variants.",
          "Input: label alignment corrected when prefix icon is present.",
        ],
      },
      {
        type: "changed",
        items: [
          "Border radius default tightened from 0.375rem to 0.25rem to match Swiss grid aesthetic.",
        ],
      },
    ],
  },
  {
    version: "2.1.0",
    date: "May 28, 2026",
    tag: "minor",
    summary: "Avatar component, icon documentation, and Typography foundation page.",
    changes: [
      {
        type: "added",
        items: [
          "Avatar component with image, initials fallback, and status dot.",
          "Icons foundation page with searchable grid and click-to-copy JSX.",
          "Typography foundation page with full type scale specimen.",
          "Plus Jakarta Sans now the default sans-serif family (was Inter).",
          "JetBrains Mono now the default mono family (was Fira Code).",
        ],
      },
      {
        type: "changed",
        items: [
          "Button: icon-only variant now enforces a square aspect ratio.",
          "Input: placeholder color now uses --muted-foreground for consistency.",
        ],
      },
    ],
  },
  {
    version: "2.0.0",
    date: "May 5, 2026",
    tag: "major",
    summary: "Major version. Tailwind v4, new token architecture, and full component rebuild.",
    changes: [
      {
        type: "breaking",
        items: [
          "Tailwind CSS upgraded to v4. The @tailwind directives are replaced with @import.",
          "All components rebuilt from scratch — no direct upgrade path from v1. See Migration guide.",
          "Component imports moved from @ds/ui/components/* to @ds/ui named exports.",
          "All color tokens now use CSS oklch() — raw hex overrides may produce unexpected results.",
        ],
      },
      {
        type: "added",
        items: [
          "Full semantic token system with --primary, --card, --muted, --border and matching .dark variants.",
          "Radix UI primitives now power Dialog, Dropdown, Tabs, Tooltip, Select, and Checkbox.",
          "New component: Accordion, Collapsible, NavigationMenu, RadioGroup.",
          "ThemeProvider with system, light, and dark modes.",
        ],
      },
      {
        type: "removed",
        items: [
          "v1 styled-components dependency removed entirely.",
          "Legacy theme.json config file — replaced by CSS custom properties.",
          "Button: solid and hollow variants removed; use variant='default' and variant='outline'.",
        ],
      },
    ],
  },
];
