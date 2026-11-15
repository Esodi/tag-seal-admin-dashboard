"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ChevronDown, Languages, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AccountMenu({ compact = false, user, onNavigate }: {
  compact?: boolean;
  user?: { username?: string; email?: string; firstname?: string; surname?: string; platformRole?: string };
  onNavigate?: () => void;
}) {
  const { session, signOut } = useAuthSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const currentUser = session?.user ?? user;
  const displayName = [currentUser?.firstname, currentUser?.surname].filter(Boolean).join(" ") || currentUser?.username || "Administrator";
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const role = currentUser?.platformRole === "superAdmin" ? "Super administrator" : "Administrator";
  const avatar = <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</span>;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setConfirmSignOut(false);
    }
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Open profile menu" className={`${compact ? "size-10 justify-center" : "w-full p-2"} group flex items-center gap-3 rounded-xl text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>
          {avatar}
          {!compact && <><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{displayName}</span><span className="block truncate text-xs text-muted-foreground">{role}</span></span><ChevronDown className="size-4 text-muted-foreground transition group-data-[state=open]:rotate-180" /></>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={compact ? "bottom" : "top"} align={compact ? "end" : "start"} sideOffset={10} collisionPadding={12} className="w-64 max-w-[calc(100vw-1.5rem)] p-2">
        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">{avatar}<div className="min-w-0"><p className="truncate text-sm font-semibold">{displayName}</p><p className="truncate text-xs font-medium text-primary">{role}</p></div></div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard/account/profile" onClick={onNavigate}><UserRound />My profile</Link></DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? <Sun /> : <Moon />}Change theme<span className="ml-auto text-xs capitalize text-muted-foreground">{resolvedTheme}</span></DropdownMenuItem>
        <DropdownMenuItem disabled><Languages />Language<span className="ml-auto text-xs">EN</span></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={(event) => { event.preventDefault(); setConfirmSignOut(true); }}><LogOut />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <ConfirmationAlertDialog
      open={confirmSignOut}
      onOpenChange={(open) => { if (!signingOut) setConfirmSignOut(open); }}
      icon={<LogOut />}
      destructive
      title="Sign out?"
      description="You will need to sign in again to use the Tag & Seal administration dashboard."
      confirmLabel={signingOut ? "Signing out…" : "Sign out"}
      cancelLabel="Cancel"
      onConfirm={handleSignOut}
    />
  </>;
}
