"use client";

import { useState } from "react";
import {
  Sparkles,
  Layers,
  Tag,
  FileText,
  Activity,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import type {
  BlueprintOptionsResponse,
  BlueprintStudioEvent,
  BlueprintStudioPayload,
  BlueprintStudioSection,
  BlueprintStudioStage,
} from "./types";

const PRESET_TEMPLATES: Record<
  string,
  {
    name: string;
    animalType: string;
    code: string;
    defaultSubjectMode: "individual" | "group";
    subjectModes: string[];
    groupDisplayName?: string;
    reproductionMode: string;
    stages: BlueprintStudioStage[];
    formSections: BlueprintStudioSection[];
    events: BlueprintStudioEvent[];
  }
> = {
  dairy_cattle: {
    name: "Dairy Cattle",
    animalType: "cattle",
    code: "dairy_cattle_v1",
    defaultSubjectMode: "individual",
    subjectModes: ["individual"],
    reproductionMode: "live_birth",
    stages: [
      { name: "Calf", code: "calf", isTagApplicable: false },
      { name: "Weaner", code: "weaner", isTagApplicable: false },
      { name: "Heifer", code: "heifer", isTagApplicable: true },
      { name: "Cow", code: "cow", isTagApplicable: true },
      { name: "Bull", code: "bull", isTagApplicable: true },
    ],
    formSections: [
      {
        id: "physical",
        title: "Physical Attributes",
        fields: [
          { key: "coat_pattern", label: "Coat Pattern", type: "text", required: false },
          { key: "horn_status", label: "Horn Status", type: "select", options: ["Polled", "Horned", "Dehorned"], required: false },
        ],
      },
      {
        id: "breeding",
        title: "Pedigree & Origin",
        fields: [
          { key: "sire_breed", label: "Sire Breed", type: "text", required: false },
          { key: "dam_breed", label: "Dam Breed", type: "text", required: false },
        ],
      },
    ],
    events: [
      { name: "Daily Milking", code: "milking", family: "production", behaviorCode: "record_milking", enabled: true },
      { name: "Weighing & Growth", code: "record_weight", family: "inventory", behaviorCode: "record_weight", enabled: true },
      { name: "Vaccination", code: "record_vaccination", family: "health", behaviorCode: "record_vaccination", enabled: true },
      { name: "Artificial Insemination", code: "insemination", family: "reproduction", behaviorCode: "record_insemination", enabled: true },
      { name: "Calving & Birth", code: "calving", family: "reproduction", behaviorCode: "record_birth", enabled: true },
      { name: "Mortality / Exit", code: "animal_mortality", family: "lifecycle", behaviorCode: "record_exit", enabled: true },
    ],
  },
  broiler_poultry: {
    name: "Broiler Poultry",
    animalType: "poultry",
    code: "broiler_poultry_v1",
    defaultSubjectMode: "group",
    subjectModes: ["group"],
    groupDisplayName: "Flock / Batch",
    reproductionMode: "egg_laying",
    stages: [
      { name: "Day-Old Chick", code: "day_old_chick", isTagApplicable: false },
      { name: "Brooder", code: "brooder", isTagApplicable: false },
      { name: "Grower", code: "grower", isTagApplicable: false },
      { name: "Finisher", code: "finisher", isTagApplicable: false },
    ],
    formSections: [
      {
        id: "housing",
        title: "Housing & Pen Details",
        fields: [
          { key: "pen_number", label: "Pen / House Identifier", type: "text", required: true },
          { key: "hatchery_source", label: "Hatchery Source", type: "text", required: false },
        ],
      },
    ],
    events: [
      { name: "Daily Feed Intake", code: "daily_feed", family: "feeding", behaviorCode: "feed_intake", enabled: true },
      { name: "Flock Mortality Log", code: "flock_mortality", family: "lifecycle", behaviorCode: "flock_mortality", enabled: true },
      { name: "Batch Medication", code: "batch_vaccination", family: "health", behaviorCode: "record_vaccination", enabled: true },
      { name: "Sample Weighing", code: "batch_sample_weight", family: "inventory", behaviorCode: "record_weight", enabled: true },
      { name: "Batch Harvest / Sale", code: "flock_harvest", family: "production", behaviorCode: "batch_sale", enabled: true },
    ],
  },
  swine_pork: {
    name: "Swine / Pigs",
    animalType: "pig",
    code: "swine_pig_v1",
    defaultSubjectMode: "individual",
    subjectModes: ["individual", "group"],
    groupDisplayName: "Pen / Litter",
    reproductionMode: "live_birth",
    stages: [
      { name: "Piglet (Suckling)", code: "piglet", isTagApplicable: false },
      { name: "Weaner", code: "weaner", isTagApplicable: false },
      { name: "Grower", code: "grower", isTagApplicable: true },
      { name: "Finisher", code: "finisher", isTagApplicable: true },
      { name: "Sow / Boar", code: "breeding_adult", isTagApplicable: true },
    ],
    formSections: [
      {
        id: "genetics",
        title: "Lineage & Litter Info",
        fields: [
          { key: "litter_number", label: "Litter Number", type: "text", required: false },
          { key: "teat_count", label: "Teat Count", type: "number", required: false },
        ],
      },
    ],
    events: [
      { name: "Weighing & ADG", code: "record_weight", family: "inventory", behaviorCode: "record_weight", enabled: true },
      { name: "Farrowing & Litter Size", code: "farrowing", family: "reproduction", behaviorCode: "record_birth", enabled: true },
      { name: "Iron & Vaccination", code: "pig_vaccination", family: "health", behaviorCode: "record_vaccination", enabled: true },
      { name: "Mortality", code: "pig_mortality", family: "lifecycle", behaviorCode: "record_exit", enabled: true },
    ],
  },
  dairy_goat: {
    name: "Dairy & Meat Goat",
    animalType: "goat",
    code: "goat_standard_v1",
    defaultSubjectMode: "individual",
    subjectModes: ["individual", "group"],
    groupDisplayName: "Herd / Pen",
    reproductionMode: "live_birth",
    stages: [
      { name: "Kid (Neonate)", code: "kid", isTagApplicable: false },
      { name: "Weaner Kid", code: "weaner", isTagApplicable: false },
      { name: "Grower Goat", code: "grower", isTagApplicable: true },
      { name: "Doe (Adult Female)", code: "doe", isTagApplicable: true },
      { name: "Buck (Adult Male)", code: "buck", isTagApplicable: true },
    ],
    formSections: [
      {
        id: "characteristics",
        title: "Goat Characteristics",
        fields: [
          { key: "breed_variety", label: "Breed Variety", type: "text", required: false },
          { key: "horn_status", label: "Horn Status", type: "select", options: ["Horned", "Polled", "Disbudded"], required: false },
          { key: "coat_color", label: "Coat Color", type: "text", required: false },
        ],
      },
    ],
    events: [
      { name: "Kidding & Birth", code: "record_kidding", family: "reproduction", behaviorCode: "record_birth", enabled: true },
      { name: "Milking & Yield", code: "record_milking", family: "production", behaviorCode: "record_milking", enabled: true },
      { name: "Fiber (Wool) Shearing", code: "record_fiber", family: "production", behaviorCode: "record_production_yield", enabled: false },
      { name: "Weighing & Growth", code: "record_weight", family: "inventory", behaviorCode: "record_weight", enabled: true },
      { name: "Herd Vaccination", code: "record_vaccination", family: "health", behaviorCode: "record_vaccination", enabled: true },
      { name: "Deworming", code: "record_deworming", family: "health", behaviorCode: "record_deworming", enabled: true },
      { name: "Veterinary Treatment", code: "record_treatment", family: "health", behaviorCode: "record_treatment", enabled: true },
      { name: "Dry-off", code: "record_dryoff", family: "reproduction", behaviorCode: "record_dryoff", enabled: true },
      { name: "Artificial Insemination", code: "insemination", family: "reproduction", behaviorCode: "record_insemination", enabled: true },
      { name: "Pregnancy Check", code: "pregnancy", family: "reproduction", behaviorCode: "record_pregnancy", enabled: true },
      { name: "Mortality / Exit", code: "goat_exit", family: "lifecycle", behaviorCode: "record_exit", enabled: true },
    ],
  },
};

export function BlueprintStudioDialog({
  isOpen,
  onClose,
  options,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  options?: BlueprintOptionsResponse["data"] | null;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Species & Mode
  const [code, setCode] = useState("");
  const [speciesName, setSpeciesName] = useState("");
  const [animalType, setAnimalType] = useState("cattle");
  const [subjectModes, setSubjectModes] = useState<string[]>(["individual"]);
  const [defaultSubjectMode, setDefaultSubjectMode] = useState<"individual" | "group">("individual");
  const [groupDisplayName, setGroupDisplayName] = useState("");
  const [reproductionMode, setReproductionMode] = useState("live_birth");

  // Step 2: Identification & Stages
  const [stages, setStages] = useState<BlueprintStudioStage[]>([
    { name: "Young (Early Stage)", code: "young", isTagApplicable: false },
    { name: "Adult", code: "adult", isTagApplicable: true },
  ]);
  const [newStageName, setNewStageName] = useState("");
  const [newStageIsTagApplicable, setNewStageIsTagApplicable] = useState(true);

  // Step 3: Registration Form Schema
  const [sections, setSections] = useState<BlueprintStudioSection[]>([
    {
      id: "general_traits",
      title: "Physical Attributes",
      fields: [
        { key: "color_markings", label: "Distinct Markings", type: "text", required: false },
      ],
    },
  ]);
  const [newFieldSectionId, setNewFieldSectionId] = useState("general_traits");
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date" | "select" | "boolean">("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // Step 4: Lifecycle Events
  const [events, setEvents] = useState<BlueprintStudioEvent[]>([
    { name: "Weighing & Growth", code: "record_weight", family: "inventory", behaviorCode: "record_weight", enabled: true },
    { name: "Veterinary / Vaccination", code: "record_vaccination", family: "health", behaviorCode: "record_vaccination", enabled: true },
    { name: "Mortality / Exit", code: "record_exit", family: "lifecycle", behaviorCode: "record_exit", enabled: true },
  ]);
  const [newEventName, setNewEventName] = useState("");
  const [newEventCode, setNewEventCode] = useState("");
  const [newEventFamily, setNewEventFamily] = useState("health");

  // Apply a Starter Preset
  const applyPreset = (presetKey: string) => {
    const preset = PRESET_TEMPLATES[presetKey];
    if (!preset) return;
    setCode(preset.code);
    setSpeciesName(preset.name);
    setAnimalType(preset.animalType);
    setSubjectModes([...preset.subjectModes]);
    setDefaultSubjectMode(preset.defaultSubjectMode);
    setGroupDisplayName(preset.groupDisplayName || "");
    setReproductionMode(preset.reproductionMode);
    setStages(preset.stages.map((s) => ({ ...s })));
    setSections(preset.formSections.map((sec) => ({ ...sec, fields: [...sec.fields] })));
    setEvents(preset.events.map((e) => ({ ...e })));
    if (preset.formSections.length > 0) {
      setNewFieldSectionId(preset.formSections[0].id);
    }
    toast.success(`Loaded "${preset.name}" preset template!`);
  };

  // Stage Handlers
  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    setStages((prev) => [
      ...prev,
      {
        name: newStageName.trim(),
        code: newStageName.trim().toLowerCase().replace(/\s+/g, "_"),
        isTagApplicable: newStageIsTagApplicable,
      },
    ]);
    setNewStageName("");
    setNewStageIsTagApplicable(true);
  };

  const handleToggleStageTagApplicable = (index: number) => {
    setStages((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isTagApplicable: !s.isTagApplicable } : s))
    );
  };

  const handleRemoveStage = (index: number) => {
    setStages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Field Handlers
  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    const finalKey = newFieldKey.trim() || newFieldLabel.trim().toLowerCase().replace(/\s+/g, "_");
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === newFieldSectionId) {
          return {
            ...sec,
            fields: [
              ...sec.fields,
              {
                key: finalKey,
                label: newFieldLabel.trim(),
                type: newFieldType,
                required: newFieldRequired,
              },
            ],
          };
        }
        return sec;
      })
    );
    setNewFieldKey("");
    setNewFieldLabel("");
    setNewFieldRequired(false);
  };

  const handleRemoveField = (sectionId: string, fieldIndex: number) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            fields: sec.fields.filter((_, idx) => idx !== fieldIndex),
          };
        }
        return sec;
      })
    );
  };

  // Event Handlers
  const handleToggleEvent = (index: number) => {
    setEvents((prev) =>
      prev.map((ev, idx) => (idx === index ? { ...ev, enabled: !ev.enabled } : ev))
    );
  };

  const handleAddCustomEvent = () => {
    if (!newEventName.trim()) return;
    const evCode = newEventCode.trim() || newEventName.trim().toLowerCase().replace(/\s+/g, "_");
    setEvents((prev) => [
      ...prev,
      {
        name: newEventName.trim(),
        code: evCode,
        family: newEventFamily,
        enabled: true,
      },
    ]);
    setNewEventName("");
    setNewEventCode("");
  };

  // Final Submit
  const handleFinalSubmit = async (publishImmediately: boolean) => {
    if (!code.trim()) {
      toast.error("Please enter a Blueprint Code");
      setStep(1);
      return;
    }
    if (!speciesName.trim()) {
      toast.error("Please enter a Species Name");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BlueprintStudioPayload = {
        isStudio: true,
        code: code.trim().toLowerCase().replace(/\s+/g, "_"),
        speciesName: speciesName.trim(),
        speciesCode: speciesName.trim().toLowerCase().replace(/\s+/g, "_"),
        subjectModes,
        defaultSubjectMode,
        groupDisplayName: subjectModes.includes("group") ? (groupDisplayName.trim() || "Batch / Flock") : undefined,
        reproductionMode,
        stages: stages.map((s) => ({
          name: s.name,
          code: s.code || s.name.toLowerCase().replace(/\s+/g, "_"),
          isTagApplicable: s.isTagApplicable,
        })),
        formSchema: {
          sections,
        },
        events: events.filter((e) => e.enabled !== false).map((e) => ({
          name: e.name,
          code: e.code,
          family: e.family,
          behaviorCode: e.behaviorCode,
        })),
        publishImmediately,
      };

      const res = await fetch("/api/admin/blueprints/animal-blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Failed to create Blueprint via Studio.");
      }

      toast.success(
        publishImmediately
          ? "Blueprint created and published to mobile manifest!"
          : "Blueprint draft created successfully!"
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error creating blueprint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Animal Blueprint Studio</DialogTitle>
                <DialogDescription>
                  Configure Species, Manage As modes, Stage Tag Rules, Form Fields, and Events all in one flow.
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Step {step} of 5
            </Badge>
          </div>
        </DialogHeader>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-5 gap-2 my-2 py-2 border-y border-border/50 text-xs font-medium">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${
              step === 1 ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="truncate">1. Species & Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${
              step === 2 ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="truncate">2. Stages & Tags</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${
              step === 3 ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="truncate">3. Form Fields</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(4)}
            className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${
              step === 4 ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="truncate">4. Events</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(5)}
            className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${
              step === 5 ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="truncate">5. Review & Publish</span>
          </button>
        </div>

        {/* STEP 1: Species & Management Mode */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/50">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Quick Start: Pick a verified industry preset</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => applyPreset("dairy_cattle")}>
                  Dairy Cattle
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyPreset("broiler_poultry")}>
                  Broiler Poultry
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyPreset("swine_pork")}>
                  Swine / Pigs
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyPreset("dairy_goat")}>
                  Dairy & Meat Goat
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Species Name *</label>
                <Input
                  value={speciesName}
                  onChange={(e) => {
                    setSpeciesName(e.target.value);
                    if (!code) {
                      setCode(e.target.value.toLowerCase().replace(/\s+/g, "_") + "_v1");
                    }
                  }}
                  placeholder="e.g. Dairy Cattle, Layer Chicken, Boer Goat"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Blueprint Code *</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="e.g. dairy_cattle_v1"
                  className="mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Mobile Animal Category</label>
                <Select value={animalType} onValueChange={setAnimalType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">Cattle / Bovine</SelectItem>
                    <SelectItem value="poultry">Poultry / Avian</SelectItem>
                    <SelectItem value="pig">Pig / Swine</SelectItem>
                    <SelectItem value="goat">Goat / Caprine</SelectItem>
                    <SelectItem value="sheep">Sheep / Ovine</SelectItem>
                    <SelectItem value="horse">Horse / Equine</SelectItem>
                    <SelectItem value="dog">Dog / Canine</SelectItem>
                    <SelectItem value="other">Other Species</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Reproduction Mode</label>
                <Select value={reproductionMode} onValueChange={setReproductionMode}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select reproduction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live_birth">Live Birth (Mammals)</SelectItem>
                    <SelectItem value="egg_laying">Egg Laying (Poultry/Reptiles)</SelectItem>
                    <SelectItem value="spawning">Spawning (Fish/Aquaculture)</SelectItem>
                    <SelectItem value="none">Not Tracked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="border-border/60">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Allowed "Manage As" Modes</h4>
                    <p className="text-xs text-muted-foreground">
                      Controls whether the mobile app allows Individual animals, Group/Flock batches, or both.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subjectModes.includes("individual")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSubjectModes([...subjectModes, "individual"]);
                        } else if (subjectModes.length > 1) {
                          setSubjectModes(subjectModes.filter((m) => m !== "individual"));
                          if (defaultSubjectMode === "individual") setDefaultSubjectMode("group");
                        }
                      }}
                      className="rounded text-primary"
                    />
                    <span>Individual Animal (Single ear tag, unique ID)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subjectModes.includes("group")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSubjectModes([...subjectModes, "group"]);
                        } else if (subjectModes.length > 1) {
                          setSubjectModes(subjectModes.filter((m) => m !== "group"));
                          if (defaultSubjectMode === "group") setDefaultSubjectMode("individual");
                        }
                      }}
                      className="rounded text-primary"
                    />
                    <span>Group / Herd / Flock (Quantity-managed batch)</span>
                  </label>
                </div>

                {subjectModes.includes("group") && (
                  <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground">Default Management Mode</label>
                      <Select
                        value={defaultSubjectMode}
                        onValueChange={(val) => setDefaultSubjectMode(val as "individual" | "group")}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectModes.includes("individual") && (
                            <SelectItem value="individual">Individual by Default</SelectItem>
                          )}
                          <SelectItem value="group">Group by Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Group Batch Display Label</label>
                      <Input
                        value={groupDisplayName}
                        onChange={(e) => setGroupDisplayName(e.target.value)}
                        placeholder="e.g. Flock, Pen, Batch, Pond"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 2: Stages & Tag Rules */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 flex items-start gap-2.5">
              <Tag className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-primary">Stage-Based Tag Deferral Rules</p>
                <p className="text-muted-foreground mt-0.5">
                  Early animal stages (e.g. Calf, Chick, Piglet) should defer mandatory tagging. When marked "Tag Deferred",
                  the mobile registration UI disables required tag inputs and displays a clear explanation to farmers.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Configured Stages for {speciesName || "Species"}
                </h4>
                <span className="text-xs text-muted-foreground">{stages.length} stages defined</span>
              </div>

              <div className="divide-y divide-border border rounded-xl overflow-hidden bg-card">
                {stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-6">{idx + 1}.</span>
                      <div>
                        <p className="text-sm font-semibold">{stage.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{stage.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStageTagApplicable(idx)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
                          stage.isTagApplicable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {stage.isTagApplicable ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Tag Required (Standard)</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Tag Deferred (Early Stage)</span>
                          </>
                        )}
                      </button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-rose-500 hover:text-rose-700"
                        onClick={() => handleRemoveStage(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Stage */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-foreground">Add Custom Stage</label>
                <Input
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="e.g. Sucking Piglet, Pullet, Yearling"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!newStageIsTagApplicable}
                    onChange={(e) => setNewStageIsTagApplicable(!e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span>Mark as Early / Tag Deferred</span>
                </label>
              </div>
              <Button size="sm" onClick={handleAddStage} disabled={!newStageName.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Stage
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Form Fields Builder */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-xs">
              <p className="font-semibold text-foreground">Dynamic Registration Schema</p>
              <p className="text-muted-foreground mt-0.5">
                Core identity fields (Farm, Subject Mode, Identifier, Growth Stage) are standard. Here you define custom
                biological and operational attributes for this species.
              </p>
            </div>

            {/* Section & Field List */}
            <div className="space-y-3">
              {sections.map((section) => (
                <Card key={section.id} className="border-border/60">
                  <CardContent className="pt-3 pb-3 space-y-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">{section.title}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {section.fields.length} Fields
                      </Badge>
                    </div>

                    {section.fields.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 text-center">No custom fields in this section yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {section.fields.map((field, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs border border-border/40"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{field.label}</span>
                              <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                                {field.type}
                              </Badge>
                              {field.required && (
                                <Badge variant="destructive" className="text-[10px]">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-rose-500 hover:text-rose-700"
                              onClick={() => handleRemoveField(section.id, fIdx)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Field Box */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-3">
              <h5 className="text-xs font-bold text-foreground">Add Custom Field to Registration</h5>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Section</label>
                  <Select value={newFieldSectionId} onValueChange={setNewFieldSectionId}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Field Label *</label>
                  <Input
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="e.g. Teat Count, Sire Tag"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Input Type</label>
                  <Select
                    value={newFieldType}
                    onValueChange={(val) => setNewFieldType(val as "text" | "number" | "date" | "select" | "boolean")}
                  >
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text / String</SelectItem>
                      <SelectItem value="number">Numeric</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="select">Dropdown Choice</SelectItem>
                      <SelectItem value="boolean">Yes / No Switch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-1.5 text-xs pb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span>Required</span>
                  </label>
                  <Button size="sm" onClick={handleAddField} disabled={!newFieldLabel.trim()} className="h-9 mb-1">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Lifecycle Events */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-xs">
              <p className="font-semibold text-foreground">Operational & Veterinary Events</p>
              <p className="text-muted-foreground mt-0.5">
                Enabled events become accessible in the mobile animal profile and quick-action sheets.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Configured Events for {speciesName || "Species"}
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {events.map((ev, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleEvent(idx)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      ev.enabled !== false
                        ? "bg-primary/5 border-primary/40 shadow-sm"
                        : "bg-card border-border opacity-60"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center mt-0.5 ${
                        ev.enabled !== false ? "bg-primary text-primary-foreground" : "border border-muted-foreground"
                      }`}
                    >
                      {ev.enabled !== false && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold truncate">{ev.name}</p>
                        <Badge variant="outline" className="text-[9px] uppercase">
                          {ev.family}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">{ev.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Event */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2">
              <h5 className="text-xs font-bold text-foreground">Add Custom Event</h5>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Event Name *</label>
                  <Input
                    value={newEventName}
                    onChange={(e) => {
                      setNewEventName(e.target.value);
                      if (!newEventCode) {
                        setNewEventCode(e.target.value.toLowerCase().replace(/\s+/g, "_"));
                      }
                    }}
                    placeholder="e.g. Hoof Trimming, Shearing"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Event Code</label>
                  <Input
                    value={newEventCode}
                    onChange={(e) => setNewEventCode(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder="e.g. hoof_trimming"
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Family</label>
                    <Select value={newEventFamily} onValueChange={setNewEventFamily}>
                      <SelectTrigger className="mt-1 h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">Health & Veterinary</SelectItem>
                        <SelectItem value="production">Production & Yield</SelectItem>
                        <SelectItem value="reproduction">Breeding</SelectItem>
                        <SelectItem value="feeding">Nutrition</SelectItem>
                        <SelectItem value="inventory">Inventory & Weight</SelectItem>
                        <SelectItem value="lifecycle">Lifecycle</SelectItem>
                        <SelectItem value="other">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" onClick={handleAddCustomEvent} disabled={!newEventName.trim()} className="h-9 mb-0.5">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Publish */}
        {step === 5 && (
          <div className="space-y-4 py-2">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">Ready to Deploy Blueprint</p>
                <p className="text-muted-foreground mt-0.5">
                  Review the assembled configuration. Publishing will automatically compile the mobile manifest and deliver
                  these rules, forms, and event workflows directly to farmer and extension officer devices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-3 pb-3 space-y-2 text-xs">
                  <h4 className="font-bold text-primary">Identity & Management Modes</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Species:</span>
                      <span className="font-semibold">{speciesName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Blueprint Code:</span>
                      <span className="font-mono">{code}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Allowed Modes:</span>
                      <span className="font-semibold">{subjectModes.join(", ")}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Default Mode:</span>
                      <span className="font-semibold">{defaultSubjectMode}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-3 pb-3 space-y-2 text-xs">
                  <h4 className="font-bold text-primary">Growth Stages & Tag Deferrals</h4>
                  <div className="space-y-1">
                    {stages.map((st, i) => (
                      <div key={i} className="flex justify-between py-1 border-b last:border-0">
                        <span>{st.name}</span>
                        <Badge
                          variant="outline"
                          className={st.isTagApplicable ? "text-emerald-600" : "text-amber-600"}
                        >
                          {st.isTagApplicable ? "Tag Required" : "Tag Deferred"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-3 pb-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-primary">Active Events ({events.filter((e) => e.enabled !== false).length})</h4>
                  <span className="text-muted-foreground font-mono">{events.filter((e) => e.enabled !== false).map((e) => e.name).join(" • ")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <div>
            {step > 1 && (
              <Button type="button" variant="outline" size="sm" onClick={() => setStep((s) => (s - 1) as any)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>

            {step < 5 ? (
              <Button type="button" size="sm" onClick={() => setStep((s) => (s + 1) as any)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFinalSubmit(false)}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleFinalSubmit(true)}
                  disabled={isSubmitting}
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  {isSubmitting ? "Deploying..." : "Publish & Compile Manifest"}
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

