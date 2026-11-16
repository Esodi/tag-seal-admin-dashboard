import {
  Building2,
  CloudOff,
  ExternalLink,
  Handshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { LandingAuthCta } from "@/features/landing/landing-auth-cta";

const audiences = [
  {
    title: "Farmers & field staff",
    text: "Register animals, scan tags, and record events—online or offline.",
  },
  {
    title: "Cooperatives & milk teams",
    text: "Centres, intakes, transporters, drivers, and factory operators.",
  },
  {
    title: "Veterinarians",
    text: "Verified professionals answering on-demand farm requests.",
  },
  {
    title: "Traders & auction officers",
    text: "Marketplace trade and live auction operations.",
  },
  {
    title: "Platform administrators",
    text: "Configure types, permissions, people, and oversight in this portal.",
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Stable animal identity",
    text: "The animal's primary record and physical identifiers stay consistent for life. Sales move ownership without rewriting history.",
  },
  {
    icon: CloudOff,
    title: "Honest offline boundaries",
    text: "Draft and capture in the field; reservations, dispatch acceptance, and ownership transfers need the server when it matters.",
  },
  {
    icon: Users,
    title: "Privacy by default",
    text: "Private herds and sensitive clinical notes stay masked until the right parties are in the conversation.",
  },
  {
    icon: Handshake,
    title: "Role-based access",
    text: "Portal permissions and farm grants decide who may view, configure, or record—not just what the UI hides.",
  },
];

const portalScope = [
  "Animal types, event blueprints, and option lists",
  "People, farms, locations, and access",
  "Veterinary verification and service requests",
  "Dairy organisations, centres, and transport",
  "Marketplace, auctions, careers, and reporting",
  "Security, OTP, and platform permissions",
];

const sisterProducts = [
  {
    name: "Tag & Seal",
    text: "RFID-powered tracking and tamper-evident authentication for livestock, crops, and assets.",
  },
  {
    name: "Shamba Bora",
    text: "Digital farm management: biometric registration, crop traceability, and cooperative tools.",
  },
  {
    name: "MeatTracePro",
    text: "End-to-end meat supply chain traceability from farm to fork with real-time data.",
  },
];

export function LandingAbout() {
  return (
    <>
      <section className="px-5 pb-12 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            About
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Practical farm work. Trusted digital records.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Tag &amp; Seal connects livestock identity, field operations, and admin
            oversight for Tanzania&apos;s agricultural teams.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="font-display text-5xl font-bold text-foreground/10 sm:text-6xl">
              Climb Up
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Building2 className="size-4" />
              Climb Up Limited
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Transforming agriculture and utilities through technology—empowering
              ecosystems with ICT solutions built for Africa&apos;s realities and
              tomorrow&apos;s challenges.
            </p>
            <a
              href="https://www.climbup.co.tz/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:opacity-80"
            >
              Visit climbup.co.tz
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold leading-snug text-foreground sm:text-3xl">
              Honoring the work on the ground while giving every animal a record that
              lasts from farm to fork.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Tag &amp; Seal is Climb Up&apos;s livestock traceability platform: a secure
              admin portal paired with an offline-capable Super App—so configuration and
              fieldwork stay in sync across Tanzania&apos;s agricultural value chains.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-14">
          <article>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Vision
            </p>
            <h2 className="mt-3 font-display text-xl font-bold text-foreground sm:text-2xl">
              Pioneer ICT innovations that ascend beyond boundaries
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Empowering a world where technology unlocks limitless possibilities—from
              ground to cloud, with trust and transparency.
            </p>
          </article>
          <article>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Mission
            </p>
            <h2 className="mt-3 font-display text-xl font-bold text-foreground sm:text-2xl">
              Transformative ICT for efficiency, transparency, and sustainability
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Climb Up delivers customer-centric platforms spanning agricultural value
              chains, utilities, and beyond—optimizing operations in real time while
              advancing environmental stewardship.
            </p>
          </article>
        </div>
        <div className="mx-auto mt-12 max-w-6xl">
          <p className="text-sm font-semibold text-foreground">Our perspective</p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Technology should do more than digitize—it should transform. Climb Up designs
            systems that respond to real challenges: food insecurity, water scarcity, and
            limited rural access. Agriculture deserves farmer-first solutions; innovation
            should connect ground to cloud with trust.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Who we serve with Tag &amp; Seal
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            One phone login can open different hubs as memberships and approvals allow.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((item) => (
              <article key={item.title}>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Climb Up platforms
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Field-proven digital platforms for agriculture, livestock, and related value chains.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {sisterProducts.map((item) => (
              <article key={item.name}>
                <h3 className="text-base font-semibold text-foreground">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Principles we design around
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {principles.map((item) => (
              <article key={item.title}>
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-muted/40 px-6 py-10 sm:px-10 sm:py-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            What this portal configures
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Administrators shape the system the field app downloads—without replacing the
            mobile experience farmers use every day.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {portalScope.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Contact Climb Up
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Working hours 8:00am – 5:00pm · Call lines available 24/7
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <a
              href="tel:+255652433633"
              className="flex gap-3 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                +255 652 433 633
                <br />
                +255 739 633 433
              </span>
            </a>
            <a
              href="mailto:info@climbup.co.tz"
              className="flex gap-3 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              info@climbup.co.tz
            </a>
            <p className="flex gap-3 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              55 Ally Sykes, Kawe Beach, Kinondoni
            </p>
          </div>
          <a
            href="https://www.climbup.co.tz/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:opacity-80"
          >
            More about Climb Up Limited
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </section>

      <section className="px-5 pb-20 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Start in the admin workspace
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Sign in to manage the platform—or open the dashboard if you already have a session.
          </p>
          <div className="mt-8">
            <LandingAuthCta
              variant="primary"
              guestLabel="Get started"
              memberLabel="Open dashboard"
              showArrow
            />
          </div>
        </div>
      </section>
    </>
  );
}
