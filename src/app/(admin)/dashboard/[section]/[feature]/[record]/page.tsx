import { notFound } from "next/navigation";
import { AnimalTypeWorkspace } from "@/features/animal-setup/animal-type-workspace";
import { AuctionCentreDetailsPage } from "@/features/auction/auction-centre-details";
import { OptionListPage } from "@/features/event-options/option-list-page";
import { FactoryDetailsPage } from "@/features/dairy/factory-details-page";

export const instant = false;

export default async function RecordPage({ params }: { params: Promise<{ section: string; feature: string; record: string }> }) {
  const { section, feature, record } = await params;
  if (section === "blueprints" && feature === "animal-types-events" && /^\d+$/.test(record)) return <AnimalTypeWorkspace typeId={record} />;
  if (section === "blueprints" && feature === "lookup-sets" && /^[0-9a-f-]{36}$/i.test(record)) return <OptionListPage listId={record} />;
  if (section === "auction" && feature === "centres") return <AuctionCentreDetailsPage uuid={record} />;
  if (section !== "dairy" || feature !== "factories") notFound();
  return <FactoryDetailsPage uuid={record} />;
}
