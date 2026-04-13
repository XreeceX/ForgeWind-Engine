import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Phase2Event, Phase2EventType } from './event-types';

@Injectable()
export class EventBusService {
  private readonly emitter = new EventEmitter();

  publish<TPayload extends Record<string, unknown>>(
    event: Phase2Event<TPayload>,
  ): void {
    this.emitter.emit(event.type, event.payload);
  }

  subscribe<TPayload>(
    eventType: Phase2EventType,
    handler: (payload: TPayload) => Promise<void> | void,
  ): void {
    this.emitter.on(eventType, handler);
  }
}
