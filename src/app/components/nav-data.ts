export interface NavItem {
  label: string;
  path: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
