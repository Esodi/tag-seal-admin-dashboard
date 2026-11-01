"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Eye,
  FileCode,
  FileStack,
  FileText,
  Globe,
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationAlertDialog } from "@/components/ui/confirmation-alert-dialog";
import { CustomViewDetailsDialog, DetailItem } from "@/components/ui/custom-view-details-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { blueprintResourceConfigs } from "./blueprint-config";
import { BlueprintPreviewModal } from "./blueprint-preview-modal";
import type {
  AnimalBlueprintRecord,
  BlueprintOptionsResponse,
  BlueprintRecord,
  BlueprintResource,
  BlueprintResponse,
  DynamicSpeciesRecord,
  EventDefinitionRecord,
  FormDefinitionRecord,
  LookupSetRecord,
} from "./types";

function getRecordVersion(record: BlueprintRecord): string {
  if ("version" in record && typeof record.version === "number") {
    return `v${record.version}`;
  }
  if ("blueprint_version" in record && typeof record.blueprint_version === "number") {
    return `v${record.blueprint_version}`;
  }
  return "v1";
}

export function BlueprintResourceDashboard({
  resource,
  initialData,
  initialOptions,
  initialError,
}: {
  resource: BlueprintResource;
  initialData: BlueprintResponse | null;
  initialOptions?: BlueprintOptionsResponse["data"] | null;
  initialError?: string | null;
}) {
  const config = blueprintResourceConfigs[resource];
  const [items, setItems] = useState<BlueprintRecord[]>(() => initialData?.data ?? []);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [secondaryFilter, setSecondaryFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<BlueprintRecord | null>(null);
  const [previewRecord, setPreviewRecord] = useState<BlueprintRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [publishTarget, setPublishTarget] = useState<BlueprintRecord | null>(null);
  const [cloneTarget, setCloneTarget] = useState<BlueprintRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlueprintRecord | null>(null);

  // Form states for Create modal
  const [createFormCode, setCreateFormCode] = useState("");
  const [createFormName, setCreateFormName] = useState("");
  const [createSpeciesUuid, setCreateSpeciesUuid] = useState("");
  const [createRegFormUuid, setCreateRegFormUuid] = useState("");
  const [createBlueprintUuid, setCreateBlueprintUuid] = useState("");
  const [createFamily, setCreateFamily] = useState("other");
  const [createPurpose, setCreatePurpose] = useState<"registration" | "event">("registration");
  const [createSubjectMode, setCreateSubjectMode] = useState<"individual" | "group">("individual");
  const [createGroupLabel, setCreateGroupLabel] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (statusTab !== "all" && item.status !== statusTab) return false;

      // Secondary filter
      if (secondaryFilter !== "all") {
        if (resource === "event-definitions") {
          const ev = item as EventDefinitionRecord;
          if (ev.family !== secondaryFilter) return false;
        } else if (resource === "form-definitions") {
          const fd = item as FormDefinitionRecord;
          if (fd.purpose !== secondaryFilter) return false;
        } else if (resource === "dynamic-species") {
          const sp = item as DynamicSpeciesRecord;
          if (sp.default_subject_mode !== secondaryFilter) return false;
        }
      }

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const codeMatch = "code" in item && item.code?.toLowerCase().includes(q);
      const nameMatch = "name" in item && item.name?.toLowerCase().includes(q);
      const speciesMatch =
        "species" in item && item.species?.name?.toLowerCase().includes(q);
      return Boolean(codeMatch || nameMatch || speciesMatch);
    });
  }, [items, search, statusTab, secondaryFilter, resource]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((i) => i.status === "published").length;
    const draft = items.filter((i) => i.status === "draft").length;
    const retired = items.filter((i) => i.status === "retired").length;
    return { total, published, draft, retired };
  }, [items]);

  // Handlers
  const handlePublish = async (record: BlueprintRecord) => {
    try {
      const res = await fetch(`/api/admin/blueprints/${resource}/${record.id || record.uuid}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Failed to publish definition.");
      }
      setItems((prev) =>
        prev.map((i) => (i.uuid === record.uuid ? { ...i, status: "published" } : i)),
      );
      toast.success(`${config.singular} has been published and manifest compiled.`);
      setPublishTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error publishing.");
    }
  };

  const handleClone = async (record: BlueprintRecord) => {
    try {
      const res = await fetch(`/api/admin/blueprints/${resource}/${record.id || record.uuid}/clone`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Failed to clone definition.");
      }
      if (data.data) {
        setItems((prev) => [data.data, ...prev]);
      }
      toast.success(`Created new draft version for ${record.code || "definition"}.`);
      setCloneTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error cloning.");
    }
  };

  const handleDelete = async (record: BlueprintRecord) => {
    try {
      const res = await fetch(`/api/admin/blueprints/${resource}/${record.id || record.uuid}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Failed to delete definition.");
      }
      if (record.status === "draft") {
        setItems((prev) => prev.filter((i) => i.uuid !== record.uuid));
      } else {
        setItems((prev) =>
          prev.map((i) => (i.uuid === record.uuid ? { ...i, status: "retired" } : i)),
        );
      }
      toast.success(`${config.singular} status updated.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting.");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payload: Record<string, unknown> = {};

      if (resource === "animal-blueprints") {
        payload = {
          code: createFormCode,
          species_uuid: createSpeciesUuid,
          registration_form_uuid: createRegFormUuid,
          version: 1,
        };
      } else if (resource === "event-definitions") {
        payload = {
          name: createFormName,
          code: createFormCode,
          blueprint_uuid: createBlueprintUuid,
          form_uuid: createRegFormUuid,
          family: createFamily,
        };
      } else if (resource === "form-definitions") {
        payload = {
          code: createFormCode,
          purpose: createPurpose,
          version: 1,
        };
      } else if (resource === "lookup-sets") {
        payload = {
          name: createFormName,
          code: createFormCode,
          version: 1,
        };
      } else if (resource === "dynamic-species") {
        payload = {
          name: createFormName,
          code: createFormCode,
          default_subject_mode: createSubjectMode,
          group_display_name: createGroupLabel || null,
        };
      }

      const res = await fetch(`/api/admin/blueprints/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || result.status === false) {
        throw new Error(result.message || "Failed to create definition.");
      }

      if (result.data) {
        setItems((prev) => [result.data, ...prev]);
      }
      toast.success(`${config.singular} added in draft status.`);
      setIsCreateOpen(false);
      setCreateFormCode("");
      setCreateFormName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Validation error.");
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        eyebrow="Configuration"
        parent="Blueprint Engine"
        parentHref="/dashboard/blueprints"
        title={config.title}
        description={config.description}
        badge={config.badge}
        actions={
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 font-semibold"
          >
            <Plus className="size-4" />
            {config.createLabel}
          </Button>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Definitions</span>
              <FileStack className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Catalog records registered</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Published (Active)</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
              {stats.published}
            </p>
            <p className="text-[11px] text-muted-foreground">Synced to mobile manifests</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Draft Versions</span>
              <Layers className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
              {stats.draft}
            </p>
            <p className="text-[11px] text-muted-foreground">Under active configuration</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Retired</span>
              <Trash2 className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-muted-foreground tabular-nums">
              {stats.retired}
            </p>
            <p className="text-[11px] text-muted-foreground">Archived platform revisions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full sm:w-auto">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">
              All ({items.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs">
              Published ({stats.published})
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs">
              Drafts ({stats.draft})
            </TabsTrigger>
            <TabsTrigger value="retired" className="text-xs">
              Retired ({stats.retired})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          {resource === "event-definitions" && (
            <Select value={secondaryFilter} onValueChange={setSecondaryFilter}>
              <SelectTrigger className="h-9 w-40 text-xs">
                <SelectValue placeholder="All Families" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Families</SelectItem>
                <SelectItem value="health">Health & Vet</SelectItem>
                <SelectItem value="reproduction">Reproduction</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="feeding">Feeding</SelectItem>
                <SelectItem value="lifecycle">Lifecycle</SelectItem>
              </SelectContent>
            </Select>
          )}

          {resource === "form-definitions" && (
            <Select value={secondaryFilter} onValueChange={setSecondaryFilter}>
              <SelectTrigger className="h-9 w-40 text-xs">
                <SelectValue placeholder="All Purposes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="registration">Registration Forms</SelectItem>
                <SelectItem value="event">Event Forms</SelectItem>
              </SelectContent>
            </Select>
          )}

          {resource === "dynamic-species" && (
            <Select value={secondaryFilter} onValueChange={setSecondaryFilter}>
              <SelectTrigger className="h-9 w-40 text-xs">
                <SelectValue placeholder="All Subject Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="individual">Individual Animals</SelectItem>
                <SelectItem value="group">Group / Herds</SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="relative min-w-64 flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={config.searchPlaceholder}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      {filteredItems.length === 0 ? (
        <EmptyCard
          icon={FileStack}
          title={`No ${config.title} found`}
          description={
            search
              ? "No records matched your search criteria. Try a different query or clear filters."
              : `No ${config.title.toLowerCase()} exist yet. Create your first one to get started.`
          }
          action={
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 font-semibold">
              <Plus className="size-4" />
              {config.createLabel}
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                {config.columns.map((col) => (
                  <TableHead key={col.key} className="text-xs font-semibold">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-14 text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((record, index) => {
                const isDraft = record.status === "draft";

                return (
                  <TableRow key={record.uuid || record.id} className="transition hover:bg-muted/30">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    {/* Column values mapped per resource */}
                    {resource === "animal-blueprints" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                              <Sparkles className="size-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {(record as AnimalBlueprintRecord).species?.name || "Standard Animal"}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {record.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                            {record.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {(record as AnimalBlueprintRecord).animal_type || "Cattle"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {getRecordVersion(record)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {(record as AnimalBlueprintRecord).events_count ?? 6} events
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {resource === "event-definitions" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                              <Activity className="size-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {(record as EventDefinitionRecord).name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {record.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                            {record.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {(record as EventDefinitionRecord).blueprint?.code || "Universal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(record as EventDefinitionRecord).behavior_code || "Standard"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {(record as EventDefinitionRecord).family || "other"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs text-muted-foreground">
                            {(record as EventDefinitionRecord).form?.code || "form_schema"}
                          </code>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {resource === "form-definitions" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
                              <FileCode className="size-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">{record.code}</p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {(record as FormDefinitionRecord).checksum?.slice(0, 18) ?? "draft schema"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {getRecordVersion(record)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              (record as FormDefinitionRecord).purpose === "registration"
                                ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            }
                          >
                            {(record as FormDefinitionRecord).purpose}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {(record as FormDefinitionRecord).schema_json?.sections?.length || 2} sections
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Globe className="size-3 text-primary" />
                            <span>EN, SW (100%)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {resource === "lookup-sets" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                              <Database className="size-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {(record as LookupSetRecord).name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {record.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                            {record.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {getRecordVersion(record)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(record as LookupSetRecord).parent?.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {(record as LookupSetRecord).options_count ?? (record as LookupSetRecord).options?.length ?? 0} choices
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {resource === "dynamic-species" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                              <Layers className="size-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {(record as DynamicSpeciesRecord).name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {record.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                            {record.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {(record as DynamicSpeciesRecord).default_subject_mode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(record as DynamicSpeciesRecord).group_display_name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {(record as DynamicSpeciesRecord).mobile_type_name ?? "Cattle"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {(record as DynamicSpeciesRecord).capabilities_json?.reproduction ?? "Live birth"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.created_at?.slice(0, 10)}
                        </TableCell>
                      </>
                    )}

                    {/* Action Dropdown Menu */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setSelectedRecord(record)} className="gap-2">
                            <Eye className="size-4 text-muted-foreground" />
                            View details
                          </DropdownMenuItem>

                          {(resource === "animal-blueprints" || resource === "form-definitions" || resource === "event-definitions") && (
                            <DropdownMenuItem onClick={() => setPreviewRecord(record)} className="gap-2 font-medium text-primary">
                              <Sparkles className="size-4" />
                              Preview flow
                            </DropdownMenuItem>
                          )}

                          {isDraft && (
                            <DropdownMenuItem onClick={() => setPublishTarget(record)} className="gap-2 text-emerald-600">
                              <Send className="size-4" />
                              Publish definition
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => setCloneTarget(record)} className="gap-2">
                            <Copy className="size-4 text-muted-foreground" />
                            Clone new version
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(record)}
                            className="gap-2 text-danger focus:text-danger"
                          >
                            <Trash2 className="size-4" />
                            {isDraft ? "Delete draft" : "Retire version"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View Details Dialog */}
      {selectedRecord && (
        <CustomViewDetailsDialog
          open={Boolean(selectedRecord)}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
          title={`${config.singular} Details`}
          description={`Full configuration schema and metadata for ${selectedRecord.code || "record"}.`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Code">{selectedRecord.code}</DetailItem>
              <DetailItem label="Version">{getRecordVersion(selectedRecord)}</DetailItem>
              <DetailItem label="Status">{selectedRecord.status}</DetailItem>
              <DetailItem label="UUID">{selectedRecord.uuid}</DetailItem>
              <DetailItem label="Created At">{selectedRecord.created_at}</DetailItem>
              <DetailItem label="Updated At">{selectedRecord.updated_at ?? "—"}</DetailItem>
            </div>

            {/* JSON Inspector for configuration schemas */}
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-foreground">Configuration Schema (JSON)</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Immutable Snapshot
                </Badge>
              </div>
              <pre className="max-h-60 overflow-y-auto rounded-lg bg-card p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {JSON.stringify(
                  "schema_json" in selectedRecord
                    ? selectedRecord.schema_json
                    : "settings_json" in selectedRecord
                    ? selectedRecord.settings_json
                    : selectedRecord,
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </CustomViewDetailsDialog>
      )}

      {/* Interactive Blueprint & Form Preview Modal */}
      {previewRecord && (
        <BlueprintPreviewModal
          open={Boolean(previewRecord)}
          onOpenChange={(open) => !open && setPreviewRecord(null)}
          blueprint={resource === "animal-blueprints" ? (previewRecord as AnimalBlueprintRecord) : undefined}
          eventRecord={resource === "event-definitions" ? (previewRecord as EventDefinitionRecord) : undefined}
          formSchema={resource === "form-definitions" ? (previewRecord as FormDefinitionRecord).schema_json : undefined}
        />
      )}

      {/* Publish Confirmation Alert Dialog */}
      <ConfirmationAlertDialog
        open={Boolean(publishTarget)}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        title={`Publish ${config.singular}?`}
        description={`Publishing ${publishTarget?.code || "this definition"} will make it immutable, calculate its sha256 checksum, and sync it to the mobile offline manifest. Existing drafts will be archived.`}
        confirmLabel="Yes, publish definition"
        onConfirm={() => {
          if (publishTarget) return handlePublish(publishTarget);
        }}
      />

      {/* Clone Confirmation Dialog */}
      <ConfirmationAlertDialog
        open={Boolean(cloneTarget)}
        onOpenChange={(open) => !open && setCloneTarget(null)}
        title={`Clone ${config.singular}?`}
        description={`This will clone ${cloneTarget?.code || "this definition"} into a new draft version. You can customize the fields before publishing.`}
        confirmLabel="Create clone version"
        onConfirm={() => {
          if (cloneTarget) return handleClone(cloneTarget);
        }}
      />

      {/* Delete / Retire Confirmation Dialog */}
      <ConfirmationAlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget?.status === "draft" ? "Delete Draft Definition?" : "Retire Definition?"}
        description={
          deleteTarget?.status === "draft"
            ? "This will permanently delete this draft definition."
            : "Published definitions cannot be hard-deleted to preserve ledger history. It will be marked retired and prevented from new animal assignments."
        }
        confirmLabel={deleteTarget?.status === "draft" ? "Delete Draft" : "Retire Version"}
        destructive={true}
        onConfirm={() => {
          if (deleteTarget) return handleDelete(deleteTarget);
        }}
      />

      {/* Create Resource Modal */}
      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title={config.createLabel}
        description={`Add a new ${config.singular.toLowerCase()} to the Blueprint Engine.`}
        onSubmit={handleCreateSubmit}
        submitLabel="Create definition"
      >
        <div className="space-y-4 py-2">
          {resource === "animal-blueprints" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Blueprint Code</label>
                <Input
                  value={createFormCode}
                  onChange={(e) => setCreateFormCode(e.target.value)}
                  placeholder="e.g. cattle.standard or swine.commercial"
                  required
                  className="h-9 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  Lowercase snake_case or dotted format (e.g. cattle.dairy.v1)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Dynamic Species</label>
                <Select value={createSpeciesUuid} onValueChange={setCreateSpeciesUuid}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select species..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(initialOptions?.species ?? [
                      { uuid: "sp-1", name: "Cattle (Ng'ombe)", code: "cattle" },
                      { uuid: "sp-2", name: "Swine (Nguruwe)", code: "swine" },
                      { uuid: "sp-3", name: "Goat (Mbuzi)", code: "goat" },
                    ]).map((s) => (
                      <SelectItem key={s.uuid} value={s.uuid}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Registration Form</label>
                <Select value={createRegFormUuid} onValueChange={setCreateRegFormUuid}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select published form schema..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(initialOptions?.registration_forms ?? [
                      { uuid: "rf-1", code: "reg_cattle_standard_v1", version: 1, status: "published" },
                      { uuid: "rf-2", code: "reg_swine_standard_v1", version: 1, status: "published" },
                    ]).map((f) => (
                      <SelectItem key={f.uuid} value={f.uuid}>
                        {f.code} (v{f.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {resource === "event-definitions" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Event Name</label>
                <Input
                  value={createFormName}
                  onChange={(e) => setCreateFormName(e.target.value)}
                  placeholder="e.g. Routine Weight Recording"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Event Code</label>
                <Input
                  value={createFormCode}
                  onChange={(e) => setCreateFormCode(e.target.value)}
                  placeholder="e.g. record_weight"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Target Blueprint</label>
                <Select value={createBlueprintUuid} onValueChange={setCreateBlueprintUuid}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select blueprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(initialOptions?.blueprints ?? [
                      { uuid: "bp-1", code: "cattle.standard", version: 1, status: "published" },
                      { uuid: "bp-2", code: "swine.standard", version: 1, status: "published" },
                    ]).map((bp) => (
                      <SelectItem key={bp.uuid} value={bp.uuid}>
                        {bp.code} (v{bp.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Event Family</label>
                <Select value={createFamily} onValueChange={setCreateFamily}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health & Vet</SelectItem>
                    <SelectItem value="reproduction">Breeding & Reproduction</SelectItem>
                    <SelectItem value="production">Production & Yield</SelectItem>
                    <SelectItem value="inventory">Inventory & Weight</SelectItem>
                    <SelectItem value="feeding">Feeding & Nutrition</SelectItem>
                    <SelectItem value="lifecycle">Lifecycle & Movement</SelectItem>
                    <SelectItem value="other">General Husbandry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Event Form Schema</label>
                <Select value={createRegFormUuid} onValueChange={setCreateRegFormUuid}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select event form..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(initialOptions?.event_forms ?? [
                      { uuid: "ef-1", code: "form_weight_v1", version: 1, status: "published" },
                      { uuid: "ef-2", code: "form_feeding_v1", version: 1, status: "published" },
                    ]).map((f) => (
                      <SelectItem key={f.uuid} value={f.uuid}>
                        {f.code} (v{f.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {resource === "form-definitions" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Form Code</label>
                <Input
                  value={createFormCode}
                  onChange={(e) => setCreateFormCode(e.target.value)}
                  placeholder="e.g. form_vaccination_v1"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Form Purpose</label>
                <Select
                  value={createPurpose}
                  onValueChange={(val) => setCreatePurpose(val as "registration" | "event")}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration">Animal Registration (Intake)</SelectItem>
                    <SelectItem value="event">Operational Event Record</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {resource === "lookup-sets" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Lookup Name</label>
                <Input
                  value={createFormName}
                  onChange={(e) => setCreateFormName(e.target.value)}
                  placeholder="e.g. Disposal Reasons"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Lookup Code</label>
                <Input
                  value={createFormCode}
                  onChange={(e) => setCreateFormCode(e.target.value)}
                  placeholder="e.g. disposal_reasons"
                  required
                  className="h-9 text-xs"
                />
              </div>
            </>
          )}

          {resource === "dynamic-species" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Species Name</label>
                <Input
                  value={createFormName}
                  onChange={(e) => setCreateFormName(e.target.value)}
                  placeholder="e.g. Dairy Cattle (Ng'ombe wa Maziwa)"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Species Code</label>
                <Input
                  value={createFormCode}
                  onChange={(e) => setCreateFormCode(e.target.value)}
                  placeholder="e.g. dairy_cattle"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Default Subject Mode</label>
                <Select
                  value={createSubjectMode}
                  onValueChange={(val) => setCreateSubjectMode(val as "individual" | "group")}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Animals</SelectItem>
                    <SelectItem value="group">Group / Population (Flock, Pen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Group Display Label (optional)</label>
                <Input
                  value={createGroupLabel}
                  onChange={(e) => setCreateGroupLabel(e.target.value)}
                  placeholder="e.g. Herd, Flock, Pond, Pen"
                  className="h-9 text-xs"
                />
              </div>
            </>
          )}
        </div>
      </FormDialog>
    </div>
  );
}
