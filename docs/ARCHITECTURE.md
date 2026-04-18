# ForgeWind Engine — Architecture Deep Dive

> This document provides a comprehensive look at the system architecture, design decisions, patterns, and tradeoffs behind ForgeWind Engine.

---

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [System Architecture](#system-architecture)
- [API Gateway](#api-gateway)
- [Microservices](#microservices)
- [Multi-Agent AI System](#multi-agent-ai-system)
- [Data Architecture](#data-architecture)
- [Shared Packages](#shared-packages)
- [Communication Patterns](#communication-patterns)
- [Security](#security)
- [Infrastructure](#infrastructure)
- [Observability](#observability)
- [Design Tradeoffs](#design-tradeoffs)
- [Future Architecture](#future-architecture)

---

## Overview

ForgeWind Engine is a **distributed microservices system** organized as a TypeScript monorepo. It comprises:

- **1 frontend** application (Next.js 14)
- **1 API gateway** (NestJS) serving as the single entry point
- **8 backend microservices** (NestJS) handling specific domains
- **6 AI agents** (TypeScript libraries) built on a shared agent framework
- **4 shared packages** providing types, config, utilities, and AI infrastructure
- **3 data stores** (PostgreSQL, Redis, Pinecone)

All packages are managed by **pnpm workspaces** with **Turborepo** orchestrating builds, and the entire system is deployable via Docker Compose (dev), Kubernetes (staging), or Terraform + ECS Fargate (production).

---

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Separation of Concerns** | Each microservice owns a single domain (users, jobs, content, etc.) with its own data access patterns |
| **Type Safety End-to-End** | Shared TypeScript interfaces (`@forgewind-engine/shared-types`) ensure consistent contracts from frontend to backend |
| **Configuration as Code** | Zod schemas validate all environment variables at startup; Terraform defines all infrastructure |
| **Fail Gracefully** | `Result<T, E>` type for explicit error handling; agent confidence scores for AI uncertainty |
| **AI as a First-Class Citizen** | Dedicated agent framework, not an afterthought — structured tool calling, token tracking, iteration limits |
| **Monorepo, Not Monolith** | Shared code via packages, independent deployment via services, unified developer experience via Turborepo |

---

## System Architecture

### High-Level Request Flow

```
Browser (Next.js SSR/CSR)
    │
    │  HTTP/HTTPS
    ▼
┌──────────────────────────────────────────────┐
│  API Gateway (:4000)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Helmet   │→│ Throttler│→│ JWT Guard    │ │
│  │ (headers)│ │ (rate    │ │ (auth check) │ │
│  └──────────┘ │  limit)  │ └──────┬───────┘ │
│               └──────────┘        │          │
│                                   ▼          │
│  ┌────────────────────────────────────────┐  │
│  │         Controller Router              │  │
│  │  /auth  /users  /profile  /jobs        │  │
│  │  /content  /agents  /health            │  │
│  └────────────────┬───────────────────────┘  │
└───────────────────┼──────────────────────────┘
                    │  HTTP (internal)
        ┌───────────┼───────────────────┐
        ▼           ▼                   ▼
   ┌─────────┐ ┌─────────┐       ┌──────────┐
   │ User    │ │ Job     │  ...  │ Content  │
   │ Service │ │ Service │       │ Engine   │
   └────┬────┘ └────┬────┘       └────┬─────┘
        │           │                  │
        ▼           ▼                  ▼
   ┌─────────┐ ┌─────────┐       ┌─────────┐
   │Postgres │ │Pinecone │       │ OpenAI  │
   │ (Prisma)│ │(vectors)│       │ GPT-4o  │
   └─────────┘ └─────────┘       └─────────┘
```

### Request Lifecycle

1. **Client** sends request to the API Gateway (`:4000`)
2. **Helmet** applies security headers (XSS protection, HSTS, etc.)
3. **Throttler** checks rate limits (configurable per endpoint)
4. **JWT Guard** validates the bearer token (skipped for public routes like `/auth/login`)
5. **Controller** identifies the target service based on route prefix
6. **Gateway** forwards the request to the appropriate microservice via HTTP
7. **Service** processes the request, interacts with data stores, returns response
8. **Gateway** wraps the response in the standard `ApiResponse<T>` envelope
9. **Client** receives the response

---

## API Gateway

### Architecture

The API Gateway (`apps/api-gateway`) is a NestJS application that acts as the single entry point for all client traffic. It does not contain business logic — its responsibilities are strictly cross-cutting concerns.

### Responsibilities

| Concern | Implementation |
|---------|----------------|
| **Authentication** | `@nestjs/passport` with `passport-jwt` strategy; LinkedIn OAuth2 for social login |
| **Authorization** | Custom JWT guard applied globally with route-level overrides |
| **Rate Limiting** | `@nestjs/throttler` with configurable TTL and limits |
| **Input Validation** | `class-validator` + `class-transformer` via NestJS `ValidationPipe` |
| **Security Headers** | `helmet` middleware for HTTP security headers |
| **API Documentation** | `@nestjs/swagger` auto-generating OpenAPI spec at `/api/docs` |
| **Service Routing** | HTTP proxy to downstream services based on route prefix |
| **Error Handling** | Global exception filter normalizing errors to `ApiError` format |

### Configuration

Service URLs are managed via `gateway.config.ts` using `@nestjs/config`:

```typescript
registerAs('gateway', () => ({
  jwtSecret: process.env.JWT_SECRET,
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:4001',
  jobServiceUrl: process.env.JOB_SERVICE_URL || 'http://localhost:4004',
  contentServiceUrl: process.env.CONTENT_SERVICE_URL || 'http://localhost:4005',
  // ...
}));
```

### Why a Gateway?

- **Single TLS termination point** — Only one service needs a certificate
- **Centralized auth** — Services don't each implement JWT verification
- **Rate limiting** — Applied uniformly before any business logic runs
- **Client simplicity** — Frontend talks to one origin, avoiding CORS complexity
- **Deployment flexibility** — Services can be reorganized without client changes

---

## Microservices

### Service Design Pattern

Every microservice follows a consistent NestJS structure:

```
service-name/
├── src/
│   ├── main.ts              # Bootstrap: prefix, port, CORS
│   ├── app.module.ts         # Root module importing feature modules
│   ├── controllers/          # HTTP route handlers
│   ├── services/             # Business logic
│   ├── dto/                  # Request/response validation
│   └── types/                # Service-specific types
├── package.json
└── tsconfig.json
```

**Common bootstrap pattern:**
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  await app.listen(process.env.PORT || DEFAULT_PORT);
}
```

### Service Breakdown

#### User Service (:4001)

The only service using **Prisma ORM** for relational data access. Handles the full user lifecycle:

- Registration with bcrypt password hashing
- JWT token issuance and refresh
- LinkedIn OAuth2 integration via `passport-linkedin-oauth2`
- Career goals and preferences management
- User profile CRUD

**Why Prisma only here?** The user domain has the most structured relational data (users, preferences, goals). Other services that need user context receive it via the gateway request headers or service-to-service calls. This avoids coupling every service to a shared database.

#### Resume Parser (:4002)

Handles document ingestion and AI-powered extraction:

- **pdf-parse** for PDF text extraction
- **mammoth** for DOCX to text conversion
- **OpenAI GPT-4o** for structured data extraction from raw text
- Returns `ParsedResume` matching the shared type contract

#### LinkedIn Ingestion (:4003)

Processes LinkedIn's data export format:

- **csv-parser** for CSV data export files
- **adm-zip** for ZIP archive handling
- **multer** for file upload handling
- Profile analysis and scoring via OpenAI
- Network and activity analysis endpoints

#### Job Service (:4004)

Combines traditional job data with AI-powered matching:

- **Pinecone** vector database for semantic similarity search
- **OpenAI embeddings** for job/profile vectorization
- **@nestjs/schedule** for periodic job aggregation
- Match scoring with natural language explanations
- Application tracking state machine

#### Content Engine (:4005)

AI-driven content creation and strategy:

- Post generation with tone/audience customization
- Headline and About section optimization
- Content calendar generation
- Template management system
- Cold email drafting

#### Recommendation Engine (:4006)

Cross-domain intelligence combining skills, content, and networking:

- Skill gap analysis against target roles
- Learning path generation
- Certification recommendations
- Networking target suggestions
- Content topic recommendations

#### Analytics Service (:4007)

Event-driven metrics and reporting:

- **@nestjs/schedule** for periodic report generation
- Event tracking with flexible event types
- Metrics aggregation per user
- Weekly progress reports
- Feedback sentiment analysis

#### Automation Service (:4008)

Async job processing and outreach orchestration:

- **BullMQ** for reliable job queue processing
- **Nodemailer** for email delivery
- Multi-step outreach campaign management
- Reminder and schedule management
- Application preparation workflows

---

## Multi-Agent AI System

### Framework Architecture

The agent system is built on `@forgewind-engine/agent-core`, which provides:

```
┌─────────────────────────────────────────────┐
│  agent-core package                         │
│                                             │
│  ┌───────────┐      ┌───────────────────┐   │
│  │ LLMClient │◄─────│    BaseAgent      │   │
│  │           │      │                   │   │
│  │ • chat()  │      │ • getSystemPrompt │   │
│  │ • retry   │      │ • getTools        │   │
│  │ • backoff │      │ • buildUserMsg    │   │
│  └───────────┘      │ • run()           │   │
│                     │ • executeTool     │   │
│                     └─────────┬─────────┘   │
│                               │ extends     │
│              ┌────────────────┼────────┐    │
│              ▼                ▼        ▼    │
│         ProfileAgent    JobAgent   ...      │
└─────────────────────────────────────────────┘
```

### BaseAgent Contract

Every agent must implement three abstract methods:

| Method | Purpose |
|--------|---------|
| `getSystemPrompt()` | Returns the agent's persona, capabilities, and output format instructions |
| `getTools()` | Returns an array of OpenAI function definitions the agent can invoke |
| `buildUserMessage(input)` | Transforms the raw task input into a structured prompt for the LLM |

### Execution Loop

```
run(input) {
  messages = [system_prompt, user_message]
  
  for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    response = llm.chat(messages, tools)
    
    if (response.has_tool_calls) {
      for (tool_call of response.tool_calls) {
        result = this.executeTool(tool_call.name, tool_call.arguments)
        messages.push(tool_call, tool_result)
      }
    } else {
      return parseOutput(response.content)
    }
  }
  
  return { success: false, error: "Max iterations reached" }
}
```

**Key design decisions:**

- **Max 10 iterations** — Prevents runaway token consumption
- **Tool results feed back** — The LLM sees the result of each tool call, enabling multi-step reasoning
- **JSON output parsing** — Final response is parsed for `output`, `reasoning`, and `confidence`
- **Fallback handling** — If JSON parsing fails, raw text becomes `output` with `confidence: 0.5`
- **Token tracking** — Every execution records `promptTokens`, `completionTokens`, `totalTokens`

### Tool Implementation Pattern

Tools are implemented as methods on the agent class. The LLM decides which tools to call based on the task context:

```typescript
// Example: ProfileAgent tool
private analyzProfile(args: { profile: LinkedInProfile }) {
  const { profile } = args;
  const scores = {
    headline: this.scoreHeadline(profile.headline),
    about: this.scoreAbout(profile.about),
    experience: this.scoreExperience(profile.experience),
    // ...
  };
  return { overallScore: average(scores), breakdown: scores, recommendations: [...] };
}
```

Tools are a mix of **deterministic logic** (scoring heuristics, template lookup) and **data retrieval** (fetching user data, searching indexes). The LLM orchestrates the sequence — deciding what to analyze first, what data to request, and how to synthesize findings.

### Why This Pattern?

| Alternative | Why We Chose Tool-Calling Instead |
|-------------|-----------------------------------|
| **Single prompt** | Tool-calling allows multi-step reasoning and data gathering; a single prompt would need all context upfront |
| **LangChain** | Lighter-weight; we control the loop, retries, and token tracking without framework overhead |
| **Fine-tuned model** | GPT-4o with tools is more flexible; fine-tuning would lock us into specific behaviors |
| **RAG only** | RAG is used within tools (Pinecone search), but agents need more than retrieval — they need reasoning |

---

## Data Architecture

### PostgreSQL (Primary Store)

**Used by:** User Service (via Prisma), with other services using raw SQL or lightweight ORMs.

**Responsibilities:**
- User accounts, auth tokens, preferences
- Job listings and application records
- Content drafts and templates
- Event logs and analytics data
- Agent task records

**Why PostgreSQL 16?**
- JSON/JSONB support for semi-structured agent outputs
- Full-text search for basic text matching (before vector search)
- Mature ecosystem, excellent Prisma support
- RDS managed service reduces operational burden

### Redis (Cache & Queues)

**Used by:** API Gateway (caching, sessions), Automation Service (BullMQ)

**Responsibilities:**
- JWT session caching
- Rate limiter state
- BullMQ job queues for async processing
- Temporary computation results

**Why Redis 7?**
- Sub-millisecond reads for auth/rate-limit checks in the hot path
- BullMQ requires Redis as its backing store
- Streams support for potential future event bus

### Pinecone (Vector Database)

**Used by:** Job Service, Recommendation Engine

**Responsibilities:**
- Job description embeddings (3072 dimensions via OpenAI)
- User profile embeddings for matching
- Semantic similarity search for job recommendations
- Skill-to-role alignment vectors

**Why Pinecone?**
- Managed service — no infrastructure to maintain
- Native support for metadata filtering (location, salary, etc.)
- Fast approximate nearest neighbor search at scale
- Simple SDK integration (`@pinecone-database/pinecone`)

### Data Flow

```
User Action → API Gateway → Service
                              │
                 ┌────────────┼────────────────┐
                 ▼            ▼                ▼
            PostgreSQL     Redis           Pinecone
            (persistent)   (ephemeral)     (embeddings)
                 │            │                │
                 └────────────┼────────────────┘
                              ▼
                    Response → Gateway → Client
```

---

## Shared Packages

### @forgewind-engine/shared-types

The single source of truth for all TypeScript interfaces used across the monorepo:

| Domain | Types |
|--------|-------|
| **User** | `User`, `UserRole`, `RemotePreference`, `CareerGoals` |
| **Job** | `Job`, `JobType`, `ExperienceLevel` |
| **Profile** | `LinkedInProfile`, `Experience`, `Education`, `Skill`, `Certification`, `Post` |
| **Resume** | `ParsedResume`, `PersonalInfo`, `Project` |
| **Agent** | `AgentType`, `AgentTask`, `AgentResult`, `AgentTaskStatus`, `Priority`, `SuggestedAction` |
| **Events** | `EventType`, `DomainEvent` |
| **API** | `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`, `ResponseMetadata` |

**Design decision:** Types are interfaces (not classes) to avoid runtime dependencies. This package has zero production dependencies — it's pure type definitions compiled away at build time.

### @forgewind-engine/config

Environment configuration with runtime validation:

- `baseEnvSchema` — `NODE_ENV`, `PORT`
- `databaseEnvSchema` — `DATABASE_URL`
- `authEnvSchema` — `JWT_SECRET`, `JWT_EXPIRES_IN`
- `aiEnvSchema` — `OPENAI_API_KEY`, `OPENAI_MODEL`
- `validateEnv(schema)` — Throws descriptive errors on startup if env vars are missing or malformed

**Constants** include `API_VERSION`, pagination defaults, `MAX_FILE_SIZE` (10MB), `AGENT_TIMEOUT_MS`, rate limit values, and `EMBEDDING_DIMENSIONS` (3072).

### @forgewind-engine/utils

Runtime utilities shared across all services:

| Utility | Purpose |
|---------|---------|
| `logger` | Pino-based structured JSON logging |
| `generateId()` | Nanoid-based unique ID generation |
| `Result<T, E>` | Functional error handling (`ok(value)` / `err(error)` / `isOk()` / `isErr()`) |
| `retry()` | Configurable retry with exponential backoff |
| `validate()` | Generic Zod-based validation helper |

### @forgewind-engine/agent-core

The AI agent framework (detailed in [Multi-Agent AI System](#multi-agent-ai-system)):

- `BaseAgent` — Abstract class with the tool-calling loop
- `LLMClient` — OpenAI SDK wrapper with retries and backoff
- Agent types — `AgentExecutionResult`, tool definitions, config types

---

## Communication Patterns

### Current: Synchronous HTTP

All service-to-service communication currently flows through HTTP via the API Gateway:

```
Client → Gateway → Service A → Response → Gateway → Client
```

**Tradeoff:** Simplicity over resilience. Acceptable for current scale, but introduces latency for multi-service requests and tight coupling to service availability.

### Async Processing: BullMQ

The Automation Service uses BullMQ (backed by Redis) for operations that shouldn't block the request:

- Outreach campaign execution (multi-step email sequences)
- Scheduled reminders
- Report generation

```
Client → Gateway → Automation Service → Enqueue Job → Response (202 Accepted)
                                              │
                                              ▼
                                     BullMQ Worker
                                         │
                                    Process Job
                                    (send email, etc.)
```

### Event-Driven (Planned)

The `DomainEvent` type in shared-types signals the intent for event-driven architecture:

```typescript
interface DomainEvent {
  id: string;
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: Date;
  userId: string;
}
```

**Future state:** Redis Streams or a dedicated message broker (RabbitMQ/Kafka) for:
- Service decoupling (user-service publishes `USER_UPDATED`, other services subscribe)
- Event sourcing for analytics (every action becomes a trackable event)
- Saga patterns for multi-service workflows (apply to job → update tracker → send notification)

---

## Security

### Authentication Flow

```
Registration:
  Client → POST /auth/register → User Service
    → bcrypt hash password → Store in PostgreSQL
    → Issue JWT → Return token

Login:
  Client → POST /auth/login → User Service
    → Verify bcrypt hash → Issue JWT
    → Return { accessToken, refreshToken }

Protected Request:
  Client → Authorization: Bearer <token>
    → JWT Guard validates signature + expiry
    → Attaches user context to request
    → Controller handles business logic
```

### LinkedIn OAuth2

```
Client → GET /auth/linkedin
  → Redirect to LinkedIn authorization
  → User grants access
  → LinkedIn redirects to /auth/linkedin/callback
  → Exchange code for LinkedIn profile data
  → Create/link user account
  → Issue JWT
```

### Security Measures

| Layer | Measure |
|-------|---------|
| **Transport** | HTTPS via TLS termination at ingress/ALB |
| **Headers** | Helmet middleware (XSS, HSTS, clickjacking, MIME sniffing) |
| **Auth** | JWT with configurable expiry + refresh token rotation |
| **Rate Limiting** | Per-IP throttling via `@nestjs/throttler` |
| **Input Validation** | `class-validator` on all DTOs, `ValidationPipe` with `whitelist: true` |
| **Env Secrets** | Zod validation ensures secrets are present; K8s Secrets for deployment |
| **Database** | Parameterized queries via Prisma (SQL injection prevention) |

---

## Infrastructure

### Development (Docker Compose)

```yaml
# infra/docker/docker-compose.yml
services:
  postgres:     # PostgreSQL 16, port 5432
  redis:        # Redis 7 Alpine, port 6379
  pgadmin:      # pgAdmin 4, port 5050
```

Persistent volumes for Postgres and Redis data. All services on a shared `forgewind-network` bridge.

### Staging (Kubernetes)

Manifests in `infra/k8s/`:

| Resource | Purpose |
|----------|---------|
| `namespace.yaml` | Isolates ForgeWind Engine resources in `forgewind` namespace |
| `configmap.yaml` | Non-secret configuration (ports, hostnames, `NODE_ENV`) |
| `secrets.yaml` | Base64-encoded secrets (DB credentials, JWT secret, API keys) |
| `deployments/` | Pod specs for api-gateway and user-service with health probes |
| `ingress.yaml` | TLS-terminated routing at `api.forgeengine.dev` via cert-manager |

### Production (Terraform + AWS)

```
┌──────────────────────────────────────────────┐
│  AWS Region: us-east-1                       │
│                                              │
│  ┌────────── VPC 10.0.0.0/16 ─────────────┐ │
│  │                                         │ │
│  │  Public Subnets (2 AZs)                │ │
│  │  ┌──────────────────────┐              │ │
│  │  │  ECS Fargate Cluster │              │ │
│  │  │  • api-gateway ×2    │              │ │
│  │  │  • user-service ×2   │              │ │
│  │  └──────────┬───────────┘              │ │
│  │             │                           │ │
│  │  Private Subnets (2 AZs)              │ │
│  │  ┌──────────────────────┐              │ │
│  │  │  RDS PostgreSQL 16   │              │ │
│  │  │  • Encrypted         │              │ │
│  │  │  • Multi-AZ (prod)   │              │ │
│  │  └──────────────────────┘              │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  S3: Terraform state                         │
│  DynamoDB: State locking                     │
│  CloudWatch: Centralized logs                │
└──────────────────────────────────────────────┘
```

**Key Terraform decisions:**
- **S3 + DynamoDB backend** for shared state and locking
- **Fargate** (serverless containers) to avoid EC2 management
- **Private subnets** for RDS to prevent direct internet access
- **Security groups** with least-privilege (ECS → RDS on 5432 only)
- **`manage_master_user_password`** for RDS secrets rotation via Secrets Manager

---

## Observability

### Logging

All services use **Pino** for structured JSON logging via `@forgewind-engine/utils`:

```json
{
  "level": "info",
  "time": 1700000000000,
  "msg": "Job match computed",
  "service": "job-service",
  "userId": "usr_abc123",
  "jobId": "job_xyz789",
  "score": 0.87,
  "durationMs": 234
}
```

### Agent Observability

Every agent execution returns telemetry:

```typescript
interface AgentExecutionResult {
  success: boolean;
  output: unknown;
  reasoning: string;
  confidence: number;       // 0.0 - 1.0
  toolsUsed: string[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}
```

### Health Checks

Each service exposes `GET /api/v1/health` for liveness/readiness probes used by Kubernetes deployments.

---

## Design Tradeoffs

### Monorepo vs. Polyrepo

**Chose: Monorepo (Turborepo + pnpm)**

| Pro | Con |
|-----|-----|
| Single `pnpm install` for everything | Larger repo size over time |
| Shared types guarantee compile-time consistency | CI builds all packages (mitigated by Turborepo caching) |
| Atomic refactors across services | Git history is shared |
| Unified tooling (lint, format, test) | Requires workspace-aware tooling |

### HTTP Gateway vs. Message Broker

**Chose: HTTP with BullMQ for async**

| Pro | Con |
|-----|-----|
| Simple to reason about and debug | Synchronous calls add latency |
| No broker infrastructure to manage | Service coupling through availability |
| Request-response is natural for CRUD | Not ideal for event choreography |
| BullMQ handles async needs | Two communication patterns to maintain |

**Migration path:** Redis Streams or RabbitMQ when service count exceeds ~15 or when event-driven workflows become dominant.

### Prisma in User Service Only

**Chose: Isolated ORM**

| Pro | Con |
|-----|-----|
| Only one service manages the schema | Other services use raw queries or simpler clients |
| Single migration pipeline | No shared Prisma models across services |
| Prevents distributed schema coupling | Requires data transfer objects between services |

### Agent Framework: Custom vs. LangChain

**Chose: Custom BaseAgent**

| Pro | Con |
|-----|-----|
| Full control over execution loop | More code to maintain |
| No framework version churn | Need to build features LangChain provides |
| Optimized for our tool-calling pattern | Less community ecosystem |
| Lightweight (< 500 lines of core code) | Must implement streaming, caching ourselves |

---

## Future Architecture

### Near-Term

- **Event bus** — Redis Streams for decoupled service communication
- **Service mesh** — Istio or Linkerd for observability, traffic management, mTLS
- **Distributed tracing** — OpenTelemetry integration across all services
- **Circuit breakers** — Resilience patterns for inter-service calls

### Medium-Term

- **Graph database** — Neo4j for network relationship modeling and path analysis
- **Real-time** — WebSocket gateway for live notifications and agent progress streaming
- **CQRS** — Separate read/write models for analytics-heavy queries
- **Multi-tenant** — Workspace isolation for team/enterprise features

### Long-Term

- **Agent-to-agent protocol** — Agents communicate and delegate tasks to each other
- **Fine-tuned models** — Domain-specific models for career content and matching
- **Edge computing** — Cloudflare Workers for latency-sensitive operations
- **ML pipeline** — Feature store and model training pipeline for personalization

---

*Last updated: April 2026*
