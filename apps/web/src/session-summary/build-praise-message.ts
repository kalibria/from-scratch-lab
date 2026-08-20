export function buildPraiseMessage(params: { comebackPhrases: string[]; streak: number }): string {
  const parts: string[] = [];

  if (params.comebackPhrases.length === 1) {
    parts.push(`You nailed "${params.comebackPhrases[0]}" — used to mix it up, got it right today.`);
  } else if (params.comebackPhrases.length > 1) {
    parts.push(`Today you nailed ${params.comebackPhrases.length} phrases you used to mix up.`);
  }

  parts.push(params.streak > 1 ? `${params.streak} days in a row — keep it up.` : 'Nice session.');

  return parts.join(' ');
}
