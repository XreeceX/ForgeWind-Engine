import OpenAI from "openai";
import pino from "pino";
import {
  BaseAgent,
  type AgentContext,
  type AgentTool,
  type ToolParameters,
} from "@career-os/agent-core";
import type { LinkedInProfile } from "@career-os/shared-types";

interface ProfileAnalysis {
  overallScore: number;
  headlineScore: number;
  aboutScore: number;
  experienceScore: number;
  skillsScore: number;
  completenessScore: number;
  issues: string[];
  strengths: string[];
}

interface HeadlineSuggestion {
  headline: string;
  strategy: string;
  targetAudience: string;
}

interface AboutRewrite {
  content: string;
  wordCount: number;
  keywordsIncluded: string[];
  tone: string;
}

interface ExperienceOptimization {
  original: string;
  optimized: string;
  improvements: string[];
  metrics_added: boolean;
}

interface SkillSuggestion {
  skill: string;
  relevance: string;
  demandLevel: "low" | "medium" | "high" | "critical";
  category: string;
}

export class ProfileAgent extends BaseAgent {
  constructor(openai: OpenAI, logger?: pino.Logger) {
    super(openai, "profile-optimizer", logger);
  }

  protected getSystemPrompt(context: AgentContext): string {
    const profile = context.input["profile"] as LinkedInProfile | undefined;
    const targetRole = (context.input["targetRole"] as string) ?? "not specified";
    const industry = (context.input["industry"] as string) ?? "not specified";

    return `You are an expert LinkedIn profile optimizer and personal branding specialist with 15+ years of experience helping professionals craft compelling LinkedIn presences.

Your expertise includes:
- Writing magnetic headlines that drive profile views
- Crafting About sections that tell compelling career narratives
- Transforming bland experience descriptions into achievement-focused stories
- Identifying strategic skill gaps and recommendations
- Understanding LinkedIn's algorithm and search optimization

Current task context:
- Target role: ${targetRole}
- Industry: ${industry}
- Profile completeness: ${profile ? this.assessCompleteness(profile) : "unknown"}

Guidelines:
1. Always quantify achievements when possible (%, $, numbers)
2. Use strong action verbs (led, architected, accelerated, transformed)
3. Incorporate relevant industry keywords naturally
4. Optimize for LinkedIn search algorithm (keyword density in headline, about, experience)
5. Maintain authentic voice while elevating professional presence
6. Consider ATS compatibility for headline and skills

You MUST respond with valid JSON containing:
{
  "output": <your structured result>,
  "reasoning": "<explanation of your approach>",
  "confidence": <0.0 to 1.0>
}`;
  }

  protected buildUserMessage(context: AgentContext): string {
    const profile = context.input["profile"] as LinkedInProfile | undefined;
    const action = (context.input["action"] as string) ?? "full_optimization";
    const targetRole = context.input["targetRole"] as string | undefined;
    const preferences = context.input["preferences"] as Record<string, unknown> | undefined;

    const parts: string[] = [];

    parts.push(`Action requested: ${action}`);

    if (targetRole) {
      parts.push(`Target role: ${targetRole}`);
    }

    if (profile) {
      parts.push(`\nCurrent LinkedIn Profile:`);
      parts.push(`Headline: ${profile.headline}`);
      parts.push(`About: ${profile.about}`);
      parts.push(`Connections: ${profile.connections}`);
      parts.push(`Recommendations: ${profile.recommendations}`);

      if (profile.experiences.length > 0) {
        parts.push(`\nExperience (${profile.experiences.length} entries):`);
        for (const exp of profile.experiences) {
          const endLabel = exp.endDate ? exp.endDate.toString() : "Present";
          parts.push(
            `- ${exp.title} at ${exp.company} (${exp.startDate.toString()} – ${endLabel})`,
          );
          parts.push(`  ${exp.description}`);
          parts.push(`  Skills: ${exp.skills.join(", ")}`);
        }
      }

      if (profile.skills.length > 0) {
        parts.push(`\nSkills (${profile.skills.length}):`);
        for (const skill of profile.skills) {
          parts.push(
            `- ${skill.name} (${skill.proficiency}, ${skill.endorsements} endorsements)`,
          );
        }
      }

      if (profile.certifications.length > 0) {
        parts.push(`\nCertifications:`);
        for (const cert of profile.certifications) {
          parts.push(`- ${cert.name} by ${cert.issuer}`);
        }
      }
    }

    if (preferences) {
      parts.push(`\nUser preferences: ${JSON.stringify(preferences)}`);
    }

    if (context.memory.shortTermContext["previousSuggestions"]) {
      parts.push(
        `\nPrevious suggestions provided: ${JSON.stringify(context.memory.shortTermContext["previousSuggestions"])}`,
      );
      parts.push("Please provide different/improved suggestions this time.");
    }

    return parts.join("\n");
  }

  protected getTools(): AgentTool[] {
    return [
      this.createAnalyzeProfileTool(),
      this.createGenerateHeadlinesTool(),
      this.createRewriteAboutTool(),
      this.createOptimizeExperienceTool(),
      this.createSuggestSkillsTool(),
    ];
  }

  private createAnalyzeProfileTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        headline: {
          type: "string",
          description: "Current profile headline",
        },
        about: {
          type: "string",
          description: "Current about section text",
        },
        experienceCount: {
          type: "string",
          description: "Number of experience entries",
        },
        skillCount: {
          type: "string",
          description: "Number of skills listed",
        },
        hasRecommendations: {
          type: "string",
          description: "Whether the profile has recommendations (true/false)",
        },
        connectionCount: {
          type: "string",
          description: "Number of connections",
        },
        targetRole: {
          type: "string",
          description: "Target role for optimization",
        },
      },
      required: ["headline", "about"],
    };

    return {
      name: "analyze_profile",
      description:
        "Evaluate the current LinkedIn profile quality across all dimensions: headline effectiveness, about section engagement, experience impact, skills relevance, and overall completeness. Returns a detailed scoring breakdown with actionable issues.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<ProfileAnalysis> => {
        const headline = params["headline"] as string;
        const about = params["about"] as string;
        const experienceCount = parseInt(
          (params["experienceCount"] as string) ?? "0",
          10,
        );
        const skillCount = parseInt(
          (params["skillCount"] as string) ?? "0",
          10,
        );
        const hasRecommendations =
          (params["hasRecommendations"] as string) === "true";
        const connectionCount = parseInt(
          (params["connectionCount"] as string) ?? "0",
          10,
        );

        const headlineScore = this.scoreHeadline(headline);
        const aboutScore = this.scoreAbout(about);
        const experienceScore = Math.min(100, experienceCount * 20);
        const skillsScore = Math.min(100, skillCount * 4);

        const completenessFactors = [
          headline.length > 0 ? 20 : 0,
          about.length > 0 ? 20 : 0,
          experienceCount > 0 ? 20 : 0,
          skillCount >= 5 ? 20 : skillCount * 4,
          hasRecommendations ? 10 : 0,
          connectionCount >= 500 ? 10 : Math.floor((connectionCount / 500) * 10),
        ];
        const completenessScore = completenessFactors.reduce(
          (sum, s) => sum + s,
          0,
        );

        const issues: string[] = [];
        const strengths: string[] = [];

        if (headlineScore < 60)
          issues.push(
            "Headline is generic — needs keywords and value proposition",
          );
        else strengths.push("Headline contains relevant keywords");

        if (aboutScore < 50)
          issues.push(
            "About section is too short or lacks engagement hooks",
          );
        else if (aboutScore >= 80)
          strengths.push("About section is well-crafted and detailed");

        if (experienceCount < 3)
          issues.push("Limited experience entries — add more roles or projects");

        if (skillCount < 10)
          issues.push(
            "Too few skills listed — aim for 20+ relevant skills",
          );

        if (!hasRecommendations)
          issues.push("No recommendations — request 3-5 from colleagues");

        if (connectionCount < 500)
          issues.push("Grow your network — under 500 connections limits visibility");
        else strengths.push("Strong network size");

        const overallScore = Math.round(
          headlineScore * 0.25 +
            aboutScore * 0.25 +
            experienceScore * 0.2 +
            skillsScore * 0.15 +
            completenessScore * 0.15,
        );

        return {
          overallScore,
          headlineScore,
          aboutScore,
          experienceScore,
          skillsScore,
          completenessScore,
          issues,
          strengths,
        };
      },
    };
  }

  private createGenerateHeadlinesTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        currentHeadline: {
          type: "string",
          description: "The current headline text",
        },
        targetRole: {
          type: "string",
          description: "Desired role or position",
        },
        keySkills: {
          type: "string",
          description: "Comma-separated list of key skills to highlight",
        },
        industry: {
          type: "string",
          description: "Target industry",
        },
        tone: {
          type: "string",
          description: "Desired tone: professional, creative, technical, executive",
          enum: ["professional", "creative", "technical", "executive"],
        },
      },
      required: ["currentHeadline", "targetRole", "keySkills"],
    };

    return {
      name: "generate_headlines",
      description:
        "Generate 3-5 optimized LinkedIn headline options. Each headline is crafted with SEO keywords, value proposition, and target audience in mind. Headlines are A/B testable with different strategies.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<HeadlineSuggestion[]> => {
        const targetRole = params["targetRole"] as string;
        const keySkills = (params["keySkills"] as string)
          .split(",")
          .map((s) => s.trim());
        const tone = (params["tone"] as string) ?? "professional";
        const topSkills = keySkills.slice(0, 3).join(" | ");

        const strategies: Array<{
          strategy: string;
          template: (role: string, skills: string) => string;
          audience: string;
        }> = [
          {
            strategy: "keyword-rich",
            template: (role, skills) => `${role} | ${skills} | Driving Results Through Innovation`,
            audience: "Recruiters searching by role keywords",
          },
          {
            strategy: "value-proposition",
            template: (role, skills) =>
              `Helping Companies Scale Through ${skills} | ${role}`,
            audience: "Hiring managers looking for impact",
          },
          {
            strategy: "achievement-led",
            template: (role, _skills) =>
              `${role} — Building Solutions That Deliver Measurable Business Impact`,
            audience: "Senior leadership and decision-makers",
          },
          {
            strategy: "niche-authority",
            template: (_role, skills) =>
              `${skills} Specialist | Turning Complex Challenges Into Scalable Solutions`,
            audience: "Industry peers and niche recruiters",
          },
          {
            strategy: "personal-brand",
            template: (role, skills) =>
              `${role} | ${skills} Enthusiast | Writing About Tech & Career Growth`,
            audience: "Content consumers and thought leadership seekers",
          },
        ];

        const toneModifiers: Record<string, (h: string) => string> = {
          professional: (h) => h,
          creative: (h) => h.replace("Driving", "Reimagining").replace("Building", "Crafting"),
          technical: (h) => h.replace("Results", "Performance").replace("Solutions", "Systems"),
          executive: (h) => h.replace("Helping", "Leading").replace("Building", "Transforming"),
        };

        const modifier = toneModifiers[tone] ?? toneModifiers["professional"]!;

        return strategies.map((s) => ({
          headline: modifier(s.template(targetRole, topSkills)),
          strategy: s.strategy,
          targetAudience: s.audience,
        }));
      },
    };
  }

  private createRewriteAboutTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        currentAbout: {
          type: "string",
          description: "Current about section text",
        },
        targetRole: {
          type: "string",
          description: "Target role for keyword optimization",
        },
        achievements: {
          type: "string",
          description: "Comma-separated key achievements to incorporate",
        },
        keywords: {
          type: "string",
          description: "Comma-separated industry keywords to include",
        },
        tone: {
          type: "string",
          description: "Tone: first-person-casual, first-person-professional, third-person",
          enum: [
            "first-person-casual",
            "first-person-professional",
            "third-person",
          ],
        },
      },
      required: ["currentAbout", "targetRole"],
    };

    return {
      name: "rewrite_about",
      description:
        "Rewrite the LinkedIn About section to be professional, engaging, and keyword-rich. Produces a compelling narrative that hooks readers in the first line, showcases value, and drives action.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<AboutRewrite> => {
        const currentAbout = params["currentAbout"] as string;
        const targetRole = params["targetRole"] as string;
        const achievements = params["achievements"] as string | undefined;
        const keywords = params["keywords"] as string | undefined;
        const tone =
          (params["tone"] as string) ?? "first-person-professional";

        const achievementList = achievements
          ? achievements.split(",").map((a) => a.trim())
          : [];
        const keywordList = keywords
          ? keywords.split(",").map((k) => k.trim())
          : [];

        const hookLine = `What if your next ${targetRole} could deliver twice the impact in half the time?`;

        const narrativeParts: string[] = [hookLine, ""];

        if (tone === "third-person") {
          narrativeParts.push(
            `A seasoned ${targetRole} with a track record of transforming challenges into opportunities.`,
          );
        } else {
          narrativeParts.push(
            `I'm a ${targetRole} who thrives at the intersection of strategy and execution.`,
          );
        }

        if (achievementList.length > 0) {
          narrativeParts.push("");
          narrativeParts.push("Key highlights:");
          for (const achievement of achievementList) {
            narrativeParts.push(`→ ${achievement}`);
          }
        }

        if (keywordList.length > 0) {
          narrativeParts.push("");
          narrativeParts.push(
            `Areas of expertise: ${keywordList.join(" • ")}`,
          );
        }

        const ctaLine =
          tone === "third-person"
            ? "Open to discussing how this expertise can benefit your organization."
            : "Let's connect — I'm always open to conversations about innovation and collaboration.";

        narrativeParts.push("", ctaLine);

        const content = narrativeParts.join("\n");

        const includedKeywords = keywordList.filter((kw) =>
          content.toLowerCase().includes(kw.toLowerCase()),
        );

        const currentWordCount = currentAbout.split(/\s+/).length;
        const newWordCount = content.split(/\s+/).length;

        if (currentWordCount === 0 || newWordCount > currentWordCount) {
          // Improvement: new about is more detailed
        }

        return {
          content,
          wordCount: newWordCount,
          keywordsIncluded: includedKeywords,
          tone,
        };
      },
    };
  }

  private createOptimizeExperienceTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Job title",
        },
        company: {
          type: "string",
          description: "Company name",
        },
        description: {
          type: "string",
          description: "Current experience description text",
        },
        targetRole: {
          type: "string",
          description: "Target role for relevance optimization",
        },
      },
      required: ["title", "company", "description"],
    };

    return {
      name: "optimize_experience",
      description:
        "Improve a single experience entry by adding action verbs, quantified achievements, and better structure. Transforms passive descriptions into impact-driven bullet points.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<ExperienceOptimization> => {
        const description = params["description"] as string;
        const title = params["title"] as string;
        const company = params["company"] as string;

        const weakVerbs = [
          "responsible for",
          "worked on",
          "helped with",
          "assisted",
          "was involved in",
          "participated in",
          "handled",
          "did",
          "managed",
        ];

        const strongVerbMap: Record<string, string> = {
          "responsible for": "Spearheaded",
          "worked on": "Engineered",
          "helped with": "Collaborated on",
          "assisted": "Supported",
          "was involved in": "Contributed to",
          "participated in": "Drove",
          "handled": "Orchestrated",
          "did": "Executed",
          "managed": "Led",
        };

        let optimized = description;
        const improvements: string[] = [];
        let metricsAdded = false;

        for (const weak of weakVerbs) {
          if (optimized.toLowerCase().includes(weak)) {
            const replacement = strongVerbMap[weak] ?? "Led";
            optimized = optimized.replace(
              new RegExp(weak, "gi"),
              replacement,
            );
            improvements.push(
              `Replaced "${weak}" with "${replacement}"`,
            );
          }
        }

        const sentences = optimized.split(/[.!]\s*/);
        const hasMetrics = sentences.some((s) => /\d+%|\$\d+|\d+x|\d+\+/.test(s));

        if (!hasMetrics) {
          optimized += `\n\nAs ${title} at ${company}, delivered measurable impact across key business metrics.`;
          improvements.push(
            "Added metrics prompt — replace placeholder with actual numbers",
          );
          metricsAdded = true;
        }

        if (!optimized.includes("•") && !optimized.includes("→")) {
          const lines = optimized
            .split("\n")
            .filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            optimized = lines.map((l) => `• ${l.trim()}`).join("\n");
            improvements.push("Converted to bullet-point format for scannability");
          }
        }

        return {
          original: description,
          optimized,
          improvements,
          metrics_added: metricsAdded,
        };
      },
    };
  }

  private createSuggestSkillsTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        currentSkills: {
          type: "string",
          description: "Comma-separated list of current skills on the profile",
        },
        targetRole: {
          type: "string",
          description: "Target role for skill gap identification",
        },
        industry: {
          type: "string",
          description: "Target industry",
        },
      },
      required: ["currentSkills", "targetRole"],
    };

    return {
      name: "suggest_skills",
      description:
        "Analyze current skills against target role requirements and market demand. Recommends missing skills to add, ordered by relevance and demand level.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<SkillSuggestion[]> => {
        const currentSkills = (params["currentSkills"] as string)
          .split(",")
          .map((s) => s.trim().toLowerCase());
        const targetRole = (params["targetRole"] as string).toLowerCase();
        const industry = ((params["industry"] as string) ?? "technology").toLowerCase();

        const roleSkillMap: Record<string, Array<{ skill: string; demand: "low" | "medium" | "high" | "critical"; category: string }>> = {
          "software engineer": [
            { skill: "TypeScript", demand: "critical", category: "Programming Languages" },
            { skill: "React", demand: "high", category: "Frontend" },
            { skill: "Node.js", demand: "high", category: "Backend" },
            { skill: "AWS", demand: "high", category: "Cloud" },
            { skill: "Docker", demand: "high", category: "DevOps" },
            { skill: "CI/CD", demand: "medium", category: "DevOps" },
            { skill: "PostgreSQL", demand: "medium", category: "Databases" },
            { skill: "System Design", demand: "high", category: "Architecture" },
            { skill: "Agile", demand: "medium", category: "Methodology" },
            { skill: "Git", demand: "critical", category: "Tools" },
          ],
          "product manager": [
            { skill: "Product Strategy", demand: "critical", category: "Core" },
            { skill: "User Research", demand: "high", category: "Discovery" },
            { skill: "Data Analysis", demand: "high", category: "Analytics" },
            { skill: "A/B Testing", demand: "medium", category: "Experimentation" },
            { skill: "Roadmapping", demand: "high", category: "Planning" },
            { skill: "Stakeholder Management", demand: "critical", category: "Leadership" },
            { skill: "SQL", demand: "medium", category: "Technical" },
            { skill: "Figma", demand: "medium", category: "Design" },
            { skill: "Jira", demand: "medium", category: "Tools" },
            { skill: "OKRs", demand: "high", category: "Strategy" },
          ],
          "data scientist": [
            { skill: "Python", demand: "critical", category: "Programming" },
            { skill: "Machine Learning", demand: "critical", category: "Core" },
            { skill: "SQL", demand: "high", category: "Data" },
            { skill: "TensorFlow", demand: "high", category: "ML Frameworks" },
            { skill: "Statistics", demand: "critical", category: "Foundations" },
            { skill: "Deep Learning", demand: "high", category: "Advanced ML" },
            { skill: "NLP", demand: "medium", category: "Specialization" },
            { skill: "Spark", demand: "medium", category: "Big Data" },
            { skill: "Tableau", demand: "medium", category: "Visualization" },
            { skill: "Experiment Design", demand: "high", category: "Methodology" },
          ],
        };

        const defaultSkills: Array<{ skill: string; demand: "low" | "medium" | "high" | "critical"; category: string }> = [
          { skill: "Leadership", demand: "high", category: "Soft Skills" },
          { skill: "Communication", demand: "high", category: "Soft Skills" },
          { skill: "Problem Solving", demand: "high", category: "Core" },
          { skill: "Project Management", demand: "medium", category: "Management" },
          { skill: "Strategic Thinking", demand: "high", category: "Leadership" },
          { skill: "Cross-functional Collaboration", demand: "medium", category: "Soft Skills" },
          { skill: "Data-Driven Decision Making", demand: "high", category: "Analytics" },
          { skill: "Stakeholder Management", demand: "medium", category: "Management" },
        ];

        const matchedRole = Object.keys(roleSkillMap).find((role) =>
          targetRole.includes(role),
        );
        const roleSkills = matchedRole
          ? roleSkillMap[matchedRole]!
          : defaultSkills;

        const allCandidates = [...roleSkills, ...defaultSkills];

        const suggestions: SkillSuggestion[] = [];
        const seen = new Set<string>();

        for (const candidate of allCandidates) {
          const normalizedSkill = candidate.skill.toLowerCase();
          if (currentSkills.includes(normalizedSkill)) continue;
          if (seen.has(normalizedSkill)) continue;
          seen.add(normalizedSkill);

          suggestions.push({
            skill: candidate.skill,
            relevance: `Essential for ${targetRole} roles in ${industry}`,
            demandLevel: candidate.demand,
            category: candidate.category,
          });
        }

        const demandOrder: Record<string, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
        };

        suggestions.sort(
          (a, b) => demandOrder[a.demandLevel]! - demandOrder[b.demandLevel]!,
        );

        return suggestions.slice(0, 10);
      },
    };
  }

  private scoreHeadline(headline: string): number {
    let score = 0;
    if (headline.length > 0) score += 20;
    if (headline.length > 30) score += 15;
    if (headline.length > 60) score += 10;
    if (headline.includes("|") || headline.includes("•") || headline.includes("—"))
      score += 15;
    if (/\d/.test(headline)) score += 10;
    const powerWords = ["lead", "build", "driv", "transform", "innovat", "strateg", "expert"];
    const lowerHeadline = headline.toLowerCase();
    for (const word of powerWords) {
      if (lowerHeadline.includes(word)) {
        score += 5;
        break;
      }
    }
    if (headline.length <= 120) score += 10;
    return Math.min(100, score);
  }

  private scoreAbout(about: string): number {
    let score = 0;
    const wordCount = about.split(/\s+/).length;
    if (wordCount > 0) score += 10;
    if (wordCount > 50) score += 15;
    if (wordCount > 150) score += 15;
    if (wordCount > 300) score += 10;
    if (about.includes("•") || about.includes("→") || about.includes("✓"))
      score += 10;
    if (/\d+%|\$\d+|\d+\+/.test(about)) score += 15;
    const ctaKeywords = ["connect", "reach out", "let's", "contact", "email"];
    for (const kw of ctaKeywords) {
      if (about.toLowerCase().includes(kw)) {
        score += 10;
        break;
      }
    }
    if (about.includes("\n\n") || about.includes("\n")) score += 5;
    return Math.min(100, score);
  }

  private assessCompleteness(profile: LinkedInProfile): string {
    let filled = 0;
    const total = 7;
    if (profile.headline.length > 0) filled++;
    if (profile.about.length > 0) filled++;
    if (profile.experiences.length > 0) filled++;
    if (profile.education.length > 0) filled++;
    if (profile.skills.length >= 5) filled++;
    if (profile.recommendations > 0) filled++;
    if (profile.connections >= 100) filled++;
    return `${Math.round((filled / total) * 100)}%`;
  }
}
