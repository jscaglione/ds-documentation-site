import { createDesignSystem } from "./createDesignSystem";
import { SegmentLandingPage } from "../app/pages/SegmentLandingPage";

export const data = createDesignSystem({
  id: "data",
  label: "Data & Analytics",
  description: "Charts, tables, and data visualization",
  color: "#D97706",
  basePath: "/data",
  overview: { Page: SegmentLandingPage },
  guides: [
    { slug: "setup", label: "Setup", description: "Install chart and table packages." },
    { slug: "formatting", label: "Data Formatting", description: "Number, date, and currency formatters." },
  ],
  foundations: [],
  components: [
    { slug: "bar-chart", label: "Bar Chart", description: "Vertical and horizontal bars." },
    { slug: "line-chart", label: "Line Chart", description: "Time-series line chart." },
    { slug: "area-chart", label: "Area Chart", description: "Filled area series." },
    { slug: "pie-chart", label: "Pie Chart", description: "Part-to-whole pie or donut." },
    { slug: "scatter", label: "Scatter Plot", description: "XY scatter plot." },
    { slug: "heatmap", label: "Heatmap", description: "Matrix heatmap." },
    { slug: "sparkline", label: "Sparkline", description: "Inline trend sparkline." },
    { slug: "kpi-card", label: "KPI Card", description: "Single metric with delta." },
    { slug: "table", label: "Data Table", description: "Sortable, filterable table." },
    { slug: "pagination", label: "Pagination", description: "Page controls for large sets." },
    { slug: "filters", label: "Filters", description: "Faceted filter bar." },
    { slug: "date-range", label: "DateRange Picker", description: "Start and end date picker." },
    { slug: "export", label: "Export Menu", description: "CSV / PNG export actions." },
    { slug: "grid", label: "Dashboard Grid", description: "Dashboard widget layout." },
    { slug: "comparison", label: "Metric Comparison", description: "Side-by-side metric comparison." },
    { slug: "alert-rule", label: "Alert Rule", description: "Threshold alert configuration." },
  ],
  changelog: [],
});
