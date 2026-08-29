import { NavSection } from "./nav-data";

export interface Segment {
  id: string;
  label: string;
  description: string;
  /** Accent color for this segment */
  color: string;
  /** First page to navigate to when switching into this segment */
  defaultPath: string;
  nav: NavSection[];
}

export const SEGMENTS: Segment[] = [
  {
    id: "web",
    label: "Web",
    description: "React component library for web applications",
    color: "#2B3FE7",
    defaultPath: "/",
    nav: [
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
      {
        title: "Resources",
        items: [
          { label: "Changelog", path: "/changelog" },
        ],
      },
    ],
  },

  {
    id: "mobile",
    label: "Mobile",
    description: "React Native components for iOS and Android",
    color: "#7C3AED",
    defaultPath: "/mobile",
    nav: [
      {
        title: "Getting Started",
        items: [
          { label: "Overview", path: "/mobile" },
          { label: "Setup", path: "/mobile/setup" },
          { label: "Expo Integration", path: "/mobile/expo" },
          { label: "Native Modules", path: "/mobile/native-modules" },
        ],
      },
      {
        title: "Primitives",
        items: [
          { label: "Button", path: "/mobile/button" },
          { label: "Input", path: "/mobile/input" },
          { label: "Switch", path: "/mobile/switch" },
          { label: "Checkbox", path: "/mobile/checkbox" },
          { label: "Slider", path: "/mobile/slider" },
          { label: "Text", path: "/mobile/text" },
          { label: "Icon", path: "/mobile/icon" },
        ],
      },
      {
        title: "Layout",
        items: [
          { label: "SafeAreaView", path: "/mobile/safe-area" },
          { label: "ScrollView", path: "/mobile/scroll-view" },
          { label: "KeyboardAvoidingView", path: "/mobile/keyboard-avoiding" },
          { label: "List", path: "/mobile/list" },
          { label: "SectionList", path: "/mobile/section-list" },
        ],
      },
      {
        title: "Overlays",
        items: [
          { label: "ActionSheet", path: "/mobile/action-sheet" },
          { label: "BottomSheet", path: "/mobile/bottom-sheet" },
          { label: "Modal", path: "/mobile/modal" },
          { label: "Toast", path: "/mobile/toast" },
          { label: "Alert", path: "/mobile/alert" },
        ],
      },
      {
        title: "Native",
        items: [
          { label: "Haptics", path: "/mobile/haptics" },
          { label: "Camera", path: "/mobile/camera" },
          { label: "Biometrics", path: "/mobile/biometrics" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Changelog", path: "/changelog" },
        ],
      },
    ],
  },

  {
    id: "marketing",
    label: "Marketing",
    description: "Landing page sections and campaign components",
    color: "#0EA875",
    defaultPath: "/marketing",
    nav: [
      {
        title: "Getting Started",
        items: [
          { label: "Overview", path: "/marketing" },
          { label: "Installation", path: "/marketing/installation" },
          { label: "Content Guidelines", path: "/marketing/content" },
        ],
      },
      {
        title: "Page Sections",
        items: [
          { label: "Hero", path: "/marketing/hero" },
          { label: "Feature Grid", path: "/marketing/features" },
          { label: "Social Proof", path: "/marketing/social-proof" },
          { label: "Pricing Table", path: "/marketing/pricing" },
          { label: "FAQ", path: "/marketing/faq" },
          { label: "CTA Banner", path: "/marketing/cta" },
          { label: "Footer", path: "/marketing/footer" },
        ],
      },
      {
        title: "Content Blocks",
        items: [
          { label: "Testimonial Card", path: "/marketing/testimonial" },
          { label: "Stat Counter", path: "/marketing/stat-counter" },
          { label: "Video Embed", path: "/marketing/video" },
          { label: "Logo Grid", path: "/marketing/logos" },
          { label: "Team Grid", path: "/marketing/team" },
        ],
      },
      {
        title: "Utilities",
        items: [
          { label: "Cookie Banner", path: "/marketing/cookie" },
          { label: "Announcement Bar", path: "/marketing/announcement" },
          { label: "Newsletter Form", path: "/marketing/newsletter" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Changelog", path: "/changelog" },
        ],
      },
    ],
  },

  {
    id: "data",
    label: "Data & Analytics",
    description: "Charts, tables, and data visualization",
    color: "#D97706",
    defaultPath: "/data",
    nav: [
      {
        title: "Getting Started",
        items: [
          { label: "Overview", path: "/data" },
          { label: "Setup", path: "/data/setup" },
          { label: "Data Formatting", path: "/data/formatting" },
        ],
      },
      {
        title: "Charts",
        items: [
          { label: "Bar Chart", path: "/data/bar-chart" },
          { label: "Line Chart", path: "/data/line-chart" },
          { label: "Area Chart", path: "/data/area-chart" },
          { label: "Pie Chart", path: "/data/pie-chart" },
          { label: "Scatter Plot", path: "/data/scatter" },
          { label: "Heatmap", path: "/data/heatmap" },
          { label: "Sparkline", path: "/data/sparkline" },
        ],
      },
      {
        title: "Data Display",
        items: [
          { label: "KPI Card", path: "/data/kpi-card" },
          { label: "Data Table", path: "/data/table" },
          { label: "Pagination", path: "/data/pagination" },
          { label: "Filters", path: "/data/filters" },
          { label: "DateRange Picker", path: "/data/date-range" },
          { label: "Export Menu", path: "/data/export" },
        ],
      },
      {
        title: "Dashboard",
        items: [
          { label: "Dashboard Grid", path: "/data/grid" },
          { label: "Metric Comparison", path: "/data/comparison" },
          { label: "Alert Rule", path: "/data/alert-rule" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Changelog", path: "/changelog" },
        ],
      },
    ],
  },

  {
    id: "internal",
    label: "Internal Tools",
    description: "Admin interfaces, forms, and tooling components",
    color: "#475569",
    defaultPath: "/internal",
    nav: [
      {
        title: "Getting Started",
        items: [
          { label: "Overview", path: "/internal" },
          { label: "Setup", path: "/internal/setup" },
          { label: "Permissions", path: "/internal/permissions" },
        ],
      },
      {
        title: "Forms",
        items: [
          { label: "FormBuilder", path: "/internal/form-builder" },
          { label: "DynamicField", path: "/internal/dynamic-field" },
          { label: "MultiStep Form", path: "/internal/multistep" },
          { label: "Validation Summary", path: "/internal/validation" },
          { label: "FileUpload", path: "/internal/file-upload" },
          { label: "RichTextEditor", path: "/internal/rich-text" },
        ],
      },
      {
        title: "Layout",
        items: [
          { label: "AppShell", path: "/internal/app-shell" },
          { label: "SplitPane", path: "/internal/split-pane" },
          { label: "ResizablePanel", path: "/internal/resizable" },
          { label: "CommandPalette", path: "/internal/command" },
          { label: "Breadcrumbs", path: "/internal/breadcrumbs" },
        ],
      },
      {
        title: "Feedback",
        items: [
          { label: "Alert Banner", path: "/internal/alert-banner" },
          { label: "Loading Overlay", path: "/internal/loading" },
          { label: "Confirm Dialog", path: "/internal/confirm" },
          { label: "Activity Feed", path: "/internal/activity" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Changelog", path: "/changelog" },
        ],
      },
    ],
  },
];
