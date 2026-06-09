'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, User, Save, Loader2, Linkedin, Target } from 'lucide-react';
import { getUserServiceUrl } from '@/lib/forgewind-api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string | null;
  bio?: string | null;
}

interface CareerGoals {
  targetRole?: string | null;
  targetIndustry?: string | null;
  yearsOfExperience?: number | null;
}

async function fetchMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${getUserServiceUrl()}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json() as Promise<UserProfile>;
}

async function fetchCareerGoals(token: string): Promise<CareerGoals> {
  const res = await fetch(`${getUserServiceUrl()}/api/v1/users/me/career-goals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return {};
  return res.json() as Promise<CareerGoals>;
}

async function patchMe(token: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${getUserServiceUrl()}/api/v1/users/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json() as Promise<UserProfile>;
}

async function patchCareerGoals(token: string, data: CareerGoals): Promise<CareerGoals> {
  const res = await fetch(`${getUserServiceUrl()}/api/v1/users/me/career-goals`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update career goals');
  return res.json() as Promise<CareerGoals>;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const profileQuery = useQuery({
    queryKey: ['user-profile'],
    enabled: !!accessToken,
    queryFn: () => fetchMe(accessToken!),
  });

  const goalsQuery = useQuery({
    queryKey: ['career-goals'],
    enabled: !!accessToken,
    queryFn: () => fetchCareerGoals(accessToken!),
  });

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');

  useEffect(() => {
    if (profileQuery.data) {
      setHeadline(profileQuery.data.headline ?? '');
      setBio(profileQuery.data.bio ?? '');
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (goalsQuery.data) {
      setTargetRole(goalsQuery.data.targetRole ?? '');
      setTargetIndustry(goalsQuery.data.targetIndustry ?? '');
    }
  }, [goalsQuery.data]);

  const updateProfile = useMutation({
    mutationFn: () => patchMe(accessToken!, { headline, bio }),
    onSuccess: () => toast.success('Profile updated'),
    onError: () => toast.error('Failed to update profile'),
  });

  const updateGoals = useMutation({
    mutationFn: () => patchCareerGoals(accessToken!, { targetRole, targetIndustry }),
    onSuccess: () => toast.success('Career goals updated'),
    onError: () => toast.error('Failed to update career goals'),
  });

  const profile = profileQuery.data;
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : (session?.user?.name ?? '');
  const email = profile?.email ?? session?.user?.email ?? '';
  const initials = displayName
    ? displayName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?';

  const isLoading = !accessToken || profileQuery.isLoading;

  return (
    <div>
      <Header title="Profile" subtitle="Manage your career profile" />

      <div className="p-6 space-y-6">
        {/* Identity card */}
        <Card className="p-6">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-500 text-xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                {isLoading ? 'Loading…' : displayName || 'Your Name'}
              </h2>
              <p className="text-sm text-muted-foreground">{email}</p>
              {headline && <p className="mt-1 text-sm text-muted-foreground">{headline}</p>}
            </div>
          </div>
        </Card>

        {/* Edit profile fields */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-400" />
            <h3 className="text-base font-semibold text-foreground">Edit Profile</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Professional headline
              </label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Software Engineer | Open to work"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="A short summary of your background and goals…"
                disabled={isLoading}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 disabled:opacity-50"
              />
            </div>
          </div>

          <Button
            onClick={() => updateProfile.mutate()}
            disabled={isLoading || updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
        </Card>

        {/* Career goals */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-semibold text-foreground">Career Goals</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Target role
              </label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Staff Engineer, Engineering Manager"
                disabled={isLoading || goalsQuery.isLoading}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Target industry
              </label>
              <Input
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                placeholder="e.g. FinTech, AI / ML, SaaS"
                disabled={isLoading || goalsQuery.isLoading}
              />
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => updateGoals.mutate()}
            disabled={isLoading || goalsQuery.isLoading || updateGoals.isPending}
          >
            {updateGoals.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save goals
          </Button>
        </Card>

        {/* LinkedIn integration placeholder */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Linkedin className="h-5 w-5 text-sky-500" />
            <h3 className="text-base font-semibold text-foreground">LinkedIn Integration</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-6 text-center rounded-xl border border-dashed border-border">
            <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">Coming soon</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              LinkedIn profile import and AI-powered optimization will be available in a future
              update.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
