export type PlatformRole = "superAdmin" | "admin" | "appUser";

export const PORTAL_COOP_ROLES = ["mcu_admin", "amcos_admin", "amcos_user"] as const;

export type PortalUserLike = {
  platformRole?: string | null;
  cooperativeRoles?: string[] | null;
  permissions?: string[] | null;
};

export const SECTION_PERMISSIONS: Record<string, string[]> = {
  people: ["accounts.view", "accounts.manage"],
  events: ["events.view", "events.submit", "events.void"],
  animals: ["subjects.view", "subjects.manage"],
  career: ["accounts.view", "accounts.manage"],
  commerce: ["commerce.view", "commerce.manage"],
  auction: ["auction.view", "auction.manage"],
  vet: ["vet.view", "vet.manage"],
  dairy: ["dairy.view", "dairy.manage"],
  blueprints: ["configuration.view", "configuration.manage", "configuration.publish"],
  finance: ["finance.view", "finance.manage"],
  reference: ["configuration.view", "configuration.manage", "configuration.publish"],
  locations: ["configuration.view", "configuration.manage"],
  security: ["permissions.manage", "upgrades.view", "upgrades.run", "accounts.view", "accounts.manage"],
};

export const FEATURE_PERMISSIONS: Record<string, string[]> = {
  "security/otp-verifications": ["accounts.view", "accounts.manage", "permissions.manage"],
  "security/upgrade-runs": ["upgrades.view", "upgrades.run"],
  "security/ledger-migration": ["upgrades.view", "upgrades.run"],
  "security/platform-permissions": ["permissions.manage"],
};

export function canEnterPortal(user?: PortalUserLike | null): boolean {
  if (!user) return false;
  if (user.platformRole === "superAdmin" || user.platformRole === "admin") {
    return true;
  }
  const coop = user.cooperativeRoles ?? [];
  return coop.some((role) => (PORTAL_COOP_ROLES as readonly string[]).includes(role));
}

export function isSuperAdmin(user?: PortalUserLike | null): boolean {
  return user?.platformRole === "superAdmin";
}

export function hasPermission(user: PortalUserLike | null | undefined, code: string): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return (user.permissions ?? []).includes(code);
}

export function hasAnyPermission(user: PortalUserLike | null | undefined, codes: string[]): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const granted = new Set(user.permissions ?? []);
  return codes.some((code) => granted.has(code));
}

export function canAccessSection(user: PortalUserLike | null | undefined, sectionSlug: string): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const required = SECTION_PERMISSIONS[sectionSlug];
  if (!required) return false;
  return hasAnyPermission(user, required);
}

export function canAccessFeature(
  user: PortalUserLike | null | undefined,
  sectionSlug: string,
  featureSlug: string,
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const key = `${sectionSlug}/${featureSlug}`;
  const specific = FEATURE_PERMISSIONS[key];
  if (specific) {
    return hasAnyPermission(user, specific);
  }
  return canAccessSection(user, sectionSlug);
}

export function getVisibleSections(user: PortalUserLike | null | undefined): string[] {
  return Object.keys(SECTION_PERMISSIONS).filter((slug) => canAccessSection(user, slug));
}

export function getRoleDisplayLabel(user?: PortalUserLike | null): string {
  if (!user) return "Administrator";
  if (user.platformRole === "superAdmin") return "SuperAdmin";
  const coop = user.cooperativeRoles ?? [];
  if (coop.includes("mcu_admin")) return "MCU Admin";
  if (coop.includes("amcos_admin")) return "AMCOS Admin";
  if (coop.includes("amcos_user")) return "AMCOS User";
  if (user.platformRole === "admin") return "Administrator";
  return "Portal User";
}
