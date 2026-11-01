import { abortedPregnanciesType } from "./aborted-pregnancies";
import { allEventsType } from "./all-events";
import { calvingType } from "./calving";
import { dewormingsType } from "./dewormings";
import { disposalsType } from "./disposals";
import { dryoffsType } from "./dryoffs";
import { eggCollectionsType } from "./egg-collections";
import { farrowingType } from "./farrowing";
import { feedingsType } from "./feedings";
import { identificationEventsType } from "./identification-events";
import { inseminationsType } from "./inseminations";
import { ironInjectionsType } from "./iron-injections";
import { markingsType } from "./markings";
import { milkingsType } from "./milkings";
import { pregnancyTestsType } from "./pregnancy-tests";
import { prepuceConditionsType } from "./prepuce-conditions";
import { stageChangesType } from "./stage-changes";
import { tailDockingsType } from "./tail-dockings";
import { teethClippingsType } from "./teeth-clippings";
import { transfersType } from "./transfers";
import { treatmentsType } from "./treatments";
import type { EventTypeDefinition } from "./types";
import { vaccinationsType } from "./vaccinations";
import { weightChangesType } from "./weight-changes";

export * from "./types";

export const eventTypes: EventTypeDefinition[] = [
  allEventsType,
  calvingType,
  farrowingType,
  abortedPregnanciesType,
  vaccinationsType,
  dewormingsType,
  treatmentsType,
  prepuceConditionsType,
  milkingsType,
  eggCollectionsType,
  inseminationsType,
  pregnancyTestsType,
  dryoffsType,
  weightChangesType,
  feedingsType,
  ironInjectionsType,
  teethClippingsType,
  tailDockingsType,
  markingsType,
  stageChangesType,
  transfersType,
  disposalsType,
  identificationEventsType,
];

export const eventTypesBySlug: Record<string, EventTypeDefinition> = Object.fromEntries(
  eventTypes.map((et) => [et.slug, et]),
);

export function getEventType(slug: string): EventTypeDefinition | undefined {
  return eventTypesBySlug[slug];
}
