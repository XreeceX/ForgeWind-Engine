interface ArticleTemplateInput {
  source: string;
  tone: string;
  audience: string;
  context?: unknown;
}

export function articleTemplate(input: ArticleTemplateInput): string {
  return [
    'Write a technical article with a strong structure.',
    `Source: ${input.source}`,
    `Tone: ${input.tone}`,
    `Audience: ${input.audience}`,
    `Context: ${JSON.stringify(input.context ?? {}, null, 2)}`,
    'Include: title, intro, 3 sections, conclusion, CTA.',
    'Return markdown.',
  ].join('\n');
}
