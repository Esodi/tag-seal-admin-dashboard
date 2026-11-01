export const financeResources = [
  "bills",
  "income",
  "expenditure",
  "income-expenditure",
] as const;

export type FinanceResource = (typeof financeResources)[number];
export type FinanceCrudResource = Exclude<
  FinanceResource,
  "income-expenditure"
>;

export type FinanceRecordItem = {
  id: number;
  billNo?: string | null;
  sourceType?: string | null;
  referenceNo?: string | null;
  farmUuid?: string | null;
  farmName?: string | null;
  farmerId?: number | string | null;
  farmerName?: string | null;
  extensionOfficerId?: number | string | null;
  extensionOfficerName?: string | null;
  subjectType?: string | null;
  quantity?: number | null;
  amount?: number | null;
  unitAmount?: number | null;
  totalAmount?: number | null;
  unitCost?: number | null;
  totalCost?: number | null;
  status?: string | null;
  incomeDate?: string | null;
  expenseDate?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type FinanceOption = {
  value: string;
  label: string;
  description?: string | null;
};

export type FinanceOptions = {
  farms?: FinanceOption[];
  farmers?: FinanceOption[];
  extensionOfficers?: FinanceOption[];
};

export type FinanceResponse = {
  items: FinanceRecordItem[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
    deletedCount?: number;
  };
  summary: {
    total: number;
    active: number;
    secondary: number;
    tertiary: number;
  };
  options: FinanceOptions;
};

export type FinanceReportRow = {
  date: string;
  type?: string;
  billNo?: string;
  reference?: string;
  farm: string;
  farmer: string;
  officer?: string;
  subject: string;
  quantity: number;
  amount: number;
  status: string;
  notes: string;
};

export type IncomeExpenditureReportResponse = {
  summary: {
    totalIncome: number;
    totalExpenditure: number;
    net: number;
    totalIncomeRows: number;
    totalExpenseRows: number;
    totalBillRows: number;
  };
  incomeRows: FinanceReportRow[];
  expenseRows: FinanceReportRow[];
  billRows: FinanceReportRow[];
  filters: {
    fromDate: string;
    toDate: string;
    farmUuid?: string | null;
    farmerId?: number | null;
    search?: string;
  };
  options: FinanceOptions;
};

export type FinanceFieldType =
  | "text"
  | "number"
  | "date"
  | "textarea"
  | "select";

export type FinanceFormField = {
  name: string;
  label: string;
  type: FinanceFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  optionsKey?: keyof FinanceOptions;
  staticOptions?: FinanceOption[];
};

export type FinanceFormSection = {
  title: string;
  description: string;
  fields: FinanceFormField[];
};

export type FinanceTableColumn = {
  key: string;
  label: string;
};

