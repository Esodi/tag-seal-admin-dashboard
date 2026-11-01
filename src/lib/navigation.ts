import {
  Activity, BarChart3, Beef, BookOpenCheck, Building2, ClipboardList,
  Database, FileStack, HeartPulse, LayoutDashboard, MapPinned, ReceiptText,
  Settings2, ShieldCheck, Users,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; badge?: string };
export type NavGroup = { label: string; items: NavItem[] };

export const navigation: NavGroup[] = [
  { label: "Workspace", items: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ]},
  { label: "Operations", items: [
    { label: "Farms", href: "/dashboard/farms", icon: Building2 },
    { label: "Animals", href: "/dashboard/animals", icon: Beef, badge: "2,846" },
    { label: "Events", href: "/dashboard/events", icon: Activity },
    { label: "Health", href: "/dashboard/health", icon: HeartPulse },
    { label: "People & access", href: "/dashboard/people", icon: Users },
  ]},
  { label: "Configuration", items: [
    { label: "Blueprint studio", href: "/dashboard/blueprints", icon: FileStack, badge: "New" },
    { label: "Reference data", href: "/dashboard/reference", icon: Database },
    { label: "Locations", href: "/dashboard/locations", icon: MapPinned },
  ]},
  { label: "Insights", items: [
    { label: "Reports", href: "/dashboard/reports", icon: ClipboardList },
    { label: "Finance", href: "/dashboard/finance", icon: ReceiptText },
    { label: "Audit log", href: "/dashboard/audit", icon: BookOpenCheck },
  ]},
  { label: "Platform", items: [
    { label: "Security", href: "/dashboard/security", icon: ShieldCheck },
    { label: "System settings", href: "/dashboard/settings", icon: Settings2 },
  ]},
];

export const sectionMeta: Record<string, { title: string; description: string }> = {
  analytics: { title: "Analytics", description: "Trends and performance across livestock, farms and field operations." },
  farms: { title: "Farm registry", description: "Manage farms, ownership, access and location coverage." },
  animals: { title: "Animals", description: "Search animal subjects, identifiers, status and full history." },
  events: { title: "Events", description: "Explore health, reproduction, production and husbandry records." },
  health: { title: "Health operations", description: "Vaccinations, treatments, deworming and veterinary follow-up." },
  people: { title: "People & access", description: "Farmers, officers, veterinarians, users and invitations." },
  blueprints: { title: "Blueprint studio", description: "Design animal types, dynamic forms, events and publishing workflows." },
  reference: { title: "Reference data", description: "Maintain controlled lookup values used across the platform." },
  locations: { title: "Locations", description: "Countries, regions, districts, wards, villages and streets." },
  reports: { title: "Reports", description: "Animal, event, reproduction, production, health and finance reports." },
  finance: { title: "Finance", description: "Bills, income, expenditure and reconciliation." },
  audit: { title: "Audit log", description: "Review sensitive changes, actors, reasons and affected records." },
  security: { title: "Security", description: "Roles, platform permissions, OTP verification and access policies." },
  settings: { title: "System settings", description: "Mobile versions, sync, manifests, upgrades and migration controls." },
};
