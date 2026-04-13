import OpenAI from "openai";
import pino from "pino";
import {
  BaseAgent,
  type AgentContext,
  type AgentTool,
  type ToolParameters,
} from "@careeros-forge-engine/agent-core";
import type { LinkedInProfile, Job } from "@careeros-forge-engine/shared-types";

interface ColdEmail {
  subject: string;
  body: string;
  recipientType: string;
  personalizationPoints: string[];
  estimatedResponseRate: number;
  followUpTiming: string;
}

interface ConnectionRequest {
  message: string;
  characterCount: number;
  personalizationPoints: string[];
  connectionRationale: string;
}

interface NetworkingTarget {
  targetType: string;
  searchCriteria: string;
  approachStrategy: string;
  messageTemplate: string;
  priority: "high" | "medium" | "low";
  expectedOutcome: string;
}

interface FollowUp {
  message: string;
  daysSinceLastContact: number;
  tone: string;
  valueAdd: string;
  subject?: string;
}

interface OutreachAnalysis {
  totalSent: number;
  responseRate: number;
  positiveResponseRate: number;
  bestPerformingType: string;
  worstPerformingType: string;
  recommendations: string[];
  topPerformingPatterns: string[];
}

export class OutreachAgent extends BaseAgent {
  constructor(openai: OpenAI, logger?: pino.Logger) {
    super(openai, "outreach-assistant", logger);
  }

  protected getSystemPrompt(context: AgentContext): string {
    const profile = context.input["profile"] as LinkedInProfile | undefined;
    const targetJob = context.input["targetJob"] as Job | undefined;

    return `You are an expert career networking and outreach strategist who has helped thousands of professionals land interviews through strategic outreach.

Your expertise includes:
- Writing cold emails that get 30%+ response rates
- Crafting LinkedIn connection requests that feel genuine, not transactional
- Building networking strategies that create warm introductions
- Timing follow-ups for maximum impact without being pushy
- Analyzing outreach effectiveness and iterating on messaging

${profile ? `Sender profile: ${profile.headline} | ${profile.connections} connections | ${profile.experiences[0]?.title ?? "Professional"} at ${profile.experiences[0]?.company ?? "Current Company"}` : ""}
${targetJob ? `Target opportunity: ${targetJob.title} at ${targetJob.company}` : ""}

Core outreach principles you follow:
1. Lead with VALUE, not asks — give before you take
2. Personalize with specific details (company news, shared connections, their content)
3. Keep messages concise — under 150 words for cold outreach
4. One clear call-to-action per message
5. Follow the 3-touch rule: initial, value-add follow-up, graceful close
6. Never be generic — if a message could be sent to anyone, rewrite it
7. LinkedIn connection requests are limited to 300 characters — be strategic

You MUST respond with valid JSON containing:
{
  "output": <your structured result>,
  "reasoning": "<explanation of your outreach strategy>",
  "confidence": <0.0 to 1.0>
}`;
  }

  protected buildUserMessage(context: AgentContext): string {
    const action = (context.input["action"] as string) ?? "draft_cold_email";
    const profile = context.input["profile"] as LinkedInProfile | undefined;
    const targetJob = context.input["targetJob"] as Job | undefined;
    const recipientInfo = context.input["recipientInfo"] as Record<string, unknown> | undefined;
    const outreachHistory = context.input["outreachHistory"] as Array<Record<string, unknown>> | undefined;

    const parts: string[] = [];
    parts.push(`Action: ${action}`);

    if (profile) {
      parts.push(`\nSender:`);
      parts.push(`Name: ${profile.headline}`);
      parts.push(`Experience: ${profile.experiences.map((e) => `${e.title} @ ${e.company}`).join(", ")}`);
      parts.push(`Skills: ${profile.skills.slice(0, 10).map((s) => s.name).join(", ")}`);
    }

    if (recipientInfo) {
      parts.push(`\nRecipient information:`);
      for (const [key, value] of Object.entries(recipientInfo)) {
        parts.push(`  ${key}: ${String(value)}`);
      }
    }

    if (targetJob) {
      parts.push(`\nTarget opportunity:`);
      parts.push(`Role: ${targetJob.title} at ${targetJob.company}`);
      parts.push(`Location: ${targetJob.location}`);
      parts.push(`Required skills: ${targetJob.skills.join(", ")}`);
    }

    if (outreachHistory && outreachHistory.length > 0) {
      parts.push(`\nOutreach history (${outreachHistory.length} records):`);
      for (const record of outreachHistory.slice(0, 10)) {
        parts.push(`  - Type: ${record["type"] as string}, Response: ${record["responded"] as string}`);
      }
    }

    return parts.join("\n");
  }

  protected getTools(): AgentTool[] {
    return [
      this.createDraftColdEmailTool(),
      this.createDraftConnectionRequestTool(),
      this.createSuggestNetworkingTargetsTool(),
      this.createDraftFollowupTool(),
      this.createAnalyzeOutreachTool(),
    ];
  }

  private createDraftColdEmailTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        recipientName: {
          type: "string",
          description: "Recipient's name",
        },
        recipientRole: {
          type: "string",
          description: "Recipient's current role/title",
        },
        recipientCompany: {
          type: "string",
          description: "Recipient's company",
        },
        senderBackground: {
          type: "string",
          description: "Brief sender background relevant to the outreach",
        },
        purpose: {
          type: "string",
          description: "Purpose of the email",
          enum: [
            "job_inquiry",
            "informational_interview",
            "referral_request",
            "networking",
            "collaboration",
          ],
        },
        sharedConnections: {
          type: "string",
          description: "Any shared connections or commonalities",
        },
        specificDetail: {
          type: "string",
          description: "A specific detail about the recipient or their work to personalize the email",
        },
      },
      required: ["recipientName", "recipientRole", "recipientCompany", "purpose"],
    };

    return {
      name: "draft_cold_email",
      description:
        "Write a personalized cold outreach email to a recruiter, hiring manager, or potential contact. Optimized for response rate with a clear value proposition and CTA.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<ColdEmail> => {
        const name = params["recipientName"] as string;
        const role = params["recipientRole"] as string;
        const company = params["recipientCompany"] as string;
        const sender = (params["senderBackground"] as string) ?? "an experienced professional";
        const purpose = params["purpose"] as string;
        const sharedConnections =
          (params["sharedConnections"] as string) ?? "";
        const specificDetail =
          (params["specificDetail"] as string) ?? "";

        const personalizationPoints: string[] = [];

        const subjectLines: Record<string, string> = {
          job_inquiry: `Quick question about the team at ${company}`,
          informational_interview: `${role} perspective — 15 min chat?`,
          referral_request: `Referred to you by a mutual connection`,
          networking: `Fellow ${role.split(" ")[0]} — thought you'd find this relevant`,
          collaboration: `Potential synergy between our work`,
        };

        const subject = subjectLines[purpose] ?? subjectLines["networking"]!;

        const lines: string[] = [];

        lines.push(`Hi ${name},`);
        lines.push("");

        if (sharedConnections) {
          lines.push(
            `I noticed we're both connected to ${sharedConnections} — small world!`,
          );
          personalizationPoints.push(`Shared connection: ${sharedConnections}`);
        } else if (specificDetail) {
          lines.push(
            `I came across ${specificDetail} and it really resonated with me.`,
          );
          personalizationPoints.push(`Specific detail: ${specificDetail}`);
        } else {
          lines.push(
            `I've been following ${company}'s work and I'm impressed by what you're building.`,
          );
          personalizationPoints.push(`Company awareness: ${company}`);
        }
        lines.push("");

        const purposeBody: Record<string, string> = {
          job_inquiry: `I'm ${sender}, and I'm exploring opportunities where I can drive impact. ${company}'s approach to ${role.toLowerCase().includes("engineer") ? "engineering" : "the market"} caught my eye. I'd love to learn about your team's current priorities and whether there might be alignment.`,
          informational_interview: `I'm ${sender} looking to deepen my understanding of ${role} at companies like ${company}. Your career path is one I admire, and I'd be grateful for 15 minutes of your time to learn from your experience.`,
          referral_request: `I'm ${sender} applying for a role at ${company}. Given your perspective as ${role}, I'd love to hear what the team values most — and if you see a fit, a referral would be incredible.`,
          networking: `I'm ${sender} working in a similar space. I think there could be interesting overlap in what we're each working on, and I'd enjoy exchanging perspectives.`,
          collaboration: `I'm ${sender} and I see a natural synergy between our work. I have an idea I think could benefit both of us — would love 15 minutes to explore it.`,
        };

        lines.push(purposeBody[purpose] ?? purposeBody["networking"]!);
        lines.push("");
        lines.push(
          "Would you be open to a brief chat this week or next? I'm flexible on timing.",
        );
        lines.push("");
        lines.push("Best,");
        lines.push("[Your Name]");

        const body = lines.join("\n");

        const responseRates: Record<string, number> = {
          job_inquiry: 0.15,
          informational_interview: 0.25,
          referral_request: 0.2,
          networking: 0.18,
          collaboration: 0.22,
        };

        const baseRate = responseRates[purpose] ?? 0.15;
        const personalizedBoost = personalizationPoints.length * 0.05;

        return {
          subject,
          body,
          recipientType: role,
          personalizationPoints,
          estimatedResponseRate: Math.min(
            0.45,
            baseRate + personalizedBoost,
          ),
          followUpTiming: "Follow up in 3-5 business days if no response",
        };
      },
    };
  }

  private createDraftConnectionRequestTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        recipientName: {
          type: "string",
          description: "Person's name",
        },
        recipientRole: {
          type: "string",
          description: "Their current role",
        },
        recipientCompany: {
          type: "string",
          description: "Their current company",
        },
        connectionReason: {
          type: "string",
          description: "Why you want to connect",
          enum: [
            "shared_industry",
            "mutual_connection",
            "admire_work",
            "potential_role",
            "event_met",
            "content_engaged",
          ],
        },
        specificDetail: {
          type: "string",
          description: "A specific detail to personalize the request",
        },
      },
      required: ["recipientName", "recipientRole", "connectionReason"],
    };

    return {
      name: "draft_connection_request",
      description:
        "Create a personalized LinkedIn connection request (max 300 characters). Each message is tailored with specific personalization and a clear reason to connect.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<ConnectionRequest> => {
        const name = params["recipientName"] as string;
        const role = params["recipientRole"] as string;
        const company =
          (params["recipientCompany"] as string) ?? "your company";
        const reason = params["connectionReason"] as string;
        const detail = (params["specificDetail"] as string) ?? "";

        const templates: Record<string, string> = {
          shared_industry: `Hi ${name}, fellow ${role.split(" ")[0]} professional here. I'd love to connect and exchange ideas about our industry. Looking forward to being in your network.`,
          mutual_connection: `Hi ${name}, we share some mutual connections and I've seen your work at ${company}. Would love to connect and stay in touch.`,
          admire_work: `Hi ${name}, I've been impressed by ${detail || `what you're building at ${company}`}. Would love to connect and learn from your approach to ${role.toLowerCase()}.`,
          potential_role: `Hi ${name}, I'm exploring ${role} opportunities and ${company} stands out. Would love to connect and learn more about your team's work.`,
          event_met: `Hi ${name}, great meeting you at ${detail || "the recent event"}! Would love to stay connected and continue our conversation about ${role.toLowerCase()}.`,
          content_engaged: `Hi ${name}, your recent post about ${detail || role.toLowerCase()} really resonated. Would love to connect and follow more of your insights.`,
        };

        let message = templates[reason] ?? templates["shared_industry"]!;

        if (message.length > 300) {
          message = message.slice(0, 297) + "...";
        }

        const personalizationPoints: string[] = [];
        if (detail) personalizationPoints.push(detail);
        if (company !== "your company")
          personalizationPoints.push(`Company: ${company}`);
        personalizationPoints.push(`Connection type: ${reason}`);

        return {
          message,
          characterCount: message.length,
          personalizationPoints,
          connectionRationale: reason.replace(/_/g, " "),
        };
      },
    };
  }

  private createSuggestNetworkingTargetsTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        targetRole: {
          type: "string",
          description: "Role the user is targeting",
        },
        targetCompanies: {
          type: "string",
          description: "Comma-separated target companies",
        },
        industry: {
          type: "string",
          description: "Target industry",
        },
        currentNetwork: {
          type: "string",
          description: "Brief description of current network strength",
        },
      },
      required: ["targetRole"],
    };

    return {
      name: "suggest_networking_targets",
      description:
        "Recommend specific types of people to reach out to based on target role and companies. Includes search criteria, approach strategy, and priority ranking.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<NetworkingTarget[]> => {
        const targetRole = params["targetRole"] as string;
        const companies = params["targetCompanies"]
          ? (params["targetCompanies"] as string)
              .split(",")
              .map((s) => s.trim())
          : [];
        const industry = (params["industry"] as string) ?? "technology";

        const targets: NetworkingTarget[] = [
          {
            targetType: "Hiring Manager",
            searchCriteria: `"${targetRole}" AND "manager" at ${companies[0] ?? industry + " companies"}`,
            approachStrategy:
              "Lead with industry insight or shared challenge. Ask about team priorities, not job openings.",
            messageTemplate: `Hi [Name], I've been following ${companies[0] ?? "your company"}'s work in ${industry}. As someone deeply interested in ${targetRole}, I'd love to hear about your team's current challenges.`,
            priority: "high",
            expectedOutcome:
              "Direct path to interview or referral for open positions",
          },
          {
            targetType: "Peer in Target Role",
            searchCriteria: `"${targetRole}" at ${companies.join(" OR ") || industry + " companies"}`,
            approachStrategy:
              "Connect as peers. Share relevant content or ask about their experience in the role.",
            messageTemplate: `Hi [Name], fellow ${targetRole.split(" ")[0]} here. I'd love to connect and hear about your experience at ${companies[0] ?? "your company"}.`,
            priority: "high",
            expectedOutcome:
              "Inside information about role, culture, and potential referral",
          },
          {
            targetType: "Recruiter Specializing in Role",
            searchCriteria: `"recruiter" AND "${targetRole}" OR "${industry} recruiter"`,
            approachStrategy:
              "Be direct about your search. Share a concise value proposition and target companies.",
            messageTemplate: `Hi [Name], I'm actively exploring ${targetRole} opportunities in ${industry}. Would love to connect in case any of your current searches align.`,
            priority: "medium",
            expectedOutcome:
              "Pipeline for current and future opportunities",
          },
          {
            targetType: "Alumni from Same School/Company",
            searchCriteria: `"[Your School/Company]" AND "${industry}"`,
            approachStrategy:
              "Leverage shared background for instant rapport. Alumni are 5x more likely to respond.",
            messageTemplate: `Hi [Name], fellow [School/Company] alum here! I see you've built an impressive career in ${industry}. Would love to connect.`,
            priority: "medium",
            expectedOutcome: "Warm introduction potential and career advice",
          },
          {
            targetType: "Industry Thought Leader",
            searchCriteria: `"${industry}" AND ("speaker" OR "author" OR "advisor")`,
            approachStrategy:
              "Engage with their content first (comment, share) for 2-3 weeks before connecting. Reference specific content.",
            messageTemplate: `Hi [Name], your post about ${industry} trends was spot-on. As a ${targetRole}, I'd love to follow your insights more closely.`,
            priority: "low",
            expectedOutcome:
              "Long-term network building and visibility in the industry",
          },
        ];

        return targets;
      },
    };
  }

  private createDraftFollowupTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        recipientName: {
          type: "string",
          description: "Recipient's name",
        },
        originalPurpose: {
          type: "string",
          description: "Purpose of the original outreach",
        },
        daysSinceContact: {
          type: "string",
          description: "Days since last contact",
        },
        previousMessageSummary: {
          type: "string",
          description: "Brief summary of the last message sent",
        },
        followUpNumber: {
          type: "string",
          description: "Which follow-up this is (1st, 2nd, 3rd)",
          enum: ["1", "2", "3"],
        },
        channel: {
          type: "string",
          description: "Communication channel",
          enum: ["email", "linkedin"],
        },
      },
      required: ["recipientName", "originalPurpose", "daysSinceContact", "followUpNumber"],
    };

    return {
      name: "draft_followup",
      description:
        "Draft a strategic follow-up message that adds value rather than just checking in. Each follow-up escalates gently with new information or angles.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<FollowUp> => {
        const name = params["recipientName"] as string;
        const purpose = params["originalPurpose"] as string;
        const daysSince = parseInt(
          params["daysSinceContact"] as string,
          10,
        );
        const followUpNum = parseInt(
          params["followUpNumber"] as string,
          10,
        );
        const channel = (params["channel"] as string) ?? "email";

        const isLinkedIn = channel === "linkedin";

        const followUpStrategies: Record<
          number,
          { tone: string; valueAdd: string; template: string }
        > = {
          1: {
            tone: "helpful and casual",
            valueAdd: "Sharing a relevant resource",
            template: isLinkedIn
              ? `Hi ${name}, following up on my earlier message about ${purpose}. I came across [relevant article/insight] that I thought might be interesting given your work. Would still love to connect when you have a moment.`
              : `Hi ${name},\n\nHope your week is going well! I wanted to follow up on my note about ${purpose}.\n\nI also came across [relevant resource] that I thought you might find valuable given your focus area.\n\nWould you have 15 minutes this week for a quick chat?\n\nBest,\n[Your Name]`,
          },
          2: {
            tone: "direct but respectful",
            valueAdd: "Offering a specific insight or connection",
            template: isLinkedIn
              ? `Hi ${name}, I know you're busy — just one more note. I have a specific insight about ${purpose} that I think could be mutually valuable. Happy to share over a 10-min call if you're interested.`
              : `Hi ${name},\n\nI know your inbox is full, so I'll keep this brief.\n\nSince my last note about ${purpose}, I've [done/learned something relevant]. I think there's a specific way this could benefit your team.\n\nWould a 10-minute call work? If the timing isn't right, no worries — I'll reach out next quarter.\n\nBest,\n[Your Name]`,
          },
          3: {
            tone: "graceful close",
            valueAdd: "Final touch with open door",
            template: isLinkedIn
              ? `Hi ${name}, last note from me! If ${purpose} isn't a priority right now, I completely understand. My door is always open if anything changes. Wishing you and the team continued success.`
              : `Hi ${name},\n\nI'll keep this short — I don't want to crowd your inbox.\n\nI genuinely believe there's value in connecting about ${purpose}, but I understand timing matters. If it's not the right time, no worries at all.\n\nI'll be here if anything changes down the road. Wishing you all the best.\n\nCheers,\n[Your Name]`,
          },
        };

        const strategy = followUpStrategies[followUpNum] ?? followUpStrategies[1]!;

        const subject =
          followUpNum === 1
            ? `Re: ${purpose} + a resource I thought you'd like`
            : followUpNum === 2
              ? `Re: Quick thought on ${purpose}`
              : `Re: Last note — ${purpose}`;

        return {
          message: strategy.template,
          daysSinceLastContact: daysSince,
          tone: strategy.tone,
          valueAdd: strategy.valueAdd,
          ...(channel === "email" && { subject }),
        };
      },
    };
  }

  private createAnalyzeOutreachTool(): AgentTool {
    const parameters: ToolParameters = {
      type: "object",
      properties: {
        outreachRecords: {
          type: "string",
          description:
            "JSON string of outreach records with fields: type, sent, responded, positive, channel",
        },
      },
      required: ["outreachRecords"],
    };

    return {
      name: "analyze_outreach",
      description:
        "Analyze outreach campaign effectiveness. Reviews response rates by type, channel, and timing. Identifies winning patterns and provides optimization recommendations.",
      parameters,
      execute: async (params: Record<string, unknown>): Promise<OutreachAnalysis> => {
        let records: Array<{
          type: string;
          sent: boolean;
          responded: boolean;
          positive: boolean;
          channel: string;
        }>;

        try {
          records = JSON.parse(params["outreachRecords"] as string) as typeof records;
        } catch {
          return {
            totalSent: 0,
            responseRate: 0,
            positiveResponseRate: 0,
            bestPerformingType: "N/A",
            worstPerformingType: "N/A",
            recommendations: [
              "Unable to parse outreach records. Please provide valid JSON.",
            ],
            topPerformingPatterns: [],
          };
        }

        const totalSent = records.filter((r) => r.sent).length;
        const totalResponded = records.filter((r) => r.responded).length;
        const totalPositive = records.filter((r) => r.positive).length;

        const responseRate =
          totalSent > 0 ? totalResponded / totalSent : 0;
        const positiveResponseRate =
          totalSent > 0 ? totalPositive / totalSent : 0;

        const typeStats = new Map<
          string,
          { sent: number; responded: number; positive: number }
        >();

        for (const record of records) {
          const existing = typeStats.get(record.type) ?? {
            sent: 0,
            responded: 0,
            positive: 0,
          };
          if (record.sent) existing.sent++;
          if (record.responded) existing.responded++;
          if (record.positive) existing.positive++;
          typeStats.set(record.type, existing);
        }

        let bestType = "";
        let bestRate = -1;
        let worstType = "";
        let worstRate = 2;

        for (const [type, stats] of typeStats.entries()) {
          const rate = stats.sent > 0 ? stats.responded / stats.sent : 0;
          if (rate > bestRate) {
            bestRate = rate;
            bestType = type;
          }
          if (rate < worstRate) {
            worstRate = rate;
            worstType = type;
          }
        }

        const recommendations: string[] = [];

        if (responseRate < 0.1) {
          recommendations.push(
            "Response rate is below 10% — review personalization quality and subject lines",
          );
        }
        if (responseRate >= 0.1 && responseRate < 0.2) {
          recommendations.push(
            "Response rate is decent but can improve. Try A/B testing subject lines and opening hooks",
          );
        }
        if (responseRate >= 0.2) {
          recommendations.push(
            "Strong response rate! Focus on scaling volume while maintaining quality",
          );
        }

        if (bestType && worstType && bestType !== worstType) {
          recommendations.push(
            `Double down on ${bestType} outreach (${Math.round(bestRate * 100)}% response rate) and reassess ${worstType} strategy`,
          );
        }

        if (totalSent < 20) {
          recommendations.push(
            "Sample size is small — send at least 20+ of each type before drawing conclusions",
          );
        }

        const topPerformingPatterns: string[] = [];
        if (bestRate > 0.2) {
          topPerformingPatterns.push(
            `${bestType} messages have the highest response rate at ${Math.round(bestRate * 100)}%`,
          );
        }
        if (positiveResponseRate > 0.1) {
          topPerformingPatterns.push(
            `${Math.round(positiveResponseRate * 100)}% of all outreach generates positive responses`,
          );
        }

        return {
          totalSent,
          responseRate: Math.round(responseRate * 100) / 100,
          positiveResponseRate:
            Math.round(positiveResponseRate * 100) / 100,
          bestPerformingType: bestType || "N/A",
          worstPerformingType: worstType || "N/A",
          recommendations,
          topPerformingPatterns,
        };
      },
    };
  }
}
