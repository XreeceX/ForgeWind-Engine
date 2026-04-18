import OpenAI from "openai";
import pino from "pino";
import {
  BaseAgent,
  type AgentContext,
  type AgentTool,
  type ToolParameters,
} from "@forgewind-engine/agent-core";
import type { LinkedInProfile } from "@forgewind-engine/shared-types";

interface SkillGapAnalysis {
  currentSkills: SkillAssessment[];
  missingSkills: SkillRequirement[];
  overallReadiness: number;
  gapSeverity: "minimal" | "moderate" | "significant" | "critical";
  summary: string;
}

interface SkillAssessment {
  name: string;
  currentLevel: string;
  requiredLevel: string;
  gapSize: number;
  meetRequirement: boolean;
}

interface SkillRequirement {
  name: string;
  importance: "must_have" | "nice_to_have" | "bonus";
  demandTrend: "rising" | "stable" | "declining";
  estimatedLearningWeeks: number;
}

interface LearningPath {
  targetSkill: string;
  currentLevel: string;
  targetLevel: string;
  phases: LearningPhase[];
  totalWeeks: number;
  estimatedCost: string;
}

interface LearningPhase {
  phase: number;
  name: string;
  durationWeeks: number;
  activities: string[];
  milestone: string;
  resources: string[];
}

interface PrioritizedSkill {
  skill: string;
  priorityScore: number;
  salaryImpact: string;
  demandLevel: "low" | "medium" | "high" | "critical";
  timeToAcquire: string;
  roi: string;
  reasoning: string;
}

interface LearningResource {
  name: string;
  type: "course" | "certification" | "book" | "project" | "bootcamp";
  provider: string;
  url: string;
  cost: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;
}

interface ProgressAssessment {
  skill: string;
  startingLevel: string;
  currentLevel: string;
  targetLevel: string;
  progressPercent: number;
  milestonesMet: string[];
  milestonesRemaining: string[];
  onTrack: boolean;
  adjustedTimeline: string;
}

export class SkillGapAgent extends BaseAgent {
  constructor(openai: OpenAI, logger?: pino.Logger) {
    super(openai, "skill-gap-analyzer", logger);
  }

  protected getSystemPrompt(context: AgentContext): string {
    const targetRole = (context.input["targetRole"] as string) ?? "not specified";
    const industry = (context.input["industry"] as string) ?? "technology";

    return `You are a career development and skill gap analysis expert with deep knowledge of skill markets, learning paths, and career progression frameworks.

Your expertise includes:
- Mapping skills to market demand and salary impact
- Designing efficient learning paths that minimize time-to-competency
- Understanding which skills have the highest ROI for career advancement
- Identifying transferable skills that bridge different domains
- Tracking emerging skill trends and predicting future demand

Analysis context:
- Target role: ${targetRole}
- Target industry: ${industry}

Principles you apply:
1. Prioritize by ROI — not all skills are equally valuable
2. Consider skill adjacency — the fastest path leverages what someone already knows
3. Recommend practical learning (projects > courses > theory)
4. Factor in market timing — some skills are more urgent than others
5. Account for diminishing returns — going from intermediate to expert has different ROI than beginner to intermediate
6. Certifications matter for some skills but not others — be specific about which

You MUST respond with valid JSON containing:
{
  "output": <your structured result>,
  "reasoning": "<explanation of your skill analysis>",
  "confidence": <0.0 to 1.0>
}`;
  }

  protected buildUserMessage(context: AgentContext): string {
    const action = (context.input["action"] as string) ?? "analyze_gaps";
    const profile = context.input["profile"] as LinkedInProfile | undefined;
    const targetRole = context.input["targetRole"] as string | undefined;
    const targetSkill = context.input["targetSkill"] as string | undefined;

    const parts: string[] = [];
    parts.push(`Action: ${action}`);

    if (targetRole) parts.push(`Target role: ${targetRole}`);
    if (targetSkill) parts.push(`Focus skill: ${targetSkill}`);

    if (profile) {
      parts.push(`\nCurrent skills:`);
      for (const skill of profile.skills) {
        parts.push(
          `- ${skill.name}: ${skill.proficiency} (${skill.endorsements} endorsements)`,
        );
      }

      parts.push(`\nExperience context:`);
      for (const exp of profile.experiences.slice(0, 5)) {
        parts.push(`- ${exp.title} at ${exp.company}`);
        parts.push(`  Skills used: ${exp.skills.join(", ")}`);
      }

      if (profile.certifications.length > 0) {
        parts.push(`\nCertifications:`);
        for (const cert of profile.certifications) {
          parts.push(`- ${cert.name} (${cert.issuer})`);
        }
      }
    }

    const progressData = context.memory.shortTermContext["progressHistory"] as
      | Record<string, unknown>
      | undefined;
    if (progressData) {
      parts.push(`\nPrevious progress data: ${JSON.stringify(progressData)}`);
    }

    return parts.join("\n");
  }

  protected getTools(): AgentTool[] {
    return [
      this.createAnalyzeSkillGapsTool(),
      this.createRecommendLearningPathTool(),
      this.createPrioritizeSkillsTool(),
      this.createFindResourcesTool(),
      this.createAssessProgressTool(),
    ];
  }

  private createAnalyzeSkillGapsTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        currentSkills: {
          type: "string",
          description: "JSON string of current skills with levels: [{name, level}]",
        },
        targetRole: {
          type: "string",
          description: "Target role to compare against",
        },
        industry: {
          type: "string",
          description: "Target industry",
        },
      },
      required: ["currentSkills", "targetRole"],
    };

    return {
      name: "analyze_skill_gaps",
      description:
        "Compare user's current skills against target role requirements. Identifies gaps, assesses readiness, and categorizes gap severity. Uses market data to determine required vs. nice-to-have skills.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<SkillGapAnalysis> => {
        let currentSkills: Array<{ name: string; level: string }>;
        try {
          currentSkills = JSON.parse(params["currentSkills"] as string) as typeof currentSkills;
        } catch {
          currentSkills = [];
        }

        const targetRole = (params["targetRole"] as string).toLowerCase();

        const roleRequirements: Record<
          string,
          Array<{
            name: string;
            requiredLevel: string;
            importance: SkillRequirement["importance"];
            demandTrend: SkillRequirement["demandTrend"];
            weeksToLearn: number;
          }>
        > = {
          "software engineer": [
            { name: "JavaScript/TypeScript", requiredLevel: "ADVANCED", importance: "must_have", demandTrend: "rising", weeksToLearn: 12 },
            { name: "React", requiredLevel: "ADVANCED", importance: "must_have", demandTrend: "stable", weeksToLearn: 8 },
            { name: "Node.js", requiredLevel: "INTERMEDIATE", importance: "must_have", demandTrend: "stable", weeksToLearn: 6 },
            { name: "SQL/Databases", requiredLevel: "INTERMEDIATE", importance: "must_have", demandTrend: "stable", weeksToLearn: 4 },
            { name: "AWS/Cloud", requiredLevel: "INTERMEDIATE", importance: "nice_to_have", demandTrend: "rising", weeksToLearn: 8 },
            { name: "Docker/Kubernetes", requiredLevel: "BEGINNER", importance: "nice_to_have", demandTrend: "rising", weeksToLearn: 4 },
            { name: "CI/CD", requiredLevel: "INTERMEDIATE", importance: "nice_to_have", demandTrend: "stable", weeksToLearn: 3 },
            { name: "System Design", requiredLevel: "INTERMEDIATE", importance: "must_have", demandTrend: "rising", weeksToLearn: 10 },
          ],
          "product manager": [
            { name: "Product Strategy", requiredLevel: "ADVANCED", importance: "must_have", demandTrend: "stable", weeksToLearn: 16 },
            { name: "Data Analysis", requiredLevel: "INTERMEDIATE", importance: "must_have", demandTrend: "rising", weeksToLearn: 8 },
            { name: "User Research", requiredLevel: "INTERMEDIATE", importance: "must_have", demandTrend: "stable", weeksToLearn: 6 },
            { name: "Agile/Scrum", requiredLevel: "ADVANCED", importance: "must_have", demandTrend: "stable", weeksToLearn: 4 },
            { name: "SQL", requiredLevel: "BEGINNER", importance: "nice_to_have", demandTrend: "rising", weeksToLearn: 4 },
            { name: "A/B Testing", requiredLevel: "INTERMEDIATE", importance: "nice_to_have", demandTrend: "rising", weeksToLearn: 4 },
          ],
          "data scientist": [
            { name: "Python", requiredLevel: "ADVANCED", importance: "must_have", demandTrend: "stable", weeksToLearn: 12 },
            { name: "Machine Learning", requiredLevel: "ADVANCED", importance: "must_have", demandTrend: "rising", weeksToLearn: 16 },
            { name: "Statistics", requiredLevel: "ADVANCED", importance: "must_have", demandTrend: "stable", weeksToLearn: 12 },
            { name: "SQL", requiredLevel: "INTERMEDIATE", importance: "must_have", demandTrend: "stable", weeksToLearn: 4 },
            { name: "Deep Learning", requiredLevel: "INTERMEDIATE", importance: "nice_to_have", demandTrend: "rising", weeksToLearn: 12 },
            { name: "MLOps", requiredLevel: "BEGINNER", importance: "nice_to_have", demandTrend: "rising", weeksToLearn: 6 },
          ],
        };

        const levelToNumber: Record<string, number> = {
          BEGINNER: 1,
          INTERMEDIATE: 2,
          ADVANCED: 3,
          EXPERT: 4,
        };

        const matchedRole = Object.keys(roleRequirements).find((r) =>
          targetRole.includes(r),
        );
        const requirements = matchedRole
          ? roleRequirements[matchedRole]!
          : roleRequirements["software engineer"]!;

        const currentSkillMap = new Map(
          currentSkills.map((s) => [s.name.toLowerCase(), s.level]),
        );

        const assessments: SkillAssessment[] = [];
        const missing: SkillRequirement[] = [];
        let totalMet = 0;

        for (const req of requirements) {
          const currentLevel = currentSkillMap.get(req.name.toLowerCase());
          const currentNum = currentLevel
            ? (levelToNumber[currentLevel] ?? 0)
            : 0;
          const requiredNum = levelToNumber[req.requiredLevel] ?? 2;
          const gapSize = Math.max(0, requiredNum - currentNum);
          const meetReq = currentNum >= requiredNum;

          if (meetReq) totalMet++;

          if (currentLevel) {
            assessments.push({
              name: req.name,
              currentLevel,
              requiredLevel: req.requiredLevel,
              gapSize,
              meetRequirement: meetReq,
            });
          } else {
            missing.push({
              name: req.name,
              importance: req.importance,
              demandTrend: req.demandTrend,
              estimatedLearningWeeks: req.weeksToLearn,
            });
          }
        }

        const readiness = Math.round(
          (totalMet / requirements.length) * 100,
        );

        let severity: SkillGapAnalysis["gapSeverity"];
        if (readiness >= 80) severity = "minimal";
        else if (readiness >= 60) severity = "moderate";
        else if (readiness >= 35) severity = "significant";
        else severity = "critical";

        const mustHaveMissing = missing.filter(
          (m) => m.importance === "must_have",
        );

        const summary =
          readiness >= 80
            ? `You're well-positioned for ${targetRole} roles. Minor gaps in ${missing.slice(0, 2).map((m) => m.name).join(" and ") || "niche areas"} can be addressed quickly.`
            : readiness >= 50
              ? `You have a solid foundation but need to develop ${mustHaveMissing.map((m) => m.name).join(", ")} to be competitive for ${targetRole} positions.`
              : `Significant skill development needed for ${targetRole}. Focus on must-have skills first: ${mustHaveMissing.map((m) => m.name).join(", ")}.`;

        return {
          currentSkills: assessments,
          missingSkills: missing,
          overallReadiness: readiness,
          gapSeverity: severity,
          summary,
        };
      },
    };
  }

  private createRecommendLearningPathTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        targetSkill: {
          type: "string",
          description: "Skill to learn",
        },
        currentLevel: {
          type: "string",
          description: "Current proficiency level",
          enum: ["none", "beginner", "intermediate", "advanced"],
        },
        targetLevel: {
          type: "string",
          description: "Target proficiency level",
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        weeklyHours: {
          type: "string",
          description: "Hours available per week for learning",
        },
        learningStyle: {
          type: "string",
          description: "Preferred learning style",
          enum: ["video", "reading", "hands-on", "mixed"],
        },
      },
      required: ["targetSkill", "currentLevel", "targetLevel"],
    };

    return {
      name: "recommend_learning_path",
      description:
        "Design a structured, phased learning plan for a specific skill. Includes milestones, resources, time estimates, and practical projects for each phase.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<LearningPath> => {
        const skill = params["targetSkill"] as string;
        const currentLevel = params["currentLevel"] as string;
        const targetLevel = params["targetLevel"] as string;
        const weeklyHours = parseInt(
          (params["weeklyHours"] as string) ?? "10",
          10,
        );
        const style = (params["learningStyle"] as string) ?? "mixed";

        const baseWeeksPerLevel = Math.ceil(40 / Math.max(1, weeklyHours));

        const phases: LearningPhase[] = [];
        let phaseNum = 0;

        if (
          currentLevel === "none" ||
          (currentLevel === "beginner" &&
            (targetLevel === "intermediate" ||
              targetLevel === "advanced" ||
              targetLevel === "expert"))
        ) {
          phaseNum++;
          phases.push({
            phase: phaseNum,
            name: `${skill} Foundations`,
            durationWeeks: baseWeeksPerLevel,
            activities: this.getActivitiesForLevel("beginner", skill, style),
            milestone: `Understand core ${skill} concepts and complete a guided tutorial project`,
            resources: this.getResourcesForLevel("beginner", skill, style),
          });
        }

        if (
          (currentLevel === "none" ||
            currentLevel === "beginner" ||
            currentLevel === "intermediate") &&
          (targetLevel === "intermediate" ||
            targetLevel === "advanced" ||
            targetLevel === "expert")
        ) {
          phaseNum++;
          phases.push({
            phase: phaseNum,
            name: `${skill} Applied Practice`,
            durationWeeks: Math.ceil(baseWeeksPerLevel * 1.2),
            activities: this.getActivitiesForLevel("intermediate", skill, style),
            milestone: `Build a real-world ${skill} project and contribute to an open-source project`,
            resources: this.getResourcesForLevel("intermediate", skill, style),
          });
        }

        if (
          targetLevel === "advanced" || targetLevel === "expert"
        ) {
          phaseNum++;
          phases.push({
            phase: phaseNum,
            name: `${skill} Deep Expertise`,
            durationWeeks: Math.ceil(baseWeeksPerLevel * 1.5),
            activities: this.getActivitiesForLevel("advanced", skill, style),
            milestone: `Lead a ${skill} initiative or publish technical content demonstrating expertise`,
            resources: this.getResourcesForLevel("advanced", skill, style),
          });
        }

        if (targetLevel === "expert") {
          phaseNum++;
          phases.push({
            phase: phaseNum,
            name: `${skill} Mastery & Thought Leadership`,
            durationWeeks: Math.ceil(baseWeeksPerLevel * 2),
            activities: [
              "Mentor others in the skill",
              "Present at conferences or meetups",
              "Contribute to the skill's ecosystem (tools, libraries, standards)",
              "Write in-depth technical articles",
              "Design architecture-level solutions",
            ],
            milestone: `Recognized as a ${skill} expert — speaking, writing, or leading on the topic`,
            resources: [
              "Conference speaking opportunities",
              "Technical writing platforms (Medium, Dev.to)",
              "Open source maintainer communities",
              "Advanced workshops and masterclasses",
            ],
          });
        }

        const totalWeeks = phases.reduce((sum, p) => sum + p.durationWeeks, 0);

        const estimatedCost =
          totalWeeks <= 4
            ? "Free - $100 (free resources available)"
            : totalWeeks <= 12
              ? "$100 - $500 (course subscriptions)"
              : "$500 - $2000 (courses + certification)";

        return {
          targetSkill: skill,
          currentLevel,
          targetLevel,
          phases,
          totalWeeks,
          estimatedCost,
        };
      },
    };
  }

  private createPrioritizeSkillsTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        skills: {
          type: "string",
          description: "JSON string of skills to prioritize: [{name, currentLevel, importance}]",
        },
        targetRole: {
          type: "string",
          description: "Target role for prioritization context",
        },
        timeConstraint: {
          type: "string",
          description: "Time available in months",
        },
      },
      required: ["skills", "targetRole"],
    };

    return {
      name: "prioritize_skills",
      description:
        "Rank skills by ROI considering salary impact, market demand, time-to-acquire, and career trajectory value. Helps users focus limited learning time on the highest-impact skills.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<PrioritizedSkill[]> => {
        let skills: Array<{
          name: string;
          currentLevel: string;
          importance: string;
        }>;
        try {
          skills = JSON.parse(params["skills"] as string) as typeof skills;
        } catch {
          return [];
        }

        const targetRole = params["targetRole"] as string;
        const timeMonths = parseInt(
          (params["timeConstraint"] as string) ?? "6",
          10,
        );

        const demandData: Record<string, { demand: PrioritizedSkill["demandLevel"]; salaryBoost: number }> = {
          "typescript": { demand: "critical", salaryBoost: 15 },
          "react": { demand: "high", salaryBoost: 12 },
          "python": { demand: "critical", salaryBoost: 15 },
          "aws": { demand: "high", salaryBoost: 18 },
          "kubernetes": { demand: "high", salaryBoost: 20 },
          "machine learning": { demand: "critical", salaryBoost: 25 },
          "system design": { demand: "high", salaryBoost: 22 },
          "sql": { demand: "high", salaryBoost: 8 },
          "docker": { demand: "high", salaryBoost: 10 },
          "node.js": { demand: "high", salaryBoost: 12 },
          "go": { demand: "high", salaryBoost: 18 },
          "rust": { demand: "medium", salaryBoost: 20 },
          "graphql": { demand: "medium", salaryBoost: 8 },
          "leadership": { demand: "high", salaryBoost: 15 },
          "product strategy": { demand: "high", salaryBoost: 20 },
          "data analysis": { demand: "high", salaryBoost: 14 },
        };

        const importanceWeight: Record<string, number> = {
          must_have: 1.5,
          nice_to_have: 1.0,
          bonus: 0.6,
        };

        const prioritized: PrioritizedSkill[] = skills.map((skill) => {
          const normalizedName = skill.name.toLowerCase();
          const marketData = demandData[normalizedName] ?? {
            demand: "medium" as const,
            salaryBoost: 10,
          };

          const levelGap = this.levelToNumber("advanced") - this.levelToNumber(skill.currentLevel);
          const weeksToAcquire = Math.max(2, levelGap * 4);
          const monthsToAcquire = Math.ceil(weeksToAcquire / 4);

          const iWeight = importanceWeight[skill.importance] ?? 1.0;
          const demandMultiplier =
            marketData.demand === "critical"
              ? 1.5
              : marketData.demand === "high"
                ? 1.2
                : marketData.demand === "medium"
                  ? 1.0
                  : 0.7;

          const timeFeasibility = monthsToAcquire <= timeMonths ? 1.2 : 0.6;
          const priorityScore = Math.round(
            marketData.salaryBoost * iWeight * demandMultiplier * timeFeasibility,
          );

          return {
            skill: skill.name,
            priorityScore,
            salaryImpact: `+${marketData.salaryBoost}% average salary increase`,
            demandLevel: marketData.demand,
            timeToAcquire: `${monthsToAcquire} months at 10 hrs/week`,
            roi:
              priorityScore >= 30
                ? "Excellent"
                : priorityScore >= 20
                  ? "Good"
                  : priorityScore >= 10
                    ? "Moderate"
                    : "Low",
            reasoning: `${skill.name} is ${marketData.demand} demand for ${targetRole} roles. ${monthsToAcquire <= timeMonths ? "Achievable within your timeline." : "May require extended timeline."} ${skill.importance === "must_have" ? "This is a must-have skill." : ""}`,
          };
        });

        prioritized.sort((a, b) => b.priorityScore - a.priorityScore);
        return prioritized;
      },
    };
  }

  private createFindResourcesTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        skill: {
          type: "string",
          description: "Skill to find resources for",
        },
        level: {
          type: "string",
          description: "Target proficiency level",
          enum: ["beginner", "intermediate", "advanced"],
        },
        resourceType: {
          type: "string",
          description: "Type of resource preferred",
          enum: ["course", "certification", "book", "project", "any"],
        },
        maxBudget: {
          type: "string",
          description: "Maximum budget in USD",
        },
      },
      required: ["skill", "level"],
    };

    return {
      name: "find_resources",
      description:
        "Find the best courses, certifications, books, and projects for learning a specific skill at a given level. Returns curated, rated resources with cost and time estimates.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<LearningResource[]> => {
        const skill = params["skill"] as string;
        const level = params["level"] as string;
        const resourceType = (params["resourceType"] as string) ?? "any";
        const maxBudget = parseInt(
          (params["maxBudget"] as string) ?? "99999",
          10,
        );

        const resourceDatabase: Record<
          string,
          Record<string, LearningResource[]>
        > = {
          "typescript": {
            beginner: [
              { name: "TypeScript Handbook", type: "book", provider: "TypeScript.org", url: "https://www.typescriptlang.org/docs/handbook/", cost: "Free", duration: "2 weeks", difficulty: "beginner", rating: 4.8 },
              { name: "Understanding TypeScript", type: "course", provider: "Udemy", url: "https://udemy.com", cost: "$15", duration: "15 hours", difficulty: "beginner", rating: 4.7 },
              { name: "Execute Program: TypeScript", type: "course", provider: "Execute Program", url: "https://executeprogram.com", cost: "$19/mo", duration: "4 weeks", difficulty: "beginner", rating: 4.9 },
            ],
            intermediate: [
              { name: "Type-Level TypeScript", type: "course", provider: "type-level-typescript.com", url: "https://type-level-typescript.com", cost: "$49", duration: "4 weeks", difficulty: "intermediate", rating: 4.8 },
              { name: "Effective TypeScript", type: "book", provider: "O'Reilly", url: "https://effectivetypescript.com", cost: "$35", duration: "3 weeks", difficulty: "intermediate", rating: 4.9 },
              { name: "Build a Full-Stack App with TypeScript", type: "project", provider: "Self-directed", url: "", cost: "Free", duration: "6 weeks", difficulty: "intermediate", rating: 4.5 },
            ],
            advanced: [
              { name: "TypeScript Compiler Internals", type: "book", provider: "basarat.gitbook.io", url: "https://basarat.gitbook.io/typescript/", cost: "Free", duration: "4 weeks", difficulty: "advanced", rating: 4.6 },
              { name: "Advanced TypeScript Design Patterns", type: "project", provider: "Self-directed", url: "", cost: "Free", duration: "8 weeks", difficulty: "advanced", rating: 4.4 },
            ],
          },
          "react": {
            beginner: [
              { name: "React.dev Tutorial", type: "course", provider: "React.dev", url: "https://react.dev/learn", cost: "Free", duration: "1 week", difficulty: "beginner", rating: 4.9 },
              { name: "React — The Complete Guide", type: "course", provider: "Udemy", url: "https://udemy.com", cost: "$15", duration: "40 hours", difficulty: "beginner", rating: 4.7 },
            ],
            intermediate: [
              { name: "Epic React", type: "course", provider: "Kent C. Dodds", url: "https://epicreact.dev", cost: "$599", duration: "8 weeks", difficulty: "intermediate", rating: 4.9 },
              { name: "Build a SaaS Dashboard", type: "project", provider: "Self-directed", url: "", cost: "Free", duration: "4 weeks", difficulty: "intermediate", rating: 4.5 },
            ],
            advanced: [
              { name: "React Source Code Deep Dive", type: "project", provider: "Self-directed", url: "", cost: "Free", duration: "6 weeks", difficulty: "advanced", rating: 4.3 },
              { name: "Build a React Component Library", type: "project", provider: "Self-directed", url: "", cost: "Free", duration: "8 weeks", difficulty: "advanced", rating: 4.6 },
            ],
          },
        };

        const normalizedSkill = skill.toLowerCase();
        const skillResources = resourceDatabase[normalizedSkill];
        let resources: LearningResource[];

        if (skillResources && skillResources[level]) {
          resources = skillResources[level];
        } else {
          resources = [
            {
              name: `${skill} Fundamentals Course`,
              type: "course",
              provider: "Coursera / Udemy",
              url: "https://coursera.org",
              cost: "$15-50",
              duration: "4-6 weeks",
              difficulty: level as LearningResource["difficulty"],
              rating: 4.5,
            },
            {
              name: `${skill} Official Documentation`,
              type: "book",
              provider: "Official Docs",
              url: "",
              cost: "Free",
              duration: "Ongoing",
              difficulty: level as LearningResource["difficulty"],
              rating: 4.3,
            },
            {
              name: `Build a Project with ${skill}`,
              type: "project",
              provider: "Self-directed",
              url: "",
              cost: "Free",
              duration: "4-8 weeks",
              difficulty: level as LearningResource["difficulty"],
              rating: 4.6,
            },
          ];
        }

        if (resourceType !== "any") {
          resources = resources.filter((r) => r.type === resourceType);
        }

        resources = resources.filter((r) => {
          const costNum = parseInt(r.cost.replace(/[^0-9]/g, ""), 10);
          return isNaN(costNum) || costNum <= maxBudget;
        });

        return resources.sort((a, b) => b.rating - a.rating);
      },
    };
  }

  private createAssessProgressTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        skill: {
          type: "string",
          description: "Skill being tracked",
        },
        startingLevel: {
          type: "string",
          description: "Level when learning started",
          enum: ["none", "beginner", "intermediate", "advanced"],
        },
        currentLevel: {
          type: "string",
          description: "Current assessed level",
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        targetLevel: {
          type: "string",
          description: "Target level",
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        weeksElapsed: {
          type: "string",
          description: "Weeks since learning started",
        },
        completedMilestones: {
          type: "string",
          description: "Comma-separated completed milestones",
        },
        plannedMilestones: {
          type: "string",
          description: "Comma-separated total planned milestones",
        },
      },
      required: ["skill", "startingLevel", "currentLevel", "targetLevel", "weeksElapsed"],
    };

    return {
      name: "assess_progress",
      description:
        "Track and assess skill development progress. Compares current level vs. planned timeline, identifies completed and remaining milestones, and adjusts the timeline if needed.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<ProgressAssessment> => {
        const skill = params["skill"] as string;
        const startingLevel = params["startingLevel"] as string;
        const currentLevel = params["currentLevel"] as string;
        const targetLevel = params["targetLevel"] as string;
        const weeksElapsed = parseInt(
          params["weeksElapsed"] as string,
          10,
        );

        const completed = params["completedMilestones"]
          ? (params["completedMilestones"] as string)
              .split(",")
              .map((s) => s.trim())
          : [];
        const allMilestones = params["plannedMilestones"]
          ? (params["plannedMilestones"] as string)
              .split(",")
              .map((s) => s.trim())
          : [];

        const startNum = this.levelToNumber(startingLevel);
        const currentNum = this.levelToNumber(currentLevel);
        const targetNum = this.levelToNumber(targetLevel);

        const totalGap = Math.max(1, targetNum - startNum);
        const progressMade = currentNum - startNum;
        const progressPercent = Math.min(
          100,
          Math.round((progressMade / totalGap) * 100),
        );

        const remaining = allMilestones.filter(
          (m) => !completed.includes(m),
        );

        const expectedWeeksPerLevel = 6;
        const expectedWeeks = totalGap * expectedWeeksPerLevel;
        const expectedProgress = Math.min(
          100,
          Math.round((weeksElapsed / expectedWeeks) * 100),
        );

        const onTrack = progressPercent >= expectedProgress - 15;

        let adjustedTimeline: string;
        if (progressPercent >= 100) {
          adjustedTimeline = "Target reached! Consider advancing to the next level.";
        } else if (onTrack) {
          const remainingWeeks = Math.ceil(
            ((100 - progressPercent) / 100) * expectedWeeks,
          );
          adjustedTimeline = `On track — estimated ${remainingWeeks} more weeks to reach ${targetLevel}`;
        } else {
          const actualPaceWeeksPerPercent =
            weeksElapsed / Math.max(1, progressPercent);
          const remainingPercent = 100 - progressPercent;
          const adjustedRemainingWeeks = Math.ceil(
            actualPaceWeeksPerPercent * remainingPercent,
          );
          adjustedTimeline = `Behind schedule — at current pace, ${adjustedRemainingWeeks} more weeks needed. Consider increasing study time or adjusting approach.`;
        }

        return {
          skill,
          startingLevel,
          currentLevel,
          targetLevel,
          progressPercent,
          milestonesMet: completed,
          milestonesRemaining: remaining,
          onTrack,
          adjustedTimeline,
        };
      },
    };
  }

  private levelToNumber(level: string): number {
    const map: Record<string, number> = {
      none: 0,
      beginner: 1,
      BEGINNER: 1,
      intermediate: 2,
      INTERMEDIATE: 2,
      advanced: 3,
      ADVANCED: 3,
      expert: 4,
      EXPERT: 4,
    };
    return map[level] ?? 0;
  }

  private getActivitiesForLevel(
    level: string,
    skill: string,
    style: string,
  ): string[] {
    const baseActivities: Record<string, string[]> = {
      beginner: [
        `Complete an introductory ${skill} tutorial`,
        `Read the official ${skill} documentation`,
        `Build a simple project following a guide`,
        "Take notes and create flashcards for key concepts",
        "Join a community (Discord/Slack) for Q&A",
      ],
      intermediate: [
        `Build a real-world ${skill} project from scratch`,
        "Contribute to an open-source project",
        "Complete coding challenges/exercises",
        `Study ${skill} design patterns and best practices`,
        "Pair program or code review with experienced practitioners",
      ],
      advanced: [
        `Architect a complex ${skill} system`,
        "Mentor juniors and write technical blog posts",
        `Explore ${skill} internals and edge cases`,
        "Contribute to core libraries or frameworks",
        "Present a technical talk at a meetup",
      ],
    };

    const activities = baseActivities[level] ?? baseActivities["beginner"]!;

    if (style === "video") {
      activities.push("Follow video-based courses with hands-on exercises");
    } else if (style === "reading") {
      activities.push("Read technical books and articles deeply");
    } else if (style === "hands-on") {
      activities.push("Focus on project-based learning over theory");
    }

    return activities;
  }

  private getResourcesForLevel(
    level: string,
    skill: string,
    _style: string,
  ): string[] {
    const resources: Record<string, string[]> = {
      beginner: [
        `Official ${skill} documentation / tutorials`,
        `Free introductory courses (freeCodeCamp, Codecademy)`,
        `YouTube tutorials for ${skill} beginners`,
        `${skill} community Discord/Slack channels`,
      ],
      intermediate: [
        `Paid courses (Udemy, Pluralsight, Egghead)`,
        `${skill} books from O'Reilly or Manning`,
        `GitHub repositories with intermediate-level ${skill} projects`,
        "Code review communities and pair programming platforms",
      ],
      advanced: [
        `${skill} source code and RFCs`,
        "Conference talks and workshop recordings",
        `Advanced ${skill} books and papers`,
        "Mentorship and expert communities",
      ],
    };

    return resources[level] ?? resources["beginner"]!;
  }
}
