import { createDesignSystem } from "./createDesignSystem";
import { SegmentLandingPage } from "../app/pages/SegmentLandingPage";

export const marketing = createDesignSystem({
  id: "marketing",
  label: "Marketing",
  description: "Landing page sections and campaign components",
  color: "#0EA875",
  basePath: "/marketing",
  overview: { Page: SegmentLandingPage },
  guides: [
    { slug: "installation", label: "Installation", description: "Install marketing sections into a site or CMS." },
    { slug: "content", label: "Content Guidelines", description: "Voice, length, and image rules for campaign pages." },
  ],
  foundations: [],
  components: [
    { slug: "hero", label: "Hero", description: "Primary landing-page hero." },
    { slug: "features", label: "Feature Grid", description: "Feature highlights in a responsive grid." },
    { slug: "social-proof", label: "Social Proof", description: "Logos, ratings, and quote clusters." },
    { slug: "pricing", label: "Pricing Table", description: "Plan comparison table." },
    { slug: "faq", label: "FAQ", description: "Expandable frequently asked questions." },
    { slug: "cta", label: "CTA Banner", description: "Full-width call to action." },
    { slug: "footer", label: "Footer", description: "Site footer with links and legal." },
    { slug: "testimonial", label: "Testimonial Card", description: "Quoted customer story." },
    { slug: "stat-counter", label: "Stat Counter", description: "Animated metric." },
    { slug: "video", label: "Video Embed", description: "Responsive video embed." },
    { slug: "logos", label: "Logo Grid", description: "Partner or customer logos." },
    { slug: "team", label: "Team Grid", description: "Team member cards." },
    { slug: "cookie", label: "Cookie Banner", description: "Consent banner." },
    { slug: "announcement", label: "Announcement Bar", description: "Slim top-of-page notice." },
    { slug: "newsletter", label: "Newsletter Form", description: "Email capture form." },
  ],
  changelog: [],
});
