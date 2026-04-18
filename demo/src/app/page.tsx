import Image from "next/image";
import { mailtoCollaborate, site } from "@/config/site";

/** Intrinsic dimensions (from assets) so layout matches screenshots without cropping. */
const shots = {
  hero: {
    src: "/forge-cinematic-hero.png",
    alt: "ForgeWind cinematic hero with work mode toggle",
    w: 1024,
    h: 493,
  },
  workspace: {
    src: "/forge-workspace.png",
    alt: "ForgeWind workspace showing repository intelligence cards and agent state",
    w: 1024,
    h: 461,
  },
  contentJobs: {
    src: "/forge-content-jobs.png",
    alt: "Generated LinkedIn-ready content and opportunity feed with match scores",
    w: 1024,
    h: 353,
  },
  sidebar: {
    src: "/forge-sidebar.png",
    alt: "ForgeWind sidebar navigation with Intelligence layer and active repository",
    w: 437,
    h: 1024,
  },
} as const;

export default function Home() {
  const mailto = mailtoCollaborate();
  const hasContactCtas = Boolean(mailto || site.linkedInUrl);

  return (
    <div id="top" className="min-h-screen bg-hero-wash">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8">
          <a href="#top" className="flex items-center gap-3">
            <Image
              src="/forge-logo.png"
              width={36}
              height={36}
              alt="ForgeWind"
              className="h-9 w-9 rounded-lg border border-line object-cover shadow-sm"
              priority
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">{site.product}</p>
              <p className="text-xs text-mist">Intelligence layer</p>
            </div>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-mist md:flex">
            <a className="transition hover:text-ink" href="#product">
              Product
            </a>
            <a className="transition hover:text-ink" href="#collaborate">
              Collaborate
            </a>
            <a className="transition hover:text-ink" href="#contact">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:px-8 md:pt-20">
          <div className="flex flex-col justify-center space-y-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              ForgeWind cinematic system · Public preview
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink md:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
              A career operating system that turns profile and repository signal into strategic
              momentum.
            </h1>
            <p className="max-w-xl text-pretty text-lg leading-relaxed text-mist">
              Quiet tools for people who ship: repository intelligence, AI-assisted narratives, and
              role matches grounded in how you actually build — not generic buzzwords.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#collaborate"
                className="inline-flex items-center justify-center rounded-full bg-cta-strip px-6 py-3 text-sm font-medium text-white shadow-card transition hover:opacity-95"
              >
                Get involved
              </a>
              <a
                href="#product"
                className="text-sm font-medium text-indigo-600 underline-offset-4 hover:underline"
              >
                See the workspace
              </a>
            </div>
          </div>
          <div className="flex min-w-0 items-center justify-center">
            <figure className="w-full overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <Image
                src={shots.hero.src}
                alt={shots.hero.alt}
                width={shots.hero.w}
                height={shots.hero.h}
                className="h-auto w-full object-contain object-top"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority
              />
            </figure>
          </div>
        </section>

        <section id="product" className="border-t border-line bg-white">
          <div className="mx-auto max-w-6xl space-y-20 px-5 py-20 md:px-8">
            <Article
              eyebrow="Repository intelligence"
              title="Your stack, read as a story"
              body="Wire the repos that matter. ForgeWind highlights health, active focus, and the threads that show how you ship — so decisions stay evidence-led."
              shot={shots.workspace}
              imageFirst={false}
            />
            <Article
              eyebrow="Narrative & matches"
              title="From measurable work to posts — and roles that fit the proof"
              body="Turn real commits and architecture choices into content that sounds like you, alongside opportunity signals scored from repository context — not keyword stuffing."
              shot={shots.contentJobs}
              imageFirst
            />
            <Article
              eyebrow="Intelligence layer"
              title="One calm surface"
              body="Mode, agent state, and your active repository stay in view. Less tab-hopping; more clarity on what to do next."
              shot={shots.sidebar}
              imageFirst={false}
            />
          </div>
        </section>

        <section
          id="collaborate"
          className="border-t border-line bg-gradient-to-b from-canvas to-white"
        >
          <div className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Open builders
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold text-ink md:text-4xl">
              Ideas, feedback, and collaborators welcome
            </h2>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-mist">
              We&apos;re building ForgeWind in the open. If you want to shape the roadmap, suggest an
              integration, critique the UX, or explore working with us — we&apos;d love to hear from
              you. Thoughtful notes beat generic pitches.
            </p>
            {hasContactCtas ? (
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {mailto ? (
                  <a
                    href={mailto}
                    className="inline-flex min-w-[12rem] items-center justify-center rounded-full bg-ink px-8 py-3 text-sm font-medium text-white shadow-card transition hover:bg-ink/90"
                  >
                    Email the team
                  </a>
                ) : null}
                {site.linkedInUrl ? (
                  <a
                    href={site.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-w-[12rem] items-center justify-center rounded-full border border-line bg-white px-8 py-3 text-sm font-medium text-ink shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
                  >
                    Message on LinkedIn
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <footer id="contact" className="border-t border-line bg-white">
          <div className="mx-auto max-w-3xl space-y-6 px-5 py-14 md:px-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink">Contact & company</p>
              <p className="text-sm leading-relaxed text-mist">
                <span className="font-medium text-ink">{site.product}</span>
                <br />
                {site.location}. This site is a public preview; the product is under active
                development.
              </p>
              <p className="text-xs leading-relaxed text-mist/90">
                Nothing here is hiring commitment, financial advice, or a guarantee of features or
                timelines. We&apos;re sharing direction early because we care about feedback from
                builders and operators.
              </p>
            </div>
            <p className="border-t border-line pt-6 text-xs text-mist">
              © {site.year} {site.product}. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Article({
  eyebrow,
  title,
  body,
  shot,
  imageFirst,
}: {
  eyebrow: string;
  title: string;
  body: string;
  shot: { src: string; alt: string; w: number; h: number };
  imageFirst: boolean;
}) {
  const bodyCol = (
    <div className="flex min-w-0 flex-col justify-center space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">{eyebrow}</p>
      <h3 className="text-2xl font-semibold text-ink md:text-3xl">{title}</h3>
      <p className="text-pretty text-lg leading-relaxed text-mist">{body}</p>
    </div>
  );
  const imgCol = (
    <figure className="flex min-w-0 justify-center overflow-hidden rounded-2xl border border-line bg-slate-50/80 shadow-card md:justify-stretch">
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.w}
        height={shot.h}
        className="h-auto w-full max-w-full object-contain object-top"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </figure>
  );
  return (
    <div className="grid min-w-0 gap-10 md:grid-cols-2 md:items-center md:gap-14">
      {imageFirst ? (
        <>
          {imgCol}
          {bodyCol}
        </>
      ) : (
        <>
          {bodyCol}
          {imgCol}
        </>
      )}
    </div>
  );
}
