const items = [
  { title: "Multi-species records", text: "Cattle, goats, sheep, swine, poultry and more" },
  { title: "Offline field app", text: "Capture events where connectivity is limited" },
  { title: "Role-based admin", text: "Permissions that match real farm and platform duties" },
  { title: "Farm-to-fork visibility", text: "Identity that travels with every animal" },
];

export function LandingTrust() {
  return (
    <section id="trust" className="scroll-mt-20 px-5 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {items.map((item, index) => (
          <div key={item.title} className="relative text-center lg:px-4">
            {index > 0 ? (
              <span
                aria-hidden
                className="absolute -left-3 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-foreground/8 lg:block"
              />
            ) : null}
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
