import { notFound } from "next/navigation";
import { FactoryDetailsPage } from "@/features/dairy/factory-details-page";

export const instant = false;

export default async function RecordPage({ params }: { params: Promise<{ section: string; feature: string; record: string }> }) {
  const { section, feature, record } = await params;
  if (section !== "dairy" || feature !== "factories") notFound();
  return <FactoryDetailsPage uuid={record} />;
}
