import Image from "next/image";
import {
  Beef,
  CloudOff,
  Droplets,
  ScrollText,
  Stethoscope,
  Store,
  Tags,
} from "lucide-react";
import { LandingAuthCta } from "@/features/landing/landing-auth-cta";
import { cn } from "@/lib/utils";

const pillars = [
  {
    icon: Tags,
    title: "Livestock identity & Animal Setup",
    text: "Each animal keeps a stable identity across farms and sales. Admins publish animal types and event blueprints; the field app draws live forms—or falls back to built-in screens when a type is paused.",
    points: [
      "Multi-species: cattle, goats, sheep, swine, poultry, and more",
      "RFID, national tags, brands, and paired identifiers",
      "Published configuration manifests with revision checksums",
    ],
  },
  {
    icon: Beef,
    title: "Farm operations & events",
    text: "Owners and workers share farms with real permissions. Record milking, feeding, vaccination, weight, births, breeding, transfer, and disposal—then see the same history in Events & Logs.",
    points: [
      "Farm access grants for workers and managers",
      "Events hub including Transfer—not milking alone",
      "Portal oversight of animals, events, and locations",
    ],
  },
  {
    icon: CloudOff,
    title: "Offline-first sync",
    text: "Field teams draft and save where signal is weak. Sync runs from the button, after save when online, and around login—so the portal stays current without inventing background magic.",
    points: [
      "Local Drift cache for assigned herds and catalogs",
      "Outbox uploads with durable client identifiers",
      "Clear conflict handling when two devices edit offline",
    ],
  },
  {
    icon: Stethoscope,
    title: "On-demand veterinary (Bolt)",
    text: "Farmers request care with GPS and symptoms. Verified vets receive offers in a growing search radius, then progress accepted → travelling → arrived → treating → completed—and farmers can rate the visit.",
    points: [
      "Portal license verification before a vet goes online",
      "Preferred vet first round, then nearest dispatchable vets",
      "Treatment summary linked for animal history",
    ],
  },
  {
    icon: Store,
    title: "Marketplace & auctions",
    text: "Sellers list animals or groups; buyers browse, checkout, and settle with admin-reviewed evidence. Auctions add live sessions, bidding, and officer tools—commerce stays separate from biological status.",
    points: [
      "Listings, offers, reservation, handover",
      "Live auction rooms with anti-sniping behaviour",
      "Private herd inventory masked until you choose to sell",
    ],
  },
  {
    icon: Droplets,
    title: "Milk cooperatives",
    text: "MCU and AMCOS structures, collection centres, farmer enrolment, intakes with quality checks, transporter trips, and factory receipts—wired to the same phone login as the rest of the Super App.",
    points: [
      "Centre staff, transporter, driver, and factory workspaces",
      "Membership approval before cooperative data opens",
      "Delivery and production visibility for enrolled farmers",
    ],
  },
];

type GalleryShot = { src: string; alt: string };

/**
 * Staggered column masonry — taller in the centre.
 * `show`: which breakpoints render the column (mobile keeps the centre 4).
 */
const galleryColumns: Array<{
  show: string;
  offset: string;
  height: string;
  shots: GalleryShot[];
}> = [
  {
    show: "hidden xl:flex",
    offset: "xl:pt-16",
    height: "xl:h-[30rem]",
    shots: [
      { src: "/images/landing/cattle-pasture.jpg", alt: "Dairy cattle in pasture" },
      { src: "/images/landing/sheep-flock.jpg", alt: "Sheep in a barn pen" },
    ],
  },
  {
    show: "hidden md:flex",
    offset: "md:pt-14 lg:pt-20 xl:pt-24",
    height: "md:h-[22rem] lg:h-[26rem] xl:h-[30rem]",
    shots: [
      { src: "/images/landing/poultry-flock.jpg", alt: "Chickens foraging together" },
      { src: "/images/landing/goats-grazing.jpg", alt: "Goats eating grass in a meadow" },
      { src: "/images/landing/cattle-close.jpg", alt: "Tagged cattle close-up" },
    ],
  },
  {
    show: "flex",
    offset: "pt-8 sm:pt-10 md:pt-8 lg:pt-10",
    height: "h-[16.5rem] sm:h-[20rem] md:h-[24rem] lg:h-[28rem] xl:h-[32rem]",
    shots: [{ src: "/images/landing/swine-pen.jpg", alt: "Tagged piglet on a farm" }],
  },
  {
    show: "flex",
    offset: "pt-0",
    height: "h-[18.5rem] sm:h-[22rem] md:h-[26rem] lg:h-[30rem] xl:h-[34rem]",
    shots: [{ src: "/images/landing/goats-flock.jpg", alt: "Dense herd of goats" }],
  },
  {
    show: "flex",
    offset: "pt-1 sm:pt-2 md:pt-3 lg:pt-4",
    height: "h-[18rem] sm:h-[21.5rem] md:h-[25rem] lg:h-[29rem] xl:h-[33rem]",
    shots: [{ src: "/images/landing/cattle-dairy.jpg", alt: "Cattle in golden pasture light" }],
  },
  {
    show: "flex",
    offset: "pt-8 sm:pt-10 md:pt-8 lg:pt-12",
    height: "h-[16.5rem] sm:h-[20rem] md:h-[24rem] lg:h-[28rem] xl:h-[32rem]",
    shots: [{ src: "/images/landing/poultry-farm.jpg", alt: "Poultry on a working farm" }],
  },
  {
    show: "hidden md:flex",
    offset: "md:pt-14 lg:pt-20 xl:pt-24",
    height: "md:h-[22rem] lg:h-[26rem] xl:h-[30rem]",
    shots: [
      { src: "/images/landing/cattle-herd.jpg", alt: "Cattle herd at golden hour" },
      { src: "/images/landing/livestock-herd.jpg", alt: "Young pig in farm straw" },
      { src: "/images/landing/sheep-hill.jpg", alt: "Sheep flock outdoors" },
    ],
  },
  {
    show: "hidden xl:flex",
    offset: "xl:pt-16",
    height: "xl:h-[30rem]",
    shots: [
      { src: "/images/landing/cattle-group.jpg", alt: "Calf with ear tags in pasture" },
      { src: "/images/landing/livestock-pasture.jpg", alt: "Cattle across open pasture" },
    ],
  },
];

function LivestockGallery() {
  return (
    <div className="landing-solutions-gallery mx-auto w-full max-w-7xl overflow-hidden px-2 sm:px-4 md:px-5">
      <div className="flex items-start justify-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3">
        {galleryColumns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={cn(
              "min-w-0 flex-1 flex-col gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3",
              column.show,
              column.offset,
              column.height,
            )}
          >
            {column.shots.map((shot) => (
              <div
                key={shot.src}
                className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-muted shadow-[0_18px_40px_-28px_rgba(24,54,41,0.45)] sm:rounded-2xl"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 768px) 24vw, (max-width: 1280px) 16vw, 12vw"
                  className="object-cover transition duration-700 ease-out motion-safe:hover:scale-[1.04]"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingSolutions() {
  return (
    <>
      <section className="px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Solutions
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Capabilities that mirror the real platform
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Not a brochure of wishes—these are the modules Tag &amp; Seal already connects
            across the admin portal and the mobile Super App.
          </p>
        </div>
      </section>

      <section className="pb-4 pt-2 sm:pb-6">
        <LivestockGallery />
        <div className="mx-auto mt-8 max-w-2xl px-5 text-center sm:mt-10 sm:px-8 md:mt-12">
          <span className="inline-flex rounded-full border border-border/70 bg-background/80 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            Livestock
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:mt-4 sm:text-3xl md:text-4xl">
            Built for every herd you keep
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base md:text-lg">
            cattle, goats, sheep, swine, poultry, and more
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl space-y-16">
          {pillars.map((item) => (
            <article
              key={item.title}
              className="grid gap-5 md:grid-cols-[auto_1fr] md:gap-8"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                  {item.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                  {item.text}
                </p>
                <ul className="mt-4 space-y-2">
                  {item.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2 text-sm leading-6 text-muted-foreground"
                    >
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
          <div className="relative aspect-[4/3] min-h-[200px] sm:aspect-[16/9] sm:min-h-[220px] lg:aspect-[21/9]">
            <Image
              src="/images/landing/goats-grazing.jpg"
              alt="Goats grazing across a meadow"
              fill
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/15 sm:bg-gradient-to-r sm:from-black/55 sm:via-black/30 sm:to-black/20" />
            <div className="absolute inset-0 flex items-end p-5 sm:p-8 md:p-10">
              <div className="max-w-lg text-white">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-xs">
                  <ScrollText className="size-3.5" />
                  Traceability
                </p>
                <p className="mt-2 font-display text-xl font-bold leading-snug sm:text-2xl">
                  One ledger of events—visible where permissions allow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Configure and oversee from the admin portal
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Sign in to publish setups, review people and requests, and support the field.
          </p>
          <div className="mt-8">
            <LandingAuthCta
              variant="primary"
              guestLabel="Open admin workspace"
              memberLabel="Open dashboard"
              showArrow
            />
          </div>
        </div>
      </section>
    </>
  );
}
