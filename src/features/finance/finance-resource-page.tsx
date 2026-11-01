import { FinanceResourceDashboard } from "@/features/finance/finance-resource-dashboard";
import { IncomeExpenditureDashboard } from "@/features/finance/income-expenditure-dashboard";
import type {
  FinanceCrudResource,
  FinanceResource,
} from "@/features/finance/types";
import {
  getInitialFinanceResource,
  getInitialIncomeExpenditureReport,
} from "@/lib/finance";

export async function FinanceResourcePage({
  resource,
}: {
  resource: FinanceResource;
}) {
  if (resource === "income-expenditure") {
    const report = await getInitialIncomeExpenditureReport();
    return (
      <IncomeExpenditureDashboard
        initialData={report.data}
        initialError={report.error}
      />
    );
  }

  const result = await getInitialFinanceResource(
    resource as FinanceCrudResource,
  );
  return (
    <FinanceResourceDashboard
      resource={resource as FinanceCrudResource}
      initialData={result.data}
      initialError={result.error}
    />
  );
}

