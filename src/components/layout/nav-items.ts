import { LayoutDashboard, Target, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Challenges", href: "/challenges", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
];
