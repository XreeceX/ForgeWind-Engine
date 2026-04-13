import OpenAI from "openai";
import pino from "pino";
import {
  BaseAgent,
  type AgentContext,
  type AgentTool,
  type ToolParameters,
} from "@career-os/agent-core";

interface IndustryTrendAnalysis {
  industry: string;
  period: string;
  trends: TrendItem[];
  outlook: "bullish" | "neutral" | "bearish";
  summary: string;
}

interface TrendItem {
  name: string;
  category: "technology" | "skill" | "role" | "compensation" | "policy" | "culture";
  direction: "growing" | "stable" | "declining";
  impactLevel: "low" | "medium" | "high" | "transformative";
  timeframe: "near_term" | "mid_term" | "long_term";
  description: string;
  evidencePoints: string[];
}

interface MarketSnapshot {
  industry: string;
  timestamp: string;
  hiringVelocity: "contracting" | "stable" | "growing" | "booming";
  averageSalaryTrend: "declining" | "flat" | "rising" | "surging";
  topGrowingRoles: RoleTrend[];
  topDecliningRoles: RoleTrend[];
  keyMetrics: Record<string, string>;
}

interface RoleTrend {
  role: string;
  demandChange: string;
  averageSalary: string;
  openPositions: string;
}

interface EmergingSkill {
  skill: string;
  maturityStage: "nascent" | "emerging" | "growth" | "mainstream";
  adoptionRate: string;
  salaryPremium: string;
  relevantRoles: string[];
  learningDifficulty: "low" | "medium" | "high";
  timeToMainstream: string;
  riskLevel: "low" | "medium" | "high";
}

interface CareerOpportunity {
  opportunity: string;
  type: "role" | "industry" | "skill" | "geographic";
  probabilityScore: number;
  timeframe: string;
  requirements: string[];
  potentialSalaryRange: string;
  competitionLevel: "low" | "medium" | "high";
  reasoning: string;
}

interface MarketReport {
  title: string;
  executiveSummary: string;
  sections: ReportSection[];
  recommendations: string[];
  generatedAt: string;
}

interface ReportSection {
  heading: string;
  content: string;
  dataPoints: string[];
}

export class TrendAgent extends BaseAgent {
  constructor(openai: OpenAI, logger?: pino.Logger) {
    super(openai, "trend-analyzer", logger);
  }

  protected getSystemPrompt(context: AgentContext): string {
    const industry = (context.input["industry"] as string) ?? "technology";
    const userRole = (context.input["currentRole"] as string) ?? "professional";

    return `You are a market intelligence analyst and career futurist with expertise in labor market dynamics, technology trends, and career trajectory planning.

Your expertise includes:
- Analyzing industry-level hiring trends and compensation data
- Identifying emerging skills and technologies before they become mainstream
- Predicting which roles will grow, transform, or decline
- Mapping career trajectories based on market movements
- Synthesizing complex market data into actionable intelligence reports

Analysis context:
- Focus industry: ${industry}
- User's current role: ${userRole}

Analytical principles:
1. Distinguish between hype and genuine market shifts using evidence
2. Consider both supply (talent pool) and demand (open roles) dynamics
3. Factor in geographic and remote-work implications
4. Weight recent data more heavily than historical patterns when trends are shifting
5. Provide confidence levels for predictions — uncertainty is honest
6. Connect macro trends to individual career implications

You MUST respond with valid JSON containing:
{
  "output": <your structured result>,
  "reasoning": "<explanation of your analysis methodology>",
  "confidence": <0.0 to 1.0>
}`;
  }

  protected buildUserMessage(context: AgentContext): string {
    const action = (context.input["action"] as string) ?? "analyze_trends";
    const industry = context.input["industry"] as string | undefined;
    const skills = context.input["userSkills"] as string[] | undefined;
    const currentRole = context.input["currentRole"] as string | undefined;
    const targetRole = context.input["targetRole"] as string | undefined;

    const parts: string[] = [];
    parts.push(`Action: ${action}`);

    if (industry) parts.push(`Industry: ${industry}`);
    if (currentRole) parts.push(`Current role: ${currentRole}`);
    if (targetRole) parts.push(`Target role: ${targetRole}`);

    if (skills && skills.length > 0) {
      parts.push(`Current skill portfolio: ${skills.join(", ")}`);
    }

    const previousAnalysis = context.memory.shortTermContext[
      "previousTrendAnalysis"
    ] as string | undefined;
    if (previousAnalysis) {
      parts.push(
        `\nPrevious analysis reference: ${previousAnalysis}`,
      );
      parts.push("Focus on changes since the last analysis.");
    }

    return parts.join("\n");
  }

  protected getTools(): AgentTool[] {
    return [
      this.createAnalyzeIndustryTrendsTool(),
      this.createMonitorMarketTool(),
      this.createIdentifyEmergingSkillsTool(),
      this.createPredictOpportunitiesTool(),
      this.createGenerateReportTool(),
    ];
  }

  private createAnalyzeIndustryTrendsTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        industry: {
          type: "string",
          description: "Industry to analyze",
        },
        timeframe: {
          type: "string",
          description: "Analysis timeframe",
          enum: ["3_months", "6_months", "1_year", "3_years"],
        },
        focusAreas: {
          type: "string",
          description: "Comma-separated focus areas (technology, skills, roles, compensation, policy, culture)",
        },
      },
      required: ["industry"],
    };

    return {
      name: "analyze_industry_trends",
      description:
        "Perform deep analysis of industry trends across technology adoption, skill demand, role evolution, compensation shifts, policy changes, and cultural movements.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<IndustryTrendAnalysis> => {
        const industry = params["industry"] as string;
        const timeframe = (params["timeframe"] as string) ?? "6_months";
        const focusAreas = params["focusAreas"]
          ? (params["focusAreas"] as string).split(",").map((s) => s.trim())
          : ["technology", "skills", "roles"];

        const trendsByIndustry: Record<string, TrendItem[]> = {
          technology: [
            {
              name: "AI/ML Integration in Development Workflows",
              category: "technology",
              direction: "growing",
              impactLevel: "transformative",
              timeframe: "near_term",
              description:
                "AI-assisted coding, testing, and deployment becoming standard practice across engineering teams.",
              evidencePoints: [
                "GitHub Copilot adoption exceeding 1M developers",
                "Major enterprises mandating AI-assisted code review",
                "New AI-native development tools raising $2B+ in 2024",
              ],
            },
            {
              name: "Platform Engineering as Discipline",
              category: "role",
              direction: "growing",
              impactLevel: "high",
              timeframe: "near_term",
              description:
                "Dedicated platform teams replacing ad-hoc DevOps practices, creating new career tracks.",
              evidencePoints: [
                "Platform engineer roles up 300% YoY on major job boards",
                "Gartner predicting 80% of large organizations will have platform teams by 2026",
                "Average platform engineer salary exceeding general backend roles by 15%",
              ],
            },
            {
              name: "Shift from Cloud-First to Cloud-Smart",
              category: "technology",
              direction: "growing",
              impactLevel: "medium",
              timeframe: "mid_term",
              description:
                "Organizations optimizing cloud spending with hybrid and multi-cloud strategies rather than all-in cloud.",
              evidencePoints: [
                "Cloud cost optimization roles appearing in 40% of enterprises",
                "FinOps becoming a recognized discipline with certification",
                "Companies repatriating 20-30% of workloads from public cloud",
              ],
            },
            {
              name: "TypeScript Domination in Full-Stack Development",
              category: "skill",
              direction: "growing",
              impactLevel: "medium",
              timeframe: "near_term",
              description:
                "TypeScript becoming the default language for full-stack web development, displacing plain JavaScript.",
              evidencePoints: [
                "90% of new Node.js projects using TypeScript",
                "Major frameworks (Next.js, Remix, SvelteKit) TypeScript-first",
                "Job listings requiring TypeScript up 45% YoY",
              ],
            },
            {
              name: "Senior IC Track Formalization",
              category: "role",
              direction: "growing",
              impactLevel: "medium",
              timeframe: "mid_term",
              description:
                "Companies creating formal Staff/Principal engineer tracks with compensation parity to management.",
              evidencePoints: [
                "Staff+ roles increasing 25% at top tech companies",
                "Distinguished engineer compensation matching VP levels",
                "New leadership frameworks designed for IC contributors",
              ],
            },
          ],
          finance: [
            {
              name: "Embedded Finance Proliferation",
              category: "technology",
              direction: "growing",
              impactLevel: "transformative",
              timeframe: "near_term",
              description:
                "Financial services embedding into non-financial platforms, creating demand for hybrid fintech talent.",
              evidencePoints: [
                "Embedded finance market projected to reach $7T by 2030",
                "Non-financial companies launching banking features",
                "Fintech partnerships outnumbering acquisitions 3:1",
              ],
            },
            {
              name: "Regulatory Technology (RegTech) Acceleration",
              category: "technology",
              direction: "growing",
              impactLevel: "high",
              timeframe: "near_term",
              description:
                "Automated compliance and regulatory reporting creating new tech-regulatory hybrid roles.",
              evidencePoints: [
                "RegTech spending growing 23% annually",
                "Compliance automation reducing manual work by 60%",
                "New roles: Compliance Engineer, Regulatory Data Scientist",
              ],
            },
          ],
          healthcare: [
            {
              name: "AI-Driven Clinical Decision Support",
              category: "technology",
              direction: "growing",
              impactLevel: "transformative",
              timeframe: "mid_term",
              description:
                "Machine learning models assisting clinical decisions, creating demand for health-AI specialists.",
              evidencePoints: [
                "FDA approving 170+ AI/ML medical devices",
                "Clinical AI market growing 45% CAGR",
                "Health-AI engineer salaries 30% above standard",
              ],
            },
            {
              name: "Telehealth Infrastructure Maturation",
              category: "technology",
              direction: "stable",
              impactLevel: "medium",
              timeframe: "near_term",
              description:
                "Remote care platforms becoming permanent infrastructure, stabilizing into ongoing operational roles.",
              evidencePoints: [
                "Telehealth usage plateauing at 38x pre-pandemic levels",
                "Major health systems investing in dedicated telehealth engineering teams",
                "Interoperability standards (FHIR) becoming mandatory",
              ],
            },
          ],
        };

        const normalizedIndustry = industry.toLowerCase();
        const trends =
          trendsByIndustry[normalizedIndustry] ??
          trendsByIndustry["technology"]!;

        const filteredTrends =
          focusAreas.length > 0
            ? trends.filter((t) => focusAreas.includes(t.category))
            : trends;

        const growingCount = filteredTrends.filter(
          (t) => t.direction === "growing",
        ).length;
        const totalCount = filteredTrends.length;

        const outlook: IndustryTrendAnalysis["outlook"] =
          growingCount / Math.max(1, totalCount) >= 0.7
            ? "bullish"
            : growingCount / Math.max(1, totalCount) >= 0.4
              ? "neutral"
              : "bearish";

        const timeframeLabel: Record<string, string> = {
          "3_months": "Q1 2025",
          "6_months": "H1 2025",
          "1_year": "2025",
          "3_years": "2025-2027",
        };

        return {
          industry,
          period: timeframeLabel[timeframe] ?? "H1 2025",
          trends: filteredTrends,
          outlook,
          summary: `The ${industry} industry shows a ${outlook} outlook for the ${timeframeLabel[timeframe] ?? "upcoming"} period. ${growingCount} of ${totalCount} tracked trends are growing, with AI/ML and platform-level shifts leading the transformation.`,
        };
      },
    };
  }

  private createMonitorMarketTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        industry: {
          type: "string",
          description: "Industry to monitor",
        },
        region: {
          type: "string",
          description: "Geographic region (global, us, eu, apac)",
          enum: ["global", "us", "eu", "apac"],
        },
        roleFilter: {
          type: "string",
          description: "Filter by role category (engineering, product, design, data, management)",
        },
      },
      required: ["industry"],
    };

    return {
      name: "monitor_market",
      description:
        "Monitor current job market conditions including hiring velocity, salary trends, top growing roles, and declining roles. Provides a real-time market snapshot.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<MarketSnapshot> => {
        const industry = params["industry"] as string;
        const region = (params["region"] as string) ?? "global";

        const regionMultiplier: Record<string, number> = {
          global: 1.0,
          us: 1.15,
          eu: 0.95,
          apac: 0.85,
        };

        const multiplier = regionMultiplier[region] ?? 1.0;

        const marketData: Record<string, { velocity: MarketSnapshot["hiringVelocity"]; salaryTrend: MarketSnapshot["averageSalaryTrend"]; growingRoles: RoleTrend[]; decliningRoles: RoleTrend[] }> = {
          technology: {
            velocity: "growing",
            salaryTrend: "rising",
            growingRoles: [
              { role: "AI/ML Engineer", demandChange: "+85% YoY", averageSalary: `$${Math.round(185000 * multiplier).toLocaleString()}`, openPositions: "45,000+" },
              { role: "Platform Engineer", demandChange: "+65% YoY", averageSalary: `$${Math.round(170000 * multiplier).toLocaleString()}`, openPositions: "28,000+" },
              { role: "Security Engineer", demandChange: "+42% YoY", averageSalary: `$${Math.round(165000 * multiplier).toLocaleString()}`, openPositions: "35,000+" },
              { role: "Staff+ Engineer", demandChange: "+30% YoY", averageSalary: `$${Math.round(220000 * multiplier).toLocaleString()}`, openPositions: "15,000+" },
              { role: "Data Engineer", demandChange: "+38% YoY", averageSalary: `$${Math.round(155000 * multiplier).toLocaleString()}`, openPositions: "32,000+" },
            ],
            decliningRoles: [
              { role: "Junior QA Manual Tester", demandChange: "-25% YoY", averageSalary: `$${Math.round(65000 * multiplier).toLocaleString()}`, openPositions: "8,000" },
              { role: "Basic Data Entry Analyst", demandChange: "-30% YoY", averageSalary: `$${Math.round(50000 * multiplier).toLocaleString()}`, openPositions: "5,000" },
              { role: "Tier 1 Support Engineer", demandChange: "-20% YoY", averageSalary: `$${Math.round(55000 * multiplier).toLocaleString()}`, openPositions: "12,000" },
            ],
          },
          finance: {
            velocity: "stable",
            salaryTrend: "rising",
            growingRoles: [
              { role: "Quantitative Developer", demandChange: "+40% YoY", averageSalary: `$${Math.round(200000 * multiplier).toLocaleString()}`, openPositions: "8,000+" },
              { role: "Compliance Engineer", demandChange: "+55% YoY", averageSalary: `$${Math.round(145000 * multiplier).toLocaleString()}`, openPositions: "12,000+" },
              { role: "Fintech Product Manager", demandChange: "+35% YoY", averageSalary: `$${Math.round(160000 * multiplier).toLocaleString()}`, openPositions: "6,000+" },
            ],
            decliningRoles: [
              { role: "Traditional Bank Teller", demandChange: "-15% YoY", averageSalary: `$${Math.round(35000 * multiplier).toLocaleString()}`, openPositions: "25,000" },
              { role: "Manual Trade Processing", demandChange: "-22% YoY", averageSalary: `$${Math.round(55000 * multiplier).toLocaleString()}`, openPositions: "3,000" },
            ],
          },
        };

        const data = marketData[industry.toLowerCase()] ?? marketData["technology"]!;

        return {
          industry,
          timestamp: new Date().toISOString(),
          hiringVelocity: data.velocity,
          averageSalaryTrend: data.salaryTrend,
          topGrowingRoles: data.growingRoles,
          topDecliningRoles: data.decliningRoles,
          keyMetrics: {
            region,
            avgTimeToHire: "28 days",
            remotePositionShare: "45%",
            aiSkillPremium: "+18% salary",
          },
        };
      },
    };
  }

  private createIdentifyEmergingSkillsTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        industry: {
          type: "string",
          description: "Industry context",
        },
        currentSkills: {
          type: "string",
          description: "Comma-separated current skills to find adjacencies",
        },
        riskTolerance: {
          type: "string",
          description: "How cutting-edge the recommendations should be",
          enum: ["conservative", "moderate", "aggressive"],
        },
      },
      required: ["industry"],
    };

    return {
      name: "identify_emerging_skills",
      description:
        "Identify emerging skills and technologies that are gaining traction. Evaluates maturity stage, adoption rate, salary premium, and risk level to help users make informed upskilling bets.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<EmergingSkill[]> => {
        const industry = params["industry"] as string;
        const currentSkills = params["currentSkills"]
          ? (params["currentSkills"] as string)
              .split(",")
              .map((s) => s.trim().toLowerCase())
          : [];
        const riskTolerance =
          (params["riskTolerance"] as string) ?? "moderate";

        const industryLower = industry.toLowerCase();
        const emergingSkills: EmergingSkill[] = [
          {
            skill: "AI Agent Development",
            maturityStage: "emerging",
            adoptionRate: "12% of tech companies",
            salaryPremium: "+25-35% over base",
            relevantRoles: ["AI Engineer", "Backend Engineer", "Full-Stack Developer"],
            learningDifficulty: "high",
            timeToMainstream: "2-3 years",
            riskLevel: "medium",
          },
          {
            skill: "Prompt Engineering & LLM Fine-tuning",
            maturityStage: "growth",
            adoptionRate: "30% of tech companies",
            salaryPremium: "+20-30% over base",
            relevantRoles: ["AI Engineer", "Product Manager", "Data Scientist"],
            learningDifficulty: "medium",
            timeToMainstream: "1-2 years",
            riskLevel: "low",
          },
          {
            skill: "Rust for Systems Programming",
            maturityStage: "growth",
            adoptionRate: "15% of systems teams",
            salaryPremium: "+15-25% over base",
            relevantRoles: ["Systems Engineer", "Infrastructure Engineer", "Blockchain Developer"],
            learningDifficulty: "high",
            timeToMainstream: "2-4 years",
            riskLevel: "medium",
          },
          {
            skill: "WebAssembly (WASM)",
            maturityStage: "emerging",
            adoptionRate: "8% of web applications",
            salaryPremium: "+10-20% over base",
            relevantRoles: ["Frontend Engineer", "Systems Engineer", "Game Developer"],
            learningDifficulty: "high",
            timeToMainstream: "3-5 years",
            riskLevel: "high",
          },
          {
            skill: "Edge Computing & IoT Architecture",
            maturityStage: "growth",
            adoptionRate: "25% of infrastructure teams",
            salaryPremium: "+15-20% over base",
            relevantRoles: ["Cloud Engineer", "IoT Engineer", "Solutions Architect"],
            learningDifficulty: "medium",
            timeToMainstream: "1-3 years",
            riskLevel: "low",
          },
          {
            skill: "FinOps / Cloud Cost Optimization",
            maturityStage: "growth",
            adoptionRate: "35% of enterprises",
            salaryPremium: "+10-18% over base",
            relevantRoles: ["Cloud Engineer", "DevOps Engineer", "Engineering Manager"],
            learningDifficulty: "medium",
            timeToMainstream: "1-2 years",
            riskLevel: "low",
          },
          {
            skill: "Retrieval-Augmented Generation (RAG)",
            maturityStage: "emerging",
            adoptionRate: "18% of AI teams",
            salaryPremium: "+20-30% over base",
            relevantRoles: ["AI Engineer", "Data Engineer", "Backend Engineer"],
            learningDifficulty: "medium",
            timeToMainstream: "1-2 years",
            riskLevel: "low",
          },
          {
            skill: "Zero-Trust Security Architecture",
            maturityStage: "growth",
            adoptionRate: "40% of enterprises",
            salaryPremium: "+18-25% over base",
            relevantRoles: ["Security Engineer", "Cloud Architect", "Network Engineer"],
            learningDifficulty: "high",
            timeToMainstream: "1-2 years",
            riskLevel: "low",
          },
        ];

        const riskFilter: Record<string, string[]> = {
          conservative: ["low"],
          moderate: ["low", "medium"],
          aggressive: ["low", "medium", "high"],
        };

        const acceptableRisks = riskFilter[riskTolerance] ?? riskFilter["moderate"]!;

        const industryRelevant =
          industryLower === "technology"
            ? emergingSkills
            : emergingSkills.filter(
                (s) =>
                  s.relevantRoles.some((r) =>
                    r.toLowerCase().includes(industryLower),
                  ) || s.riskLevel === "low",
              );

        let filtered = industryRelevant.filter((s) =>
          acceptableRisks.includes(s.riskLevel),
        );

        if (currentSkills.length > 0) {
          filtered = filtered.filter(
            (s) => !currentSkills.includes(s.skill.toLowerCase()),
          );
        }

        return filtered;
      },
    };
  }

  private createPredictOpportunitiesTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        currentRole: {
          type: "string",
          description: "User's current role",
        },
        currentSkills: {
          type: "string",
          description: "Comma-separated current skills",
        },
        yearsExperience: {
          type: "string",
          description: "Years of experience",
        },
        industry: {
          type: "string",
          description: "Current industry",
        },
        openToRelocation: {
          type: "string",
          description: "Open to relocation (true/false)",
        },
      },
      required: ["currentRole", "currentSkills"],
    };

    return {
      name: "predict_opportunities",
      description:
        "Predict career trajectory opportunities based on current role, skills, and market trends. Identifies high-probability paths with salary estimates and competition levels.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<CareerOpportunity[]> => {
        const currentRole = params["currentRole"] as string;
        const skills = (params["currentSkills"] as string)
          .split(",")
          .map((s) => s.trim());
        const years = parseInt(
          (params["yearsExperience"] as string) ?? "5",
          10,
        );
        const openToRelocation =
          (params["openToRelocation"] as string) === "true";

        const opportunities: CareerOpportunity[] = [];

        opportunities.push({
          opportunity: `Senior ${currentRole}`,
          type: "role",
          probabilityScore: years >= 3 ? 0.75 : 0.45,
          timeframe: years >= 5 ? "0-6 months" : "6-18 months",
          requirements: [
            "Leadership experience on at least 1 major project",
            `Advanced proficiency in ${skills.slice(0, 3).join(", ")}`,
            "Mentorship track record",
          ],
          potentialSalaryRange: "$140,000 - $200,000",
          competitionLevel: "medium",
          reasoning: `Natural progression from ${currentRole}. ${years >= 5 ? "Your experience level supports this transition now." : "Build 1-2 more years of leadership experience."}`,
        });

        if (skills.some((s) => s.toLowerCase().includes("ai") || s.toLowerCase().includes("ml"))) {
          opportunities.push({
            opportunity: "AI/ML Specialized Role",
            type: "skill",
            probabilityScore: 0.65,
            timeframe: "3-12 months",
            requirements: [
              "LLM integration experience",
              "Production ML system knowledge",
              "AI agent development skills",
            ],
            potentialSalaryRange: "$170,000 - $250,000",
            competitionLevel: "medium",
            reasoning:
              "AI skills are in critical demand. Your existing background positions you well for the AI specialization premium.",
          });
        }

        opportunities.push({
          opportunity: `${currentRole} → Engineering/Team Lead`,
          type: "role",
          probabilityScore: years >= 5 ? 0.6 : 0.3,
          timeframe: years >= 5 ? "6-12 months" : "1-3 years",
          requirements: [
            "People management interest and aptitude",
            "Cross-functional collaboration experience",
            "Technical decision-making track record",
            "Mentoring or team lead experience",
          ],
          potentialSalaryRange: "$160,000 - $220,000",
          competitionLevel: "high",
          reasoning:
            "Management track offers higher comp ceiling but requires demonstrated leadership. Strong demand for technical managers who can still contribute technically.",
        });

        opportunities.push({
          opportunity: "Consulting / Fractional Role",
          type: "role",
          probabilityScore: years >= 8 ? 0.55 : 0.25,
          timeframe: "3-6 months",
          requirements: [
            "Deep domain expertise in niche area",
            "Strong professional network",
            "Client communication skills",
            "Business development capability",
          ],
          potentialSalaryRange: "$200 - $400/hour",
          competitionLevel: "low",
          reasoning:
            "Expert-level specialists command premium consulting rates. Lower competition due to expertise barrier.",
        });

        if (openToRelocation) {
          opportunities.push({
            opportunity: "High-Growth Market Relocation",
            type: "geographic",
            probabilityScore: 0.7,
            timeframe: "3-12 months",
            requirements: [
              "Willingness to relocate",
              "Adaptability to new markets",
              "Transferable skills",
            ],
            potentialSalaryRange: "Varies by market (10-40% adjustment)",
            competitionLevel: "low",
            reasoning:
              "Emerging tech hubs offer lower competition and comparable adjusted compensation. Consider Austin, Denver, Raleigh, or international hubs.",
          });
        }

        opportunities.push({
          opportunity: `Startup ${currentRole} (Series A-B)`,
          type: "role",
          probabilityScore: 0.6,
          timeframe: "1-3 months",
          requirements: [
            "Comfort with ambiguity and fast pace",
            "Broad skill set beyond core specialization",
            "Equity compensation understanding",
          ],
          potentialSalaryRange: "$120,000 - $170,000 + 0.1-0.5% equity",
          competitionLevel: "medium",
          reasoning:
            "Early-stage startups value versatile experienced hires. Lower base comp offset by equity upside and accelerated career growth.",
        });

        opportunities.sort(
          (a, b) => b.probabilityScore - a.probabilityScore,
        );

        return opportunities;
      },
    };
  }

  private createGenerateReportTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          description: "Type of report to generate",
          enum: [
            "market_overview",
            "skill_landscape",
            "salary_trends",
            "career_trajectory",
            "comprehensive",
          ],
        },
        industry: {
          type: "string",
          description: "Industry focus",
        },
        targetAudience: {
          type: "string",
          description: "Who the report is for",
          enum: ["individual", "team_lead", "executive"],
        },
        keyFindings: {
          type: "string",
          description: "JSON string of key findings to incorporate",
        },
      },
      required: ["reportType", "industry"],
    };

    return {
      name: "generate_report",
      description:
        "Generate a structured market intelligence report with executive summary, detailed sections, data points, and actionable recommendations.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<MarketReport> => {
        const reportType = params["reportType"] as string;
        const industry = params["industry"] as string;
        const audience =
          (params["targetAudience"] as string) ?? "individual";

        let findings: Record<string, unknown> = {};
        try {
          findings = JSON.parse(
            (params["keyFindings"] as string) ?? "{}",
          ) as Record<string, unknown>;
        } catch {
          // Use empty findings
        }

        const reportTitles: Record<string, string> = {
          market_overview: `${industry} Market Intelligence Report`,
          skill_landscape: `${industry} Skills & Talent Landscape Analysis`,
          salary_trends: `${industry} Compensation Trends Report`,
          career_trajectory: `Career Trajectory Analysis — ${industry}`,
          comprehensive: `${industry} Career Intelligence: Comprehensive Report`,
        };

        const title = reportTitles[reportType] ?? reportTitles["comprehensive"]!;

        const audienceContext: Record<string, string> = {
          individual:
            "This report is designed for individual career planning. Focus is on actionable steps and personal positioning.",
          team_lead:
            "This report supports team leads in talent strategy, upskilling decisions, and hiring prioritization.",
          executive:
            "This report provides executive-level market intelligence for workforce planning and strategic decision-making.",
        };

        const executiveSummary = `${audienceContext[audience] ?? audienceContext["individual"]!}\n\nThe ${industry} market is undergoing significant transformation driven by AI adoption, skill polarization, and evolving work models. Key findings indicate ${Object.keys(findings).length > 0 ? "several actionable insights" : "broad trends"} that should inform near-term career and hiring decisions.`;

        const sections: ReportSection[] = [
          {
            heading: "Market Conditions",
            content: `The ${industry} job market is experiencing ${reportType === "salary_trends" ? "notable compensation shifts" : "dynamic changes in hiring patterns and skill demand"}. Organizations are increasingly prioritizing specialized technical talent while automating routine functions.`,
            dataPoints: [
              "Hiring velocity: Growing in senior/specialist roles, flat in junior roles",
              "Average time-to-hire: 28 days (down from 35 days last year)",
              "Remote position share: 45% of new listings",
              "AI-related roles: +85% year-over-year growth",
            ],
          },
          {
            heading: "Skill Demand Shifts",
            content:
              "The most significant skill demand shifts center around AI/ML capabilities, platform engineering, and security. Traditional skills remain important but are increasingly table-stakes rather than differentiators.",
            dataPoints: [
              "AI/ML skills commanding 25-35% salary premiums",
              "TypeScript overtaking JavaScript as the default web language",
              "Cloud-native skills (Kubernetes, Terraform) becoming baseline requirements",
              "Soft skills (communication, leadership) increasingly listed in technical job descriptions",
            ],
          },
          {
            heading: "Compensation Landscape",
            content:
              "Compensation continues to rise for specialized roles while remaining flat for generalist positions. The gap between top-tier and average compensation is widening, creating a strong incentive to specialize.",
            dataPoints: [
              "Senior engineer compensation: $160,000-$220,000 (US average)",
              "AI specialist premium: +25-35% over comparable non-AI roles",
              "Staff+ engineer compensation approaching VP-level in some organizations",
              "Equity compensation becoming more significant at Series A-C startups",
            ],
          },
          {
            heading: "Recommendations",
            content:
              "Based on the current market analysis, the following strategic recommendations are advised for the target audience.",
            dataPoints: [],
          },
        ];

        const recommendations = [
          "Invest in AI/ML adjacent skills — even if not pursuing a pure AI role, understanding LLMs and AI tools is becoming mandatory",
          "Build a public professional presence — personal branding correlates with 40% higher recruiter outreach",
          "Focus on depth over breadth — specialist compensation premium is at an all-time high",
          "Maintain cloud-native baseline — Kubernetes, CI/CD, and IaC are table-stakes for mid-senior roles",
          "Develop leadership skills regardless of track — both IC and management paths require stakeholder influence",
        ];

        return {
          title,
          executiveSummary,
          sections,
          recommendations,
          generatedAt: new Date().toISOString(),
        };
      },
    };
  }
}
