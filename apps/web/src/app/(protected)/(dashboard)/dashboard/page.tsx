'use client';

import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import {
  User,
  Briefcase,
  FileText,
  PenTool,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Bot,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    label: 'Optimize Profile',
    description: 'AI-powered LinkedIn optimization',
    icon: User,
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
    href: '/profile',
  },
  {
    label: 'Find Jobs',
    description: 'Discover matching opportunities',
    icon: Target,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    href: '/jobs',
  },
  {
    label: 'Generate Content',
    description: 'Create engaging LinkedIn posts',
    icon: PenTool,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    href: '/content',
  },
  {
    label: 'Analyze Skills',
    description: 'Identify gaps and growth areas',
    icon: TrendingUp,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    href: '/skills',
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div>
      <Header title="Dashboard" subtitle={`Welcome back, ${firstName}`} />

      <div className="space-y-8 p-2 sm:p-4">
        {/* Welcome card */}
        <Card className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10">
                <Sparkles className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Your ForgeWind workspace is ready
                </h2>
                <p className="text-sm text-muted-foreground">
                  Start by connecting GitHub to unlock AI analysis and job matching.
                </p>
              </div>
            </div>
            <Link href="/forgewind-engine">
              <Button size="sm" className="shrink-0">
                Open App <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Stats row — real data will populate once connected */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Profile Strength', value: '—', icon: User },
            { label: 'Job Matches', value: '—', icon: Briefcase },
            { label: 'Applications', value: '—', icon: FileText },
            { label: 'Content Pieces', value: '—', icon: PenTool },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
            </Card>
          ))}
        </div>

        {/* Activity + Quick Actions */}
        <div className="grid grid-cols-12 gap-6">
          {/* AI Activity (empty state) */}
          <Card className="col-span-12 lg:col-span-7">
            <div className="flex items-center justify-between px-6 pb-3 pt-5">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-400" />
                <h3 className="text-base font-semibold text-foreground">Recent AI Activity</h3>
              </div>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <Bot className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No agent activity yet. Connect GitHub and run your first analysis.
              </p>
              <Link href="/forgewind-engine" className="mt-4">
                <Button size="sm" variant="secondary">
                  Go to ForgeWind Engine
                </Button>
              </Link>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="col-span-12 space-y-4 lg:col-span-5">
            <div className="flex items-center gap-2 px-1">
              <Zap className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Card className="cursor-pointer p-4 group" hover>
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${action.bg}`}
                    >
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary-400">
                      {action.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
