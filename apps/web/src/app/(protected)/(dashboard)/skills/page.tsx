'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, ArrowRight, Zap, BookOpen, Award } from 'lucide-react';

export default function SkillsPage() {
  return (
    <div>
      <Header title="Skills" subtitle="Track and develop your skill portfolio" />

      <div className="p-6 space-y-6">
        {/* Main empty state */}
        <Card className="p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 mb-5">
              <Zap className="h-8 w-8 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Your Skill Profile</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Skills are automatically extracted and assessed when you connect and sync a
              repository. The more repositories you sync, the richer your skill profile becomes.
            </p>
            <Link href="/overview" className="mt-6">
              <Button>
                <GitBranch className="h-4 w-4" />
                Connect a Repository
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Coming soon cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-primary-400" />
              <h3 className="text-sm font-semibold text-foreground">Skill Detection</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically identifies languages, frameworks, and technologies from your code
              history.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-foreground">Gap Analysis</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Compares your detected skills against market demand for your target roles.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Learning Paths</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Personalised course and certification recommendations based on your gaps.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
