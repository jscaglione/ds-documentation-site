export interface NavItem {
  label: string;
  path: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { label: "Overview", path: "/" },
      { label: "Installation", path: "/getting-started/installation" },
      { label: "Theming", path: "/getting-started/theming" },
    ],
  },
  {
    title: "Foundations",
    items: [
      { label: "Colors", path: "/foundations/colors" },
      { label: "Typography", path: "/foundations/typography" },
      { label: "Spacing", path: "/foundations/spacing" },
      { label: "Icons", path: "/foundations/icons" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Changelog", path: "/changelog" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Avatar", path: "/components/avatar" },
      { label: "Badge", path: "/components/badge" },
      { label: "Button", path: "/components/button" },
      { label: "Card", path: "/components/card" },
      { label: "Checkbox", path: "/components/checkbox" },
      { label: "Dialog", path: "/components/dialog" },
      { label: "Dropdown Menu", path: "/components/dropdown" },
      { label: "Input", path: "/components/input" },
      { label: "Progress", path: "/components/progress" },
      { label: "Select", path: "/components/select" },
      { label: "Slider", path: "/components/slider" },
      { label: "Tabs", path: "/components/tabs" },
      { label: "Toggle", path: "/components/toggle" },
      { label: "Tooltip", path: "/components/tooltip" },
    ],
  },
];
