import Link from "next/link";
import {
  ArrowRight,
  Beef,
  BriefcaseBusiness,
  Droplets,
  Gavel,
  Stethoscope,
  Store,
} from "lucide-react";

const hubs = [
  {
    icon: Beef,
    title: "Farmer",
    text: "Herds, tags, scans, and lifecycle events on the farm.",
  },
  {
    icon: Droplets,
    title: "Milk",
    text: "Cooperatives, centres, intakes, transport, and factory receipt.",
  },
  {
    icon: Store,
    title: "Marketplace",
    text: "Listings, offers, checkout, and handover for livestock trade.",
  },
  {
    icon: Stethoscope,
    title: "Vets",
    text: "On-demand requests, nearby dispatch, and clinical close-out.",
  },
  {
    icon: Gavel,
    title: "Auctions",
    text: "Live sessions, bidding, and auction officer workflows.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Careers",
    text: "Agricultural jobs, seekers, employers, and farm hiring.",
  },
];

export function HomeEcosystem() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Ecosystem
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            One Super App. Six working hubs.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Farmers, cooperatives, vets, traders, and employers share the same Tag &amp; Seal
            account—each hub opens when membership allows.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((hub) => (
            <article key={hub.title} className="sm:pr-4">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <hub.icon className="size-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{hub.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{hub.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/solutions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:opacity-80"
          >
            See how solutions fit together
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
