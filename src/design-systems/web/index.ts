import { createDesignSystem } from "../createDesignSystem";
import { OverviewPage } from "../../app/pages/OverviewPage";
import { InstallationPage } from "../../app/pages/InstallationPage";
import { ThemingPage } from "../../app/pages/ThemingPage";
import { ColorsPage } from "../../app/pages/ColorsPage";
import { TypographyPage } from "../../app/pages/TypographyPage";
import { SpacingPage } from "../../app/pages/SpacingPage";
import { IconsPage } from "../../app/pages/IconsPage";
import { ButtonPage } from "../../app/pages/ButtonPage";
import { WEB_CHANGELOG } from "./changelog";

export const web = createDesignSystem({
  id: "web",
  label: "Web",
  description: "React component library for web applications",
  color: "#2B3FE7",
  basePath: "",
  overview: { Page: OverviewPage },
  guides: [
    { slug: "installation", label: "Installation", Page: InstallationPage },
    { slug: "theming", label: "Theming", Page: ThemingPage },
  ],
  foundations: [
    { slug: "colors", label: "Colors", Page: ColorsPage },
    { slug: "typography", label: "Typography", Page: TypographyPage },
    { slug: "spacing", label: "Spacing", Page: SpacingPage },
    { slug: "icons", label: "Icons", Page: IconsPage },
  ],
  components: [
    { slug: "avatar", label: "Avatar", description: "Visual representation of users via image or generated initials." },
    { slug: "badge", label: "Badge", description: "Small status indicators and labels for categorizing or highlighting items." },
    { slug: "button", label: "Button", Page: ButtonPage },
    { slug: "card", label: "Card", description: "Flexible container surfaces for grouping related content and actions." },
    { slug: "checkbox", label: "Checkbox", description: "Selection control for choosing one or more items from a list." },
    { slug: "dialog", label: "Dialog", description: "Modal windows for focused interactions requiring user attention or confirmation." },
    { slug: "dropdown", label: "Dropdown Menu", description: "Contextual menus that reveal a list of options on trigger interaction." },
    { slug: "input", label: "Input", description: "Text input fields for capturing user data, with support for validation states, prefixes, and suffixes." },
    { slug: "progress", label: "Progress", description: "Visual indicator of task completion or loading state." },
    { slug: "select", label: "Select", description: "Dropdown picker for choosing a single value from a list of options." },
    { slug: "slider", label: "Slider", description: "Range input control for selecting a value within a defined range." },
    { slug: "tabs", label: "Tabs", description: "Navigation component for switching between related content panels." },
    { slug: "toggle", label: "Toggle", description: "Binary control for switching between two states." },
    { slug: "tooltip", label: "Tooltip", description: "Contextual information surfaces that appear on hover or focus." },
  ],
  changelog: WEB_CHANGELOG,
});
