'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForgeWindStore } from '@/stores/forgewind.store';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Lightbulb,
  MemoryStick,
  Plus,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export default function InsightsPage() {
  const router = useRouter();
  const memoryContext = useForgeWindStore((s) => s.memoryContext);
  const repositories = useForgeWindStore((s) => s.repositories);
  const selectedRepositoryId = useForgeWindStore((s) => s.selectedRepositoryId);
  const experience = useForgeWindStore((s) => s.experience);
  const education = useForgeWindStore((s) => s.education);
  const skills = useForgeWindStore((s) => s.skills);
  const generatedContent = useForgeWindStore((s) => s.generatedContent);
  const aiAnalysis = useForgeWindStore((s) => s.aiAnalysis);
  const openToWork = useForgeWindStore((s) => s.openToWork);
  const userProfile = useForgeWindStore((s) => s.userProfile);

  const selectedRepo = repositories.find((r) => r.id === selectedRepositoryId);
  const strengthsText = memoryContext.strengths.filter(Boolean).join(', ');
  const hasRepo = repositories.length > 0;
  const totalItems =
    (hasRepo ? 1 : 0) +
    (experience.length > 0 ? 1 : 0) +
    (skills.length > 0 ? 1 : 0) +
    (generatedContent.length > 0 ? 1 : 0);

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
              <Brain className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI memory &amp; context</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Everything the AI knows about you — used to personalise posts, job matches, and
                application content.
              </p>
            </div>
          </div>
          {totalItems > 0 && (
            <span className="shrink-0 rounded-full bg-fw-orange-light px-2.5 py-1 text-xs font-semibold text-fw-orange">
              {totalItems} context source{totalItems !== 1 ? 's' : ''} active
            </span>
          )}
        </div>
      </Card>

      {/* Empty state — no repos, no profile data */}
      {totalItems === 0 && experience.length === 0 && skills.length === 0 ? (
        <Card className="p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 mb-4">
              <MemoryStick className="h-7 w-7 text-primary-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No insights yet</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Connect a repository or fill in your profile to start building AI context.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => router.push('/data-hub')}>
                <FolderGit2 className="h-4 w-4" />
                Connect a repository
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" onClick={() => router.push('/profile')}>
                <Plus className="h-4 w-4" />
                Fill in profile
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Open to work status */}
          <ContextCard
            icon={Sparkles}
            iconColor="text-green-500"
            iconBg="bg-green-500/10"
            title="Job search status"
            filled={true}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  openToWork ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground',
                )}
              />
              <p className="text-sm text-foreground font-medium">
                {openToWork ? 'Open to work' : 'Not actively looking'}
              </p>
            </div>
            {userProfile.headline && (
              <p className="mt-1 text-xs text-muted-foreground">{userProfile.headline}</p>
            )}
            <Link
              href="/profile"
              className="mt-2 inline-flex items-center gap-1 text-xs text-fw-orange hover:underline"
            >
              Edit in profile <ArrowRight className="h-3 w-3" />
            </Link>
          </ContextCard>

          {/* Active repository */}
          <ContextCard
            icon={FolderGit2}
            iconColor="text-fw-orange"
            iconBg="bg-fw-orange-light"
            title="Active repository"
            filled={!!selectedRepo}
            emptyAction={{ label: 'Connect a repo', href: '/data-hub' }}
          >
            {selectedRepo ? (
              <>
                <p className="text-sm font-semibold text-foreground font-mono">
                  {selectedRepo.fullName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedRepo.language} · Health {selectedRepo.healthScore}%
                </p>
                {selectedRepo.summary && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {selectedRepo.summary}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>
                    {repositories.length} repo{repositories.length !== 1 ? 's' : ''} total
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No repository selected.</p>
            )}
          </ContextCard>

          {/* Experience */}
          <ContextCard
            icon={Briefcase}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
            title="Work experience"
            filled={experience.length > 0}
            emptyAction={{ label: 'Add experience', href: '/profile' }}
          >
            {experience.length > 0 ? (
              <div className="space-y-2">
                {experience.slice(0, 3).map((e) => (
                  <div key={e.id} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{e.title}</span>
                      <span className="text-muted-foreground"> at {e.company}</span>
                      {e.endDate === null && (
                        <span className="ml-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-600">
                          Current
                        </span>
                      )}
                    </p>
                  </div>
                ))}
                {experience.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{experience.length - 3} more</p>
                )}
              </div>
            ) : null}
          </ContextCard>

          {/* Skills */}
          <ContextCard
            icon={Zap}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
            title="Skills"
            filled={skills.length > 0}
            emptyAction={{ label: 'Add skills', href: '/profile' }}
          >
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 12).map((s) => (
                  <span
                    key={s.id}
                    className="rounded-md bg-fw-orange-light px-2 py-0.5 text-xs font-medium text-fw-orange"
                  >
                    {s.name}
                  </span>
                ))}
                {skills.length > 12 && (
                  <span className="text-xs text-muted-foreground">+{skills.length - 12} more</span>
                )}
              </div>
            ) : null}
          </ContextCard>

          {/* Education */}
          {education.length > 0 && (
            <ContextCard
              icon={GraduationCap}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/10"
              title="Education"
              filled={true}
            >
              <div className="space-y-2">
                {education.slice(0, 2).map((e) => (
                  <div key={e.id} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{e.school}</span>
                      {e.degree && <span className="text-muted-foreground"> · {e.degree}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </ContextCard>
          )}

          {/* AI findings */}
          {aiAnalysis.findings.length > 0 && (
            <ContextCard
              icon={Lightbulb}
              iconColor="text-fw-orange"
              iconBg="bg-fw-orange-light"
              title="AI analysis findings"
              filled={true}
            >
              <div className="space-y-1.5">
                {aiAnalysis.findings.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-fw-orange" />
                    <p className="text-xs text-muted-foreground">{f}</p>
                  </div>
                ))}
              </div>
            </ContextCard>
          )}

          {/* Career narrative */}
          <ContextCard
            icon={BookOpen}
            iconColor="text-primary-400"
            iconBg="bg-primary-500/10"
            title="Career narrative"
            filled={!!memoryContext.careerNarrative.trim()}
            emptyAction={{ label: 'Generate a bio in Posts', href: '/content' }}
          >
            {memoryContext.careerNarrative ? (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {memoryContext.careerNarrative}
              </p>
            ) : null}
          </ContextCard>

          {/* Generated posts count */}
          <ContextCard
            icon={Target}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
            title="Generated content"
            filled={generatedContent.length > 0}
            emptyAction={{ label: 'Create a post', href: '/content' }}
          >
            {generatedContent.length > 0 ? (
              <>
                <p className="text-2xl font-bold text-foreground">{generatedContent.length}</p>
                <p className="text-xs text-muted-foreground">
                  post{generatedContent.length !== 1 ? 's' : ''} saved — used to personalise future
                  AI outputs
                </p>
                <div className="mt-2 space-y-1">
                  {generatedContent.slice(0, 2).map((c) => (
                    <p key={c.id} className="text-xs text-muted-foreground truncate">
                      · {c.title}
                    </p>
                  ))}
                </div>
              </>
            ) : null}
          </ContextCard>

          {/* Strengths from analysis */}
          {strengthsText && (
            <ContextCard
              icon={Sparkles}
              iconColor="text-green-500"
              iconBg="bg-green-500/10"
              title="Detected strengths"
              filled={true}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">{strengthsText}</p>
            </ContextCard>
          )}
        </div>
      )}
    </div>
  );
}

/* ── helper card component ── */
function ContextCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  filled,
  emptyAction,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  filled: boolean;
  emptyAction?: { label: string; href: string };
  children?: React.ReactNode;
}) {
  return (
    <Card className={cn('p-5 space-y-3', !filled && 'border-dashed opacity-70')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        {filled && <span className="h-2 w-2 rounded-full bg-green-400" title="Active" />}
      </div>

      {filled ? (
        children
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-xs italic text-muted-foreground/70">Not configured yet</p>
          {emptyAction && (
            <Link
              href={emptyAction.href}
              className="flex items-center gap-1 text-xs font-medium text-fw-orange hover:text-fw-deep"
            >
              {emptyAction.label} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
