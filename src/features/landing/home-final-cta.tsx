import { LandingAuthCta } from "@/features/landing/landing-auth-cta";

export function HomeFinalCta() {
  return (
    <section className="px-5 pb-20 pt-4 sm:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-primary px-6 py-12 text-center text-primary-foreground sm:px-10">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to open the admin workspace?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-primary-foreground/80">
          Configure animal types, oversee farms and events, and support the field app
          from one secure portal.
        </p>
        <div className="mt-8 flex justify-center">
          <LandingAuthCta
            variant="hero"
            guestLabel="Admin login"
            memberLabel="Open dashboard"
            showArrow
          />
        </div>
      </div>
    </section>
  );
}
