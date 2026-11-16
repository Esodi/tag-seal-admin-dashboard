import { MonitorSmartphone, Smartphone } from "lucide-react";

export function HomePlatforms() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Portal &amp; field
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Configured in the portal. Lived on the phone.
          </h2>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <article>
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MonitorSmartphone className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-foreground">Admin portal</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Publish animal types and event forms, manage people and farms, review
              veterinary applications, oversee dairy organisations, commerce, auctions,
              and reporting—with platform permissions that match real duties.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                Animal Setup &amp; Event Field Options
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                People, locations, events &amp; analytics
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                Security, OTP, and role-based access
              </li>
            </ul>
          </article>

          <article>
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Smartphone className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-foreground">Mobile Super App</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Phone login with OTP or PIN, offline-first herd work, Bluetooth weighing
              where needed, and hubs for milk, marketplace, vets, auctions, and careers—synced
              when the network returns.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                Drift local cache &amp; sync queue
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                Scan tags &amp; record lifecycle events
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                Membership gates per hub
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
