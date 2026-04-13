<div align="center">

# 🚀 CareerOS

### The AI-Powered Career Operating System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-AWS-844FBA?style=for-the-badge&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)

**Transform your career trajectory with AI-driven profile optimization, intelligent job matching, automated content strategy, and a multi-agent system that works for you 24/7.**

[Getting Started](#-getting-started) · [Architecture](#-architecture-overview) · [API Docs](docs/API.md) · [Contributing](#-contributing)

</div>

---

## What is CareerOS?

CareerOS is a full-stack, production-grade **AI Career Operating System** built as a microservices monorepo. It combines the power of OpenAI's GPT-4o with a custom multi-agent architecture to automate and optimize every aspect of a modern career — from LinkedIn profile optimization and resume parsing to intelligent job matching, content strategy, and outreach automation.

Unlike simple career tools that solve a single problem, CareerOS treats your career as a **system** — an interconnected set of inputs (skills, experience, goals) that feed into intelligent engines producing actionable outputs (optimized profiles, matched jobs, generated content, networking strategies). Six specialized AI agents coordinate across domains, each with dedicated tools and reasoning capabilities, orchestrated through a central gateway.

The platform is engineered with the same patterns used in production systems at scale: event-driven microservices, an API gateway for routing and auth, vector databases for semantic search, job queues for async processing, and infrastructure-as-code for reproducible deployments to AWS via Terraform and Kubernetes.

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│                    Next.js 14 (React 18 + TailwindCSS)              │
│            Zustand · React Query · Recharts · Framer Motion         │
│                           :3000                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (NestJS)                         │
│              Authentication · Rate Limiting · Routing               │
│            Swagger Docs · JWT · Helmet · Throttler                  │
│                           :4000                                     │
└──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
       │      │      │      │      │      │      │      │
       ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       MICROSERVICES LAYER                            │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  User    │ │  Resume  │ │ LinkedIn │ │   Job    │               │
│  │ Service  │ │  Parser  │ │ Ingestion│ │ Service  │               │
│  │  :4001   │ │  :4002   │ │  :4003   │ │  :4004   │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Content  │ │  Recom.  │ │Analytics │ │Automation│               │
│  │ Engine   │ │ Engine   │ │ Service  │ │ Service  │               │
│  │  :4005   │ │  :4006   │ │  :4007   │ │  :4008   │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
└───────────────────────┬──────────────────────────────────────────────┘
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │  │  Pinecone   │
│   16 (RDS)  │  │  7 (Cache)  │  │ (Vector DB) │
└─────────────┘  └─────────────┘  └─────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       AI AGENT LAYER                                 │
│         BaseAgent → OpenAI GPT-4o Tool-Calling Loop                  │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                            │
│  │ Profile  │ │   Job    │ │ Content  │                            │
│  │  Agent   │ │  Agent   │ │  Agent   │                            │
│  └──────────┘ └──────────┘ └──────────┘                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                            │
│  │Outreach  │ │Skill Gap │ │  Trend   │                            │
│  │  Agent   │ │  Agent   │ │  Agent   │                            │
│  └──────────┘ └──────────┘ └──────────┘                            │
└──────────────────────────────────────────────────────────────────────┘
```

> For a deep dive into architecture decisions and tradeoffs, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## ✨ Key Features

### Profile Intelligence
- **LinkedIn profile analysis** — Parse and score your profile with AI-powered recommendations
- **Headline & About optimization** — Generate compelling copy tailored to your target role
- **Experience rewriting** — Transform bullet points into impact-driven narratives
- **Skill suggestions** — Identify missing skills based on target roles and industry trends
- **Profile import** — Ingest LinkedIn data exports (CSV/ZIP) or direct URL analysis

### Job Intelligence
- **Semantic job matching** — Vector similarity search via Pinecone for role-skill alignment
- **Match scoring & explanations** — Understand *why* a job is a good fit with detailed reasoning
- **Market trend analysis** — Track demand signals, salary ranges, and hiring patterns
- **Application tracking** — Full pipeline management from discovery through offer
- **Strategy recommendations** — AI-generated application strategies per role

### Content Engine
- **Post generation** — Create LinkedIn posts with hooks, storytelling, and CTAs
- **Content calendar** — Strategic scheduling aligned with career goals
- **Template library** — Pre-built templates across categories (thought leadership, case studies, etc.)
- **Content analysis** — Score and improve drafts for engagement potential
- **Cold email drafting** — Professional outreach copy for networking and applications

### Skill Intelligence
- **Gap analysis** — Compare current skills against target role requirements
- **Learning paths** — Curated recommendations for skill development
- **Certification guidance** — Identify high-ROI certifications for your career trajectory
- **Progress tracking** — Monitor skill development over time
- **Project suggestions** — Portfolio project ideas to demonstrate new skills

### Multi-Agent System
- **6 specialized AI agents** — Profile, Job, Content, Outreach, Skill Gap, and Trend agents
- **Tool-calling architecture** — Each agent has dedicated tools for its domain
- **Autonomous reasoning** — Agents iterate up to 10 tool-calling cycles per task
- **Confidence scoring** — Every agent output includes a confidence metric
- **Token tracking** — Full usage monitoring per agent execution

### Automation & Outreach
- **Application prep** — Automated resume tailoring and cover letter generation
- **Outreach campaigns** — Multi-step email sequences with BullMQ job queues
- **Smart scheduling** — Reminders and follow-up scheduling
- **Connection requests** — AI-drafted personalized connection messages
- **Campaign analytics** — Track open rates, responses, and conversion

### Analytics & Reporting
- **Career score** — Composite metric across profile, skills, activity, and network
- **Progress tracking** — Visualize career trajectory over time with Recharts
- **Weekly reports** — Automated digest of activity, progress, and recommendations
- **Event tracking** — Full audit trail of career actions and milestones
- **Feedback analysis** — Sentiment and theme extraction from career interactions

---

## 🔧 System Design

### Microservices Architecture

Each service is an independent NestJS application with its own port, module structure, and API prefix (`/api/v1`). Services communicate through the API Gateway, which handles cross-cutting concerns like authentication, rate limiting, and request routing.

| Service | Port | Responsibility |
|---------|------|---------------|
| API Gateway | 4000 | Auth, routing, rate limiting, Swagger docs |
| User Service | 4001 | User management, auth, preferences, Prisma/PostgreSQL |
| Resume Parser | 4002 | PDF/DOCX parsing via pdf-parse & mammoth, LLM extraction |
| LinkedIn Ingestion | 4003 | Data export processing (CSV/ZIP), URL analysis, profile scoring |
| Job Service | 4004 | Job aggregation, semantic matching (Pinecone), scheduled tasks |
| Content Engine | 4005 | AI content generation, strategy planning, template management |
| Recommendation Engine | 4006 | Skill analysis, networking suggestions, career recommendations |
| Analytics Service | 4007 | Event tracking, metrics aggregation, scheduled reports |
| Automation Service | 4008 | BullMQ job queues, outreach campaigns, email via Nodemailer |

### Multi-Agent AI Pattern

The agent system follows a **BaseAgent → Specialized Agent** inheritance pattern:

```
BaseAgent (agent-core)
  ├── System prompt definition
  ├── Tool registration
  ├── OpenAI chat completion loop (max 10 iterations)
  ├── Tool call execution & result aggregation
  ├── JSON output parsing (output, reasoning, confidence)
  └── Token usage tracking

ProfileAgent extends BaseAgent
  ├── Tools: analyze_profile, generate_headlines, rewrite_about, ...
  └── Domain-specific system prompt for profile optimization

JobAgent extends BaseAgent
  ├── Tools: search_jobs, score_match, explain_match, ...
  └── Domain-specific system prompt for job intelligence
  
  ... (4 more specialized agents)
```

Each agent:
1. Receives a task with context (user profile, goals, etc.)
2. The LLM decides which tools to invoke and in what order
3. Tool results are fed back into the conversation
4. The agent iterates until it produces a final structured response
5. Output includes `success`, `output`, `reasoning`, `confidence`, and `toolsUsed`

### API Gateway Pattern

The gateway (`apps/api-gateway`) is the single entry point for all client requests:

- **Authentication** — JWT-based with LinkedIn OAuth2 support via Passport
- **Rate Limiting** — `@nestjs/throttler` with configurable limits per endpoint
- **Security** — Helmet headers, CORS configuration, class-validator input validation
- **Documentation** — Swagger UI auto-generated at `/api/docs`
- **Routing** — Proxies requests to downstream services based on route prefix

### Data Layer

| Store | Purpose | Used By |
|-------|---------|---------|
| **PostgreSQL 16** | Primary relational store — users, jobs, applications, content, events | User Service, Job Service, Analytics |
| **Redis 7** | Caching, session storage, BullMQ job queues | API Gateway, Automation Service |
| **Pinecone** | Vector embeddings for semantic job matching and recommendations | Job Service, Recommendation Engine |

### Shared Packages

| Package | Purpose |
|---------|---------|
| `@career-os/shared-types` | TypeScript interfaces, enums, and API envelope types across all services |
| `@career-os/config` | Zod-validated environment schemas and application constants |
| `@career-os/utils` | Logger (Pino), nanoid generation, `Result<T, E>` type, retry utilities |
| `@career-os/agent-core` | BaseAgent framework, LLMClient (OpenAI), agent execution types |

---

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Frontend** | Next.js | 14.2 |
| | React | 18.3 |
| | TailwindCSS | 3.4 |
| | Zustand | 5.x |
| | React Query (TanStack) | 5.60 |
| | Recharts | latest |
| | Framer Motion | latest |
| **Backend** | NestJS | 10.4 |
| | Prisma ORM | 5.22 |
| | Passport + JWT | latest |
| | class-validator / class-transformer | latest |
| | BullMQ | 5.x |
| **AI / ML** | OpenAI SDK | 4.70 |
| | GPT-4o | — |
| | Pinecone (Vector DB) | 3.x |
| **Data** | PostgreSQL | 16 |
| | Redis | 7 |
| **Infra** | Docker Compose | — |
| | Kubernetes | — |
| | Terraform (AWS) | ~5.0 |
| | ECS Fargate | — |
| | RDS | — |
| **Tooling** | Turborepo | 2.3 |
| | pnpm Workspaces | 9.x |
| | TypeScript | 5.6 |
| | Zod | 3.23 |
| | Pino (logging) | 9.x |
| | Husky + lint-staged | latest |
| | Prettier | 3.3 |

---

## 📁 Project Structure

```
career-os/
├── apps/
│   ├── web/                          # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/                  # App router (layout, providers)
│   │   │   └── components/           # React components
│   │   ├── tailwind.config.ts
│   │   └── next.config.js
│   │
│   └── api-gateway/                  # NestJS API Gateway
│       └── src/
│           ├── config/               # Gateway + service URL config
│           ├── controllers/          # auth, users, profile, jobs, content, agents
│           ├── guards/               # JWT auth guard
│           ├── dto/                  # Request/response DTOs
│           └── main.ts              # Bootstrap (port 4000, Swagger, CORS)
│
├── services/
│   ├── user-service/                 # Auth + user management (Prisma)
│   ├── resume-parser/                # PDF/DOCX → structured data
│   ├── linkedin-ingestion/           # LinkedIn export processing
│   ├── job-service/                  # Job matching + tracking (Pinecone)
│   ├── content-engine/               # AI content generation
│   ├── recommendation-engine/        # Skills + networking recommendations
│   ├── analytics-service/            # Event tracking + reporting
│   └── automation-service/           # Outreach campaigns + scheduling (BullMQ)
│
├── agents/
│   ├── profile-agent/                # Profile optimization AI agent
│   ├── job-agent/                    # Job matching AI agent
│   ├── content-agent/                # Content strategy AI agent
│   ├── outreach-agent/               # Outreach assistance AI agent
│   ├── skill-gap-agent/              # Skill gap analysis AI agent
│   └── trend-agent/                  # Market trend analysis AI agent
│
├── packages/
│   ├── shared-types/                 # TypeScript interfaces + enums
│   ├── config/                       # Zod env validation + constants
│   ├── utils/                        # Logger, IDs, Result type, retry
│   └── agent-core/                   # BaseAgent + LLMClient framework
│
├── infra/
│   ├── docker/
│   │   └── docker-compose.yml        # PostgreSQL 16, Redis 7, pgAdmin
│   ├── k8s/
│   │   ├── namespace.yaml
│   │   ├── ingress.yaml              # api.careeros.dev with TLS
│   │   ├── configmap.yaml
│   │   ├── secrets.yaml
│   │   └── deployments/              # api-gateway, user-service
│   └── terraform/
│       ├── main.tf                   # Provider + backend (S3)
│       ├── vpc.tf                    # VPC, subnets, security groups
│       ├── rds.tf                    # PostgreSQL 16 on RDS
│       ├── ecs.tf                    # Fargate cluster + services
│       ├── variables.tf
│       └── outputs.tf
│
├── docs/
│   ├── ARCHITECTURE.md               # Deep-dive architecture docs
│   └── API.md                        # Full API reference
│
├── turbo.json                        # Turborepo pipeline config
├── pnpm-workspace.yaml               # Workspace package definitions
├── tsconfig.base.json                # Shared TypeScript config
├── .env.example                      # Environment variable template
└── package.json                      # Root scripts + dev dependencies
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20 | Runtime |
| pnpm | ≥ 9 | Package manager |
| Docker | Latest | Infrastructure services |

### 1. Clone the repository

```bash
git clone https://github.com/your-username/career-os.git
cd career-os
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
DATABASE_URL=postgresql://career_os:career_os_dev@localhost:5432/career_os
OPENAI_API_KEY=sk-...

# Optional
REDIS_URL=redis://localhost:6379
PINECONE_API_KEY=...
PINECONE_INDEX=career-os
JWT_SECRET=your-secret-key
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
```

### 4. Start infrastructure

```bash
pnpm docker:up
```

This launches PostgreSQL 16, Redis 7, and pgAdmin via Docker Compose.

| Service | URL |
|---------|-----|
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| pgAdmin | `http://localhost:5050` |

### 5. Run database migrations

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Apply migrations
```

### 6. Start all services

```bash
pnpm dev
```

Turborepo runs all apps, services, and packages in development mode with hot reload.

### 7. Open the application

| App | URL |
|-----|-----|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| API Gateway | [http://localhost:4000/api/v1](http://localhost:4000/api/v1) |
| Swagger Docs | [http://localhost:4000/api/docs](http://localhost:4000/api/docs) |

---

## 📡 API Documentation

All endpoints are prefixed with `/api/v1` and routed through the API Gateway on port 4000. Full API documentation with request/response schemas is available in [docs/API.md](docs/API.md) and via Swagger UI at `/api/docs`.

### Endpoint Summary

| Domain | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Auth** | POST | `/auth/register` | Create account |
| | POST | `/auth/login` | JWT login |
| | POST | `/auth/refresh` | Refresh token |
| | GET | `/auth/linkedin` | LinkedIn OAuth flow |
| | GET | `/auth/me` | Current user |
| **Users** | GET | `/users/me` | Get profile |
| | PATCH | `/users/me` | Update profile |
| | PATCH | `/users/me/career-goals` | Update career goals |
| **Profile** | POST | `/profile/analyze` | AI profile analysis |
| | POST | `/profile/optimize` | Optimize profile sections |
| | POST | `/profile/import` | Import LinkedIn data |
| | GET | `/profile/suggestions` | Get improvement suggestions |
| **Jobs** | GET | `/jobs` | Search jobs |
| | GET | `/jobs/matches` | Semantic job matches |
| | GET | `/jobs/:id` | Job details |
| | POST | `/jobs/:id/apply` | Start application |
| | GET | `/jobs/applications` | List applications |
| | PATCH | `/jobs/applications/:id` | Update application status |
| **Content** | POST | `/content/generate` | Generate content |
| | POST | `/content/rewrite` | Rewrite/improve content |
| | GET | `/content/strategy` | Get content strategy |
| | GET | `/content/templates` | List templates |
| **Agents** | POST | `/agents/tasks` | Submit agent task |
| | GET | `/agents/tasks/:id` | Get task result |
| | DELETE | `/agents/tasks/:id` | Cancel task |
| **Health** | GET | `/health` | Gateway health check |

### Example Request

```bash
curl -X POST http://localhost:4000/api/v1/content/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "post",
    "topic": "Lessons from transitioning to a senior engineering role",
    "tone": "professional",
    "targetAudience": "tech professionals"
  }'
```

---

## 🤖 AI Agents

CareerOS features six specialized AI agents, each built on the `BaseAgent` framework from `@career-os/agent-core`. Agents use OpenAI's GPT-4o with function calling to autonomously reason about tasks and invoke domain-specific tools.

### How Agents Work

```
Task Submitted → BaseAgent.run()
    ↓
Build System Prompt + User Message
    ↓
┌─────────────────────────────┐
│  LLM Call (GPT-4o)          │◄──────────────┐
│  → Analyze context          │               │
│  → Decide: respond or tool? │               │
└──────────┬──────────────────┘               │
           │                                   │
    ┌──────▼──────┐                           │
    │ Tool Call?  │── Yes ──► Execute Tool ────┘
    └──────┬──────┘           Return result
           │ No                (up to 10 iterations)
           ▼
    Parse Final Response
    → { output, reasoning, confidence }
```

### Agent Directory

| Agent | Tools | Description |
|-------|-------|-------------|
| **Profile Agent** | `analyze_profile`, `generate_headlines`, `rewrite_about`, `optimize_experience`, `suggest_skills` | Analyzes LinkedIn profiles and generates optimized content for each section |
| **Job Agent** | `search_jobs`, `score_match`, `explain_match`, `suggest_strategy` | Finds relevant opportunities and explains fit with detailed scoring |
| **Content Agent** | `generate_post_ideas`, `write_post`, `create_content_plan`, `suggest_hooks`, `analyze_trends` | Creates content strategy, writes posts, and identifies trending topics |
| **Outreach Agent** | `draft_cold_email`, `draft_connection_request`, `suggest_networking_targets`, `draft_followup`, `analyze_outreach` | Generates personalized outreach messages and manages networking strategy |
| **Skill Gap Agent** | `analyze_skill_gaps`, `recommend_learning_path`, `prioritize_skills`, `find_resources`, `assess_progress` | Identifies skill gaps against target roles and builds learning roadmaps |
| **Trend Agent** | `analyze_industry_trends`, `monitor_market`, `identify_emerging_skills`, `predict_opportunities`, `generate_report` | Tracks industry movements, emerging technologies, and career opportunities |

---

## 💻 Development

### Running Individual Services

```bash
# Start only the API gateway
pnpm --filter api-gateway dev

# Start only the job service
pnpm --filter job-service dev

# Start multiple specific services
pnpm --filter api-gateway --filter user-service --filter job-service dev
```

### Build

```bash
# Build all packages and services
pnpm build

# Build a specific service
pnpm --filter content-engine build
```

### Lint & Format

```bash
pnpm lint          # ESLint across all packages
pnpm format        # Prettier formatting
```

### Adding a New Service

1. Create a new directory under `services/`:
   ```bash
   mkdir -p services/my-service/src
   ```

2. Initialize with NestJS and add workspace dependencies:
   ```json
   {
     "name": "my-service",
     "dependencies": {
       "@career-os/shared-types": "workspace:*",
       "@career-os/config": "workspace:*",
       "@career-os/utils": "workspace:*"
     }
   }
   ```

3. Set up the NestJS bootstrap in `src/main.ts` with the global prefix:
   ```typescript
   app.setGlobalPrefix('api/v1');
   await app.listen(process.env.PORT || 4009);
   ```

4. Register the service URL in `apps/api-gateway/src/config/gateway.config.ts`

5. Add proxy routes in the appropriate gateway controller

### Coding Standards

- **Strict TypeScript** — `noUncheckedIndexedAccess`, `strictNullChecks`, `noImplicitAny`
- **Zod validation** — All environment variables validated at startup
- **Result type** — Use `Result<T, E>` from `@career-os/utils` for error handling
- **API envelope** — All responses wrapped in `ApiResponse<T>` from `@career-os/shared-types`
- **Pino logging** — Structured JSON logging across all services
- **Husky + lint-staged** — Pre-commit hooks for linting and formatting

---

## 🚢 Deployment

### Docker Compose (Development)

```bash
pnpm docker:up      # Start PostgreSQL, Redis, pgAdmin
pnpm docker:down    # Tear down infrastructure
```

### Kubernetes (Staging / Production)

The `infra/k8s/` directory contains manifests for deploying to any Kubernetes cluster:

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/secrets.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/ingress.yaml
```

- **Ingress** configured for `api.careeros.dev` with TLS via cert-manager
- **Health probes** on each deployment for automated restarts
- **Resource limits** defined per container

### Terraform (AWS)

The `infra/terraform/` directory provisions the full AWS stack:

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

**Provisioned resources:**
- VPC with public/private subnets across 2 AZs
- RDS PostgreSQL 16 (encrypted, private subnet, optional Multi-AZ)
- ECS Fargate cluster with task definitions for api-gateway and user-service
- Security groups with least-privilege networking
- CloudWatch log groups for centralized logging
- S3 backend + DynamoDB locking for state management

---

## 🗺 Roadmap

### Phase 1 — Foundation ✅
- [x] Monorepo setup with Turborepo + pnpm workspaces
- [x] API Gateway with JWT auth and rate limiting
- [x] User service with Prisma ORM
- [x] Resume parser (PDF + DOCX)
- [x] LinkedIn data ingestion
- [x] Shared packages (types, config, utils)
- [x] Docker Compose infrastructure

### Phase 2 — Intelligence 🔄
- [x] Multi-agent framework (BaseAgent + LLMClient)
- [x] 6 specialized AI agents
- [x] Job matching with Pinecone vector search
- [x] Content engine with template system
- [x] Recommendation engine
- [ ] Real-time job search index integration
- [ ] Enhanced semantic matching with fine-tuned embeddings

### Phase 3 — Automation
- [x] BullMQ job queue integration
- [x] Outreach campaign management
- [ ] Email delivery with tracking (open/click rates)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Browser extension for LinkedIn
- [ ] Automated application submission

### Phase 4 — Scale & Polish
- [ ] Full Next.js frontend implementation
- [ ] Real-time notifications (WebSocket)
- [ ] Multi-tenant architecture
- [ ] Graph database for network analysis (Neo4j)
- [ ] Advanced analytics dashboards
- [ ] Mobile app (React Native)
- [ ] Team/enterprise features

### Phase 5 — Advanced AI
- [ ] Agent-to-agent communication protocol
- [ ] Long-term memory with conversation history
- [ ] Fine-tuned models for career domain
- [ ] Voice interface for interview prep
- [ ] Video content analysis
- [ ] Predictive career pathing

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Commit** your changes: `git commit -m "feat: add new feature"`
4. **Push** to the branch: `git push origin feat/my-feature`
5. **Open** a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `refactor:` | Code refactoring |
| `test:` | Adding tests |
| `chore:` | Maintenance |

### Branch Naming

```
feat/description     # New features
fix/description      # Bug fixes
refactor/description # Refactoring
docs/description     # Documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with purpose by engineers who believe careers deserve better tools.**

[⬆ Back to Top](#-careeros)

</div>
