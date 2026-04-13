import OpenAI from "openai";
import pino from "pino";
import {
  BaseAgent,
  type AgentContext,
  type AgentTool,
  type ToolParameters,
} from "@careeros-forge-engine/agent-core";
import type {
  Job,
  ExperienceLevel,
  LinkedInProfile,
  CareerGoals,
} from "@careeros-forge-engine/shared-types";

interface JobSearchResult {
  jobs: ScoredJob[];
  totalFound: number;
  searchCriteria: Record<string, string>;
}

interface ScoredJob {
  jobId: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchBreakdown: MatchBreakdown;
}

interface MatchBreakdown {
  skillMatch: number;
  experienceMatch: number;
  locationMatch: number;
  salaryMatch: number;
  cultureFit: number;
  overallScore: number;
}

interface MatchExplanation {
  jobId: string;
  fitSummary: string;
  strengths: string[];
  gaps: string[];
  dealBreakers: string[];
  recommendation: "strong_match" | "good_match" | "moderate_match" | "weak_match";
}

interface ApplicationStrategy {
  jobId: string;
  approach: string;
  resumeTailoring: string[];
  coverLetterPoints: string[];
  networkingActions: string[];
  timeline: string;
  estimatedSuccessRate: number;
}

export class JobAgent extends BaseAgent {
  constructor(openai: OpenAI, logger?: pino.Logger) {
    super(openai, "job-matcher", logger);
  }

  protected getSystemPrompt(context: AgentContext): string {
    const goals = context.input["careerGoals"] as CareerGoals | undefined;

    return `You are an expert job matching and career strategy AI with deep knowledge of hiring practices, ATS systems, and job market dynamics.

Your expertise includes:
- Semantic job matching beyond keyword overlap
- Understanding hidden requirements in job descriptions
- Predicting culture fit from company signals
- Crafting targeted application strategies
- Identifying patterns in successful job applications

${goals ? `User's career goals:
- Target role: ${goals.targetRole ?? "not specified"}
- Target industries: ${goals.targetIndustry?.join(", ") ?? "not specified"}
- Target companies: ${goals.targetCompanies?.join(", ") ?? "not specified"}
- Salary range: ${goals.salaryRange ? `${goals.salaryRange.currency} ${goals.salaryRange.min}-${goals.salaryRange.max}` : "not specified"}
- Remote preference: ${goals.remotePreference}` : "No career goals provided."}

Guidelines:
1. Go beyond keyword matching — evaluate transferable skills and adjacent experience
2. Consider company stage, culture, and growth trajectory
3. Be honest about gaps — don't oversell weak matches
4. Provide actionable, specific strategies, not generic advice
5. Factor in market timing and hiring trends

You MUST respond with valid JSON containing:
{
  "output": <your structured result>,
  "reasoning": "<explanation of your matching logic>",
  "confidence": <0.0 to 1.0>
}`;
  }

  protected buildUserMessage(context: AgentContext): string {
    const profile = context.input["profile"] as LinkedInProfile | undefined;
    const jobs = context.input["jobs"] as Job[] | undefined;
    const action = (context.input["action"] as string) ?? "match_jobs";
    const targetJobId = context.input["targetJobId"] as string | undefined;

    const parts: string[] = [];
    parts.push(`Action: ${action}`);

    if (profile) {
      parts.push(`\nCandidate Profile:`);
      parts.push(`Headline: ${profile.headline}`);
      parts.push(
        `Skills: ${profile.skills.map((s) => `${s.name} (${s.proficiency})`).join(", ")}`,
      );
      parts.push(`Experience: ${profile.experiences.length} roles`);
      for (const exp of profile.experiences.slice(0, 5)) {
        parts.push(`  - ${exp.title} at ${exp.company}: ${exp.description.slice(0, 200)}`);
      }
    }

    if (jobs && jobs.length > 0) {
      parts.push(`\nJob Listings (${jobs.length}):`);
      for (const job of jobs) {
        parts.push(`\n[${job.id}] ${job.title} at ${job.company}`);
        parts.push(`  Location: ${job.location} | Type: ${job.jobType} | Level: ${job.experienceLevel}`);
        parts.push(`  Skills: ${job.skills.join(", ")}`);
        if (job.salaryRange) {
          parts.push(
            `  Salary: ${job.salaryRange.currency} ${job.salaryRange.min}-${job.salaryRange.max}`,
          );
        }
        parts.push(`  Description: ${job.description.slice(0, 300)}...`);
      }
    }

    if (targetJobId) {
      parts.push(`\nFocus on job ID: ${targetJobId}`);
    }

    return parts.join("\n");
  }

  protected getTools(): AgentTool[] {
    return [
      this.createSearchJobsTool(),
      this.createScoreMatchTool(),
      this.createExplainMatchTool(),
      this.createSuggestStrategyTool(),
    ];
  }

  private createSearchJobsTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for job titles, skills, or keywords",
        },
        location: {
          type: "string",
          description: "Preferred location or 'remote'",
        },
        experienceLevel: {
          type: "string",
          description: "Experience level filter",
          enum: ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"],
        },
        minSalary: {
          type: "string",
          description: "Minimum salary requirement (numeric string)",
        },
        skills: {
          type: "string",
          description: "Comma-separated required skills",
        },
      },
      required: ["query"],
    };

    return {
      name: "search_jobs",
      description:
        "Search job listings by query, location, experience level, salary, and skills. Returns matched jobs sorted by relevance. This connects to the job database/search index.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<JobSearchResult> => {
        const query = params["query"] as string;
        const location = params["location"] as string | undefined;
        const experienceLevel = params["experienceLevel"] as
          | ExperienceLevel
          | undefined;
        const minSalary = params["minSalary"]
          ? parseInt(params["minSalary"] as string, 10)
          : undefined;
        const skills = params["skills"]
          ? (params["skills"] as string).split(",").map((s) => s.trim())
          : [];

        const searchCriteria: Record<string, string> = {
          query,
          ...(location && { location }),
          ...(experienceLevel && { experienceLevel }),
          ...(minSalary !== undefined && {
            minSalary: minSalary.toString(),
          }),
          ...(skills.length > 0 && { skills: skills.join(", ") }),
        };

        // In production, this queries the job search index (Elasticsearch/Typesense)
        // For now, returns a structured placeholder indicating the search was executed
        return {
          jobs: [],
          totalFound: 0,
          searchCriteria,
        };
      },
    };
  }

  private createScoreMatchTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        candidateSkills: {
          type: "string",
          description: "Comma-separated candidate skills",
        },
        candidateExperienceYears: {
          type: "string",
          description: "Total years of relevant experience",
        },
        candidateLocation: {
          type: "string",
          description: "Candidate location",
        },
        candidateSalaryMin: {
          type: "string",
          description: "Candidate minimum salary expectation",
        },
        jobRequiredSkills: {
          type: "string",
          description: "Comma-separated job required skills",
        },
        jobExperienceLevel: {
          type: "string",
          description: "Required experience level",
          enum: ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"],
        },
        jobLocation: {
          type: "string",
          description: "Job location",
        },
        jobSalaryMin: {
          type: "string",
          description: "Job salary minimum",
        },
        jobSalaryMax: {
          type: "string",
          description: "Job salary maximum",
        },
      },
      required: ["candidateSkills", "jobRequiredSkills"],
    };

    return {
      name: "score_match",
      description:
        "Calculate a detailed match score between a candidate and a job. Returns breakdown across skill match, experience fit, location compatibility, salary alignment, and estimated culture fit.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<MatchBreakdown> => {
        const candidateSkills = (params["candidateSkills"] as string)
          .split(",")
          .map((s) => s.trim().toLowerCase());
        const jobSkills = (params["jobRequiredSkills"] as string)
          .split(",")
          .map((s) => s.trim().toLowerCase());

        const matchedSkills = candidateSkills.filter((cs) =>
          jobSkills.some(
            (js) => js.includes(cs) || cs.includes(js),
          ),
        );
        const skillMatch =
          jobSkills.length > 0
            ? Math.round((matchedSkills.length / jobSkills.length) * 100)
            : 50;

        const candidateYears = parseInt(
          (params["candidateExperienceYears"] as string) ?? "0",
          10,
        );
        const levelYearsMap: Record<string, number> = {
          ENTRY: 1,
          MID: 3,
          SENIOR: 6,
          LEAD: 8,
          EXECUTIVE: 12,
        };
        const requiredYears =
          levelYearsMap[
            (params["jobExperienceLevel"] as string) ?? "MID"
          ] ?? 3;
        const experienceRatio = candidateYears / Math.max(1, requiredYears);
        const experienceMatch = Math.min(
          100,
          Math.round(Math.min(experienceRatio, 1.3) * 77),
        );

        const candidateLocation = (
          (params["candidateLocation"] as string) ?? ""
        ).toLowerCase();
        const jobLocation = (
          (params["jobLocation"] as string) ?? ""
        ).toLowerCase();
        let locationMatch = 50;
        if (jobLocation.includes("remote") || candidateLocation === jobLocation) {
          locationMatch = 100;
        } else if (
          candidateLocation &&
          jobLocation &&
          (jobLocation.includes(candidateLocation) ||
            candidateLocation.includes(jobLocation))
        ) {
          locationMatch = 80;
        }

        const candidateSalary = parseInt(
          (params["candidateSalaryMin"] as string) ?? "0",
          10,
        );
        const jobSalaryMax = parseInt(
          (params["jobSalaryMax"] as string) ?? "0",
          10,
        );
        const jobSalaryMin = parseInt(
          (params["jobSalaryMin"] as string) ?? "0",
          10,
        );
        let salaryMatch = 50;
        if (candidateSalary > 0 && jobSalaryMax > 0) {
          if (candidateSalary <= jobSalaryMax && candidateSalary >= jobSalaryMin) {
            salaryMatch = 100;
          } else if (candidateSalary <= jobSalaryMax * 1.1) {
            salaryMatch = 75;
          } else {
            salaryMatch = Math.max(
              0,
              100 - Math.round(((candidateSalary - jobSalaryMax) / jobSalaryMax) * 100),
            );
          }
        }

        const cultureFit = Math.round(
          (skillMatch * 0.4 + experienceMatch * 0.3 + locationMatch * 0.3) *
            0.8,
        );

        const overallScore = Math.round(
          skillMatch * 0.35 +
            experienceMatch * 0.25 +
            locationMatch * 0.15 +
            salaryMatch * 0.15 +
            cultureFit * 0.1,
        );

        return {
          skillMatch,
          experienceMatch,
          locationMatch,
          salaryMatch,
          cultureFit,
          overallScore,
        };
      },
    };
  }

  private createExplainMatchTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        jobId: {
          type: "string",
          description: "Job identifier",
        },
        jobTitle: {
          type: "string",
          description: "Job title",
        },
        overallScore: {
          type: "string",
          description: "Overall match score (0-100)",
        },
        skillMatch: {
          type: "string",
          description: "Skill match score (0-100)",
        },
        matchedSkills: {
          type: "string",
          description: "Comma-separated list of matched skills",
        },
        missingSkills: {
          type: "string",
          description: "Comma-separated list of missing required skills",
        },
        experienceMatch: {
          type: "string",
          description: "Experience match score (0-100)",
        },
        salaryMatch: {
          type: "string",
          description: "Salary match score (0-100)",
        },
      },
      required: ["jobId", "jobTitle", "overallScore"],
    };

    return {
      name: "explain_match",
      description:
        "Generate a detailed, human-readable explanation of why a job is or isn't a good fit. Includes strengths, gaps, deal-breakers, and an overall recommendation category.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<MatchExplanation> => {
        const jobId = params["jobId"] as string;
        const jobTitle = params["jobTitle"] as string;
        const overallScore = parseInt(params["overallScore"] as string, 10);
        const skillMatchScore = parseInt((params["skillMatch"] as string) ?? "50", 10);
        const matchedSkills = params["matchedSkills"]
          ? (params["matchedSkills"] as string).split(",").map((s) => s.trim())
          : [];
        const missingSkills = params["missingSkills"]
          ? (params["missingSkills"] as string).split(",").map((s) => s.trim())
          : [];
        const salaryMatchScore = parseInt(
          (params["salaryMatch"] as string) ?? "50",
          10,
        );

        const strengths: string[] = [];
        const gaps: string[] = [];
        const dealBreakers: string[] = [];

        if (matchedSkills.length > 0) {
          strengths.push(
            `Strong skill alignment: ${matchedSkills.join(", ")}`,
          );
        }
        if (skillMatchScore >= 80) {
          strengths.push("Excellent technical skill coverage for this role");
        }
        if (overallScore >= 70) {
          strengths.push("Well-rounded match across multiple dimensions");
        }

        if (missingSkills.length > 0 && missingSkills.length <= 3) {
          gaps.push(
            `Minor skill gaps: ${missingSkills.join(", ")} — learnable within 1-3 months`,
          );
        } else if (missingSkills.length > 3) {
          gaps.push(
            `Significant skill gaps: ${missingSkills.join(", ")} — would require substantial upskilling`,
          );
        }

        if (salaryMatchScore < 30) {
          dealBreakers.push(
            "Salary expectations significantly exceed the posted range",
          );
        }
        if (skillMatchScore < 30) {
          dealBreakers.push(
            "Core required skills are largely missing from candidate profile",
          );
        }

        let recommendation: MatchExplanation["recommendation"];
        if (overallScore >= 80) recommendation = "strong_match";
        else if (overallScore >= 65) recommendation = "good_match";
        else if (overallScore >= 45) recommendation = "moderate_match";
        else recommendation = "weak_match";

        const fitSummary =
          overallScore >= 70
            ? `This ${jobTitle} role is a strong fit. Your experience and skills align well with the core requirements.`
            : overallScore >= 50
              ? `This ${jobTitle} role is a reasonable fit with some gaps to address. With targeted preparation, you could be competitive.`
              : `This ${jobTitle} role has significant mismatches. Consider whether the role is worth pursuing or if adjacent positions might be better targets.`;

        return {
          jobId,
          fitSummary,
          strengths,
          gaps,
          dealBreakers,
          recommendation,
        };
      },
    };
  }

  private createSuggestStrategyTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        jobId: {
          type: "string",
          description: "Target job identifier",
        },
        jobTitle: {
          type: "string",
          description: "Job title",
        },
        company: {
          type: "string",
          description: "Company name",
        },
        matchScore: {
          type: "string",
          description: "Overall match score (0-100)",
        },
        matchedSkills: {
          type: "string",
          description: "Comma-separated matched skills",
        },
        missingSkills: {
          type: "string",
          description: "Comma-separated missing skills",
        },
        candidateStrengths: {
          type: "string",
          description: "Comma-separated key candidate strengths",
        },
      },
      required: ["jobId", "jobTitle", "company", "matchScore"],
    };

    return {
      name: "suggest_strategy",
      description:
        "Create a tailored application strategy for a specific job, including resume tailoring tips, cover letter talking points, networking actions, and a timeline.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<ApplicationStrategy> => {
        const jobId = params["jobId"] as string;
        const jobTitle = params["jobTitle"] as string;
        const company = params["company"] as string;
        const matchScore = parseInt(params["matchScore"] as string, 10);
        const matchedSkills = params["matchedSkills"]
          ? (params["matchedSkills"] as string).split(",").map((s) => s.trim())
          : [];
        const missingSkills = params["missingSkills"]
          ? (params["missingSkills"] as string).split(",").map((s) => s.trim())
          : [];
        const strengths = params["candidateStrengths"]
          ? (params["candidateStrengths"] as string)
              .split(",")
              .map((s) => s.trim())
          : [];

        let approach: string;
        if (matchScore >= 80) {
          approach = `Direct application with confidence. Your profile strongly matches this ${jobTitle} role at ${company}. Lead with your ${matchedSkills.slice(0, 3).join(", ")} expertise.`;
        } else if (matchScore >= 60) {
          approach = `Strategic application with targeted positioning. Bridge gaps by emphasizing transferable skills and adjacent experience. Consider getting a warm introduction.`;
        } else {
          approach = `Network-first approach. Build connections at ${company} before applying. Use informational interviews to learn about the team and demonstrate your potential.`;
        }

        const resumeTailoring: string[] = [];
        if (matchedSkills.length > 0) {
          resumeTailoring.push(
            `Move ${matchedSkills.slice(0, 3).join(", ")} to the top of your skills section`,
          );
        }
        resumeTailoring.push(
          `Mirror the job description language for ${jobTitle} in your summary`,
        );
        if (missingSkills.length > 0) {
          resumeTailoring.push(
            `Add any tangential experience with ${missingSkills.slice(0, 2).join(", ")} — even side projects count`,
          );
        }
        resumeTailoring.push(
          "Quantify top 3 achievements with specific metrics (%, $, time saved)",
        );

        const coverLetterPoints: string[] = [
          `Open with why ${company} specifically excites you (reference recent news, product, or mission)`,
          `Highlight your strongest overlap: ${strengths.slice(0, 2).join(" and ") || "relevant experience"}`,
        ];
        if (missingSkills.length > 0) {
          coverLetterPoints.push(
            `Proactively address skill gaps: frame ${missingSkills[0]} as something you're actively developing`,
          );
        }
        coverLetterPoints.push(
          "Close with a specific value proposition — what you'll achieve in the first 90 days",
        );

        const networkingActions: string[] = [
          `Search LinkedIn for current ${company} employees in similar roles — send 3 personalized connection requests`,
          `Look for ${company} alumni from your school or previous companies`,
          `Check if any 2nd-degree connections can provide a referral`,
        ];
        if (matchScore < 70) {
          networkingActions.push(
            `Request an informational interview to learn about the ${jobTitle} team before applying`,
          );
        }

        const timeline =
          matchScore >= 80
            ? "Apply within 48 hours — you're well-positioned and speed matters"
            : matchScore >= 60
              ? "1-week preparation: tailor resume, initiate networking, then apply"
              : "2-week strategy: network first, gather intelligence, then submit a tailored application";

        const estimatedSuccessRate =
          matchScore >= 80
            ? Math.min(0.45, matchScore / 200)
            : matchScore >= 60
              ? Math.min(0.25, matchScore / 300)
              : Math.min(0.1, matchScore / 500);

        return {
          jobId,
          approach,
          resumeTailoring,
          coverLetterPoints,
          networkingActions,
          timeline,
          estimatedSuccessRate: Math.round(estimatedSuccessRate * 100) / 100,
        };
      },
    };
  }
}
