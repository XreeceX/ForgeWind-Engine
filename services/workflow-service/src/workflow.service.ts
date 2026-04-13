import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

type WorkflowStep = 'intent' | 'tone' | 'audience' | 'completed';

interface WorkflowSession {
  id: string;
  userId: string;
  repoId: string;
  step: WorkflowStep;
  answers: {
    intent?: string;
    tone?: string;
    audience?: string;
  };
}

@Injectable()
export class WorkflowService {
  private readonly sessions = new Map<string, WorkflowSession>();

  startSession(userId: string, repoId: string): WorkflowSession {
    const session: WorkflowSession = {
      id: randomUUID(),
      userId,
      repoId,
      step: 'intent',
      answers: {},
    };

    this.sessions.set(session.id, session);
    return session;
  }

  respond(sessionId: string, response: string): WorkflowSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException('Workflow session not found');
    }

    if (session.step === 'intent') {
      session.answers.intent = response;
      session.step = 'tone';
    } else if (session.step === 'tone') {
      session.answers.tone = response;
      session.step = 'audience';
    } else if (session.step === 'audience') {
      session.answers.audience = response;
      session.step = 'completed';
    }

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): WorkflowSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException('Workflow session not found');
    }

    return session;
  }

  getPromptForStep(step: WorkflowStep): string {
    if (step === 'intent') {
      return 'What do you want to create from this repository (post, article, blog)?';
    }
    if (step === 'tone') {
      return 'What tone do you want (professional, engaging, technical, thought-leadership)?';
    }
    if (step === 'audience') {
      return 'Who is the target audience (recruiters, hiring managers, peers, founders)?';
    }
    return 'Workflow complete. Ready to generate content.';
  }
}
