export enum Phase2EventType {
  REPO_SELECTED = 'REPO_SELECTED',
  REPO_ANALYZED = 'REPO_ANALYZED',
  CONTENT_REQUESTED = 'CONTENT_REQUESTED',
}

export interface Phase2Event<TPayload = Record<string, unknown>> {
  type: Phase2EventType;
  payload: TPayload;
}
