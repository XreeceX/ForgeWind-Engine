import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageEvent } from '@nestjs/common';
import { Observable, concatMap, from, map, tap, timer } from 'rxjs';
import { randomUUID } from 'crypto';
import { CreateAiSessionDto } from './ai-session.dto';
import {
  AiStreamEvent,
  SessionSummary,
  UiWorkflowState,
} from './ai-session.types';

interface SessionContext extends SessionSummary {
  prompt?: string;
}

@Injectable()
export class AiSessionService {
  private readonly sessions = new Map<string, SessionContext>();

  createSession(userId: string, dto: CreateAiSessionDto): SessionSummary {
    const sessionId = randomUUID();
    const session: SessionContext = {
      sessionId,
      userId,
      selectedRepoId: dto.selectedRepoId,
      intent: dto.intent,
      prompt: dto.prompt,
      state: 'IDLE',
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string, userId: string): SessionSummary {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('This session belongs to another user');
    }

    return session;
  }

  streamSession(sessionId: string, userId: string): Observable<MessageEvent> {
    const session = this.getSession(sessionId, userId);
    const events = this.buildExecutionEvents(session);

    return from(events).pipe(
      concatMap((event, index) =>
        timer(index === 0 ? 0 : 650).pipe(
          tap(() => {
            if (event.type === 'state') {
              this.updateSessionState(session.sessionId, event.state);
            }
          }),
          map(
            (): MessageEvent => ({
              type: event.type,
              data: event,
            }),
          ),
        ),
      ),
    );
  }

  private updateSessionState(
    sessionId: string,
    nextState: UiWorkflowState,
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    this.sessions.set(sessionId, {
      ...session,
      state: nextState,
    });
  }

  private buildExecutionEvents(session: SessionSummary): AiStreamEvent[] {
    const now = () => new Date().toISOString();
    const repoContext = session.selectedRepoId
      ? `repository ${session.selectedRepoId}`
      : 'selected repositories';

    return [
      {
        type: 'state',
        sessionId: session.sessionId,
        timestamp: now(),
        state: 'CONNECTING',
      },
      {
        type: 'state',
        sessionId: session.sessionId,
        timestamp: now(),
        state: 'ANALYZING',
      },
      {
        type: 'thinking',
        sessionId: session.sessionId,
        timestamp: now(),
        content: `Analyzing ${repoContext} for intent: "${session.intent}".`,
      },
      {
        type: 'memory_context',
        sessionId: session.sessionId,
        timestamp: now(),
        content: {
          careerGoal: 'Backend Engineer',
          skills: ['Node.js', 'TypeScript', 'System Design'],
          preferredTone: 'professional',
        },
      },
      {
        type: 'state',
        sessionId: session.sessionId,
        timestamp: now(),
        state: 'THINKING',
      },
      {
        type: 'thinking',
        sessionId: session.sessionId,
        timestamp: now(),
        content:
          'Running analysis agent and content strategy agent in parallel.',
      },
      {
        type: 'state',
        sessionId: session.sessionId,
        timestamp: now(),
        state: 'GENERATING_ACTIONS',
      },
      {
        type: 'action_suggestion',
        sessionId: session.sessionId,
        timestamp: now(),
        actions: [
          'Generate LinkedIn post',
          'Draft technical article',
          'Create project case-study thread',
        ],
      },
      {
        type: 'state',
        sessionId: session.sessionId,
        timestamp: now(),
        state: 'GENERATING_OUTPUT',
      },
      {
        type: 'final_output',
        sessionId: session.sessionId,
        timestamp: now(),
        content: `I analyzed ${repoContext} and drafted a publish-ready LinkedIn post tailored to your "${session.intent}" intent.`,
      },
      {
        type: 'state',
        sessionId: session.sessionId,
        timestamp: now(),
        state: 'COMPLETED',
      },
    ];
  }
}
