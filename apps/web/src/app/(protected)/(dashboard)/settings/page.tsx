'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import {
  Bell,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  LogOut,
  Moon,
  Palette,
  Shield,
  Sun,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  type ForgeWindApiAgentState,
  forgeWindJson,
  getForgeWindApiBaseUrl,
} from '@/lib/forgewind-api';
import { useForgeWindAccessToken } from '@/hooks/use-forgewind-access-token';
import { useForgeWindStore } from '@/stores/forgewind.store';
import { cn } from '@/lib/cn';

/* ── toggle component ── */
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fw-orange focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-fw-orange' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

/* ── section header ── */
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4.5 w-4.5 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── settings row ── */
function SettingRow({
  label,
  description,
  children,
  danger,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div>
        <p className={cn('text-sm font-medium', danger ? 'text-red-500' : 'text-foreground')}>
          {label}
        </p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const agentModes = ['focus', 'explore', 'rest'] as const;
const TONES = ['Professional', 'Casual', 'Technical', 'Storytelling', 'Concise'];

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const accessToken = useForgeWindAccessToken();

  const notifications = useForgeWindStore((s) => s.notifications);
  const setNotifications = useForgeWindStore((s) => s.setNotifications);
  const memoryContext = useForgeWindStore((s) => s.memoryContext);
  const updateMemoryContext = useForgeWindStore((s) => s.updateMemoryContext);
  const agentSnapshot = useForgeWindStore((s) => s.agentSnapshot);
  const setAgentSnapshot = useForgeWindStore((s) => s.setAgentSnapshot);
  const experience = useForgeWindStore((s) => s.experience);
  const skills = useForgeWindStore((s) => s.skills);
  const repositories = useForgeWindStore((s) => s.repositories);
  const generatedContent = useForgeWindStore((s) => s.generatedContent);

  const [tone, setTone] = useState(memoryContext.preferredTone);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const apiReady = !!getForgeWindApiBaseUrl() && !!accessToken;
  const userName = session?.user?.name ?? '';
  const userEmail = session?.user?.email ?? '';
  const initials = userName
    ? userName
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
    : '?';

  const patchAgent = useMutation({
    mutationFn: (mode: (typeof agentModes)[number]) =>
      forgeWindJson<ForgeWindApiAgentState>('/agent-state', {
        method: 'PATCH',
        accessToken: accessToken!,
        body: JSON.stringify({ mode }),
      }),
    onSuccess: (row) => {
      if (!row) return;
      setAgentSnapshot({
        mode: row.mode,
        agentStatus: row.agentStatus,
        lastAction: row.lastAction,
      });
      toast.success('Agent mode updated');
    },
    onError: () => toast.error('Could not update agent mode.'),
  });

  function saveTone() {
    updateMemoryContext({ preferredTone: tone });
    toast.success('AI preferences saved');
  }

  function exportData() {
    const data = {
      profile: { name: userName, email: userEmail },
      experience,
      skills,
      repositories: repositories.map((r) => ({ name: r.fullName, language: r.language })),
      generatedContent: generatedContent.map((c) => ({
        title: c.title,
        channel: c.channel,
        createdAt: c.createdAt,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forgewind-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  }

  return (
    <div className="max-w-2xl space-y-6 pb-10">
      {/* ── Account ── */}
      <Card className="p-5 space-y-1">
        <Section icon={User} title="Account">
          {/* Profile row */}
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-light p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-600 text-lg font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{userName || 'Your Name'}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => router.push('/profile')}>
              Edit profile
            </Button>
          </div>

          <div>
            <SettingRow label="Change password" description="Update your login credentials">
              <button
                type="button"
                onClick={() =>
                  toast('Password reset emails will be supported via your email provider.', {
                    icon: '🔑',
                  })
                }
                className="flex items-center gap-1.5 text-sm text-fw-orange hover:text-fw-deep font-medium"
              >
                Reset <ChevronRight className="h-4 w-4" />
              </button>
            </SettingRow>
            <SettingRow label="Email address" description={userEmail || 'Not available'}>
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Check className="h-3 w-3" /> Verified
              </span>
            </SettingRow>
          </div>
        </Section>
      </Card>

      {/* ── Appearance ── */}
      <Card className="p-5">
        <Section icon={Palette} title="Appearance" description="Choose how ForgeWind looks for you">
          <SettingRow label="Theme" description="Switch between light and dark mode">
            <div className="flex items-center gap-2 rounded-lg border border-border p-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  resolvedTheme !== 'dark'
                    ? 'bg-fw-orange text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  resolvedTheme === 'dark'
                    ? 'bg-fw-orange text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </button>
            </div>
          </SettingRow>
        </Section>
      </Card>

      {/* ── Notifications ── */}
      <Card className="p-5">
        <Section icon={Bell} title="Notifications" description="Control what alerts you receive">
          <SettingRow
            label="Job match alerts"
            description="Get notified when new AI-matched roles are found"
          >
            <Toggle
              checked={notifications.jobMatchAlerts}
              onChange={(v) => {
                setNotifications({ jobMatchAlerts: v });
                toast.success(v ? 'Job alerts enabled' : 'Job alerts disabled');
              }}
            />
          </SettingRow>
          <SettingRow label="Content reminders" description="Reminders to post your saved drafts">
            <Toggle
              checked={notifications.contentReminders}
              onChange={(v) => {
                setNotifications({ contentReminders: v });
                toast.success('Preference saved');
              }}
            />
          </SettingRow>
          <SettingRow
            label="Weekly career digest"
            description="A weekly summary of your activity and insights"
          >
            <Toggle
              checked={notifications.weeklyDigest}
              onChange={(v) => {
                setNotifications({ weeklyDigest: v });
                toast.success('Preference saved');
              }}
            />
          </SettingRow>
          <SettingRow
            label="Agent activity updates"
            description="Notifications when AI agents complete tasks"
          >
            <Toggle
              checked={notifications.agentUpdates}
              onChange={(v) => {
                setNotifications({ agentUpdates: v });
                toast.success('Preference saved');
              }}
            />
          </SettingRow>
        </Section>
      </Card>

      {/* ── AI & Writing ── */}
      <Card className="p-5 space-y-4">
        <Section icon={Zap} title="AI & Writing" description="Customise how the AI writes for you">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Preferred writing tone
            </p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t.toLowerCase())}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    tone === t.toLowerCase()
                      ? 'border-fw-orange bg-fw-orange-light text-fw-orange'
                      : 'border-border text-muted-foreground hover:border-fw-orange-mid',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {apiReady && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI agent mode
              </p>
              <div className="flex gap-2">
                {agentModes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={patchAgent.isPending}
                    onClick={() => patchAgent.mutate(m)}
                    className={cn(
                      'flex-1 rounded-lg border py-2 text-xs font-semibold capitalize transition-colors',
                      agentSnapshot?.mode === m
                        ? 'border-fw-orange bg-fw-orange-light text-fw-orange'
                        : 'border-border text-muted-foreground hover:border-fw-orange-mid',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Status: {agentSnapshot?.agentStatus ?? '—'}
                {agentSnapshot?.lastAction ? ` · ${agentSnapshot.lastAction}` : ''}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button size="sm" onClick={saveTone}>
              Save AI preferences
            </Button>
          </div>
        </Section>
      </Card>

      {/* ── Integrations ── */}
      <Card className="p-5">
        <Section icon={ExternalLink} title="Integrations" description="Connected services and APIs">
          <SettingRow
            label="GitHub"
            description={
              repositories.length > 0
                ? `${repositories.length} repo${repositories.length !== 1 ? 's' : ''} connected`
                : 'No repositories connected'
            }
          >
            <div className="flex items-center gap-2">
              {repositories.length > 0 ? (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Check className="h-3 w-3" /> Connected
                </span>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => router.push('/data-hub')}>
                  <Github className="h-3.5 w-3.5" /> Connect
                </Button>
              )}
            </div>
          </SettingRow>
          <SettingRow
            label="ForgeWind API"
            description={apiReady ? 'Backend connected and authenticated' : 'Not configured'}
          >
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                apiReady
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-surface-light text-muted-foreground',
              )}
            >
              {apiReady ? (
                <>
                  <Check className="h-3 w-3" /> Active
                </>
              ) : (
                'Inactive'
              )}
            </span>
          </SettingRow>
          <SettingRow label="LinkedIn" description="Import profile and post directly">
            <span className="flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
              <Linkedin className="h-3 w-3" /> Coming soon
            </span>
          </SettingRow>
        </Section>
      </Card>

      {/* ── Privacy & Data ── */}
      <Card className="p-5">
        <Section
          icon={Shield}
          title="Privacy & Data"
          description="Manage your data and account security"
        >
          <SettingRow
            label="Export your data"
            description="Download all your profile, content, and settings as JSON"
          >
            <Button size="sm" variant="secondary" onClick={exportData}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </SettingRow>
          <SettingRow label="Sign out" description="Sign out of your current session">
            <Button size="sm" variant="secondary" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </SettingRow>
        </Section>
      </Card>

      {/* ── Danger zone ── */}
      <Card className="p-5 border-red-200 dark:border-red-900">
        <Section
          icon={Trash2}
          title="Danger zone"
          description="Irreversible actions — proceed with caution"
        >
          <SettingRow
            label="Delete account"
            description="Permanently delete your account and all data. This cannot be undone."
            danger
          >
            {!confirmDelete ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-xs text-red-500 font-medium">Are you sure?</p>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white border-0"
                  onClick={() => {
                    toast.error('Account deletion requires contacting support.');
                    setConfirmDelete(false);
                  }}
                >
                  Yes, delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </SettingRow>
        </Section>
      </Card>
    </div>
  );
}
