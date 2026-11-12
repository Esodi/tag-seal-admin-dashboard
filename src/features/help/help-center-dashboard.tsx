"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, Copy, Keyboard, Search, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { reportDate } from "@/lib/report-print";

export const helpTopics = [
  { category: "Accounts & access", items: [
    { question: "How do I update my profile?", answer: "Open the avatar menu in the header or sidebar and choose My profile. Edit your personal details and select Save profile. Changes appear in both profile menus after a successful save.", href: "/dashboard/account/profile", link: "Open my profile" },
    { question: "Why can’t I access a page or perform an action?", answer: "Your administrator role and assigned permissions control access. Ask a super administrator to review your permissions. Editing your own profile does not change your role." },
    { question: "Why is account deletion unavailable?", answer: "The last administrator cannot be removed. Accounts linked to operational records also need review by another administrator before deletion." },
  ] },
  { category: "Records & workflows", items: [
    { question: "How do I find and edit a record?", answer: "Choose a section in the sidebar, search its table, and use status filters to narrow the results. Open the row’s actions menu to view details or edit where supported." },
    { question: "Where do archived events appear?", answer: "For event types that support archiving, switch to the Deleted tab. Available actions may include restore and permanent deletion. Review the confirmation carefully before continuing.", href: "/dashboard/events", link: "Open Events" },
    { question: "Can I work without an internet connection?", answer: "This dashboard requires a connection to load and save records. If a save fails, keep your edits open and retry when connected. A failed save should not be treated as a completed update." },
  ] },
  { category: "Finance & reports", items: [
    { question: "How do I print a financial report?", answer: "Open Finance → Income & Expenditure, select the period and filters, and choose Print report. The print preview includes the returned sections and uses East Africa Time. Use your browser’s Save as PDF option for a digital copy.", href: "/dashboard/finance/income-expenditure", link: "Open financial report" },
    { question: "Why is the financial report marked as a limited preview?", answer: "The report includes up to 250 records per source in its summary and up to 100 rows per section. Narrow the date range to review smaller periods. A preview should not be treated as a complete ledger." },
    { question: "How do I investigate a loading error?", answer: "Try again after checking your connection. If the problem continues, send your implementation team the page name, the error message, and the steps that led to it. Copy diagnostics below for the browser and connection details." },
  ] },
];
export function HelpCenterDashboard() {
  const [query, setQuery] = useState("");
  const filtered = helpTopics.map(group => ({ ...group, items: group.items.filter(item => `${group.category} ${item.question} ${item.answer}`.toLowerCase().includes(query.trim().toLowerCase())) })).filter(group => group.items.length);
  async function diagnostics() {
    try { await navigator.clipboard.writeText(`Tag & Seal support details\nTime: ${reportDate(new Date().toISOString(), true)}\nPage: ${window.location.pathname}\nConnection: ${navigator.onLine ? "Online" : "Offline"}\nBrowser: ${navigator.userAgent}`); toast.success("Diagnostics copied. Share them with your support team."); }
    catch { toast.error("Could not copy diagnostics. Share the page name and error message with your support team."); }
  }
  return <div className="mx-auto max-w-6xl space-y-6"><DashboardHeader title="Help Center" description="Find answers, understand workflows, and get help with Tag & Seal." actions={<Button variant="outline" onClick={() => void diagnostics()}><Copy />Copy diagnostics</Button>} />
    <div className="relative"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search help articles" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search accounts, records, reports…" className="h-12 rounded-xl bg-card pl-11" /></div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-5" aria-live="polite">{filtered.length ? filtered.map(group => <Card key={group.category} className="gap-3 shadow-none"><CardHeader><h2 className="flex items-center gap-2 font-semibold"><BookOpen className="size-4 text-primary" />{group.category}</h2></CardHeader><CardContent className="divide-y">{group.items.map(item => <details key={item.question} className="group py-4"><summary className="cursor-pointer text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.question}</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>{"href" in item && item.href && <Link href={item.href} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">{item.link}<ArrowRight className="size-3.5" /></Link>}</details>)}</CardContent></Card>) : <Card className="p-6 text-center"><h2 className="font-semibold">No matching answers</h2><p className="text-sm text-muted-foreground">Try another keyword or clear your search.</p><Button variant="outline" onClick={() => setQuery("")}>Clear search</Button></Card>}</div>
      <aside className="space-y-5"><Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-2 font-semibold"><Keyboard className="size-4 text-primary" />Keyboard navigation</h2></CardHeader><CardContent className="space-y-4">{[["Tab", "Move to the next control"], ["Shift + Tab", "Move to the previous control"], ["Enter", "Activate a focused button or link"], ["Esc", "Close an open menu or dialog"]].map(([key, text]) => <div key={key} className="space-y-1.5"><kbd className="rounded border bg-muted px-2 py-1 text-xs">{key}</kbd><p className="text-xs leading-5 text-muted-foreground">{text}</p></div>)}</CardContent></Card><Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-4 text-primary" />Need more help?</h2></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-6 text-muted-foreground">Contact your platform administrator or implementation team. Include the affected page, steps to reproduce, and a screenshot of the error.</p><p className="text-xs text-muted-foreground">Never share passwords, PINs, or verification codes.</p><Button variant="outline" className="w-full" onClick={() => void diagnostics()}><Copy />Copy diagnostics</Button></CardContent></Card></aside>
    </div>
  </div>;
}
