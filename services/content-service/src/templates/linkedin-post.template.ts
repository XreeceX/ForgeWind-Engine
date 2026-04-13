interface LinkedInTemplateInput {
  source: string;
  tone: string;
  audience: string;
  context?: unknown;
}

export function linkedinPostTemplate(input: LinkedInTemplateInput): string {
  return [
    'Create a polished LinkedIn post.',
    `Source: ${input.source}`,
    `Tone: ${input.tone}`,
    `Audience: ${input.audience}`,
    `Context: ${JSON.stringify(input.context ?? {}, null, 2)}`,
    'Return plain text only.',
  ].join('\n');
}
