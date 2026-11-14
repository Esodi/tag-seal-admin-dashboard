export type Localized = { en: string; sw?: string | null };

export type ListSource = "old_app" | "custom" | "system";

export type OptionListSummary = {
  uuid: string;
  code: string;
  name: Localized;
  source: ListSource;
  editable: boolean;
  status: string;
  sharedTable: string | null;
  optionsCount: number;
  usedIn: number;
};

export type OptionAnswer = { uuid: string; code: string; label: Localized; active: boolean };

export type OptionList = Omit<OptionListSummary, "optionsCount" | "usedIn"> & {
  usedIn: string[];
  extraField: { label: string; choices: Array<{ value: string; label: string }> } | null;
  options: OptionAnswer[];
};

export const SOURCE_LABELS: Record<ListSource, string> = {
  old_app: "From old app",
  custom: "Custom",
  system: "System",
};

export const SOURCE_HELP: Record<ListSource, string> = {
  old_app: "Copied from the old app. Changes here are saved to the old app too, so both show the same answers.",
  custom: "Created here for custom events.",
  system: "Statuses the platform relies on. They cannot be changed.",
};

export const OPTIONS_HREF = "/dashboard/blueprints/lookup-sets";
