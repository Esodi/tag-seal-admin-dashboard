export type UserPermission = { id: number; code: string; name: string };
export type UserProfile = { id: number; name: string; phone?: string | null };
export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  parent?: string;
};

export type CooperativeRoleBadge = { role: string; status: string };

export type UserAccount = {
  id: number;
  uuid: string;
  username: string;
  email: string;
  phone?: string | null;
  role: string;
  roleLabel: string;
  roleId: number;
  profile: UserProfile | null;
  profileDetails?: Record<string, unknown> | null;
  cooperativeRoles?: CooperativeRoleBadge[];
  featureMemberships?: string[];
  status: string;
  statusLabel: string;
  permissions: UserPermission[];
  createdAt: string;
  updatedAt: string;
};

export type UserStats = {
  total: number;
  active: number;
  systemUsers: number;
  farmers: number;
};

export type UsersMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
  stats: UserStats;
};

export type UsersResponse = {
  status: boolean;
  data: UserAccount[];
  meta: UsersMeta;
};

export type UserFormOptions = {
  roles: SelectOption[];
  statuses: SelectOption[];
  permissions: UserPermission[];
  farms?: SelectOption[];
  countries?: SelectOption[];
  regions?: SelectOption[];
  districts?: SelectOption[];
  wards?: SelectOption[];
  villages?: SelectOption[];
  streets?: SelectOption[];
  identityCardTypes?: SelectOption[];
  schoolLevels?: SelectOption[];
};

export type UserFormOptionsResponse = {
  status: boolean;
  data: UserFormOptions;
};
