import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const narrativeTypeEnum = pgEnum('narrative_type', [
  'bio',
  'project_summary',
  'commit_story',
]);

export const opportunitySourceEnum = pgEnum('opportunity_source', [
  'github_jobs',
  'manual',
  'ai_suggested',
]);

export const opportunityStatusEnum = pgEnum('opportunity_status', [
  'new',
  'saved',
  'dismissed',
]);

export const agentModeEnum = pgEnum('agent_mode', ['focus', 'explore', 'rest']);

export const agentStatusEnum = pgEnum('forge_agent_status', [
  'idle',
  'syncing',
  'generating',
  'error',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubId: text('github_id').notNull().unique(),
  username: text('username').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  email: text('email'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const repositories = pgTable('repositories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  githubRepoId: text('github_repo_id').notNull(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  description: text('description'),
  language: text('language').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  connectedAt: timestamp('connected_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true, mode: 'date' }),
});

export const repoSnapshots = pgTable('repo_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  repoId: uuid('repo_id')
    .notNull()
    .references(() => repositories.id, { onDelete: 'cascade' }),
  capturedAt: timestamp('captured_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  commitCount30d: integer('commit_count_30d').notNull(),
  topLanguages: jsonb('top_languages').$type<Record<string, number>>().notNull(),
  contributors: jsonb('contributors')
    .$type<Array<{ login: string; commits: number }>>()
    .notNull(),
  focusScore: numeric('focus_score', { precision: 4, scale: 2 }).notNull(),
  healthScore: numeric('health_score', { precision: 4, scale: 2 }).notNull(),
  rawSignal: jsonb('raw_signal').$type<Record<string, unknown>>().notNull(),
});

export const narratives = pgTable('narratives', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  repoId: uuid('repo_id').references(() => repositories.id, {
    onDelete: 'cascade',
  }),
  type: narrativeTypeEnum('type').notNull(),
  content: text('content').notNull(),
  modelVersion: text('model_version').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
});

export const opportunityMatches = pgTable('opportunity_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  source: opportunitySourceEnum('source').notNull(),
  matchScore: numeric('match_score', { precision: 4, scale: 2 }).notNull(),
  matchedSignals: jsonb('matched_signals').$type<Record<string, unknown>>().notNull(),
  url: text('url'),
  status: opportunityStatusEnum('status').notNull().default('new'),
  surfacedAt: timestamp('surfaced_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export const agentState = pgTable('agent_state', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  mode: agentModeEnum('mode').notNull().default('focus'),
  activeRepoId: uuid('active_repo_id').references(() => repositories.id, {
    onDelete: 'set null',
  }),
  agentStatus: agentStatusEnum('agent_status').notNull().default('idle'),
  lastAction: text('last_action'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  repositories: many(repositories),
  narratives: many(narratives),
  opportunityMatches: many(opportunityMatches),
  agentState: one(agentState),
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  user: one(users, {
    fields: [repositories.userId],
    references: [users.id],
  }),
  snapshots: many(repoSnapshots),
  narratives: many(narratives),
}));

export const repoSnapshotsRelations = relations(repoSnapshots, ({ one }) => ({
  repository: one(repositories, {
    fields: [repoSnapshots.repoId],
    references: [repositories.id],
  }),
}));

export const narrativesRelations = relations(narratives, ({ one }) => ({
  user: one(users, {
    fields: [narratives.userId],
    references: [users.id],
  }),
  repository: one(repositories, {
    fields: [narratives.repoId],
    references: [repositories.id],
  }),
}));

export const opportunityMatchesRelations = relations(opportunityMatches, ({ one }) => ({
  user: one(users, {
    fields: [opportunityMatches.userId],
    references: [users.id],
  }),
}));

export const agentStateRelations = relations(agentState, ({ one }) => ({
  user: one(users, {
    fields: [agentState.userId],
    references: [users.id],
  }),
  activeRepo: one(repositories, {
    fields: [agentState.activeRepoId],
    references: [repositories.id],
  }),
}));
