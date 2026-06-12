'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
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

export default function JobsPage() {
  const accessToken = useForgeWindAccessToken();
  const forgeWindUserId = useForgeWindStore((s) => s.forgeWindUserId);
  const repositories = useForgeWindStore((s) => s.repositories);
  const selectedRepositoryId = useForgeWindStore((s) => s.selectedRepositoryId);
  const selectedRepository = repositories.find((r) => r.id === selectedRepositoryId);
  const queryClient = useQueryClient();

  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;

  /* local applied tracking (extends API status) */
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  /* search + filter state */
  const [search, setSearch] = useState('');
  const [workType, setWorkType] = useState<WorkType>('Any');
  const [tab, setTab] = useState<Tab>('all');

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['forgewind-matches'] });
    },
    onError: () => toast.error('Could not update status.'),
  });

  /* fallback jobs when API not configured */
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
        reason: 'Public technical narratives indicate senior-level communication.',
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
    const rows = matchesQuery.data ?? [];
    return rows.map((m) => mapOpportunityMatchToJob(m));
  }, [apiReady, fallbackJobs, matchesQuery.data]);

  const filteredJobs = useMemo(() => {
    let jobs = allJobs;

    /* tab filter */
    if (tab === 'saved') jobs = jobs.filter((j) => j.status === 'saved');
    if (tab === 'applied') jobs = jobs.filter((j) => appliedIds.has(j.id));
    if (tab === 'all') jobs = jobs.filter((j) => j.status !== 'dismissed');

    /* keyword search */
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q),
      );
    }

    /* work type filter */
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
          {/* Search */}
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

          {/* Work type */}
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

        {/* Context */}
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
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading matches…
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fw-orange-light">
            <Briefcase className="h-7 w-7 text-fw-orange" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {tab === 'saved'
                ? 'No saved jobs yet'
                : tab === 'applied'
                  ? 'No applications yet'
                  : 'No jobs found'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === 'all' && search
                ? 'Try a different search term or remove filters.'
                : tab === 'all'
                  ? 'Sync a repository to surface opportunities.'
                  : 'Save or mark jobs as applied from the All jobs tab.'}
            </p>
          </div>
          {tab === 'all' && search && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setWorkType('Any');
              }}
            >
              Clear filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const isApplied = appliedIds.has(job.id);
            const isSaved = job.status === 'saved';
            const matchVariant =
              job.matchScore >= 85 ? 'success' : job.matchScore >= 70 ? 'primary' : 'warning';

            return (
              <Card
                key={job.id}
                className="p-5 transition-all duration-200 hover:border-fw-orange-mid hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Company logo placeholder */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-light text-sm font-bold text-muted-foreground">
                      {job.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{job.title}</p>
                      <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company}
                        </span>
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
                  <Badge variant={matchVariant} className="shrink-0">
                    {job.matchScore}% match
                  </Badge>
                </div>

                {/* Reason */}
                <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fw-orange" />
                  {job.reason}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  Based on your repository skills and career goals
                </p>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {/* Easy Apply / View */}
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setAppliedIds((s) => new Set([...s, job.id]))}
                      className="inline-flex items-center gap-1.5 rounded-fw-btn bg-fw-orange px-4 py-1.5 text-xs font-semibold text-white hover:bg-fw-deep transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Easy Apply
                    </a>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setAppliedIds((s) => new Set([...s, job.id]));
                        toast.success(`Marked as applied to ${job.title} at ${job.company}`);
                      }}
                      disabled={isApplied}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                        </>
                      ) : (
                        'Mark as applied'
                      )}
                    </Button>
                  )}

                  {/* Save / unsave */}
                  {apiReady && !isApplied && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={updateStatus.isPending}
                      onClick={() => {
                        updateStatus.mutate({ id: job.id, status: isSaved ? 'saved' : 'saved' });
                        toast.success(isSaved ? 'Removed from saved' : 'Job saved');
                      }}
                    >
                      <BookmarkCheck className="h-3.5 w-3.5" />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                  )}

                  {/* Dismiss */}
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

                  {/* Time context */}
                  <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> AI matched
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
