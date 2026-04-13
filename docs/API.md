# CareerOS Forge Engine — API Reference

> Complete API documentation for all CareerOS Forge Engine microservices.
> All endpoints are prefixed with `/api/v1` and routed through the API Gateway at `http://localhost:4000`.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints by Service](#endpoints-by-service)
  - [Auth](#auth)
  - [Users](#users)
  - [Profile](#profile)
  - [Resume Parser](#resume-parser)
  - [LinkedIn Ingestion](#linkedin-ingestion)
  - [Jobs](#jobs)
  - [Job Matching](#job-matching)
  - [Job Tracking](#job-tracking)
  - [Content Generation](#content-generation)
  - [Content Strategy](#content-strategy)
  - [Content Templates](#content-templates)
  - [Skill Recommendations](#skill-recommendations)
  - [Networking Recommendations](#networking-recommendations)
  - [Analytics — Tracking](#analytics--tracking)
  - [Analytics — Feedback](#analytics--feedback)
  - [Analytics — Reports](#analytics--reports)
  - [Automation — Outreach](#automation--outreach)
  - [Automation — Scheduling](#automation--scheduling)
  - [Automation — Applications](#automation--applications)
  - [Agents](#agents)
  - [Health](#health)

---

## Overview

| Property | Value |
|----------|-------|
| **Base URL** | `http://localhost:4000/api/v1` |
| **Protocol** | HTTP (HTTPS in production) |
| **Content-Type** | `application/json` |
| **Auth** | Bearer JWT token in `Authorization` header |
| **Docs UI** | `http://localhost:4000/api/docs` (Swagger) |

### Service Ports (Direct Access)

| Service | Port | Prefix |
|---------|------|--------|
| API Gateway | 4000 | `/api/v1` |
| User Service | 4001 | `/api/v1` |
| Resume Parser | 4002 | `/api/v1` |
| LinkedIn Ingestion | 4003 | `/api/v1` |
| Job Service | 4004 | `/api/v1` |
| Content Engine | 4005 | `/api/v1` |
| Recommendation Engine | 4006 | `/api/v1` |
| Analytics Service | 4007 | `/api/v1` |
| Automation Service | 4008 | `/api/v1` |

---

## Authentication

Most endpoints require a valid JWT token. Obtain one via `/auth/login` or `/auth/register`.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Public endpoints** (no auth required):
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/linkedin`
- `GET /auth/linkedin/callback`
- `GET /health`
- `GET /parse/supported-formats`

---

## Response Format

### Success Response

All successful responses are wrapped in the `ApiResponse<T>` envelope:

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2026-04-13T12:00:00.000Z",
    "requestId": "req_abc123",
    "version": "v1"
  }
}
```

### Paginated Response

List endpoints return `PaginatedResponse<T>`:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  },
  "metadata": { ... }
}
```

---

## Error Handling

Errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "constraint": "isEmail"
    }
  },
  "metadata": { ... }
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body or parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Resource already exists (e.g., duplicate email) |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Rate Limiting

The API Gateway enforces rate limits via `@nestjs/throttler`:

| Tier | Limit | Window |
|------|-------|--------|
| Default | 100 requests | 60 seconds |
| Auth endpoints | 10 requests | 60 seconds |
| AI generation | 20 requests | 60 seconds |

When rate limited, the response includes:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

---

## Endpoints by Service

---

### Auth

Handles user registration, login, token refresh, and LinkedIn OAuth.

**Service:** User Service (`:4001`) via Gateway

#### `POST /auth/register`

Create a new user account.

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secureP@ssw0rd",
    "firstName": "Jane",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2026-04-13T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

#### `POST /auth/login`

Authenticate and receive JWT tokens.

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secureP@ssw0rd"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 3600
  }
}
```

#### `POST /auth/refresh`

Refresh an expired access token.

```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOi..."
  }'
```

#### `GET /auth/linkedin`

Initiates LinkedIn OAuth2 flow. Redirects the user to LinkedIn's authorization page.

#### `GET /auth/linkedin/callback`

Handles the OAuth callback from LinkedIn. Exchanges the authorization code for user profile data, creates or links the account, and returns JWT tokens.

#### `GET /auth/me`

Returns the currently authenticated user.

```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

### Users

User profile and preferences management.

**Service:** User Service (`:4001`) via Gateway

#### `GET /users/me`

Get the authenticated user's full profile.

```bash
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "user",
    "careerGoals": {
      "targetRole": "Senior Software Engineer",
      "targetIndustry": "Technology",
      "remotePreference": "remote",
      "salaryRange": { "min": 150000, "max": 200000 }
    },
    "createdAt": "2026-04-13T12:00:00.000Z",
    "updatedAt": "2026-04-13T14:30:00.000Z"
  }
}
```

#### `PATCH /users/me`

Update user profile fields.

```bash
curl -X PATCH http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

#### `PATCH /users/me/career-goals`

Update career goals.

```bash
curl -X PATCH http://localhost:4000/api/v1/users/me/career-goals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Engineering Manager",
    "targetIndustry": "FinTech",
    "remotePreference": "hybrid",
    "salaryRange": { "min": 180000, "max": 250000 }
  }'
```

#### `DELETE /users/me`

Delete the authenticated user's account.

#### `GET /users/:id` *(service-level)*

Get a user by ID. Available on the User Service directly (`:4001`).

#### `GET /users/preferences` *(service-level)*

Get user notification and display preferences.

#### `PATCH /users/preferences` *(service-level)*

Update user preferences.

---

### Profile

LinkedIn profile analysis, optimization, and import.

**Service:** LinkedIn Ingestion (`:4003`) via Gateway

#### `POST /profile/analyze`

Analyze a LinkedIn profile with AI-powered scoring.

```bash
curl -X POST http://localhost:4000/api/v1/profile/analyze \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "profileUrl": "https://linkedin.com/in/janedoe",
    "targetRole": "Senior Software Engineer"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 72,
    "breakdown": {
      "headline": { "score": 65, "feedback": "Too generic — missing target role keywords" },
      "about": { "score": 78, "feedback": "Good narrative but lacks quantified impact" },
      "experience": { "score": 80, "feedback": "Strong bullet points, consider adding metrics" },
      "skills": { "score": 60, "feedback": "Missing 5 key skills for target role" },
      "education": { "score": 85, "feedback": "Well documented" }
    },
    "recommendations": [
      "Add 'distributed systems' to your skills section",
      "Rewrite headline to include target role: 'Senior Software Engineer'",
      "Quantify impact in your most recent role"
    ]
  }
}
```

#### `POST /profile/optimize`

Generate optimized versions of profile sections.

```bash
curl -X POST http://localhost:4000/api/v1/profile/optimize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "headline",
    "current": "Software Engineer at TechCorp",
    "targetRole": "Senior Software Engineer",
    "industry": "Technology"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "optimized": "Senior Software Engineer | Distributed Systems & Cloud Architecture | Building scalable platforms at TechCorp",
    "alternatives": [
      "Software Engineer → Senior SWE | Passionate about system design & developer experience",
      "Senior Software Engineer | Full-Stack TypeScript | Cloud-Native Architecture"
    ],
    "reasoning": "Added target role, key technical skills, and value proposition"
  }
}
```

#### `POST /profile/import`

Import LinkedIn data from an export file (ZIP/CSV).

```bash
curl -X POST http://localhost:4000/api/v1/profile/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@linkedin-export.zip"
```

#### `GET /profile/suggestions`

Get personalized profile improvement suggestions.

```bash
curl http://localhost:4000/api/v1/profile/suggestions \
  -H "Authorization: Bearer <token>"
```

---

### Resume Parser

PDF and DOCX resume parsing with AI extraction.

**Service:** Resume Parser (`:4002`)

#### `POST /parse`

Parse a resume file (PDF or DOCX) into structured data.

```bash
curl -X POST http://localhost:4002/api/v1/parse \
  -H "Authorization: Bearer <token>" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personalInfo": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1-555-0123",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/janedoe"
    },
    "experience": [
      {
        "title": "Software Engineer",
        "company": "TechCorp",
        "startDate": "2022-01",
        "endDate": "present",
        "description": "Led migration of monolith to microservices...",
        "highlights": [
          "Reduced deployment time by 60%",
          "Designed event-driven architecture serving 50K RPM"
        ]
      }
    ],
    "education": [
      {
        "degree": "BS Computer Science",
        "institution": "Stanford University",
        "graduationDate": "2022"
      }
    ],
    "skills": ["TypeScript", "Python", "Kubernetes", "PostgreSQL", "React"],
    "certifications": [
      { "name": "AWS Solutions Architect Associate", "issuer": "Amazon", "date": "2024" }
    ],
    "projects": [
      {
        "name": "Open Source Contribution",
        "description": "Core contributor to distributed task queue library",
        "url": "https://github.com/example/project"
      }
    ]
  }
}
```

#### `POST /parse/text`

Parse resume from raw text input (instead of file upload).

```bash
curl -X POST http://localhost:4002/api/v1/parse/text \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Jane Doe\nSoftware Engineer\n..."
  }'
```

#### `GET /parse/supported-formats`

List supported file formats for parsing.

```bash
curl http://localhost:4002/api/v1/parse/supported-formats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "formats": ["pdf", "docx"],
    "maxFileSize": "10MB"
  }
}
```

---

### LinkedIn Ingestion

LinkedIn data export processing and analysis.

**Service:** LinkedIn Ingestion (`:4003`)

#### `POST /ingest/export`

Ingest a LinkedIn data export (ZIP archive).

```bash
curl -X POST http://localhost:4003/api/v1/ingest/export \
  -H "Authorization: Bearer <token>" \
  -F "file=@linkedin-data.zip"
```

#### `POST /ingest/text`

Ingest LinkedIn profile from pasted text.

#### `POST /ingest/url`

Analyze a LinkedIn profile by URL.

```bash
curl -X POST http://localhost:4003/api/v1/ingest/url \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://linkedin.com/in/janedoe"
  }'
```

#### `POST /ingest/analyze`

Run comprehensive analysis on ingested profile data.

#### `GET /ingest/analysis/:userId`

Retrieve stored analysis results for a user.

#### `POST /network/analyze`

Analyze LinkedIn network connections for insights.

```bash
curl -X POST http://localhost:4003/api/v1/network/analyze \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usr_abc123"
  }'
```

#### `POST /activity/analyze`

Analyze LinkedIn activity (posts, engagement) patterns.

---

### Jobs

Job search, listing, and discovery.

**Service:** Job Service (`:4004`)

#### `GET /jobs`

Search and list jobs with filters.

```bash
curl "http://localhost:4000/api/v1/jobs?query=senior+engineer&location=remote&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `query` | string | Search term |
| `location` | string | Location or "remote" |
| `type` | string | `full-time`, `contract`, `part-time` |
| `level` | string | `junior`, `mid`, `senior`, `lead`, `principal` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |

#### `GET /jobs/trends`

Get job market trend data.

```bash
curl http://localhost:4004/api/v1/jobs/trends \
  -H "Authorization: Bearer <token>"
```

#### `GET /jobs/:id`

Get full details for a specific job.

#### `POST /jobs`

Create a job listing (admin/internal use).

---

### Job Matching

Semantic job matching powered by Pinecone vector search.

**Service:** Job Service (`:4004`)

#### `GET /matching/:userId`

Get semantically matched jobs for a user based on their profile and career goals.

```bash
curl http://localhost:4004/api/v1/matching/usr_abc123 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "job": {
          "id": "job_xyz789",
          "title": "Senior Software Engineer",
          "company": "InnovateCo",
          "location": "Remote",
          "salary": { "min": 160000, "max": 200000 }
        },
        "score": 0.92,
        "matchReasons": [
          "Strong alignment with TypeScript and distributed systems experience",
          "Remote preference matches",
          "Salary range overlaps with target"
        ]
      }
    ]
  }
}
```

#### `GET /matching/:userId/explain/:jobId`

Get a detailed explanation of why a specific job matches the user.

```bash
curl http://localhost:4004/api/v1/matching/usr_abc123/explain/job_xyz789 \
  -H "Authorization: Bearer <token>"
```

#### `POST /matching/score`

Score a specific user-job combination.

```bash
curl -X POST http://localhost:4004/api/v1/matching/score \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usr_abc123",
    "jobId": "job_xyz789"
  }'
```

---

### Job Tracking

Application pipeline management.

**Service:** Job Service (`:4004`)

#### `POST /tracking/applications`

Start tracking a job application.

```bash
curl -X POST http://localhost:4004/api/v1/tracking/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_xyz789",
    "status": "applied",
    "notes": "Applied via company website"
  }'
```

#### `GET /tracking/applications`

List all tracked applications for the authenticated user.

```bash
curl http://localhost:4004/api/v1/tracking/applications \
  -H "Authorization: Bearer <token>"
```

#### `PATCH /tracking/applications/:id`

Update application status.

```bash
curl -X PATCH http://localhost:4004/api/v1/tracking/applications/app_123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "interview_scheduled",
    "notes": "Technical interview on Friday"
  }'
```

**Application statuses:** `saved` → `applied` → `screening` → `interview_scheduled` → `interviewing` → `offer` → `accepted` / `rejected` / `withdrawn`

#### `GET /tracking/stats`

Get application pipeline statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 24,
    "byStatus": {
      "saved": 5,
      "applied": 8,
      "screening": 3,
      "interview_scheduled": 2,
      "interviewing": 4,
      "offer": 1,
      "rejected": 1
    },
    "responseRate": 0.58,
    "averageDaysToResponse": 4.2
  }
}
```

---

### Content Generation

AI-powered content creation for LinkedIn.

**Service:** Content Engine (`:4005`)

#### `POST /generate/post`

Generate a LinkedIn post.

```bash
curl -X POST http://localhost:4005/api/v1/generate/post \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Lessons learned migrating from monolith to microservices",
    "tone": "conversational",
    "targetAudience": "software engineers",
    "includeHashtags": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Last year, I led a monolith-to-microservices migration.\n\nHere are 5 things I wish I'd known before we started:\n\n1. Start with the strangler fig pattern...\n\n#SoftwareEngineering #Microservices #TechLeadership",
    "wordCount": 245,
    "estimatedReadTime": "1 min",
    "hooks": [
      "Last year, I led a monolith-to-microservices migration.",
      "We broke our monolith into 12 services. Here's what happened."
    ]
  }
}
```

#### `POST /generate/headline`

Generate optimized LinkedIn headlines.

```bash
curl -X POST http://localhost:4005/api/v1/generate/headline \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentRole": "Software Engineer",
    "targetRole": "Senior Software Engineer",
    "skills": ["TypeScript", "distributed systems", "cloud architecture"],
    "count": 5
  }'
```

#### `POST /generate/about`

Generate LinkedIn About section copy.

#### `POST /generate/experience`

Generate experience bullet points.

```bash
curl -X POST http://localhost:4005/api/v1/generate/experience \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "company": "TechCorp",
    "responsibilities": "Built backend services, led code reviews, mentored juniors",
    "impact": "Reduced latency by 40%, scaled to 50K RPM"
  }'
```

#### `POST /generate/cold-email`

Draft a professional cold email.

```bash
curl -X POST http://localhost:4005/api/v1/generate/cold-email \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Sarah Chen",
    "recipientRole": "VP of Engineering",
    "company": "InnovateCo",
    "purpose": "expressing interest in senior engineering roles",
    "context": "We both attended the same distributed systems conference"
  }'
```

#### `POST /generate/rewrite`

Rewrite and improve existing content.

```bash
curl -X POST http://localhost:4005/api/v1/generate/rewrite \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I am a software engineer with 5 years of experience.",
    "goal": "Make it more compelling and specific",
    "tone": "professional"
  }'
```

---

### Content Strategy

Content planning and analysis.

**Service:** Content Engine (`:4005`)

#### `POST /strategy/calendar`

Generate a content calendar.

```bash
curl -X POST http://localhost:4005/api/v1/strategy/calendar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "weeks": 4,
    "postsPerWeek": 3,
    "themes": ["technical leadership", "career growth", "distributed systems"],
    "targetAudience": "senior engineers"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calendar": [
      {
        "week": 1,
        "posts": [
          {
            "day": "Monday",
            "topic": "How I approach system design interviews",
            "type": "story",
            "theme": "career growth"
          },
          {
            "day": "Wednesday",
            "topic": "The real cost of microservices",
            "type": "opinion",
            "theme": "technical leadership"
          },
          {
            "day": "Friday",
            "topic": "3 patterns every senior engineer should know",
            "type": "listicle",
            "theme": "distributed systems"
          }
        ]
      }
    ]
  }
}
```

#### `POST /strategy/analyze`

Analyze content performance patterns.

#### `POST /strategy/topics`

Get trending topic suggestions for your niche.

---

### Content Templates

Pre-built content templates.

**Service:** Content Engine (`:4005`)

#### `GET /templates`

List all available templates.

```bash
curl http://localhost:4005/api/v1/templates \
  -H "Authorization: Bearer <token>"
```

#### `GET /templates/categories`

List template categories.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      "thought-leadership",
      "case-study",
      "career-story",
      "technical-tutorial",
      "industry-insight",
      "engagement-hook"
    ]
  }
}
```

#### `GET /templates/:id`

Get a specific template with placeholders.

---

### Skill Recommendations

AI-powered skill analysis and learning paths.

**Service:** Recommendation Engine (`:4006`)

#### `POST /skills/analyze`

Analyze current skills against target role requirements.

```bash
curl -X POST http://localhost:4006/api/v1/skills/analyze \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentSkills": ["TypeScript", "React", "Node.js", "PostgreSQL"],
    "targetRole": "Senior Software Engineer",
    "targetIndustry": "FinTech"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallReadiness": 0.68,
    "gaps": [
      {
        "skill": "System Design",
        "importance": "critical",
        "currentLevel": "intermediate",
        "requiredLevel": "advanced",
        "priority": 1
      },
      {
        "skill": "Kubernetes",
        "importance": "high",
        "currentLevel": "beginner",
        "requiredLevel": "intermediate",
        "priority": 2
      }
    ],
    "strengths": [
      { "skill": "TypeScript", "level": "advanced", "relevance": "high" },
      { "skill": "React", "level": "advanced", "relevance": "medium" }
    ]
  }
}
```

#### `POST /skills/recommend`

Get personalized skill development recommendations.

#### `POST /skills/certifications`

Get certification recommendations aligned with career goals.

```bash
curl -X POST http://localhost:4006/api/v1/skills/certifications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentSkills": ["AWS", "Docker", "Kubernetes"],
    "targetRole": "Cloud Architect",
    "budget": "medium"
  }'
```

#### `POST /skills/projects`

Get project suggestions to build specific skills.

---

### Networking Recommendations

Networking strategy and connection suggestions.

**Service:** Recommendation Engine (`:4006`)

#### `POST /recommendations/topics`

Get recommended content topics based on goals.

#### `POST /recommendations/people`

Get suggested people to connect with.

```bash
curl -X POST http://localhost:4006/api/v1/recommendations/people \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Senior Software Engineer",
    "industry": "Technology",
    "goals": ["mentorship", "referrals"]
  }'
```

#### `POST /recommendations/companies`

Get recommended companies to target.

#### `POST /networking/connections`

Analyze existing connections for opportunities.

#### `POST /networking/strategy`

Generate a networking strategy.

```bash
curl -X POST http://localhost:4006/api/v1/networking/strategy \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Engineering Manager",
    "timeline": "6 months",
    "currentNetwork": { "size": 500, "industryRelevance": 0.4 }
  }'
```

---

### Analytics — Tracking

Event tracking and metrics.

**Service:** Analytics Service (`:4007`)

#### `POST /tracking/events`

Track a career event.

```bash
curl -X POST http://localhost:4007/api/v1/tracking/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "application_submitted",
    "payload": {
      "jobId": "job_xyz789",
      "company": "InnovateCo",
      "method": "direct"
    }
  }'
```

#### `GET /tracking/events`

List tracked events with filters.

```bash
curl "http://localhost:4007/api/v1/tracking/events?type=application_submitted&from=2026-04-01" \
  -H "Authorization: Bearer <token>"
```

#### `GET /tracking/metrics/:userId`

Get aggregated metrics for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "careerScore": 74,
    "profileCompleteness": 0.85,
    "applicationsThisMonth": 12,
    "interviewRate": 0.42,
    "contentEngagement": {
      "postsThisMonth": 8,
      "avgLikes": 45,
      "avgComments": 12
    },
    "networkGrowth": {
      "newConnections": 23,
      "meaningfulInteractions": 15
    }
  }
}
```

---

### Analytics — Feedback

Feedback collection and analysis.

**Service:** Analytics Service (`:4007`)

#### `POST /feedback`

Submit feedback on a career interaction.

```bash
curl -X POST http://localhost:4007/api/v1/feedback \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "interview",
    "rating": 4,
    "notes": "Good cultural fit discussion, technical round was challenging",
    "relatedJobId": "job_xyz789"
  }'
```

#### `GET /feedback/analysis/:userId`

Get sentiment and theme analysis of all feedback.

---

### Analytics — Reports

Automated reporting.

**Service:** Analytics Service (`:4007`)

#### `GET /reports/weekly/:userId`

Get the weekly career progress report.

```bash
curl http://localhost:4007/api/v1/reports/weekly/usr_abc123 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { "start": "2026-04-07", "end": "2026-04-13" },
    "summary": "Strong week with 3 new applications and 1 interview scheduled",
    "highlights": [
      "Applied to 3 senior engineering roles",
      "Published 2 LinkedIn posts (avg 67 likes)",
      "Completed AWS certification module"
    ],
    "metrics": {
      "careerScore": { "current": 74, "change": 3 },
      "applications": { "submitted": 3, "responses": 1 },
      "content": { "posts": 2, "engagement": 134 },
      "networking": { "connections": 5, "messages": 8 }
    },
    "recommendations": [
      "Follow up with InnovateCo recruiter",
      "Publish a post about your AWS learning journey",
      "Connect with 3 engineering managers at target companies"
    ]
  }
}
```

#### `GET /reports/progress/:userId`

Get long-term career progress tracking.

---

### Automation — Outreach

Campaign management and execution.

**Service:** Automation Service (`:4008`)

#### `POST /outreach/campaigns`

Create an outreach campaign.

```bash
curl -X POST http://localhost:4008/api/v1/outreach/campaigns \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FinTech Engineering Manager Outreach",
    "targets": [
      {
        "name": "Sarah Chen",
        "role": "VP of Engineering",
        "company": "InnovateCo",
        "email": "sarah@innovateco.com"
      }
    ],
    "template": "cold-email",
    "steps": [
      { "type": "email", "delayDays": 0, "template": "initial_outreach" },
      { "type": "email", "delayDays": 5, "template": "followup" }
    ]
  }'
```

#### `POST /outreach/campaigns/:id/execute`

Trigger execution of a campaign (enqueues jobs via BullMQ).

#### `GET /outreach/campaigns`

List all campaigns with status.

#### `GET /outreach/history/:userId`

Get outreach history and results.

---

### Automation — Scheduling

Reminders and scheduling management.

**Service:** Automation Service (`:4008`)

#### `POST /scheduling/reminders`

Create a reminder.

```bash
curl -X POST http://localhost:4008/api/v1/scheduling/reminders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Follow up with InnovateCo",
    "dueDate": "2026-04-18T10:00:00Z",
    "type": "follow_up",
    "relatedJobId": "job_xyz789"
  }'
```

#### `GET /scheduling/reminders`

List active reminders.

#### `PATCH /scheduling/reminders/:id`

Update or dismiss a reminder.

#### `POST /scheduling/schedules`

Create a recurring schedule (e.g., weekly content publishing).

#### `GET /scheduling/schedules`

List active schedules.

---

### Automation — Applications

Application preparation and tracking.

**Service:** Automation Service (`:4008`)

#### `POST /applications/prepare`

Prepare application materials for a specific job.

```bash
curl -X POST http://localhost:4008/api/v1/applications/prepare \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_xyz789",
    "userId": "usr_abc123",
    "includeResumeTailoring": true,
    "includeCoverLetter": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tailoredResume": {
      "highlights": ["Emphasized distributed systems experience", "Added FinTech keywords"],
      "suggestedChanges": [
        "Move Kubernetes experience to first bullet",
        "Add quantified impact for payment processing project"
      ]
    },
    "coverLetter": "Dear Hiring Team at InnovateCo...",
    "applicationChecklist": [
      "Update resume with suggested changes",
      "Customize cover letter greeting",
      "Research recent InnovateCo news for interview prep"
    ]
  }
}
```

#### `POST /applications/track`

Track an application submission.

#### `GET /applications/insights/:userId`

Get application insights and patterns.

---

### Agents

Submit tasks to AI agents and retrieve results.

**Service:** API Gateway (`:4000`)

#### `POST /agents/tasks`

Submit a task to a specific AI agent.

```bash
curl -X POST http://localhost:4000/api/v1/agents/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "profile",
    "priority": "high",
    "input": {
      "action": "analyze",
      "profile": {
        "headline": "Software Engineer at TechCorp",
        "about": "Passionate about building great software...",
        "experience": [...],
        "skills": ["TypeScript", "React", "Node.js"]
      },
      "targetRole": "Senior Software Engineer"
    }
  }'
```

**Agent types:** `profile`, `job`, `content`, `outreach`, `skill-gap`, `trend`

**Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "task_abc123",
    "agentType": "profile",
    "status": "completed",
    "result": {
      "success": true,
      "output": { ... },
      "reasoning": "Analyzed profile sections against target role requirements...",
      "confidence": 0.87,
      "suggestedActions": [
        {
          "type": "optimize_headline",
          "description": "Rewrite headline to include target role",
          "priority": "high"
        }
      ]
    },
    "tokenUsage": {
      "promptTokens": 1250,
      "completionTokens": 890,
      "totalTokens": 2140
    },
    "durationMs": 3450
  }
}
```

#### `GET /agents/tasks/:id`

Get the status and result of an agent task.

```bash
curl http://localhost:4000/api/v1/agents/tasks/task_abc123 \
  -H "Authorization: Bearer <token>"
```

#### `DELETE /agents/tasks/:id`

Cancel a pending or running agent task.

---

### Health

System health checks.

#### `GET /health`

API Gateway health check.

```bash
curl http://localhost:4000/api/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-13T12:00:00.000Z",
  "uptime": 86400,
  "version": "0.1.0"
}
```

---

## SDK Usage (TypeScript)

For TypeScript clients, the shared types package provides full type safety:

```typescript
import type { ApiResponse, Job, PaginatedResponse } from '@careeros-forge/shared-types';

const response = await fetch('/api/v1/jobs?query=engineer');
const data: PaginatedResponse<Job> = await response.json();

data.data.forEach(job => {
  console.log(job.title, job.company);
});
```

---

## Swagger UI

Interactive API documentation is available when the API Gateway is running:

```
http://localhost:4000/api/docs
```

The Swagger UI provides:
- Interactive endpoint testing
- Request/response schema visualization
- Authentication token input
- Auto-generated from NestJS decorators

---

*Last updated: April 2026*
