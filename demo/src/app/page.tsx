import { ImageSlot } from "@/components/ImageSlot";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-20 pt-16 md:px-10">
        <header className="mb-16 flex items-center justify-between gap-4">
          <span className="text-sm font-medium tracking-tight text-zinc-100">ForgeWind</span>
          <span className="text-xs uppercase tracking-widest text-mist">Preview</span>
        </header>

        <section className="grid flex-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="space-y-8">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
              Career signal, without the noise.
            </h1>
            <p className="max-w-xl text-pretty text-lg leading-relaxed text-mist">
              We’re building quiet, opinionated tools that help you see what matters next — and move
              with intent. This page is a thin slice; the full product lives elsewhere.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white"
                href="#"
              >
                Get updates
              </a>
              <span className="text-sm text-mist">More soon.</span>
            </div>
          </div>

          <ImageSlot
            filename="hero.png"
            alt=""
            className="aspect-[4/3] w-full shadow-2xl shadow-black/40 lg:max-h-[min(420px,50vh)]"
          />
        </section>

        <section className="mt-24 grid gap-6 border-t border-white/10 pt-16 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-mist">Shape</p>
            <p className="text-zinc-200">
              Thoughtful defaults, fast feedback loops, and a view that stays out of your way.
            </p>
          </div>
          <ImageSlot
            filename="detail.png"
            alt=""
            className="aspect-video w-full md:aspect-[16/9]"
          />
        </section>
      </div>
    </main>
  );
}
