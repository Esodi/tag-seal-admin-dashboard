import { getInitialUsers } from "@/lib/users";
import { UsersDashboard } from "@/features/users/users-dashboard";

export async function UserAccountsPage() {
  const initial = await getInitialUsers();
  return <UsersDashboard initialUsers={initial.users} initialOptions={initial.options} initialError={initial.error} />;
}
