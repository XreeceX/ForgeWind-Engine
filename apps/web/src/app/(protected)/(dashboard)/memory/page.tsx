'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForgeWindStore } from '@/stores/forgewind.store';
import { Brain, ArrowRight, BookOpen, Zap, GitBranch } from 'lucide-react';

function MemoryCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  content,
  emptyLabel,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  content: string;
  emptyLabel: string;
}) {
  const isEmpty = !content.trim();
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {isEmpty ? (
        <p className="text-xs italic text-muted-foreground/70">{emptyLabel}</p>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
      )}
    </Card>
  );
}

export default function MemoryPage() {
  const memoryContext = useForgeWindStore((state) => state.memoryContext);
  const repositories = useForgeWindStore((state) => state.repositories);
  const selectedRepositoryId = useForgeWindStore((state) => state.selectedRepositoryId);

  const selectedRepository = repositories.find((repo) => repo.id === selectedRepositoryId);
  const strengthsText = memoryContext.strengths.filter(Boolean).join(', ');
  const hasAnyData = memoryContext.careerNarrative.trim() || strengthsText || selectedRepository;

  return (
    <div className="space-y-6 p-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground">Persistent memory context</p>
        <p className="text-xs text-muted-foreground mt-1">
          Used by AI Studio and Content to keep outputs context-aware and consistent across
          sessions.
        </p>
      </Card>

      {!hasAnyData ? (
        <Card className="p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 mb-4">
              <Brain className="h-7 w-7 text-primary-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No memory yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Memory context is built automatically as you sync repositories, generate content, and
              configure your profile settings.
            </p>
            <Link href="/overview" className="mt-5">
              <Button size="sm" variant="secondary">
                <GitBranch className="h-4 w-4" />
                Connect a repository
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <MemoryCard
            icon={BookOpen}
            iconColor="text-primary-400"
            iconBg="bg-primary-500/10"
            title="Career narrative"
            content={memoryContext.careerNarrative}
            emptyLabel="No career narrative yet. Configure it in Settings."
          />
          <MemoryCard
            icon={Zap}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
            title="Current strengths"
            content={strengthsText}
            emptyLabel="No strengths recorded yet. Sync a repository to populate these."
          />
          <MemoryCard
            icon={GitBranch}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
            title="Active repository context"
            content={
              selectedRepository
                ? `${selectedRepository.fullName} — ${selectedRepository.summary || 'No summary yet.'}`
                : ''
            }
            emptyLabel="No repository selected. Choose one from the Overview page."
          />
        </div>
      )}
    </div>
  );
}
