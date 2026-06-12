'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookmarkCheck,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Target,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { SkeletonCard } from '@/components/ui/skeleton';
import {
  type ForgeWindApiNarrative,
  type ForgeWindApiOpportunityMatch,
  forgeWindJson,
  getForgeWindApiBaseUrl,
} from '@/lib/forgewind-api';
import { mapOpportunityMatchToJob } from '@/lib/forgewind-mappers';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import { useForgeWindStore } from '@/stores/forgewind.store';
import { cn } from '@/lib/cn';

type Tab = 'all' | 'saved' | 'applied';
type WorkType = 'Any' | 'Remote' | 'Hybrid' | 'On-site';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  reason: string;
  url?: string | null;
  status?: string;
}

/* ── build a LinkedIn job-search URL for any role ── */
function linkedInSearchUrl(title: string, company: string) {
  const q = encodeURIComponent(`${title} ${company}`);
  return `https://www.linkedin.com/jobs/search/?keywords=${q}&f_C=${encodeURIComponent(company)}`;
}

/* ── well-known careers pages ── */
const KNOWN_CAREERS: Record<string, string> = {
  stripe: 'https://stripe.com/jobs',
  datadog: 'https://careers.datadoghq.com',
  notion: 'https://www.notion.so/careers',
  linear: 'https://linear.app/careers',
  vercel: 'https://vercel.com/careers',
  github: 'https://github.com/about/careers',
  google: 'https://careers.google.com',
  microsoft: 'https://careers.microsoft.com',
  amazon: 'https://amazon.jobs',
  meta: 'https://www.metacareers.com',
  apple: 'https://jobs.apple.com',
  netflix: 'https://jobs.netflix.com',
  shopify: 'https://www.shopify.com/careers',
  airbnb: 'https://careers.airbnb.com',
  uber: 'https://www.uber.com/us/en/careers',
  figma: 'https://www.figma.com/careers',
  openai: 'https://openai.com/careers',
};

function companyUrl(company: string, jobTitle: string, jobUrl?: string | null): string {
  if (jobUrl) return jobUrl;
  const key = company.toLowerCase().replace(/\s+/g, '');
  return KNOWN_CAREERS[key] ?? linkedInSearchUrl(jobTitle, company);
}

/* deterministic brand-ish hue per company name */
function companyHue(company: string): number {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = (hash * 31 + company.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

export default function JobsPage() {
  const accessToken = useForgeWindAccessToken();
  const forgeWindUserId = useForgeWindStore((s) => s.forgeWindUserId);
  const repositories = useForgeWindStore((s) => s.repositories);
  const selectedRepositoryId = useForgeWindStore((s) => s.selectedRepositoryId);
  const selectedRepository = repositories.find((r) => r.id === selectedRepositoryId);
  const profile = useForgeWindStore((s) => s.userProfile);
  const experience = useForgeWindStore((s) => s.experience);
  const skills = useForgeWindStore((s) => s.skills);
  const queryClient = useQueryClient();

  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [workType, setWorkType] = useState<WorkType>('Any');
  const [tab, setTab] = useState<Tab>('all');

  /* auto-fill modal */
  const [autofillJob, setAutofillJob] = useState<JobMatch | null>(null);
  const [autofillResult, setAutofillResult] = useState<{
    coverLetter: string;
    headline: string;
    skills: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const matchesQuery = useQuery({
    queryKey: ['forgewind-matches', forgeWindUserId],
    enabled: apiReady,
    queryFn: () => forgeWindJson<ForgeWindApiOpportunityMatch[]>('/matches', { accessToken }),
  });

  const updateStatus = useMutation({
    mutationFn: (input: { id: string; status: 'saved' | 'dismissed' }) =>
      forgeWindJson(`/matches/${input.id}/status`, {
        method: 'PATCH',
        accessToken: accessToken!,
        body: JSON.stringify({ status: input.status }),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['forgewind-matches'] }),
    onError: () => toast.error('Could not update status.'),
  });

  /* AI auto-fill — generate a tailored cover letter + headline + skills summary */
  const autofillMutation = useMutation({
    mutationFn: async (job: JobMatch) => {
      if (!forgeWindUserId) throw new Error('Not authenticated with ForgeWind API.');

      /* Build context about the user */
      const userContext = [
        profile.name ? `Name: ${profile.name}` : '',
        profile.headline ? `Current headline: ${profile.headline}` : '',
        experience.length > 0
          ? `Experience: ${experience.map((e) => `${e.title} at ${e.company}`).join(', ')}`
          : '',
        skills.length > 0 ? `Skills: ${skills.map((s) => s.name).join(', ')}` : '',
        selectedRepository
          ? `Active repository: ${selectedRepository.fullName} (${selectedRepository.language})`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      /* Use profile_optimization narrative type but inject job context via repoId + userId */
      const narrative = await forgeWindJson<ForgeWindApiNarrative>('/narratives/generate', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
          userId: forgeWindUserId,
          type: 'bio',
          ...(selectedRepositoryId ? { repoId: selectedRepositoryId } : {}),
          /* Pass job context in description field — the API uses snapshot context */
          jobContext: {
            title: job.title,
            company: job.company,
            userContext,
          },
        }),
      });

      /* Parse or build the autofill sections */
      const bio = narrative.content;

      return {
        coverLetter: `Dear ${job.company} Hiring Team,\n\nI am excited to apply for the ${job.title} position. ${bio}\n\nI believe my background aligns well with what you are looking for, and I would love the opportunity to contribute to ${job.company}.\n\nBest regards`,
        headline:
          profile.headline ||
          `${experience[0]?.title ?? 'Software Engineer'} · Open to ${job.title} roles`,
        skills:
          skills.length > 0
            ? skills.map((s) => s.name).join(' · ')
            : `${selectedRepository?.language ?? 'TypeScript'} · System Design · API Development`,
      };
    },
    onSuccess: (data) => setAutofillResult(data),
    onError: (e: Error) => toast.error(e.message),
  });

  async function copy(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Copy failed');
    }
  }

  /* fallback jobs */
  const fallbackJobs = useMemo<JobMatch[]>(() => {
    const lang = selectedRepository?.language ?? 'TypeScript';
    const base = selectedRepository?.healthScore ?? 72;
    return [
      {
        id: 'j1',
        title: 'Senior Backend Engineer',
        company: 'Stripe',
        location: 'Remote',
        matchScore: Math.min(97, base + 8),
        reason: `Strong alignment with ${lang} ownership and systems reliability.`,
        status: 'new',
      },
      {
        id: 'j2',
        title: 'Platform Engineer',
        company: 'Datadog',
        location: 'New York, NY',
        matchScore: Math.min(94, base + 5),
        reason: 'Repository commits show operational maturity and architecture depth.',
        status: 'new',
      },
      {
        id: 'j3',
        title: 'Staff Software Engineer',
        company: 'Notion',
        location: 'San Francisco, CA',
        matchScore: Math.min(91, base + 3),
        reason: 'Technical narratives indicate senior-level communication and delivery.',
        status: 'new',
      },
      {
        id: 'j4',
        title: 'Engineering Manager',
        company: 'Linear',
        location: 'Remote',
        matchScore: Math.min(88, base + 2),
        reason: 'Broad ownership patterns and team-wide commit coordination detected.',
        status: 'new',
      },
    ];
  }, [selectedRepository]);

  const allJobs = useMemo<JobMatch[]>(() => {
    if (!apiReady) return fallbackJobs;
    return (matchesQuery.data ?? []).map((m) => mapOpportunityMatchToJob(m));
  }, [apiReady, fallbackJobs, matchesQuery.data]);

  const filteredJobs = useMemo(() => {
    let jobs = allJobs;
    if (tab === 'saved') jobs = jobs.filter((j) => j.status === 'saved');
    if (tab === 'applied') jobs = jobs.filter((j) => appliedIds.has(j.id));
    if (tab === 'all') jobs = jobs.filter((j) => j.status !== 'dismissed');
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q),
      );
    }
    if (workType !== 'Any') {
      jobs = jobs.filter((j) => j.location.toLowerCase().includes(workType.toLowerCase()));
    }
    return jobs;
  }, [allJobs, tab, search, workType, appliedIds]);

  const savedCount = allJobs.filter((j) => j.status === 'saved').length;
  const appliedCount = appliedIds.size;

  return (
    <div className="space-y-5">
      {/* Search + filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, or location…"
              className="h-9 w-full rounded-lg border border-border bg-surface-light pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-fw-orange focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['Any', 'Remote', 'Hybrid', 'On-site'] as WorkType[]).map((wt) => (
              <button
                key={wt}
                type="button"
                onClick={() => setWorkType(wt)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  workType === wt
                    ? 'border-fw-orange bg-fw-orange-light text-fw-orange'
                    : 'border-border text-muted-foreground hover:border-fw-orange-mid',
                )}
              >
                {wt}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Matched from:{' '}
          <span className="font-medium text-foreground">
            {selectedRepository?.fullName ?? 'No repository selected'}
          </span>
        </p>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {[
          {
            id: 'all' as Tab,
            label: 'All jobs',
            count: allJobs.filter((j) => j.status !== 'dismissed').length,
          },
          { id: 'saved' as Tab, label: 'Saved', count: savedCount, icon: BookmarkCheck },
          { id: 'applied' as Tab, label: 'Applied', count: appliedCount, icon: CheckCircle2 },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === t.id
                ? 'border-fw-orange text-fw-orange'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.icon && <t.icon className="h-3.5 w-3.5" />}
            {t.label}
            {t.count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  tab === t.id
                    ? 'bg-fw-orange text-white'
                    : 'bg-surface-light text-muted-foreground',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {apiReady && matchesQuery.isLoading ? (
        <div className="space-y-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fw-orange-light">
            <Briefcase className="h-7 w-7 text-fw-orange" />
          </div>
          <p className="font-semibold text-foreground">
            {tab === 'saved'
              ? 'No saved jobs yet'
              : tab === 'applied'
                ? 'No applications yet'
                : 'No jobs found'}
          </p>
          <p className="text-sm text-muted-foreground">
            {tab === 'all' && search
              ? 'Try a different search or remove filters.'
              : 'Sync a repository to surface AI-matched opportunities.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const isApplied = appliedIds.has(job.id);
            const isSaved = job.status === 'saved';
            const href = companyUrl(job.company, job.title, job.url);
            const matchVariant =
              job.matchScore >= 85 ? 'success' : job.matchScore >= 70 ? 'primary' : 'warning';

            return (
              <Card
                key={job.id}
                className="group overflow-hidden p-0 transition-all duration-200 hover:border-fw-orange-mid hover:shadow-md cursor-pointer"
              >
                {/* Clickable banner — opens careers page */}
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setAppliedIds((s) => new Set([...s, job.id]))}
                  className="block p-5 hover:bg-fw-orange-light/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Company initials badge — deterministic brand hue */}
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, hsl(${companyHue(job.company)} 65% 48%), hsl(${(companyHue(job.company) + 30) % 360} 70% 38%))`,
                        }}
                      >
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{job.title}</p>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm font-medium text-fw-orange">{job.company}</p>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          {isApplied && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Applied
                            </span>
                          )}
                          {isSaved && !isApplied && (
                            <span className="flex items-center gap-1 text-sky-500">
                              <BookmarkCheck className="h-3.5 w-3.5" />
                              Saved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Badge variant={matchVariant}>{job.matchScore}% match</Badge>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            job.matchScore >= 85
                              ? 'bg-success'
                              : job.matchScore >= 70
                                ? 'bg-gradient-to-r from-fw-orange to-amber-400'
                                : 'bg-warning',
                          )}
                          style={{ width: `${Math.min(100, job.matchScore)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fw-orange" />
                    {job.reason}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Tap to open {job.company}&apos;s careers page
                  </p>
                </a>

                {/* Action row (stops propagation) */}
                <div
                  className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-light/50 px-5 py-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* AI Auto-fill */}
                  <Button
                    size="sm"
                    onClick={() => {
                      setAutofillJob(job);
                      setAutofillResult(null);
                      autofillMutation.mutate(job);
                    }}
                    className="gap-1.5"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    AI Auto-fill
                  </Button>

                  {/* Save */}
                  {apiReady && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={updateStatus.isPending}
                      onClick={() => {
                        updateStatus.mutate({ id: job.id, status: 'saved' });
                        toast.success(isSaved ? 'Removed from saved' : 'Job saved');
                      }}
                    >
                      <BookmarkCheck className="h-3.5 w-3.5" />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                  )}

                  {/* Not interested */}
                  {apiReady && job.status === 'new' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        updateStatus.mutate({ id: job.id, status: 'dismissed' });
                        toast.success('Job dismissed');
                      }}
                    >
                      Not interested
                    </Button>
                  )}

                  <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> AI matched
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Auto-fill modal */}
      <Modal
        open={!!autofillJob}
        onClose={() => {
          setAutofillJob(null);
          setAutofillResult(null);
          autofillMutation.reset();
        }}
        title={
          autofillJob ? `Auto-fill for ${autofillJob.title} at ${autofillJob.company}` : 'Auto-fill'
        }
        size="lg"
      >
        {autofillMutation.isPending && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-fw-orange" />
            <div className="text-center">
              <p className="font-semibold text-foreground">Preparing your application…</p>
              <p className="mt-1 text-sm text-muted-foreground">
                AI agent is generating a tailored cover letter, headline, and skills summary.
              </p>
            </div>
          </div>
        )}

        {autofillResult && autofillJob && (
          <div className="space-y-5">
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              ✓ Application data ready — copy each section and paste it into {autofillJob.company}
              &apos;s form.
              <a
                href={companyUrl(autofillJob.company, autofillJob.title, autofillJob.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 font-semibold underline"
              >
                Open application <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Professional headline
                </p>
                <button
                  type="button"
                  onClick={() => copy(autofillResult.headline, 'headline')}
                  className="flex items-center gap-1.5 text-xs text-fw-orange hover:text-fw-deep"
                >
                  {copiedField === 'headline' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedField === 'headline' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm text-foreground">
                {autofillResult.headline}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Key skills
                </p>
                <button
                  type="button"
                  onClick={() => copy(autofillResult.skills, 'skills')}
                  className="flex items-center gap-1.5 text-xs text-fw-orange hover:text-fw-deep"
                >
                  {copiedField === 'skills' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedField === 'skills' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm text-foreground">
                {autofillResult.skills}
              </div>
            </div>

            {/* Cover letter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cover letter
                </p>
                <button
                  type="button"
                  onClick={() => copy(autofillResult.coverLetter, 'cover')}
                  className="flex items-center gap-1.5 text-xs text-fw-orange hover:text-fw-deep"
                >
                  {copiedField === 'cover' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedField === 'cover' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border bg-surface-light px-4 py-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {autofillResult.coverLetter}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const all = `HEADLINE:\n${autofillResult.headline}\n\nSKILLS:\n${autofillResult.skills}\n\nCOVER LETTER:\n${autofillResult.coverLetter}`;
                  copy(all, 'all');
                }}
              >
                {copiedField === 'all' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedField === 'all' ? 'Copied everything!' : 'Copy all'}
              </Button>
              <a
                href={companyUrl(autofillJob.company, autofillJob.title, autofillJob.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-fw-btn border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-light"
              >
                <ExternalLink className="h-4 w-4" />
                Open {autofillJob.company} careers
              </a>
            </div>
          </div>
        )}

        {autofillMutation.isError && (
          <div className="space-y-4">
            <p className="text-sm text-red-600">
              AI auto-fill requires the ForgeWind API to be connected. In the meantime, here's your
              profile data to copy manually:
            </p>
            <div className="rounded-lg border border-border bg-surface-light p-4 text-sm text-foreground space-y-2">
              {profile.name && (
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
              )}
              {profile.headline && (
                <p>
                  <strong>Headline:</strong> {profile.headline}
                </p>
              )}
              {experience[0] && (
                <p>
                  <strong>Recent role:</strong> {experience[0].title} at {experience[0].company}
                </p>
              )}
              {skills.length > 0 && (
                <p>
                  <strong>Skills:</strong> {skills.map((s) => s.name).join(', ')}
                </p>
              )}
            </div>
            <Button
              onClick={() => {
                const text = [
                  profile.name && `Name: ${profile.name}`,
                  profile.headline && `Headline: ${profile.headline}`,
                  experience[0] &&
                    `Recent role: ${experience[0].title} at ${experience[0].company}`,
                  skills.length > 0 && `Skills: ${skills.map((s) => s.name).join(', ')}`,
                ]
                  .filter(Boolean)
                  .join('\n');
                copy(text, 'fallback');
              }}
            >
              {copiedField === 'fallback' ? 'Copied!' : 'Copy profile data'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
