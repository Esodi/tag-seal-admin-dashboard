const steps = [
  {
    step: "01",
    title: "Tag the animal",
    text: "Register livestock with stable identifiers—RFID, national tags, brands—so the animal keeps one trusted identity for life.",
  },
  {
    step: "02",
    title: "Record in the field",
    text: "Log milking, feeding, vaccination, weight, transfer, and more—even offline. Forms follow published animal setup when live.",
  },
  {
    step: "03",
    title: "Sync & oversee",
    text: "Sync to the server; admins see events, farms, and people in the portal with role-based permissions.",
  },
];

export function HomeHowItWorks() {
  return (
    <section className="bg-muted/30 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From the ear tag to the admin desk
          </h2>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((item) => (
            <article key={item.step}>
              <p className="font-display text-3xl font-bold text-foreground/15">{item.step}</p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
