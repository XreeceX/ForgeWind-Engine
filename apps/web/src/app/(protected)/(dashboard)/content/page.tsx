'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Check,
  Copy,
  FileText,
  Linkedin,
  Loader2,
  Mail,
  Pin,
  Sparkles,
  ThumbsUp,
  User,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  type ForgeWindApiNarrative,
  forgeWindJson,
  getForgeWindApiBaseUrl,
} from '@/lib/forgewind-api';
import { mapNarrativeToGeneratedItem } from '@/lib/forgewind-mappers';
import type { GeneratedContentItem } from '@/stores/forgewind.store';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import { useForgeWindStore } from '@/stores/forgewind.store';
import { cn } from '@/lib/cn';

const POST_TYPES = [
  {
    id: 'commit_story',
    label: 'LinkedIn Post',
    icon: Linkedin,
    channel: 'linkedin' as const,
    requiresRepo: true,
  },
  {
    id: 'project_summary',
    label: 'Project Story',
    icon: FileText,
    channel: 'linkedin' as const,
    requiresRepo: true,
  },
  {
    id: 'bio',
    label: 'Professional Bio',
    icon: User,
    channel: 'portfolio' as const,
    requiresRepo: false,
  },
  {
    id: 'profile_optimization',
    label: 'Profile Optimiser',
    icon: Sparkles,
    channel: 'portfolio' as const,
    requiresRepo: false,
  },
] as const;

type PostTypeId = (typeof POST_TYPES)[number]['id'];

const CHANNEL_ICON: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  email: Mail,
  portfolio: BookOpen,
};

function channelLabel(ch: string) {
  return { linkedin: 'LinkedIn', email: 'Email', portfolio: 'Portfolio' }[ch] ?? ch;
}

export default function PostsPage() {
  const accessToken = useForgeWindAccessToken();
  const forgeWindUserId = useForgeWindStore((s) => s.forgeWindUserId);
  const generatedContent = useForgeWindStore((s) => s.generatedContent);
  const selectedRepositoryId = useForgeWindStore((s) => s.selectedRepositoryId);
  const repositories = useForgeWindStore((s) => s.repositories);
  const pushGeneratedContent = useForgeWindStore((s) => s.pushGeneratedContent);
  const selectedRepository = repositories.find((r) => r.id === selectedRepositoryId);

  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;
  const queryClient = useQueryClient();

  /* Generate flow */
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<PostTypeId>('commit_story');
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* Load saved narratives */
  const narrativesQuery = useQuery({
    queryKey: ['forgewind-narratives', forgeWindUserId],
    enabled: apiReady,
    queryFn: () => forgeWindJson<ForgeWindApiNarrative[]>('/narratives', { accessToken }),
  });

  const generateMutation = useMutation({
    mutationFn: () => {
      if (!forgeWindUserId) throw new Error('Not authenticated with ForgeWind API');
      const type = POST_TYPES.find((t) => t.id === selectedType)!;
      return forgeWindJson<ForgeWindApiNarrative>('/narratives/generate', {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
          userId: forgeWindUserId,
          type: selectedType,
          ...(type.requiresRepo && selectedRepositoryId ? { repoId: selectedRepositoryId } : {}),
        }),
      });
    },
    onSuccess: (narrative) => {
      setGeneratedText(narrative.content);
      setGenerating(false);
      void queryClient.invalidateQueries({ queryKey: ['forgewind-narratives'] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setGenerating(false);
    },
  });

  const pinMutation = useMutation({
    mutationFn: (input: { id: string; isPinned: boolean }) =>
      forgeWindJson<ForgeWindApiNarrative>(`/narratives/${input.id}/pin`, {
        method: 'PATCH',
        accessToken,
        body: JSON.stringify({ isPinned: input.isPinned }),
      }),
    onSuccess: (_, vars) => {
      toast.success(vars.isPinned ? 'Post pinned' : 'Post unpinned');
      void queryClient.invalidateQueries({ queryKey: ['forgewind-narratives'] });
    },
  });

  const apiItems: GeneratedContentItem[] = useMemo(() => {
    if (!narrativesQuery.data) return [];
    return narrativesQuery.data.map(mapNarrativeToGeneratedItem);
  }, [narrativesQuery.data]);

  const combined: GeneratedContentItem[] = useMemo(() => {
    const byId = new Map<string, GeneratedContentItem>();
    for (const item of apiItems) byId.set(item.id, item);
    for (const item of generatedContent) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    return [...byId.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [apiItems, generatedContent]);

  async function copyPost(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Clipboard copy failed');
    }
  }

  function saveGenerated() {
    if (!generatedText) return;
    const type = POST_TYPES.find((t) => t.id === selectedType)!;
    pushGeneratedContent({ title: type.label, channel: type.channel, body: generatedText });
    toast.success('Saved to posts');
    setGeneratedText(null);
    setGenerating(false);
  }

  return (
    <div className="space-y-5">
      {/* Start a post box */}
      <Card className="p-4">
        {!generating && !generatedText ? (
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-bold text-primary-600">
                {/* user initials placeholder */}
                <User className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setGenerating(true)}
                className="flex-1 rounded-full border border-border bg-surface-light px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-surface hover:border-fw-orange-mid transition-colors"
              >
                Start a post — generate AI-powered content…
              </button>
            </div>
            {/* Quick type chips */}
            <div className="mt-3 flex flex-wrap gap-2 pl-13">
              {POST_TYPES.map((pt) => {
                const Icon = pt.icon;
                const disabled = pt.requiresRepo && !selectedRepositoryId;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setSelectedType(pt.id);
                      setGenerating(true);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      'disabled:cursor-not-allowed disabled:opacity-40',
                      'border-border text-muted-foreground hover:border-fw-orange-mid hover:text-fw-orange',
                    )}
                    title={disabled ? 'Requires an active repository' : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : generatedText ? (
          /* Generated result */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <p className="text-sm font-semibold text-foreground">Post generated</p>
              <span className="ml-auto text-xs text-muted-foreground">
                {POST_TYPES.find((t) => t.id === selectedType)?.label}
              </span>
            </div>
            <div className="rounded-fw-card border border-border bg-surface-light p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {generatedText}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={saveGenerated}>
                <Pin className="h-3.5 w-3.5" /> Save to posts
              </Button>
              <Button size="sm" variant="secondary" onClick={() => copyPost(generatedText, 'new')}>
                {copiedId === 'new' ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedId === 'new' ? 'Copied!' : 'Copy'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setGeneratedText(null);
                  setGenerating(true);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Try again
              </button>
            </div>
          </div>
        ) : (
          /* Type picker */
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">What would you like to create?</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {POST_TYPES.map((pt) => {
                const Icon = pt.icon;
                const disabled = pt.requiresRepo && !selectedRepositoryId;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedType(pt.id)}
                    className={cn(
                      'rounded-fw-card border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40',
                      selectedType === pt.id
                        ? 'border-fw-orange bg-fw-orange-light/50 ring-1 ring-fw-orange'
                        : 'border-border bg-surface-light hover:border-fw-orange-mid',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 mb-1',
                        selectedType === pt.id ? 'text-fw-orange' : 'text-muted-foreground',
                      )}
                    />
                    <p className="text-xs font-semibold text-foreground">{pt.label}</p>
                    {pt.requiresRepo && !selectedRepositoryId && (
                      <p className="mt-0.5 text-[10px] text-amber-500">Needs active repo</p>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !apiReady}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" /> Generate
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setGenerating(false)}>
                Cancel
              </Button>
            </div>
            {!apiReady && (
              <p className="text-xs text-amber-600">
                ForgeWind API not configured — connect the backend to enable AI generation.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Posts feed */}
      {combined.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fw-orange-light">
            <FileText className="h-7 w-7 text-fw-orange" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate your first post using the box above.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {combined.map((item) => {
            const narrative = narrativesQuery.data?.find((n) => n.id === item.id);
            const isPinned = Boolean(narrative?.isPinned);
            const ChannelIcon = CHANNEL_ICON[item.channel] ?? FileText;

            return (
              <Card
                key={item.id}
                className="relative overflow-hidden p-5 transition-all duration-200 hover:border-fw-orange-mid hover:shadow-sm"
              >
                {/* Pin ribbon */}
                {isPinned && (
                  <div className="absolute -right-8 top-3 rotate-45 bg-gradient-to-r from-fw-orange to-amber-400 px-8 py-0.5 shadow-sm">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      <Pin className="h-2.5 w-2.5" /> Pinned
                    </span>
                  </div>
                )}

                {/* Post header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fw-orange-light">
                      <ChannelIcon className="h-4 w-4 text-fw-orange" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {channelLabel(item.channel)} ·{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post body */}
                <p className="text-sm text-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">
                  {item.body}
                </p>

                {/* LinkedIn-style engagement preview */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground border-t border-border pt-3">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Ready to share</span>
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyPost(item.body, item.id)}
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedId === item.id ? 'Copied!' : 'Copy for LinkedIn'}
                  </Button>
                  {narrative && (
                    <Button
                      size="sm"
                      variant={isPinned ? 'primary' : 'ghost'}
                      disabled={pinMutation.isPending}
                      onClick={() => pinMutation.mutate({ id: narrative.id, isPinned: !isPinned })}
                    >
                      <Pin className="h-3.5 w-3.5" />
                      {isPinned ? 'Unpin' : 'Pin'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
