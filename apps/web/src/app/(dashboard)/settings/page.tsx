"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  Target,
  Bell,
  Link2,
  Database,
  Save,
  Linkedin,
  Mail,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          enabled ? "bg-primary-500" : "bg-surface-lighter"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            enabled && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex.chen@example.com");
  const [headline, setHeadline] = useState(
    "Senior Software Engineer | AI Enthusiast"
  );
  const [location, setLocation] = useState("San Francisco, CA");

  const [targetRole, setTargetRole] = useState("Staff Software Engineer");
  const [targetCompanies, setTargetCompanies] = useState(
    "Stripe, OpenAI, Vercel, Notion"
  );
  const [salaryMin, setSalaryMin] = useState("200000");
  const [salaryMax, setSalaryMax] = useState("350000");
  const [remotePreference, setRemotePreference] = useState("remote");

  const [notifications, setNotifications] = useState({
    jobMatches: true,
    applicationUpdates: true,
    profileViews: false,
    weeklyDigest: true,
    aiTaskComplete: true,
    contentReminders: true,
  });

  return (
    <div>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-5 w-5 text-primary-400" />
            <h3 className="text-base font-semibold text-white">
              Profile Settings
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              containerClassName="md:col-span-2"
            />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Career Goals */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              Career Goals
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Target Role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <Input
              label="Target Companies"
              value={targetCompanies}
              onChange={(e) => setTargetCompanies(e.target.value)}
            />
            <Input
              label="Minimum Salary"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              icon={<span className="text-xs">$</span>}
            />
            <Input
              label="Maximum Salary"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              icon={<span className="text-xs">$</span>}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Work Preference
              </label>
              <div className="flex gap-2">
                {["remote", "hybrid", "onsite"].map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setRemotePreference(pref)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-all",
                      remotePreference === pref
                        ? "border-primary-500/30 bg-primary-500/10 text-primary-400"
                        : "border-border text-slate-400 hover:border-border-light hover:text-slate-200"
                    )}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button>
              <Save className="h-4 w-4" />
              Save Goals
            </Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">
              Notification Preferences
            </h3>
          </div>
          <div className="divide-y divide-border">
            <Toggle
              enabled={notifications.jobMatches}
              onChange={(v) =>
                setNotifications((n) => ({ ...n, jobMatches: v }))
              }
              label="New Job Matches"
              description="Get notified when new jobs match your profile"
            />
            <Toggle
              enabled={notifications.applicationUpdates}
              onChange={(v) =>
                setNotifications((n) => ({ ...n, applicationUpdates: v }))
              }
              label="Application Updates"
              description="Updates on your job application status"
            />
            <Toggle
              enabled={notifications.profileViews}
              onChange={(v) =>
                setNotifications((n) => ({ ...n, profileViews: v }))
              }
              label="Profile Views"
              description="When someone views your profile"
            />
            <Toggle
              enabled={notifications.weeklyDigest}
              onChange={(v) =>
                setNotifications((n) => ({ ...n, weeklyDigest: v }))
              }
              label="Weekly Digest"
              description="Summary of your career activity each week"
            />
            <Toggle
              enabled={notifications.aiTaskComplete}
              onChange={(v) =>
                setNotifications((n) => ({ ...n, aiTaskComplete: v }))
              }
              label="AI Task Completion"
              description="When an AI agent finishes a task"
            />
            <Toggle
              enabled={notifications.contentReminders}
              onChange={(v) =>
                setNotifications((n) => ({ ...n, contentReminders: v }))
              }
              label="Content Reminders"
              description="Reminders for scheduled content posts"
            />
          </div>
        </Card>

        {/* Connected Accounts */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Link2 className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-semibold text-white">
              Connected Accounts
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                  <Linkedin className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">LinkedIn</p>
                  <p className="text-xs text-slate-500">
                    Connected as alex.chen@example.com
                  </p>
                </div>
              </div>
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <Mail className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Google</p>
                  <p className="text-xs text-slate-500">
                    Not connected
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Connect
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Database className="h-5 w-5 text-slate-400" />
            <h3 className="text-base font-semibold text-white">
              Data Management
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-white">Export Data</p>
                <p className="text-xs text-slate-500">
                  Download all your data as a JSON file
                </p>
              </div>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Delete Account
                  </p>
                  <p className="text-xs text-slate-500">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <Button variant="danger" size="sm">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
