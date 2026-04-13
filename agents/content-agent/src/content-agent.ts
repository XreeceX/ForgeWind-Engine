import OpenAI from "openai";
import pino from "pino";
import {
  BaseAgent,
  type AgentContext,
  type AgentTool,
  type ToolParameters,
} from "@career-os/agent-core";
import type { LinkedInProfile } from "@career-os/shared-types";

interface PostIdea {
  topic: string;
  angle: string;
  format: "text" | "carousel" | "poll" | "video_script" | "article";
  estimatedEngagement: "low" | "medium" | "high" | "viral";
  targetAudience: string;
  hook: string;
}

interface WrittenPost {
  content: string;
  hashtags: string[];
  estimatedReadTimeSeconds: number;
  callToAction: string;
  postType: string;
  characterCount: number;
}

interface ContentPlan {
  weekStart: string;
  posts: PlannedPost[];
  themes: string[];
  goals: string[];
}

interface PlannedPost {
  dayOfWeek: string;
  timeSlot: string;
  topic: string;
  format: string;
  objective: string;
}

interface HookSuggestion {
  hook: string;
  hookType: "question" | "statistic" | "contrarian" | "story" | "challenge";
  whyItWorks: string;
}

interface TrendInsight {
  trend: string;
  relevance: string;
  contentOpportunity: string;
  urgency: "evergreen" | "timely" | "urgent";
}

export class ContentAgent extends BaseAgent {
  constructor(openai: OpenAI, logger?: pino.Logger) {
    super(openai, "content-strategist", logger);
  }

  protected getSystemPrompt(context: AgentContext): string {
    const profile = context.input["profile"] as LinkedInProfile | undefined;
    const industry = (context.input["industry"] as string) ?? "technology";
    const tone = (context.input["tone"] as string) ?? "professional yet approachable";

    return `You are a LinkedIn content strategist and ghostwriter with expertise in building thought leadership on the platform.

Your deep expertise includes:
- Writing viral LinkedIn posts that generate 10x average engagement
- Understanding LinkedIn's algorithm (dwell time, early engagement velocity, comment quality)
- Creating content calendars aligned with personal brand strategy
- Crafting hooks that stop the scroll in the first 2 lines
- A/B testing post variations for maximum reach
- Building authority through consistent, high-value content

Content creator context:
- Industry: ${industry}
- Desired tone: ${tone}
- Current connections: ${profile?.connections ?? "unknown"}
- Current posting history: ${profile?.posts?.length ?? 0} posts tracked
${profile?.posts && profile.posts.length > 0 ? `- Average engagement: ${Math.round(profile.posts.reduce((sum, p) => sum + p.likes + p.comments, 0) / profile.posts.length)} interactions per post` : ""}

LinkedIn algorithm insights you should apply:
1. First 2 lines are the hook — they appear before "...see more"
2. Posts with 8-12 lines of text get the highest dwell time
3. Carousels/documents get 2-3x more reach than text posts
4. Posts with questions drive 2x comments
5. Best posting times: Tue-Thu, 8-10am or 5-6pm in user's timezone
6. Native content always outperforms external links

You MUST respond with valid JSON containing:
{
  "output": <your structured result>,
  "reasoning": "<explanation of your content strategy>",
  "confidence": <0.0 to 1.0>
}`;
  }

  protected buildUserMessage(context: AgentContext): string {
    const action = (context.input["action"] as string) ?? "generate_ideas";
    const profile = context.input["profile"] as LinkedInProfile | undefined;
    const topic = context.input["topic"] as string | undefined;
    const expertise = context.input["expertise"] as string[] | undefined;
    const audience = context.input["targetAudience"] as string | undefined;

    const parts: string[] = [];
    parts.push(`Action: ${action}`);

    if (topic) parts.push(`Topic focus: ${topic}`);
    if (audience) parts.push(`Target audience: ${audience}`);

    if (expertise && expertise.length > 0) {
      parts.push(`Creator expertise areas: ${expertise.join(", ")}`);
    }

    if (profile) {
      parts.push(`\nProfile context:`);
      parts.push(`Headline: ${profile.headline}`);
      parts.push(`Skills: ${profile.skills.map((s) => s.name).join(", ")}`);

      if (profile.posts.length > 0) {
        parts.push(`\nRecent posts performance:`);
        const sortedPosts = [...profile.posts].sort(
          (a, b) => b.likes + b.comments - (a.likes + a.comments),
        );
        for (const post of sortedPosts.slice(0, 3)) {
          parts.push(
            `- "${post.content.slice(0, 80)}..." (${post.likes} likes, ${post.comments} comments)`,
          );
        }
      }
    }

    const previousContent = context.memory.shortTermContext["previousPosts"] as
      | string[]
      | undefined;
    if (previousContent && previousContent.length > 0) {
      parts.push(
        `\nAvoid topics already covered: ${previousContent.join(", ")}`,
      );
    }

    return parts.join("\n");
  }

  protected getTools(): AgentTool[] {
    return [
      this.createGeneratePostIdeasTool(),
      this.createWritePostTool(),
      this.createContentPlanTool(),
      this.createSuggestHooksTool(),
      this.createAnalyzeTrendsTool(),
    ];
  }

  private createGeneratePostIdeasTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        expertise: {
          type: "string",
          description: "Comma-separated areas of expertise",
        },
        industry: {
          type: "string",
          description: "Target industry",
        },
        audienceLevel: {
          type: "string",
          description: "Audience seniority level",
          enum: ["junior", "mid-level", "senior", "executive", "mixed"],
        },
        contentGoal: {
          type: "string",
          description: "Primary goal of the content",
          enum: [
            "thought_leadership",
            "engagement",
            "lead_generation",
            "hiring",
            "personal_brand",
          ],
        },
        count: {
          type: "string",
          description: "Number of ideas to generate (1-10)",
        },
      },
      required: ["expertise", "industry"],
    };

    return {
      name: "generate_post_ideas",
      description:
        "Brainstorm LinkedIn post topics tailored to the creator's expertise, industry, and audience. Each idea includes a topic, angle, format recommendation, engagement estimate, and a sample hook.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<PostIdea[]> => {
        const expertiseAreas = (params["expertise"] as string)
          .split(",")
          .map((s) => s.trim());
        const industry = params["industry"] as string;
        const audienceLevel =
          (params["audienceLevel"] as string) ?? "mixed";
        const goal =
          (params["contentGoal"] as string) ?? "thought_leadership";
        const count = Math.min(
          10,
          parseInt((params["count"] as string) ?? "5", 10),
        );

        const templates: Array<{
          angle: string;
          format: PostIdea["format"];
          engagement: PostIdea["estimatedEngagement"];
          hookTemplate: (expertise: string) => string;
        }> = [
          {
            angle: "Lessons learned the hard way",
            format: "text",
            engagement: "high",
            hookTemplate: (exp) =>
              `I spent 5 years doing ${exp} wrong. Here's what I wish someone told me on day 1:`,
          },
          {
            angle: "Contrarian take on industry norm",
            format: "text",
            engagement: "viral",
            hookTemplate: (exp) =>
              `Unpopular opinion: Most ${exp} advice is outdated. Here's what actually works in 2025:`,
          },
          {
            angle: "Framework / mental model",
            format: "carousel",
            engagement: "high",
            hookTemplate: (exp) =>
              `The 4-step framework I use for every ${exp} decision (saved me 100+ hours):`,
          },
          {
            angle: "Behind the scenes story",
            format: "text",
            engagement: "high",
            hookTemplate: (exp) =>
              `Last month, I almost made a critical ${exp} mistake. Here's what happened:`,
          },
          {
            angle: "Data-backed insight",
            format: "carousel",
            engagement: "medium",
            hookTemplate: (exp) =>
              `I analyzed 500+ ${exp} projects. The top 10% all do these 3 things differently:`,
          },
          {
            angle: "Beginner's guide",
            format: "carousel",
            engagement: "medium",
            hookTemplate: (exp) =>
              `New to ${exp}? Here's the roadmap I wish I had (save this):`,
          },
          {
            angle: "Industry prediction",
            format: "text",
            engagement: "high",
            hookTemplate: (exp) =>
              `${exp} is about to change dramatically. Here are 5 shifts I'm betting on:`,
          },
          {
            angle: "Tool/resource roundup",
            format: "carousel",
            engagement: "medium",
            hookTemplate: (exp) =>
              `10 ${exp} tools that replaced my entire workflow (most are free):`,
          },
          {
            angle: "Audience poll / debate starter",
            format: "poll",
            engagement: "high",
            hookTemplate: (exp) =>
              `Settle this debate: What's the #1 skill in ${exp} right now?`,
          },
          {
            angle: "Career story / vulnerability",
            format: "text",
            engagement: "viral",
            hookTemplate: (exp) =>
              `3 years ago, I was rejected from every ${exp} role I applied to. Today, I lead a team of 20. Here's what changed:`,
          },
        ];

        const goalAudience: Record<string, string> = {
          thought_leadership: `${audienceLevel} professionals in ${industry}`,
          engagement: `Broad LinkedIn audience interested in ${industry}`,
          lead_generation: `Decision-makers and hiring managers in ${industry}`,
          hiring: `${industry} talent looking for opportunities`,
          personal_brand: `${industry} community and recruiter network`,
        };

        const ideas: PostIdea[] = [];
        const selectedTemplates = templates.slice(0, count);

        for (let i = 0; i < selectedTemplates.length; i++) {
          const template = selectedTemplates[i]!;
          const expertise =
            expertiseAreas[i % expertiseAreas.length] ?? expertiseAreas[0]!;

          ideas.push({
            topic: `${expertise} — ${template.angle}`,
            angle: template.angle,
            format: template.format,
            estimatedEngagement: template.engagement,
            targetAudience: goalAudience[goal] ?? goalAudience["thought_leadership"]!,
            hook: template.hookTemplate(expertise),
          });
        }

        return ideas;
      },
    };
  }

  private createWritePostTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Post topic",
        },
        hook: {
          type: "string",
          description: "Opening hook line",
        },
        keyPoints: {
          type: "string",
          description: "Comma-separated key points to cover",
        },
        tone: {
          type: "string",
          description: "Writing tone",
          enum: ["professional", "casual", "inspirational", "educational", "provocative"],
        },
        format: {
          type: "string",
          description: "Post format",
          enum: ["text", "listicle", "story", "how-to", "opinion"],
        },
        includeHashtags: {
          type: "string",
          description: "Whether to include hashtags (true/false)",
        },
      },
      required: ["topic", "hook", "keyPoints"],
    };

    return {
      name: "write_post",
      description:
        "Write a complete, publish-ready LinkedIn post. Crafts the hook, body, and call-to-action. Optimized for LinkedIn's algorithm (line spacing, length, engagement triggers).",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<WrittenPost> => {
        const topic = params["topic"] as string;
        const hook = params["hook"] as string;
        const keyPoints = (params["keyPoints"] as string)
          .split(",")
          .map((s) => s.trim());
        const tone = (params["tone"] as string) ?? "professional";
        const format = (params["format"] as string) ?? "text";
        const includeHashtags =
          (params["includeHashtags"] as string) !== "false";

        const lines: string[] = [];

        lines.push(hook);
        lines.push("");

        if (format === "listicle" || format === "how-to") {
          for (let i = 0; i < keyPoints.length; i++) {
            lines.push(`${i + 1}. ${keyPoints[i]}`);
            lines.push("");
          }
        } else if (format === "story") {
          lines.push("Here's how it happened:");
          lines.push("");
          for (const point of keyPoints) {
            lines.push(`→ ${point}`);
          }
          lines.push("");
          lines.push("The lesson?");
          lines.push("");
        } else {
          for (const point of keyPoints) {
            lines.push(`• ${point}`);
          }
          lines.push("");
        }

        const ctas: Record<string, string> = {
          professional:
            "What's your take? I'd love to hear your perspective in the comments.",
          casual: "Agree? Disagree? Drop your thoughts below 👇",
          inspirational:
            "If this resonated, share it with someone who needs to hear it today.",
          educational:
            "Save this for later and follow for more actionable insights.",
          provocative:
            "Change my mind. I'll respond to every thoughtful comment.",
        };

        lines.push(ctas[tone] ?? ctas["professional"]!);

        const content = lines.join("\n");

        const topicWords = topic
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        const hashtags = includeHashtags
          ? [
              ...topicWords.slice(0, 3).map((w) => `#${w}`),
              "#careers",
              "#linkedin",
            ].slice(0, 5)
          : [];

        const wordCount = content.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 4);

        return {
          content: includeHashtags
            ? `${content}\n\n${hashtags.join(" ")}`
            : content,
          hashtags,
          estimatedReadTimeSeconds: readTime,
          callToAction: ctas[tone] ?? ctas["professional"]!,
          postType: format,
          characterCount: content.length,
        };
      },
    };
  }

  private createContentPlanTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        expertise: {
          type: "string",
          description: "Comma-separated expertise areas",
        },
        postsPerWeek: {
          type: "string",
          description: "Target number of posts per week (1-7)",
        },
        primaryGoal: {
          type: "string",
          description: "Primary content goal",
          enum: [
            "thought_leadership",
            "engagement",
            "lead_generation",
            "hiring",
            "personal_brand",
          ],
        },
        weekStartDate: {
          type: "string",
          description: "Start date for the content plan (YYYY-MM-DD)",
        },
      },
      required: ["expertise", "postsPerWeek"],
    };

    return {
      name: "create_content_plan",
      description:
        "Generate a weekly content calendar with specific post topics, formats, optimal posting times, and strategic objectives for each post.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<ContentPlan> => {
        const expertiseAreas = (params["expertise"] as string)
          .split(",")
          .map((s) => s.trim());
        const postsPerWeek = Math.min(
          7,
          Math.max(1, parseInt((params["postsPerWeek"] as string) ?? "3", 10)),
        );
        const goal =
          (params["primaryGoal"] as string) ?? "thought_leadership";
        const weekStart =
          (params["weekStartDate"] as string) ??
          new Date().toISOString().split("T")[0]!;

        const optimalDays = [
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Monday",
          "Friday",
          "Saturday",
          "Sunday",
        ];

        const timeSlots = ["8:00 AM", "10:00 AM", "12:00 PM", "5:30 PM"];

        const postFormats = [
          "text",
          "carousel",
          "poll",
          "text",
          "carousel",
          "text",
          "article",
        ];

        const goalObjectives: Record<string, string[]> = {
          thought_leadership: [
            "Establish authority",
            "Share unique insight",
            "Start a discussion",
            "Present a framework",
            "Challenge conventional thinking",
          ],
          engagement: [
            "Drive comments",
            "Spark debate",
            "Encourage shares",
            "Build community",
            "Increase followers",
          ],
          lead_generation: [
            "Demonstrate expertise",
            "Solve a pain point",
            "Share case study",
            "Build trust",
            "Soft CTA",
          ],
          hiring: [
            "Showcase culture",
            "Highlight team wins",
            "Share job opening",
            "Celebrate employees",
            "Employer branding",
          ],
          personal_brand: [
            "Tell personal story",
            "Share career lesson",
            "Behind the scenes",
            "Celebrate milestone",
            "Vulnerability post",
          ],
        };

        const objectives = goalObjectives[goal] ?? goalObjectives["thought_leadership"]!;

        const posts: PlannedPost[] = [];
        for (let i = 0; i < postsPerWeek; i++) {
          posts.push({
            dayOfWeek: optimalDays[i % optimalDays.length]!,
            timeSlot: timeSlots[i % timeSlots.length]!,
            topic: `${expertiseAreas[i % expertiseAreas.length]} deep-dive`,
            format: postFormats[i % postFormats.length]!,
            objective: objectives[i % objectives.length]!,
          });
        }

        const themes = expertiseAreas.slice(0, 3).map((area) => `${area} thought leadership`);
        if (goal === "personal_brand") {
          themes.push("Career journey & authenticity");
        }

        const goals = [
          `Post ${postsPerWeek}x per week consistently`,
          "Grow impressions by 20% week-over-week",
          "Maintain 3%+ engagement rate",
          `Establish authority in ${expertiseAreas[0]}`,
        ];

        return {
          weekStart,
          posts,
          themes,
          goals,
        };
      },
    };
  }

  private createSuggestHooksTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Post topic to create hooks for",
        },
        tone: {
          type: "string",
          description: "Desired tone for the hook",
          enum: ["bold", "curious", "vulnerable", "data-driven", "contrarian"],
        },
        count: {
          type: "string",
          description: "Number of hook suggestions (1-10)",
        },
      },
      required: ["topic"],
    };

    return {
      name: "suggest_hooks",
      description:
        "Generate scroll-stopping hook suggestions for a LinkedIn post topic. Each hook comes with the strategy behind why it works and the psychological trigger it uses.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<HookSuggestion[]> => {
        const topic = params["topic"] as string;
        const count = Math.min(
          10,
          parseInt((params["count"] as string) ?? "5", 10),
        );

        const hookTemplates: Array<{
          type: HookSuggestion["hookType"];
          template: (t: string) => string;
          why: string;
        }> = [
          {
            type: "question",
            template: (t) =>
              `What if everything you know about ${t} is wrong?`,
            why: "Opens a knowledge gap that readers feel compelled to close. The implicit challenge to expertise drives clicks.",
          },
          {
            type: "statistic",
            template: (t) =>
              `90% of professionals get ${t} wrong. Here's what the top 10% do differently:`,
            why: "Specific numbers create credibility. The 90/10 split triggers loss aversion — readers want to be in the 10%.",
          },
          {
            type: "contrarian",
            template: (t) =>
              `Stop following ${t} best practices. They're holding you back.`,
            why: "Challenges conventional wisdom and creates cognitive dissonance. Readers engage to defend or validate their position.",
          },
          {
            type: "story",
            template: (t) =>
              `I almost quit my career over ${t}. Then this happened:`,
            why: "Vulnerability and narrative create emotional connection. The cliffhanger ensures they click 'see more'.",
          },
          {
            type: "challenge",
            template: (t) =>
              `I challenge you to try this one ${t} technique for 30 days. The results will surprise you:`,
            why: "Direct challenges create personal relevance. The time-bound element makes it feel actionable and achievable.",
          },
          {
            type: "question",
            template: (t) =>
              `If you could master one thing about ${t}, what would it be? (My answer might surprise you)`,
            why: "Invites participation while teasing valuable content. Drives comments and algorithm-boosting engagement.",
          },
          {
            type: "statistic",
            template: (t) =>
              `I studied 100+ successful ${t} examples. Here are the 3 patterns they all share:`,
            why: "Research-backed authority combined with a listicle promise. The specific number (100+) builds credibility.",
          },
          {
            type: "contrarian",
            template: (t) =>
              `Unpopular opinion: ${t} advice from 2020 is actually hurting you in 2025.`,
            why: "Time-anchored contrarian take creates urgency. Readers worry they have outdated knowledge.",
          },
          {
            type: "story",
            template: (t) =>
              `The worst ${t} decision I ever made turned into my biggest breakthrough.`,
            why: "Redemption arc stories are universally compelling. The paradox (worst → biggest) creates a curiosity gap.",
          },
          {
            type: "challenge",
            template: (t) =>
              `Your ${t} strategy is missing this ONE thing. (And it's not what you think)`,
            why: "Creates FOMO and challenges competence gently. The parenthetical disclaimer prevents it from feeling preachy.",
          },
        ];

        return hookTemplates.slice(0, count).map((h) => ({
          hook: h.template(topic),
          hookType: h.type,
          whyItWorks: h.why,
        }));
      },
    };
  }

  private createAnalyzeTrendsTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        industry: {
          type: "string",
          description: "Industry to analyze trends for",
        },
        expertise: {
          type: "string",
          description: "Comma-separated areas of expertise for relevance filtering",
        },
        timeframe: {
          type: "string",
          description: "Trend timeframe to analyze",
          enum: ["this_week", "this_month", "this_quarter", "this_year"],
        },
      },
      required: ["industry"],
    };

    return {
      name: "analyze_trends",
      description:
        "Analyze current industry trends relevant to the creator's expertise. Identifies content opportunities, urgency level, and how the creator can add unique value to the conversation.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<TrendInsight[]> => {
        const industry = params["industry"] as string;
        const expertise = params["expertise"]
          ? (params["expertise"] as string).split(",").map((s) => s.trim())
          : [];

        const trendDatabase: Record<string, TrendInsight[]> = {
          technology: [
            {
              trend: "AI agents replacing traditional SaaS workflows",
              relevance: "Reshaping how software is built and consumed",
              contentOpportunity: `Share your perspective on how ${expertise[0] ?? "your expertise"} intersects with AI agent capabilities`,
              urgency: "urgent",
            },
            {
              trend: "Remote work infrastructure becoming permanent",
              relevance: "Companies are investing in long-term distributed tooling",
              contentOpportunity: "Share frameworks for effective remote collaboration from your experience",
              urgency: "timely",
            },
            {
              trend: "Developer experience (DX) as competitive advantage",
              relevance: "Engineering teams prioritizing internal tooling",
              contentOpportunity: "Write about developer productivity wins from your team",
              urgency: "timely",
            },
            {
              trend: "Cybersecurity shifting left in development lifecycle",
              relevance: "Security becoming everyone's responsibility",
              contentOpportunity: "Share practical security tips developers actually follow",
              urgency: "evergreen",
            },
          ],
          finance: [
            {
              trend: "Embedded finance in non-financial products",
              relevance: "Every company is becoming a fintech company",
              contentOpportunity: "Break down what this means for traditional finance roles",
              urgency: "timely",
            },
            {
              trend: "AI in risk assessment and compliance",
              relevance: "Regulatory technology accelerating adoption",
              contentOpportunity: "Share how AI is changing risk workflows",
              urgency: "urgent",
            },
            {
              trend: "Sustainable finance and ESG reporting mandates",
              relevance: "New regulations creating new specializations",
              contentOpportunity: "Explain ESG implications in accessible terms",
              urgency: "evergreen",
            },
          ],
          default: [
            {
              trend: "AI literacy becoming a baseline professional skill",
              relevance: "Every industry is being reshaped by AI adoption",
              contentOpportunity: `Share how ${industry} professionals can build AI fluency`,
              urgency: "urgent",
            },
            {
              trend: "Skills-based hiring over degree requirements",
              relevance: "Credential inflation meets practical hiring",
              contentOpportunity: "Share your perspective on what actually predicts job success",
              urgency: "timely",
            },
            {
              trend: "Personal branding as career insurance",
              relevance: "Layoffs making professional visibility critical",
              contentOpportunity: "Document your journey building a professional presence",
              urgency: "evergreen",
            },
          ],
        };

        const industryKey = industry.toLowerCase();
        const trends = trendDatabase[industryKey] ?? trendDatabase["default"]!;

        return trends;
      },
    };
  }
}
