'use client';

import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  FileText,
  MessageSquare,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const metrics = [
  { label: 'Profile Views', value: '—', icon: Eye },
  { label: 'Connections', value: '—', icon: Users },
  { label: 'Applications', value: '—', icon: FileText },
  { label: 'Content Engagement', value: '—', icon: MessageSquare },
];

export default function AnalyticsPage() {
  return (
    <div>
      <Header title="Analytics" subtitle="Track your career growth metrics" />

      <div className="space-y-6 p-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
            </Card>
          ))}
        </div>

        {/* Charts — empty states */}
        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-12 p-8 lg:col-span-7">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-400" />
              <h3 className="text-base font-semibold text-foreground">Career Score Trend</h3>
            </div>
            <div className="flex h-52 flex-col items-center justify-center text-center">
              <TrendingUp className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Connect GitHub and complete your profile to start tracking your career score.
              </p>
              <Link href="/forgewind-engine" className="mt-4">
                <Button size="sm" variant="secondary">
                  Get started <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
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

        {/* AI Insights empty state */}
        <Card className="p-8">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-semibold text-foreground">AI Insights</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              AI insights will appear here once you connect your GitHub and build your career
              profile.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
