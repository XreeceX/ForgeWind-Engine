'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Check,
  GraduationCap,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { getUserServiceUrl } from '@/lib/forgewind-api';
import {
  useForgeWindStore,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
} from '@/stores/forgewind.store';
import { cn } from '@/lib/cn';
import toast from 'react-hot-toast';

/* ── API helpers ── */
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
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json() as Promise<UserProfile>;
}
async function patchCareerGoals(token: string, data: CareerGoals): Promise<CareerGoals> {
  const res = await fetch(`${getUserServiceUrl()}/api/v1/users/me/career-goals`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update career goals');
  return res.json() as Promise<CareerGoals>;
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const SKILL_CATEGORIES = ['Engineering', 'Design', 'Product', 'Data', 'Leadership', 'Other'];

const BLANK_EXP: Omit<ExperienceItem, 'id'> = {
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: null,
  description: '',
  employmentType: 'Full-time',
};
const BLANK_EDU: Omit<EducationItem, 'id'> = {
  school: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const openToWork = useForgeWindStore((s) => s.openToWork);
  const setOpenToWork = useForgeWindStore((s) => s.setOpenToWork);
  const experience = useForgeWindStore((s) => s.experience);
  const addExperience = useForgeWindStore((s) => s.addExperience);
  const updateExperience = useForgeWindStore((s) => s.updateExperience);
  const removeExperience = useForgeWindStore((s) => s.removeExperience);
  const education = useForgeWindStore((s) => s.education);
  const addEducation = useForgeWindStore((s) => s.addEducation);
  const removeEducation = useForgeWindStore((s) => s.removeEducation);
  const skills = useForgeWindStore((s) => s.skills);
  const addSkill = useForgeWindStore((s) => s.addSkill);
  const removeSkill = useForgeWindStore((s) => s.removeSkill);

  /* profile queries */
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
  const [editingHeadline, setEditingHeadline] = useState(false);

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
    onSuccess: () => {
      toast.success('Profile updated');
      setEditingHeadline(false);
    },
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

  /* profile completion */
  const completionItems = [
    !!headline,
    !!bio,
    experience.length > 0,
    education.length > 0,
    skills.length > 0,
    !!targetRole,
  ];
  const completionPct = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100,
  );

  /* experience form */
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState<Omit<ExperienceItem, 'id'>>(BLANK_EXP);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);

  function submitExp() {
    if (!expForm.title || !expForm.company) {
      toast.error('Title and company are required');
      return;
    }
    if (editingExpId) {
      updateExperience(editingExpId, expForm);
    } else {
      addExperience(expForm);
    }
    setExpForm(BLANK_EXP);
    setShowExpForm(false);
    setEditingExpId(null);
  }

  /* education form */
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState<Omit<EducationItem, 'id'>>(BLANK_EDU);

  function submitEdu() {
    if (!eduForm.school) {
      toast.error('School name is required');
      return;
    }
    addEducation(eduForm);
    setEduForm(BLANK_EDU);
    setShowEduForm(false);
  }

  /* skills form */
  const [skillInput, setSkillInput] = useState('');
  const [skillCategory, setSkillCategory] = useState('Engineering');

  function submitSkill() {
    const name = skillInput.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Skill already added');
      return;
    }
    addSkill({ name, category: skillCategory });
    setSkillInput('');
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Open to work banner */}
      {openToWork && (
        <div className="rounded-fw-card border border-green-200 bg-green-50 px-4 py-3 flex items-center justify-between dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Open to work — recruiters can see you&apos;re available
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenToWork(false)}
            className="text-xs text-green-600 hover:underline dark:text-green-400"
          >
            Turn off
          </button>
        </div>
      )}

      {/* Profile hero card */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-600 text-2xl font-bold">
              {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-foreground">
                {isLoading ? 'Loading…' : displayName || 'Your Name'}
              </h2>
              {editingHeadline ? (
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Add a headline"
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => updateProfile.mutate()}
                    className="text-fw-orange hover:text-fw-deep"
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingHeadline(false)}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-sm text-muted-foreground">{headline || 'Add a headline'}</p>
                  <button
                    type="button"
                    onClick={() => setEditingHeadline(true)}
                    className="text-muted-foreground hover:text-fw-orange"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">{email}</p>
              {targetRole && (
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-amber-400" />
                  Targeting: {targetRole}
                  {targetIndustry ? ` · ${targetIndustry}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Open to work toggle */}
          <button
            type="button"
            onClick={() => setOpenToWork(!openToWork)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              openToWork
                ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'border-border text-muted-foreground hover:border-fw-orange hover:text-fw-orange',
            )}
          >
            {openToWork ? '✓ Open to work' : '+ Open to work'}
          </button>
        </div>

        {/* Completion bar */}
        <div className="mt-5 rounded-lg border border-border bg-surface-light p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-foreground">Profile completion</p>
            <span className="text-xs font-bold text-fw-orange">{completionPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-border">
            <div
              className="h-2 rounded-full bg-fw-orange transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {completionPct < 100 ? 'Add more sections below to reach 100%' : 'Profile complete!'}
          </p>
        </div>
      </Card>

      {/* About / Bio */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-fw-orange" />
            <h3 className="text-base font-semibold text-foreground">About</h3>
          </div>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Write a summary about your background, skills, and what you're looking for…"
          disabled={isLoading}
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-fw-orange focus:outline-none disabled:opacity-50"
        />
        <Button
          onClick={() => updateProfile.mutate()}
          disabled={isLoading || updateProfile.isPending}
          size="sm"
        >
          {updateProfile.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </Button>
      </Card>

      {/* Career Goals */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4.5 w-4.5 text-amber-400" />
          <h3 className="text-base font-semibold text-foreground">Career Goals</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Target role
            </label>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Staff Engineer, Engineering Manager"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Target industry
            </label>
            <Input
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              placeholder="e.g. FinTech, AI / ML, SaaS"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => updateGoals.mutate()}
          disabled={isLoading || updateGoals.isPending}
        >
          {updateGoals.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save goals
        </Button>
      </Card>

      {/* Experience */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-base font-semibold text-foreground">Experience</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setExpForm(BLANK_EXP);
              setEditingExpId(null);
              setShowExpForm(true);
            }}
            className="flex items-center gap-1 text-sm text-fw-orange hover:text-fw-deep font-medium"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {/* Add/edit form */}
        {showExpForm && (
          <div className="rounded-lg border border-fw-orange-mid bg-fw-orange-light/20 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Title *
                </label>
                <Input
                  value={expForm.title}
                  onChange={(e) => setExpForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Company *
                </label>
                <Input
                  value={expForm.company}
                  onChange={(e) => setExpForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Location
                </label>
                <Input
                  value={expForm.location}
                  onChange={(e) => setExpForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. London, UK / Remote"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Employment type
                </label>
                <select
                  value={expForm.employmentType}
                  onChange={(e) => setExpForm((f) => ({ ...f, employmentType: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-border bg-panel px-2.5 text-sm text-foreground"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Start date
                </label>
                <Input
                  type="month"
                  value={expForm.startDate}
                  onChange={(e) => setExpForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  End date
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="month"
                    value={expForm.endDate ?? ''}
                    onChange={(e) => setExpForm((f) => ({ ...f, endDate: e.target.value || null }))}
                    disabled={expForm.endDate === null && expForm.startDate !== ''}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={expForm.endDate === null}
                      onChange={(e) =>
                        setExpForm((f) => ({ ...f, endDate: e.target.checked ? null : '' }))
                      }
                      className="accent-fw-orange"
                    />
                    Present
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                value={expForm.description}
                onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Describe your responsibilities and achievements…"
                className="w-full resize-none rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-fw-orange focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={submitExp}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowExpForm(false);
                  setEditingExpId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        {experience.length === 0 && !showExpForm ? (
          <p className="text-sm text-muted-foreground">No experience added yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {experience.map((exp) => (
              <div key={exp.id} className="flex items-start gap-3 py-4 first:pt-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-light">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm">{exp.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {exp.company} · {exp.employmentType}
                  </p>
                  {exp.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {exp.location}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {exp.startDate || '?'} — {exp.endDate ?? 'Present'}
                  </p>
                  {exp.description && (
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setExpForm({
                        title: exp.title,
                        company: exp.company,
                        location: exp.location,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                        description: exp.description,
                        employmentType: exp.employmentType,
                      });
                      setEditingExpId(exp.id);
                      setShowExpForm(true);
                    }}
                    className="rounded p-1 text-muted-foreground hover:bg-surface-light hover:text-fw-orange"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-surface-light hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Education */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4.5 w-4.5 text-purple-400" />
            <h3 className="text-base font-semibold text-foreground">Education</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setEduForm(BLANK_EDU);
              setShowEduForm(true);
            }}
            className="flex items-center gap-1 text-sm text-fw-orange hover:text-fw-deep font-medium"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {showEduForm && (
          <div className="rounded-lg border border-fw-orange-mid bg-fw-orange-light/20 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  School *
                </label>
                <Input
                  value={eduForm.school}
                  onChange={(e) => setEduForm((f) => ({ ...f, school: e.target.value }))}
                  placeholder="University / College name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Degree
                </label>
                <Input
                  value={eduForm.degree}
                  onChange={(e) => setEduForm((f) => ({ ...f, degree: e.target.value }))}
                  placeholder="e.g. Bachelor of Science"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Field of study
                </label>
                <Input
                  value={eduForm.field}
                  onChange={(e) => setEduForm((f) => ({ ...f, field: e.target.value }))}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Start year
                </label>
                <Input
                  type="number"
                  value={eduForm.startYear}
                  onChange={(e) => setEduForm((f) => ({ ...f, startYear: e.target.value }))}
                  placeholder="2018"
                  min="1950"
                  max="2030"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  End year
                </label>
                <Input
                  type="number"
                  value={eduForm.endYear}
                  onChange={(e) => setEduForm((f) => ({ ...f, endYear: e.target.value }))}
                  placeholder="2022"
                  min="1950"
                  max="2035"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={submitEdu}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowEduForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {education.length === 0 && !showEduForm ? (
          <p className="text-sm text-muted-foreground">No education added yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {education.map((edu) => (
              <div key={edu.id} className="flex items-start gap-3 py-4 first:pt-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-light">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm">{edu.school}</p>
                  <p className="text-sm text-muted-foreground">
                    {[edu.degree, edu.field].filter(Boolean).join(', ')}
                  </p>
                  {(edu.startYear || edu.endYear) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {edu.startYear}–{edu.endYear}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(edu.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-surface-light hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Skills */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4.5 w-4.5 text-amber-400" />
          <h3 className="text-base font-semibold text-foreground">Skills</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((sk) => (
            <span
              key={sk.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface-light px-3 py-1 text-xs font-medium text-foreground"
            >
              {sk.name}
              <button
                type="button"
                onClick={() => removeSkill(sk.id)}
                className="text-muted-foreground hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <p className="text-sm text-muted-foreground">No skills added yet.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitSkill()}
            placeholder="Add a skill (press Enter)"
            className="h-8 w-48 text-sm"
          />
          <select
            value={skillCategory}
            onChange={(e) => setSkillCategory(e.target.value)}
            className="h-8 rounded-lg border border-border bg-panel px-2 text-xs text-foreground"
          >
            {SKILL_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <Button size="sm" variant="secondary" onClick={submitSkill} disabled={!skillInput.trim()}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        {/* Skills by category */}
        {skills.length > 0 && (
          <div className="space-y-2">
            {SKILL_CATEGORIES.filter((cat) => skills.some((s) => s.category === cat)).map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <Award className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
                  {cat}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <span
                        key={s.id}
                        className="rounded-md bg-fw-orange-light px-2 py-0.5 text-xs font-medium text-fw-orange"
                      >
                        {s.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
