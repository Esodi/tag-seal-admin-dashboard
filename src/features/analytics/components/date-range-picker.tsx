"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthOffset(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-TZ", { day: "numeric", month: "short", year: "numeric" }).format(parseDate(value));
}

export function DateRangePicker({ from, to, active, onChange }: { from: string; to: string; active: boolean; onChange: (from: string, to: string) => void }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => monthOffset(parseDate(from), 0));
  const [start, setStart] = useState<string | null>(from);
  const [end, setEnd] = useState<string | null>(to);

  const openPicker = () => {
    setStart(from);
    setEnd(to);
    setMonth(monthOffset(parseDate(from), 0));
    setOpen(true);
  };

  const chooseDate = (date: string) => {
    if (!start || end || date < start) {
      setStart(date);
      setEnd(null);
      return;
    }

    setEnd(date);
    onChange(start, date);
    setOpen(false);
  };

  return <>
    <Button type="button" variant={active ? "default" : "outline"} aria-pressed={active} onClick={openPicker}>
      <CalendarDays className="size-4" />Custom range
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="lg" className="gap-4">
        <DialogHeader>
          <DialogTitle>Choose a date range</DialogTitle>
          <DialogDescription>Select a start date, then an end date. Results update automatically.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-supporting">
          <span className="min-w-0 truncate text-muted-foreground">{start ? dateLabel(start) : "Start date"} <span className="mx-1">→</span> {end ? dateLabel(end) : "End date"}</span>
          <span className="ml-3 shrink-0 text-muted-foreground">{start && !end ? "Choose end" : "Choose start"}</span>
        </div>
        <div className="flex items-center justify-between border-b pb-2">
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setMonth((current) => monthOffset(current, -1))} aria-label="Previous month"><ChevronLeft /></Button>
          <span className="text-supporting font-medium">Browse months</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setMonth((current) => monthOffset(current, 1))} aria-label="Next month"><ChevronRight /></Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <CalendarMonth month={month} start={start} end={end} onSelect={chooseDate} />
          <div className="hidden sm:block"><CalendarMonth month={monthOffset(month, 1)} start={start} end={end} onSelect={chooseDate} /></div>
        </div>
        <p className="text-supporting text-muted-foreground">For a single day, select the same date twice.</p>
      </DialogContent>
    </Dialog>
  </>;
}

function CalendarMonth({ month, start, end, onSelect }: { month: Date; start: string | null; end: string | null; onSelect: (value: string) => void }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leading = (firstDay.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const slots = Math.ceil((leading + days) / 7) * 7;
  const today = isoDate(new Date());

  return <div>
    <h3 className="mb-3 text-center text-supporting font-semibold">{new Intl.DateTimeFormat("en-TZ", { month: "long", year: "numeric" }).format(month)}</h3>
    <div className="grid grid-cols-7 gap-1 text-center">
      {weekdays.map((day) => <span key={day} className="py-1 text-xs font-medium text-muted-foreground">{day}</span>)}
      {Array.from({ length: slots }, (_, index) => {
        const day = index - leading + 1;
        if (day < 1 || day > days) return <span key={index} aria-hidden="true" />;
        const value = isoDate(new Date(month.getFullYear(), month.getMonth(), day));
        const boundary = value === start || value === end;
        const withinRange = Boolean(start && end && value > start && value < end);
        return <button key={value} type="button" aria-label={dateLabel(value)} aria-pressed={boundary} onClick={() => onSelect(value)} className={cn("grid aspect-square min-h-9 place-items-center rounded-lg text-supporting tabular-nums transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", withinRange && "bg-primary/10", boundary && "bg-primary font-semibold text-primary-foreground hover:bg-primary/90", value === today && !boundary && "font-semibold text-primary ring-1 ring-primary/35")}>{day}</button>;
      })}
    </div>
  </div>;
}
