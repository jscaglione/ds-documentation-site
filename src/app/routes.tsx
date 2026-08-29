import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { InstallationPage } from "./pages/InstallationPage";
import { ThemingPage } from "./pages/ThemingPage";
import { ColorsPage } from "./pages/ColorsPage";
import { TypographyPage } from "./pages/TypographyPage";
import { SpacingPage } from "./pages/SpacingPage";
import { IconsPage } from "./pages/IconsPage";
import { ButtonPage } from "./pages/ButtonPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { ChangelogPage } from "./pages/ChangelogPage";
import { SegmentLandingPage } from "./pages/SegmentLandingPage";
import { DraftPage } from "./pages/DraftPage";
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";
import { RequireRole } from "./components/RequireRole";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        element: (
          <RequireRole allow={["admin"]}>
            <AdminPage />
          </RequireRole>
        ),
      },
    ],
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: OverviewPage },
      { path: "changelog", Component: ChangelogPage },
      // Segment landing pages
      { path: "mobile", Component: SegmentLandingPage },
      { path: "marketing", Component: SegmentLandingPage },
      { path: "data", Component: SegmentLandingPage },
      { path: "internal", Component: SegmentLandingPage },
      { path: "getting-started/installation", Component: InstallationPage },
      { path: "getting-started/theming", Component: ThemingPage },
      { path: "foundations/colors", Component: ColorsPage },
      { path: "foundations/typography", Component: TypographyPage },
      { path: "foundations/spacing", Component: SpacingPage },
      { path: "foundations/icons", Component: IconsPage },
      { path: "components/button", Component: ButtonPage },
      { path: "components/input", element: <PlaceholderPage title="Input" description="Text input fields for capturing user data, with support for validation states, prefixes, and suffixes." /> },
      { path: "components/card", element: <PlaceholderPage title="Card" description="Flexible container surfaces for grouping related content and actions." /> },
      { path: "components/badge", element: <PlaceholderPage title="Badge" description="Small status indicators and labels for categorizing or highlighting items." /> },
      { path: "components/dialog", element: <PlaceholderPage title="Dialog" description="Modal windows for focused interactions requiring user attention or confirmation." /> },
      { path: "components/dropdown", element: <PlaceholderPage title="Dropdown Menu" description="Contextual menus that reveal a list of options on trigger interaction." /> },
      { path: "components/tabs", element: <PlaceholderPage title="Tabs" description="Navigation component for switching between related content panels." /> },
      { path: "components/toggle", element: <PlaceholderPage title="Toggle" description="Binary control for switching between two states." /> },
      { path: "components/checkbox", element: <PlaceholderPage title="Checkbox" description="Selection control for choosing one or more items from a list." /> },
      { path: "components/select", element: <PlaceholderPage title="Select" description="Dropdown picker for choosing a single value from a list of options." /> },
      { path: "components/tooltip", element: <PlaceholderPage title="Tooltip" description="Contextual information surfaces that appear on hover or focus." /> },
      { path: "components/avatar", element: <PlaceholderPage title="Avatar" description="Visual representation of users via image or generated initials." /> },
      { path: "components/progress", element: <PlaceholderPage title="Progress" description="Visual indicator of task completion or loading state." /> },
      { path: "components/slider", element: <PlaceholderPage title="Slider" description="Range input control for selecting a value within a defined range." /> },
      // Segment sub-pages (catch-all placeholders)
      { path: "mobile/*", element: <PlaceholderPage title="Mobile Component" description="React Native component documentation coming soon." /> },
      { path: "marketing/*", element: <PlaceholderPage title="Marketing Component" description="Marketing section documentation coming soon." /> },
      { path: "data/*", element: <PlaceholderPage title="Data Component" description="Data & analytics component documentation coming soon." /> },
      { path: "internal/*", element: <PlaceholderPage title="Internal Component" description="Internal tools component documentation coming soon." /> },
      // Draft pages created via the sidebar add-page flow
      { path: "drafts/:id", Component: DraftPage },
    ],
  },
]);
