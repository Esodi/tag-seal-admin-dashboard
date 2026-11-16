"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { LandingAuthCta } from "@/features/landing/landing-auth-cta";
import { cn } from "@/lib/utils";

const slides = [
  {
    src: "/images/landing/cattle-pasture.jpg",
    alt: "Cattle grazing in open pasture",
    label: "Cattle",
  },
  {
    src: "/images/landing/livestock-herd.jpg",
    alt: "Mixed livestock across open land",
    label: "Herds",
  },
  {
    src: "/images/landing/sheep-flock.jpg",
    alt: "Sheep flock in a farm pen",
    label: "Sheep",
  },
  {
    src: "/images/landing/goats-grazing.jpg",
    alt: "Many goats eating grass in a meadow",
    label: "Goats grazing",
  },
  {
    src: "/images/landing/poultry-farm.jpg",
    alt: "Poultry on a working farm",
    label: "Poultry",
  },
];

const INTERVAL_MS = 6500;

export function LandingHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Livestock gallery"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn(
              "object-cover object-center will-change-transform",
              i === index ? "landing-ken-burns" : "scale-100"
            )}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/30" />

      <div
        className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2.5 sm:right-6 lg:right-8"
        role="tablist"
        aria-label="Slide"
      >
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`${slide.label} (${i + 1} of ${slides.length})`}
              onClick={() => goTo(i)}
              className={cn(
                "group relative flex items-center justify-center rounded-full transition-all duration-300",
                active ? "h-8 w-2.5" : "size-2.5 hover:scale-110"
              )}
            >
              <span
                className={cn(
                  "block rounded-full transition-all duration-300",
                  active
                    ? "h-8 w-1.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.45)]"
                    : "size-1.5 bg-white/45 group-hover:bg-white/80"
                )}
              />
            </button>
          );
        })}
        <span className="mt-2 hidden rotate-180 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50 [writing-mode:vertical-rl] sm:block">
          {slides[index]?.label}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-5 pb-10 pr-12 pt-28 sm:px-8 sm:pr-16 sm:pt-32 lg:px-10 lg:pr-20">
        <div
          id="landing-hero-copy"
          className="landing-fade-up mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
            Livestock management
          </p>
          <p className="mt-6 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tag &amp; Seal
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Every animal. Every farm.
            <br className="hidden sm:block" /> One trusted record.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            Secure livestock identity, field operations, and admin oversight for
            Tanzania&apos;s agricultural ecosystem—built for the farm and the portal.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LandingAuthCta
              variant="hero"
              guestLabel="Open admin workspace"
              memberLabel="Open dashboard"
              showArrow
            />
            <Link
              href="/solutions"
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/35 bg-white/5 px-5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Explore solutions
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="landing-rise mx-auto grid w-full max-w-7xl gap-6 pt-10 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <p className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-white/55 lg:block">
            Est. · Climb Up Limited
          </p>

          <a
            href="#trust"
            className="mx-auto inline-flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            Scroll
            <ArrowDown className="size-3.5 animate-bounce" />
          </a>

          <div className="justify-self-end lg:max-w-sm">
            <div className="rounded-3xl bg-white/12 p-5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                · Our mission
              </p>
              <p className="mt-3 text-sm leading-6 text-white/90">
                Clear digital records for every animal—so identity stays trusted from
                farm to fork.
              </p>
              <Link
                href="/about"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white transition hover:opacity-80"
              >
                Learn more
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
