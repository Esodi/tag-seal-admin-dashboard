import Link from "next/link";
import { ArrowRight, BarChart3, Beef, CheckCircle2, MapPinned, ShieldCheck } from "lucide-react";

const capabilities = [
  { icon: Beef, title: "Livestock management", text: "One dependable record for every animal, identifier and lifecycle event." },
  { icon: MapPinned, title: "Farm intelligence", text: "Connect farms, farmers and locations across every administrative level." },
  { icon: BarChart3, title: "Operational insight", text: "Turn field activity into clear reports, trends and accountable decisions." },
];

export default function HomePage() {
  return <main className="min-h-screen bg-[#07170f] text-white">
    <section className="relative isolate min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/tag-seal-farm.jpg')" }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#062617]/95 via-[#123d28]/84 to-[#07170f]/92" />
      <div className="absolute -right-32 -top-32 size-[34rem] rounded-full bg-[#facc15]/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between rounded-full border border-white/15 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
          <Link href="/" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#facc15] text-xs font-bold text-[#123d28]">T&S</span><span className="font-semibold tracking-tight">Tag & Seal</span></Link>
          <div className="hidden items-center gap-7 text-sm text-white/75 md:flex"><a href="#solutions" className="transition hover:text-[#fde047]">Solutions</a><a href="#about" className="transition hover:text-[#fde047]">About</a><a href="#security" className="transition hover:text-[#fde047]">Security</a></div>
          <Link href="/login" className="inline-flex h-9 items-center gap-2 rounded-full bg-[#facc15] px-4 text-sm font-semibold text-[#123d28] transition hover:bg-[#fde047]">Admin login <ArrowRight className="size-4" /></Link>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#fde047]/25 bg-[#fde047]/10 px-3 py-1.5 text-xs font-semibold text-[#fde047]"><ShieldCheck className="size-4" />Secure agricultural traceability</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-.035em] sm:text-5xl lg:text-6xl">Every animal. Every farm. <span className="text-[#fde047]">One trusted record.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Tag & Seal connects animal identity, farm operations and field intelligence in a secure platform built for Tanzania&apos;s livestock ecosystem.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#facc15] px-6 text-sm font-semibold text-[#123d28] shadow-lg shadow-black/20">Open admin workspace <ArrowRight className="size-4" /></Link><a href="#solutions" className="inline-flex h-11 items-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-medium backdrop-blur">Explore the platform</a></div>
            <div id="security" className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/65">{["Role-based access", "Tamper-evident records", "Farm-to-fork visibility"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#fde047]" />{item}</span>)}</div>
          </div>

          <div id="solutions" className="grid gap-3 rounded-3xl border border-white/15 bg-black/15 p-3 shadow-2xl backdrop-blur-xl sm:p-4">{capabilities.map((item, index) => <article key={item.title} className="group rounded-2xl border border-white/10 bg-white/10 p-5 transition hover:bg-white/15"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#facc15] text-[#123d28]"><item.icon className="size-5" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#fde047]">0{index + 1}</p><h2 className="mt-1 text-lg font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p></div></div></article>)}</div>
        </div>
        <div id="about" className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-white/50"><span>Powered by Climb Up Limited</span><span>Built for accountable, connected agriculture.</span></div>
      </div>
    </section>
  </main>;
}
