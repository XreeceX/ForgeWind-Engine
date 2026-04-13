import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface AnalyzeRepositoryRequest {
  name: string;
  fullName: string;
  description: string;
  readme: string;
  languages: string[];
  stars: number;
  commits: number;
  fileTreeSummary: string;
  keyFiles: string[];
  includeDifferentiationScore?: boolean;
  tone?: string;
  audience?: string;
}

interface NormalizedRepoData {
  name: string;
  description: string;
  readme: string;
  languages: string[];
  stars: number;
  commits: number;
  file_tree_summary: string;
  key_files: string[];
}

interface TechnicalAnalysis {
  techStack: string[];
  architecture: string;
  complexity: string;
  engineeringConcepts: string[];
  codeQualityAssessment: string;
}

interface ProjectUnderstanding {
  projectSummary: string;
  targetUsers: string;
  useCases: string[];
  keyFeatures: string[];
}

interface CareerPositioning {
  recommendedRoles: string[];
  demonstratedSkills: string[];
  senioritySignal: string;
  hiringStrengths: string[];
}

interface ContentExtraction {
  postIdeas: string[];
  articleIdeas: string[];
  storyAngles: string[];
}

interface ImprovementSuggestions {
  missingFeatures: string[];
  technicalImprovements: string[];
  portfolioImprovements: string[];
  quickWins: string[];
}

interface DifferentiationScore {
  score: number;
  reason: string;
}

export interface RepositoryInsight {
  summary: string;
  techStack: string[];
  strengths: string[];
  suggestions: string[];
  complexity: string;
  useCase: string;
  normalizedRepoData: NormalizedRepoData;
  technicalAnalysis: TechnicalAnalysis;
  projectUnderstanding: ProjectUnderstanding;
  careerPositioning: CareerPositioning;
  contentExtraction: ContentExtraction;
  improvementSuggestions: ImprovementSuggestions;
  differentiationScore?: DifferentiationScore;
  linkedinPost: string;
}

@Injectable()
export class AiProvider {
  private readonly logger = new Logger(AiProvider.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  async analyzeRepository(repoData: AnalyzeRepositoryRequest): Promise<RepositoryInsight> {
    const normalizedRepoData = this.normalizeRepoData(repoData);

    if (!this.client) {
      return this.fallbackAnalysis(normalizedRepoData);
    }

    try {
      const technicalAnalysis = await this.runTechnicalAnalysis(normalizedRepoData);
      const projectUnderstanding = await this.runProjectUnderstanding(normalizedRepoData);
      const careerPositioning = await this.runCareerPositioning(normalizedRepoData);
      const contentExtraction = await this.runContentExtraction(normalizedRepoData);
      const improvementSuggestions = await this.runImprovementSuggestions(normalizedRepoData);
      const differentiationScore = repoData.includeDifferentiationScore
        ? await this.runDifferentiationScore(normalizedRepoData)
        : undefined;

      const combinedAnalysis = {
        technicalAnalysis,
        projectUnderstanding,
        careerPositioning,
        contentExtraction,
        improvementSuggestions,
        ...(differentiationScore ? { differentiationScore } : {}),
      };
      const linkedinPost = await this.runContentGeneration(
        combinedAnalysis,
        repoData.tone ?? 'professional',
        repoData.audience ?? 'hiring managers',
      );

      return this.composeRepositoryInsight({
        normalizedRepoData,
        technicalAnalysis,
        projectUnderstanding,
        careerPositioning,
        contentExtraction,
        improvementSuggestions,
        differentiationScore,
        linkedinPost,
      });
    } catch (error) {
      this.logger.warn(
        `OpenAI analyzeRepository fallback: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return this.fallbackAnalysis(normalizedRepoData);
    }
  }

  private normalizeRepoData(repoData: AnalyzeRepositoryRequest): NormalizedRepoData {
    return {
      name: repoData.name,
      description: repoData.description || '',
      readme: repoData.readme.slice(0, 6000),
      languages: repoData.languages.slice(0, 8),
      stars: repoData.stars,
      commits: repoData.commits,
      file_tree_summary: repoData.fileTreeSummary,
      key_files: repoData.keyFiles.slice(0, 25),
    };
  }

  private async runTechnicalAnalysis(repoData: NormalizedRepoData): Promise<TechnicalAnalysis> {
    const raw = await this.runJsonPrompt(
      'You are a senior software engineer.',
      [
        'Analyze the following GitHub repository and extract its technical characteristics.',
        '',
        'Focus on:',
        '- Tech stack (languages, frameworks, tools)',
        '- Architecture style (monolith, microservices, etc.)',
        '- Complexity level (beginner, intermediate, advanced)',
        '- Code quality signals (based on structure and description)',
        '- Key engineering concepts used',
        '',
        'Repository Data:',
        this.formatRepoData(repoData),
        '',
        'Return ONLY JSON:',
        '{',
        '  "techStack": [],',
        '  "architecture": "",',
        '  "complexity": "",',
        '  "engineeringConcepts": [],',
        '  "codeQualityAssessment": ""',
        '}',
      ].join('\n'),
    );

    return {
      techStack: this.toStringArray(raw['techStack']),
      architecture: this.toString(raw['architecture'], 'Monolith'),
      complexity: this.toString(raw['complexity'], 'Intermediate'),
      engineeringConcepts: this.toStringArray(raw['engineeringConcepts']),
      codeQualityAssessment: this.toString(
        raw['codeQualityAssessment'],
        'Structure suggests practical implementation quality with room for deeper validation.',
      ),
    };
  }

  private async runProjectUnderstanding(repoData: NormalizedRepoData): Promise<ProjectUnderstanding> {
    const raw = await this.runJsonPrompt(
      'You are a product-focused engineer.',
      [
        'Explain what this project actually does in a clear and concise way.',
        '',
        'Focus on:',
        '- What problem it solves',
        '- Who it is for',
        '- Real-world use case',
        '- Key features',
        '',
        'Avoid technical jargon where possible.',
        '',
        'Repository Data:',
        this.formatRepoData(repoData),
        '',
        'Return JSON:',
        '{',
        '  "projectSummary": "",',
        '  "targetUsers": "",',
        '  "useCases": [],',
        '  "keyFeatures": []',
        '}',
      ].join('\n'),
    );

    return {
      projectSummary: this.toString(raw['projectSummary'], 'A practical software project solving a clear user need.'),
      targetUsers: this.toString(raw['targetUsers'], 'Developers and end-users interested in the project domain.'),
      useCases: this.toStringArray(raw['useCases']),
      keyFeatures: this.toStringArray(raw['keyFeatures']),
    };
  }

  private async runCareerPositioning(repoData: NormalizedRepoData): Promise<CareerPositioning> {
    const raw = await this.runJsonPrompt(
      'You are a senior tech recruiter and career coach.',
      [
        'Analyze this project and determine how it positions the developer professionally.',
        '',
        'Focus on:',
        '- What roles this project supports (e.g. frontend, backend, full-stack, ML)',
        '- What skills it demonstrates',
        '- Seniority signal (junior, mid, strong mid, senior signal)',
        '- Strengths from a hiring perspective',
        '',
        'Repository Data:',
        this.formatRepoData(repoData),
        '',
        'Return JSON:',
        '{',
        '  "recommendedRoles": [],',
        '  "demonstratedSkills": [],',
        '  "senioritySignal": "",',
        '  "hiringStrengths": []',
        '}',
      ].join('\n'),
    );

    return {
      recommendedRoles: this.toStringArray(raw['recommendedRoles']),
      demonstratedSkills: this.toStringArray(raw['demonstratedSkills']),
      senioritySignal: this.toString(raw['senioritySignal'], 'Mid'),
      hiringStrengths: this.toStringArray(raw['hiringStrengths']),
    };
  }

  private async runContentExtraction(repoData: NormalizedRepoData): Promise<ContentExtraction> {
    const raw = await this.runJsonPrompt(
      'You are a personal branding expert.',
      [
        'Turn this project into content opportunities.',
        '',
        'Generate ideas for:',
        '- LinkedIn posts',
        '- Technical articles',
        '- Story-based posts (journey, challenges, lessons)',
        '',
        'Make them engaging and specific.',
        '',
        'Repository Data:',
        this.formatRepoData(repoData),
        '',
        'Return JSON:',
        '{',
        '  "postIdeas": [],',
        '  "articleIdeas": [],',
        '  "storyAngles": []',
        '}',
      ].join('\n'),
    );

    return {
      postIdeas: this.toStringArray(raw['postIdeas']),
      articleIdeas: this.toStringArray(raw['articleIdeas']),
      storyAngles: this.toStringArray(raw['storyAngles']),
    };
  }

  private async runImprovementSuggestions(repoData: NormalizedRepoData): Promise<ImprovementSuggestions> {
    const raw = await this.runJsonPrompt(
      'You are a senior engineer reviewing a portfolio project.',
      [
        'Give actionable suggestions to improve this project for:',
        '- Recruiters',
        '- Portfolio strength',
        '- Technical depth',
        '',
        'Focus on:',
        '- Missing features',
        '- Improvements',
        '- Best practices',
        '- What would make it stand out',
        '',
        'Repository Data:',
        this.formatRepoData(repoData),
        '',
        'Return JSON:',
        '{',
        '  "missingFeatures": [],',
        '  "technicalImprovements": [],',
        '  "portfolioImprovements": [],',
        '  "quickWins": []',
        '}',
      ].join('\n'),
    );

    return {
      missingFeatures: this.toStringArray(raw['missingFeatures']),
      technicalImprovements: this.toStringArray(raw['technicalImprovements']),
      portfolioImprovements: this.toStringArray(raw['portfolioImprovements']),
      quickWins: this.toStringArray(raw['quickWins']),
    };
  }

  private async runDifferentiationScore(repoData: NormalizedRepoData): Promise<DifferentiationScore> {
    const raw = await this.runJsonPrompt(
      'You are a technical hiring-market analyst.',
      [
        'Score how unique this project is in a competitive job market (0-10).',
        'Explain why.',
        '',
        'Repository Data:',
        this.formatRepoData(repoData),
        '',
        'Return JSON:',
        '{',
        '  "score": 0,',
        '  "reason": ""',
        '}',
      ].join('\n'),
    );

    const parsedScore = Number(raw['score'] ?? 0);
    const score = Number.isFinite(parsedScore)
      ? Math.max(0, Math.min(10, parsedScore))
      : 0;

    return {
      score,
      reason: this.toString(raw['reason'], 'Moderately differentiated based on the current feature set and positioning.'),
    };
  }

  private async runContentGeneration(
    combinedAnalysis: Record<string, unknown>,
    tone: string,
    audience: string,
  ): Promise<string> {
    return this.runTextPrompt(
      'You are an expert LinkedIn content creator.',
      [
        'Using the analysis below, write a high-quality LinkedIn post.',
        '',
        'Make it:',
        '- Professional',
        '- Engaging',
        '- Not generic',
        '- Slightly storytelling-driven',
        '',
        'Include:',
        '- Hook',
        '- What was built',
        '- Key tech',
        '- Why it matters',
        '- Optional call to action',
        '',
        'Analysis:',
        JSON.stringify(combinedAnalysis, null, 2),
        '',
        `Tone: ${tone}`,
        `Audience: ${audience}`,
        '',
        'Return only the post text.',
      ].join('\n'),
      0.7,
    );
  }

  private async runJsonPrompt(
    roleInstruction: string,
    prompt: string,
  ): Promise<Record<string, unknown>> {
    if (!this.client) {
      return {};
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `${roleInstruction} Always return valid JSON and follow the requested schema exactly.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message.content ?? '{}';
    return (JSON.parse(content) as Record<string, unknown>) ?? {};
  }

  private async runTextPrompt(
    roleInstruction: string,
    prompt: string,
    temperature: number,
  ): Promise<string> {
    if (!this.client) {
      return '';
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: roleInstruction,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
    });

    return (response.choices[0]?.message.content ?? '').trim();
  }

  private composeRepositoryInsight(params: {
    normalizedRepoData: NormalizedRepoData;
    technicalAnalysis: TechnicalAnalysis;
    projectUnderstanding: ProjectUnderstanding;
    careerPositioning: CareerPositioning;
    contentExtraction: ContentExtraction;
    improvementSuggestions: ImprovementSuggestions;
    differentiationScore?: DifferentiationScore;
    linkedinPost: string;
  }): RepositoryInsight {
    const suggestions = [
      ...params.improvementSuggestions.quickWins,
      ...params.improvementSuggestions.technicalImprovements,
      ...params.improvementSuggestions.portfolioImprovements,
    ].slice(0, 8);

    return {
      summary: params.projectUnderstanding.projectSummary,
      techStack: params.technicalAnalysis.techStack,
      strengths: params.careerPositioning.hiringStrengths,
      suggestions,
      complexity: params.technicalAnalysis.complexity,
      useCase:
        params.projectUnderstanding.useCases[0] ??
        params.projectUnderstanding.projectSummary,
      normalizedRepoData: params.normalizedRepoData,
      technicalAnalysis: params.technicalAnalysis,
      projectUnderstanding: params.projectUnderstanding,
      careerPositioning: params.careerPositioning,
      contentExtraction: params.contentExtraction,
      improvementSuggestions: params.improvementSuggestions,
      ...(params.differentiationScore ? { differentiationScore: params.differentiationScore } : {}),
      linkedinPost: params.linkedinPost,
    };
  }

  private fallbackAnalysis(repoData: NormalizedRepoData): RepositoryInsight {
    const techStack = this.buildTechStack(repoData);
    const complexity = techStack.length > 5 ? 'Advanced' : 'Intermediate';
    const summary = `${repoData.name} appears to target ${repoData.description || 'a practical problem'} with a stack centered on ${techStack.slice(0, 3).join(', ') || 'general software tooling'}.`;

    const technicalAnalysis: TechnicalAnalysis = {
      techStack,
      architecture: this.detectArchitecture(repoData),
      complexity,
      engineeringConcepts: this.deriveEngineeringConcepts(repoData),
      codeQualityAssessment:
        'Repository metadata suggests a structured project; add stronger testing and release signals for higher confidence.',
    };

    const projectUnderstanding: ProjectUnderstanding = {
      projectSummary: summary,
      targetUsers: 'Developers and professionals who benefit from the repository domain.',
      useCases: ['Portfolio demonstration', 'Internal tooling or workflow automation'],
      keyFeatures: ['Core domain workflow implementation', 'Documented code structure'],
    };

    const careerPositioning: CareerPositioning = {
      recommendedRoles: ['Software Engineer', 'Full-Stack Developer'],
      demonstratedSkills: [
        ...techStack,
        'Repository organization',
        'Product thinking',
      ].slice(0, 8),
      senioritySignal: 'Mid',
      hiringStrengths: [
        'Demonstrates practical end-to-end execution',
        'Shows ability to structure a deliverable repository',
      ],
    };

    const contentExtraction: ContentExtraction = {
      postIdeas: [
        'How this repository moved from concept to implementation',
        'Lessons learned while shaping architecture and feature scope',
      ],
      articleIdeas: [
        'Technical trade-offs and implementation decisions',
        'How to present repository impact for recruiters',
      ],
      storyAngles: [
        'Biggest challenge and how it was resolved',
        'What would be built differently in version two',
      ],
    };

    const improvementSuggestions: ImprovementSuggestions = {
      missingFeatures: ['Automated tests', 'Performance benchmarks'],
      technicalImprovements: ['Add CI checks and deployment documentation'],
      portfolioImprovements: ['Expand README with outcomes, metrics, and architecture diagram'],
      quickWins: ['Add screenshots and API examples'],
    };

    const linkedinPost = [
      'Built and analyzed a repository focused on solving a real user problem.',
      `Key technologies: ${techStack.slice(0, 5).join(', ') || 'software engineering fundamentals'}.`,
      'The biggest value was translating technical decisions into clear career positioning and recruiter-ready storytelling.',
    ].join('\n\n');

    return this.composeRepositoryInsight({
      normalizedRepoData: repoData,
      technicalAnalysis,
      projectUnderstanding,
      careerPositioning,
      contentExtraction,
      improvementSuggestions,
      linkedinPost,
    });
  }

  private buildTechStack(repoData: NormalizedRepoData): string[] {
    return [...repoData.languages, ...this.deriveStackFromFiles(repoData.key_files)]
      .filter((value, index, array) => value && array.indexOf(value) === index)
      .slice(0, 10);
  }

  private detectArchitecture(repoData: NormalizedRepoData): string {
    const summary = repoData.file_tree_summary.toLowerCase();
    if (summary.includes('services(') || summary.includes('apps(')) {
      return 'Modular service-oriented architecture';
    }
    return 'Monolith';
  }

  private deriveEngineeringConcepts(repoData: NormalizedRepoData): string[] {
    const concepts: string[] = [];
    const files = repoData.key_files.map((file) => file.toLowerCase());
    if (files.some((file) => file.includes('docker'))) concepts.push('Containerization');
    if (files.some((file) => file.includes('terraform'))) concepts.push('Infrastructure as Code');
    if (files.some((file) => file.includes('controller'))) concepts.push('API design');
    if (files.some((file) => file.includes('service'))) concepts.push('Service layer patterns');
    if (repoData.readme.toLowerCase().includes('workflow')) concepts.push('Workflow orchestration');
    return concepts;
  }

  private formatRepoData(repoData: NormalizedRepoData): string {
    return JSON.stringify(repoData, null, 2);
  }

  private toString(value: unknown, fallback: string): string {
    const stringValue = typeof value === 'string' ? value.trim() : '';
    return stringValue || fallback;
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => String(item).trim())
      .filter((item) => Boolean(item));
  }

  private deriveStackFromFiles(files: string[]): string[] {
    const normalized = files.join(' ').toLowerCase();
    const stack: string[] = [];
    if (normalized.includes('docker')) stack.push('Docker');
    if (normalized.includes('terraform')) stack.push('Terraform');
    if (normalized.includes('package.json')) stack.push('Node.js');
    if (normalized.includes('next.config')) stack.push('Next.js');
    if (normalized.includes('nestjs')) stack.push('NestJS');
    return stack;
  }
}
