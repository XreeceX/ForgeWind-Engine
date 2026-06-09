'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForgeWindStore } from '@/stores/forgewind.store';
import {
  BarChart3,
  TrendingUp,
  GitBranch,
  FileText,
  Sparkles,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

export default function AnalyticsPage() {
  const repositories = useForgeWindStore((state) => state.repositories);
  const generatedContent = useForgeWindStore((state) => state.generatedContent);
  const aiAnalysis = useForgeWindStore((state) => state.aiAnalysis);

  const repoCount = repositories.length;
  const contentCount = generatedContent.length;
  const findingCount = aiAnalysis.findings.length;
  const hasData = repoCount > 0 || contentCount > 0;

  const metrics = [
    {
      label: 'Connected repos',
      value: repoCount > 0 ? String(repoCount) : '—',
      icon: GitBranch,
      active: repoCount > 0,
    },
    {
      label: 'Generated assets',
      value: contentCount > 0 ? String(contentCount) : '—',
      icon: FileText,
      active: contentCount > 0,
    },
    {
      label: 'AI findings',
      value: findingCount > 0 ? String(findingCount) : '—',
      icon: Sparkles,
      active: findingCount > 0,
    },
    {
      label: 'Applications tracked',
      value: '—',
      icon: BarChart3,
      active: false,
    },
  ];

  return (
    <div>
      <Header title="Analytics" subtitle="Track your career growth metrics" />

      <div className="space-y-6 p-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, active }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className={`h-4 w-4 ${active ? 'text-primary-400' : ''}`} />
                <span className="text-xs">{label}</span>
              </div>
              <p
                className={`mt-2 text-2xl font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {value}
              </p>
            </Card>
          ))}
        </div>

        {/* Charts — empty states until real data exists */}
        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-12 p-8 lg:col-span-7">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-400" />
              <h3 className="text-base font-semibold text-foreground">Career Score Trend</h3>
            </div>
            <div className="flex h-52 flex-col items-center justify-center text-center">
              <TrendingUp className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {hasData
                  ? 'Career score charting coming soon — your repositories are connected.'
                  : 'Connect and sync a repository to start tracking your career score.'}
              </p>
              {!hasData && (
                <Link href="/overview" className="mt-4">
                  <Button size="sm" variant="secondary">
                    Connect repos <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          <Card className="col-span-12 p-8 lg:col-span-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-400" />
              <h3 className="text-base font-semibold text-foreground">Application Funnel</h3>
            </div>
            <div className="flex h-52 flex-col items-center justify-center text-center">
              <BarChart3 className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No applications tracked yet. Start applying to roles to see your funnel.
              </p>
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="p-8">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-semibold text-foreground">AI Insights</h3>
          </div>
          {aiAnalysis.findings.length > 0 ? (
            <ul className="space-y-2">
              {aiAnalysis.findings.map((finding, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-border bg-surface-light/40 px-4 py-3 text-sm text-foreground"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
                  {finding}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Lightbulb className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                AI insights will appear here once you connect your repositories and sync your career
                context.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
