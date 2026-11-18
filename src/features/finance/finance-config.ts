import { withCreatedColumn } from "@/lib/resource-table";
import type {
  FinanceCrudResource,
  FinanceFormSection,
  FinanceTableColumn,
} from "@/features/finance/types";

export const FINANCE_RESOLVED_NAME_FIELD_MAP: Record<string, string> = {
  farmUuid: "farmName",
  farmerId: "farmerName",
  extensionOfficerId: "extensionOfficerName",
  vetId: "vetName",
};

export type FinanceResourceConfig = {
  resource: FinanceCrudResource;
  title: string;
  singularLabel: string;
  description: string;
  primaryAction: string;
  searchPlaceholder: string;
  statusFilterOptions: { value: string; label: string }[];
  stats: {
    totalLabel: string;
    totalNote: string;
    activeLabel: string;
    activeNote: string;
    secondaryLabel: string;
    secondaryNote: string;
    tertiaryLabel: string;
    tertiaryNote: string;
    tertiaryPrefix?: string;
  };
  columns: FinanceTableColumn[];
  formSections: FinanceFormSection[];
};

export const financeResourceConfigs: Record<
  FinanceCrudResource,
  FinanceResourceConfig
> = {
  bills: {
    resource: "bills",
    title: "Bills",
    singularLabel: "Bill",
    description:
      "Service and veterinary billing records across farms, farmers and extension officers.",
    primaryAction: "Create bill",
    searchPlaceholder: "Search bill no., farm, farmer, officer or subject…",
    statusFilterOptions: [
      { value: "all", label: "All statuses" },
      { value: "paid", label: "Paid" },
      { value: "pending", label: "Pending" },
    ],
    stats: {
      totalLabel: "Total Bills",
      totalNote: "All issued bills",
      activeLabel: "Paid Bills",
      activeNote: "Settled invoices",
      secondaryLabel: "Pending Bills",
      secondaryNote: "Awaiting payment",
      tertiaryLabel: "Total Billed",
      tertiaryNote: "Cumulative billed value",
      tertiaryPrefix: "TZS ",
    },
    columns: [
      { key: "billNo", label: "Bill No" },
      { key: "farm", label: "Farm" },
      { key: "issuerName", label: "Issued By" },
      { key: "subjectType", label: "Subject" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" },
    ],
    formSections: [
      {
        title: "Bill Context & Parties",
        description: "Assign the farm, farmer and attending vet or extension officer.",
        fields: [
          {
            name: "billNo",
            label: "Bill No",
            type: "text",
            placeholder: "Leave blank to auto-generate",
            description: "Automatically generated if left blank.",
          },
          {
            name: "farmUuid",
            label: "Farm",
            type: "select",
            required: true,
            optionsKey: "farms",
            placeholder: "Select farm",
          },
          {
            name: "farmerId",
            label: "Farmer",
            type: "select",
            optionsKey: "farmers",
            placeholder: "Select farmer (auto-filled from farm if omitted)",
          },
          {
            name: "extensionOfficerId",
            label: "Extension Officer",
            type: "select",
            optionsKey: "extensionOfficers",
            placeholder: "Select extension officer (optional)",
          },
          {
            name: "vetId",
            label: "Veterinarian",
            type: "select",
            optionsKey: "vets",
            placeholder: "Select veterinarian (optional)",
          },
        ],
      },
      {
        title: "Billing Items & Payment Status",
        description: "Specify the billed service/subject, quantity, amount and status.",
        fields: [
          {
            name: "subjectType",
            label: "Subject Type",
            type: "select",
            required: true,
            staticOptions: [
              { value: "Vaccination", label: "Vaccination" },
              { value: "Treatment", label: "Clinical Treatment" },
              { value: "Deworming", label: "Deworming" },
              { value: "Insemination", label: "Artificial Insemination" },
              { value: "Consultation", label: "Veterinary Consultation" },
              { value: "Tagging", label: "Animal Tagging & Identification" },
              { value: "Other", label: "Other Service" },
            ],
          },
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
            placeholder: "1",
          },
          {
            name: "amount",
            label: "Amount (TZS)",
            type: "number",
            required: true,
            placeholder: "25000",
          },
          {
            name: "status",
            label: "Payment Status",
            type: "select",
            required: true,
            staticOptions: [
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
            ],
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Service breakdown or payment reference notes",
          },
        ],
      },
    ],
  },
  income: {
    resource: "income",
    title: "Income",
    singularLabel: "Income Record",
    description:
      "Manual and event-linked farm revenue entries, milk sales, animal disposals and transfers.",
    primaryAction: "Record income",
    searchPlaceholder: "Search source, reference no., farm, farmer or subject…",
    statusFilterOptions: [
      { value: "all", label: "All statuses" },
      { value: "received", label: "Received" },
      { value: "pending", label: "Pending" },
    ],
    stats: {
      totalLabel: "Income Entries",
      totalNote: "Recorded revenue items",
      activeLabel: "Received",
      activeNote: "Confirmed receipts",
      secondaryLabel: "Pending",
      secondaryNote: "Awaiting settlement",
      tertiaryLabel: "Total Income",
      tertiaryNote: "Cumulative revenue",
      tertiaryPrefix: "TZS ",
    },
    columns: [
      { key: "sourceType", label: "Source" },
      { key: "farm", label: "Farm" },
      { key: "referenceNo", label: "Reference" },
      { key: "subjectType", label: "Subject" },
      { key: "totalAmount", label: "Total" },
      { key: "status", label: "Status" },
      { key: "incomeDate", label: "Income Date" },
      { key: "createdAt", label: "Created" },
    ],
    formSections: [
      {
        title: "Income Source & Farm",
        description: "Select the revenue source type, farm, farmer and reference.",
        fields: [
          {
            name: "sourceType",
            label: "Source Type",
            type: "select",
            required: true,
            staticOptions: [
              { value: "manual", label: "Manual Entry" },
              { value: "milk_sale", label: "Milk Sale" },
              { value: "egg_sale", label: "Egg Sale" },
              { value: "disposal", label: "Livestock Disposal Sale" },
              { value: "transfer", label: "Livestock Transfer Sale" },
              { value: "breeding_service", label: "Breeding Service Fee" },
            ],
          },
          {
            name: "farmUuid",
            label: "Farm",
            type: "select",
            required: true,
            optionsKey: "farms",
            placeholder: "Select farm",
          },
          {
            name: "farmerId",
            label: "Farmer",
            type: "select",
            optionsKey: "farmers",
            placeholder: "Select farmer (auto-filled from farm if omitted)",
          },
          {
            name: "referenceNo",
            label: "Reference No",
            type: "text",
            placeholder: "e.g. REC-2026-0042",
          },
        ],
      },
      {
        title: "Valuation & Settlement",
        description: "Enter quantity, unit amount, total amount and receipt date.",
        fields: [
          {
            name: "subjectType",
            label: "Subject Type",
            type: "text",
            placeholder: "e.g. Raw Milk / Weaner Sale / Eggs",
          },
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
            placeholder: "1",
          },
          {
            name: "unitAmount",
            label: "Unit Amount (TZS)",
            type: "number",
            required: true,
            placeholder: "1500",
          },
          {
            name: "totalAmount",
            label: "Total Amount (TZS)",
            type: "number",
            required: true,
            placeholder: "Auto-calculated from Qty × Unit",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            staticOptions: [
              { value: "received", label: "Received" },
              { value: "pending", label: "Pending" },
            ],
          },
          {
            name: "incomeDate",
            label: "Income Date",
            type: "date",
            required: true,
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Buyer details or receipt notes",
          },
        ],
      },
    ],
  },
  expenditure: {
    resource: "expenditure",
    title: "Expenditure",
    singularLabel: "Expenditure Record",
    description:
      "Operational farm expenses, feed purchases, veterinary bills, medicines and labour costs.",
    primaryAction: "Record expense",
    searchPlaceholder: "Search source, bill no., farm, farmer or subject…",
    statusFilterOptions: [
      { value: "all", label: "All statuses" },
      { value: "paid", label: "Paid" },
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
    ],
    stats: {
      totalLabel: "Expense Entries",
      totalNote: "Recorded expenditure items",
      activeLabel: "Paid / Completed",
      activeNote: "Settled expenses",
      secondaryLabel: "Pending",
      secondaryNote: "Unpaid expenses",
      tertiaryLabel: "Total Expenditure",
      tertiaryNote: "Cumulative cost",
      tertiaryPrefix: "TZS ",
    },
    columns: [
      { key: "sourceType", label: "Source" },
      { key: "scope", label: "Ledger" },
      { key: "farm", label: "Farm / Vet" },
      { key: "billNo", label: "Bill No" },
      { key: "subjectType", label: "Subject" },
      { key: "totalCost", label: "Total" },
      { key: "status", label: "Status" },
      { key: "expenseDate", label: "Expense Date" },
      { key: "createdAt", label: "Created" },
    ],
    formSections: [
      {
        title: "Expense Source & Farm",
        description: "Select the expenditure source, farm, farmer and bill reference.",
        fields: [
          {
            name: "sourceType",
            label: "Source Type",
            type: "select",
            required: true,
            staticOptions: [
              { value: "manual", label: "Manual Expense" },
              { value: "bill", label: "Service Bill" },
              { value: "feed", label: "Feed & Nutrition" },
              { value: "medicine", label: "Veterinary Medicine & Vaccines" },
              { value: "labour", label: "Farm Labour & Wages" },
              { value: "equipment", label: "Equipment & Maintenance" },
            ],
          },
          {
            name: "farmUuid",
            label: "Farm",
            type: "select",
            required: true,
            optionsKey: "farms",
            placeholder: "Select farm",
          },
          {
            name: "farmerId",
            label: "Farmer",
            type: "select",
            optionsKey: "farmers",
            placeholder: "Select farmer (auto-filled from farm if omitted)",
          },
          {
            name: "billNo",
            label: "Bill No",
            type: "text",
            placeholder: "Optional linked bill number",
          },
        ],
      },
      {
        title: "Cost & Payment Details",
        description: "Enter quantity, unit cost, total cost and expense date.",
        fields: [
          {
            name: "subjectType",
            label: "Subject Type",
            type: "text",
            placeholder: "e.g. Dairy Meal 50kg / Vaccination Service",
          },
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
            placeholder: "1",
          },
          {
            name: "unitCost",
            label: "Unit Cost (TZS)",
            type: "number",
            required: true,
            placeholder: "45000",
          },
          {
            name: "totalCost",
            label: "Total Cost (TZS)",
            type: "number",
            required: true,
            placeholder: "Auto-calculated from Qty × Unit",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            staticOptions: [
              { value: "paid", label: "Paid" },
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
            ],
          },
          {
            name: "expenseDate",
            label: "Expense Date",
            type: "date",
            required: true,
          },
          {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Vendor details or invoice notes",
          },
        ],
      },
    ],
  },
};


// Shared resource-table convention: creation date is the final data column.
Object.values(financeResourceConfigs).forEach((config) => {
  config.columns = withCreatedColumn(config.columns, { key: "createdAt", label: "Created at" });
});

export function getFinanceResourceConfig(
  resource: FinanceCrudResource,
): FinanceResourceConfig {
  return financeResourceConfigs[resource];
}

