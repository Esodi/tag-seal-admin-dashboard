"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Globe,
  Layers,
  QrCode,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  AnimalBlueprintRecord,
  EventDefinitionRecord,
  FormFieldSchema,
  FormSchema,
  LocalizedText,
} from "./types";

function resolveText(text: LocalizedText | undefined, locale: "en" | "sw", fallback = ""): string {
  if (!text) return fallback;
  if (typeof text === "string") return text;
  return text[locale] ?? text.en ?? text.sw ?? fallback;
}

export function BlueprintPreviewModal({
  open,
  onOpenChange,
  blueprint,
  eventRecord,
  formSchema,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blueprint?: AnimalBlueprintRecord | null;
  eventRecord?: EventDefinitionRecord | null;
  formSchema?: FormSchema | null;
}) {
  const [locale, setLocale] = useState<"en" | "sw">("en");
  const [unitType, setUnitType] = useState<"individual" | "group">("individual");
  const [sexCode, setSexCode] = useState<string>("female");
  const [role, setRole] = useState<string>("farmer");
  const [activeTab, setActiveTab] = useState<string>("registration");
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Reset form values on open
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormValues({});
    }
    onOpenChange(isOpen);
  };

  const currentRegistrationSchema = blueprint?.registrationForm?.schema_json ?? formSchema;
  const events = blueprint?.events ?? (eventRecord ? [eventRecord] : []);

  // Determine current active schema
  const activeSchema: FormSchema | null = useMemo(() => {
    if (formSchema && !blueprint) return formSchema;
    if (activeTab === "registration") {
      return currentRegistrationSchema ?? null;
    }
    const currentEvent = events.find((e) => e.code === activeTab || e.uuid === activeTab);
    return currentEvent?.form?.schema_json ?? null;
  }, [activeTab, blueprint, currentRegistrationSchema, events, formSchema]);

  const activeEvent = useMemo(() => {
    if (activeTab === "registration") return null;
    return events.find((e) => e.code === activeTab || e.uuid === activeTab) ?? null;
  }, [activeTab, events]);

  const updateValue = (key: string, val: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleUnitTypeChange = (newType: "individual" | "group") => {
    setUnitType(newType);
    if (newType === "group") {
      setSexCode("not_applicable");
    } else if (sexCode === "not_applicable") {
      setSexCode("female");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold">
                  {blueprint ? `Blueprint Simulation: ${blueprint.code}` : "Dynamic Form Preview"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Interactive simulation environment testing field logic, translations, and eligibility.
                </p>
              </div>
            </div>
            {blueprint && (
              <Badge variant="outline" className="font-mono text-xs">
                v{blueprint.version} • {blueprint.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Simulation Context Controls Toolbar */}
        <div className="border-b bg-muted/40 px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">Unit:</span>
                <div className="inline-flex rounded-lg border bg-card p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleUnitTypeChange("individual")}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      unitType === "individual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitTypeChange("group")}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      unitType === "group" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Group / Herd
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">Sex:</span>
                <Select value={sexCode} onValueChange={setSexCode} disabled={unitType === "group"}>
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="intersex">Intersex</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                    <SelectItem value="not_applicable">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">Actor:</span>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="extension_officer">Extension Officer</SelectItem>
                    <SelectItem value="vet">Veterinarian</SelectItem>
                    <SelectItem value="admin">Platform Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 rounded-lg border bg-card p-1 text-xs">
              <Globe className="ml-1 size-3.5 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`rounded px-2 py-0.5 text-xs font-semibold transition ${
                  locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLocale("sw")}
                className={`rounded px-2 py-0.5 text-xs font-semibold transition ${
                  locale === "sw" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Kiswahili
              </button>
            </div>
          </div>
        </div>

        {/* Two-Column Simulation Workspace */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-12">
          {/* Left Column: Flows & Events Selector */}
          <div className="space-y-4 md:col-span-4">
            <div className="rounded-xl border bg-card p-3 shadow-2xs">
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Blueprint Workflows
              </h3>

              <div className="space-y-1.5">
                {currentRegistrationSchema && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("registration")}
                    className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                      activeTab === "registration"
                        ? "border-primary bg-primary/5 text-primary shadow-2xs ring-1 ring-primary/20"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground">
                        {locale === "sw" ? "Fomu ya Usajili" : "Registration Form"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {blueprint?.registrationForm?.code ?? "intake schema"}
                      </p>
                    </div>
                  </button>
                )}

                {events.map((ev) => {
                  const isSelected = activeTab === ev.code || activeTab === ev.uuid;
                  const eventName = resolveText(ev.translations_json, locale, ev.name);
                  return (
                    <button
                      key={ev.uuid}
                      type="button"
                      onClick={() => setActiveTab(ev.code || ev.uuid)}
                      className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary shadow-2xs ring-1 ring-primary/20"
                          : "border-border bg-card hover:bg-muted/50"
                      }`}
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                        <Activity className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground">{eventName}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{ev.code}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {ev.family ?? "Event"}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Context Inspector */}
            <div className="rounded-xl border bg-muted/30 p-3 text-xs">
              <h4 className="font-semibold text-muted-foreground">Active Facts Context</h4>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-foreground">
                <p>unit_type: <span className="font-bold text-primary">{unitType}</span></p>
                <p>sex_code: <span className="font-bold text-primary">{sexCode}</span></p>
                <p>actor_role: <span className="font-bold text-primary">{role}</span></p>
                <p>locale: <span className="font-bold text-primary">{locale}</span></p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Form Preview */}
          <div className="space-y-4 md:col-span-8">
            {activeEvent && (
              <div className="rounded-xl border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {resolveText(activeEvent.translations_json, locale, activeEvent.name)}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground">{activeEvent.code}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    Behavior: {activeEvent.behavior_code ?? "Standard"}
                  </Badge>
                </div>
              </div>
            )}

            {!activeSchema || activeSchema.sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
                <FileText className="size-10 text-muted-foreground/60" />
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  No active form schema configured for this flow.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSchema.sections.map((section, sIndex) => {
                  const sectionTitle = resolveText(section.title, locale, `Section ${sIndex + 1}`);
                  const sectionDesc = resolveText(section.description, locale, "");
                  return (
                    <Card key={section.key || sIndex} className="shadow-2xs">
                      <CardContent className="space-y-4 p-5">
                        <div className="border-b pb-2.5">
                          <h4 className="text-xs font-bold text-foreground">{sectionTitle}</h4>
                          {sectionDesc && <p className="mt-0.5 text-[11px] text-muted-foreground">{sectionDesc}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {section.fields.map((field) => {
                            const fieldLabel = resolveText(field.label, locale, field.key);
                            const fieldHelp = resolveText(field.helpText, locale, "");
                            const fieldPlaceholder = resolveText(field.placeholder, locale, "");
                            const isRequired = field.required === "always";
                            const val = formValues[field.key] ?? "";

                            return (
                              <div
                                key={field.key}
                                className={`space-y-1.5 ${
                                  field.component === "multiline_text" || field.component === "photo"
                                    ? "sm:col-span-2"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-medium text-foreground">
                                    {fieldLabel}
                                    {isRequired && <span className="ml-0.5 text-danger">*</span>}
                                  </label>
                                  {field.role && (
                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                                      {field.role}
                                    </span>
                                  )}
                                </div>

                                {field.component === "text" && (
                                  <Input
                                    value={String(val)}
                                    onChange={(e) => updateValue(field.key, e.target.value)}
                                    placeholder={fieldPlaceholder || `Enter ${fieldLabel}...`}
                                    className="h-9 text-xs"
                                  />
                                )}

                                {field.component === "multiline_text" && (
                                  <textarea
                                    value={String(val)}
                                    onChange={(e) => updateValue(field.key, e.target.value)}
                                    placeholder={fieldPlaceholder || `Enter notes...`}
                                    rows={3}
                                    className="w-full rounded-md border bg-card p-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                )}

                                {(field.component === "integer" || field.component === "decimal") && (
                                  <Input
                                    type="number"
                                    value={String(val)}
                                    onChange={(e) => updateValue(field.key, e.target.value)}
                                    placeholder={fieldPlaceholder || "0"}
                                    className="h-9 text-xs"
                                  />
                                )}

                                {field.component === "measurement" && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={String(val)}
                                      onChange={(e) => updateValue(field.key, e.target.value)}
                                      placeholder="0.00"
                                      className="h-9 flex-1 text-xs"
                                    />
                                    {field.unit && (
                                      <span className="inline-flex h-9 items-center rounded-md border bg-muted px-2.5 text-xs font-bold text-muted-foreground">
                                        {field.unit}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {field.component === "single_select" && (
                                  <Select
                                    value={String(val)}
                                    onValueChange={(newVal) => updateValue(field.key, newVal)}
                                  >
                                    <SelectTrigger className="h-9 text-xs">
                                      <SelectValue placeholder={fieldPlaceholder || "Select option..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(field.options ?? [
                                        { value: "option_1", label: "Option 1" },
                                        { value: "option_2", label: "Option 2" },
                                      ]).map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {resolveText(opt.label, locale, opt.value)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {field.component === "identifier_scanner" && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={String(val)}
                                      onChange={(e) => updateValue(field.key, e.target.value)}
                                      placeholder="Scan or enter tag ID..."
                                      className="h-9 flex-1 font-mono text-xs"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateValue(field.key, `TAG-${Math.floor(100000 + Math.random() * 900000)}`)}
                                      className="h-9 gap-1.5 text-xs font-semibold"
                                    >
                                      <QrCode className="size-3.5" />
                                      Mock Scan
                                    </Button>
                                  </div>
                                )}

                                {field.component === "photo" && (
                                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-center">
                                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                      <Camera className="size-5" />
                                      <span className="text-xs font-semibold">Simulated Camera Intake</span>
                                      <span className="text-[10px]">Tap to simulate camera capture on mobile device</span>
                                    </div>
                                  </div>
                                )}

                                {field.component === "date" && (
                                  <Input
                                    type="date"
                                    value={String(val)}
                                    onChange={(e) => updateValue(field.key, e.target.value)}
                                    className="h-9 text-xs"
                                  />
                                )}

                                {fieldHelp && (
                                  <p className="text-[10px] text-muted-foreground">{fieldHelp}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

