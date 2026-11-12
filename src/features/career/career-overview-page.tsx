import { getCareerOverview } from "@/lib/career";
import { CareerOverviewDashboard } from "./career-overview";
export async function CareerOverviewPage() {
  const result = await getCareerOverview();
  return (
    <CareerOverviewDashboard
      initialData={result.data}
      initialError={result.error}
    />
  );
}
