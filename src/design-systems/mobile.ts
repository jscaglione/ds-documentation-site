import { createDesignSystem } from "./createDesignSystem";
import { SegmentLandingPage } from "../app/pages/SegmentLandingPage";

export const mobile = createDesignSystem({
  id: "mobile",
  label: "Mobile",
  description: "React Native components for iOS and Android",
  color: "#7C3AED",
  basePath: "/mobile",
  overview: { Page: SegmentLandingPage },
  guides: [
    { slug: "setup", label: "Setup", description: "Install the React Native package and configure Metro." },
    { slug: "expo", label: "Expo Integration", description: "Use the design system inside an Expo app." },
    { slug: "native-modules", label: "Native Modules", description: "Optional native modules for haptics, camera, and biometrics." },
  ],
  foundations: [
    { slug: "text", label: "Text", description: "Type styles mapped to native Text." },
    { slug: "icon", label: "Icon", description: "Icon set and sizing for iOS and Android." },
  ],
  components: [
    { slug: "button", label: "Button", description: "Pressable action control for React Native." },
    { slug: "input", label: "Input", description: "Text input with native keyboard support." },
    { slug: "switch", label: "Switch", description: "Boolean toggle using the platform switch." },
    { slug: "checkbox", label: "Checkbox", description: "Multi-select control." },
    { slug: "slider", label: "Slider", description: "Range input for native." },
    { slug: "safe-area", label: "SafeAreaView", description: "Insets for notches and home indicators." },
    { slug: "scroll-view", label: "ScrollView", description: "Scrollable content container." },
    { slug: "keyboard-avoiding", label: "KeyboardAvoidingView", description: "Keep inputs visible above the keyboard." },
    { slug: "list", label: "List", description: "Virtualized list of rows." },
    { slug: "section-list", label: "SectionList", description: "Sectioned native list." },
    { slug: "action-sheet", label: "ActionSheet", description: "Platform action sheet." },
    { slug: "bottom-sheet", label: "BottomSheet", description: "Draggable sheet overlay." },
    { slug: "modal", label: "Modal", description: "Full-screen or card modal." },
    { slug: "toast", label: "Toast", description: "Transient feedback message." },
    { slug: "alert", label: "Alert", description: "Native alert dialog." },
    { slug: "haptics", label: "Haptics", description: "Haptic feedback helpers." },
    { slug: "camera", label: "Camera", description: "Camera capture primitive." },
    { slug: "biometrics", label: "Biometrics", description: "Face ID / fingerprint prompt." },
  ],
  changelog: [],
});
