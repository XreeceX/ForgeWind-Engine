'use client';

import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { JobMatchCard, type JobMatch } from '@/components/jobs/job-match-card';
import { Card } from '@/components/ui/card';
import {
  type ForgeWindApiOpportunityMatch,
  forgeWindJson,
  getForgeWindApiBaseUrl,
} from '@/lib/forgewind-api';
import { mapOpportunityMatchToJob } from '@/lib/forgewind-mappers';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import { useForgeWindStore } from '@/stores/forgewind.store';

export default function JobsPage() {
  const accessToken = useForgeWindAccessToken();
  const forgeWindUserId = useForgeWindStore((state) => state.forgeWindUserId);
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);
  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);
  const queryClient = useQueryClient();

  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;
  const fallbackMatches = useMemo<JobMatch[]>(() => {
    const language = selectedRepository?.language ?? 'TypeScript';
    const baseScore = selectedRepository?.healthScore ?? 72;
    return [
      {
        id: 'job-1',
        title: 'Senior Backend Engineer',
        company: 'Stripe',
        location: 'Remote',
        matchScore: Math.min(97, baseScore + 8),
        reason: `Strong alignment with ${language} ownership and systems reliability experience.`,
        status: 'new',
      },
      {
        id: 'job-2',
        title: 'Platform Engineer',
        company: 'Datadog',
        location: 'New York, NY',
        matchScore: Math.min(94, baseScore + 5),
        reason: 'Repository commits show operational maturity and architecture depth.',
        status: 'new',
      },
      {
        id: 'job-3',
        title: 'Staff Software Engineer',
        company: 'Notion',
        location: 'San Francisco, CA',
        matchScore: Math.min(91, baseScore + 3),
        reason: 'Public technical narratives indicate senior-level communication and delivery.',
        status: 'new',
      },
    ];
  }, [selectedRepository]);

  const matchesQuery = useQuery({
    queryKey: ['forgewind-matches', forgeWindUserId],
    enabled: apiReady,
    queryFn: () =>
      forgeWindJson<ForgeWindApiOpportunityMatch[]>('/matches', {
        accessToken,
      }),
  });

  const updateStatus = useMutation({
    mutationFn: async (input: { id: string; status: 'saved' | 'dismissed' }) =>
      forgeWindJson(`/matches/${input.id}/status`, {
        method: 'PATCH',
        accessToken: accessToken!,
        body: JSON.stringify({ status: input.status }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['forgewind-matches'] });
      toast.success('Match status updated');
    },
    onError: () => {
      toast.error('Could not update match status.');
    },
  });

  const jobs: JobMatch[] = useMemo(() => {
    if (!apiReady) return fallbackMatches;
    const rows = matchesQuery.data ?? [];
    const active = rows.filter((m) => m.status !== 'dismissed');
    if (active.length === 0) return [];
    return active.map((m) => {
      const v = mapOpportunityMatchToJob(m);
      return {
        id: v.id,
        title: v.title,
        company: v.company,
        location: v.location,
        matchScore: v.matchScore,
        reason: v.reason,
        url: v.url,
        status: v.status,
      };
    });
  }, [apiReady, fallbackMatches, matchesQuery.data]);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground">Role matching context</p>
        <p className="text-xs text-muted-foreground">
          Matches are personalized from: {selectedRepository?.fullName ?? 'No repository selected'}
        </p>
        {apiReady ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Live data from ForgeWind API. Save or dismiss updates your match list.
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_FORGEWIND_API_URL</code>{' '}
            and sign in to load opportunities from the API.
          </p>
        )}
        {matchesQuery.isError ? (
          <p className="mt-2 text-xs text-red-600">Could not load matches from the API.</p>
        ) : null}
      </Card>

      <div className="space-y-3">
        {apiReady && matchesQuery.isLoading ? (
          <Card className="p-5 text-sm text-muted-foreground">Loading matches…</Card>
        ) : jobs.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">
            No opportunity matches yet. Add rows via the API or integration pipeline.
          </Card>
        ) : (
          jobs.map((job) => (
            <JobMatchCard
              key={job.id}
              job={job}
              showActions={apiReady && job.status === 'new'}
              onSave={(id) => updateStatus.mutate({ id, status: 'saved' })}
              onDismiss={(id) => updateStatus.mutate({ id, status: 'dismissed' })}
            />
          ))
        )}
      </div>
    </div>
  );
}
