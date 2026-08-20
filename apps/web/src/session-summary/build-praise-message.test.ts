import { describe, it, expect } from 'vitest';
import { buildPraiseMessage } from './build-praise-message.js';

describe('buildPraiseMessage', () => {
  it('names the single comeback phrase', () => {
    const message = buildPraiseMessage({ comebackPhrases: ['break the ice'], streak: 1 });
    expect(message).toContain('"break the ice"');
  });

  it('counts multiple comeback phrases without naming them', () => {
    const message = buildPraiseMessage({ comebackPhrases: ['a', 'b', 'c'], streak: 1 });
    expect(message).toContain('3 phrases');
  });

  it('falls back to a generic line with no comeback phrases', () => {
    const message = buildPraiseMessage({ comebackPhrases: [], streak: 1 });
    expect(message).toBe('Nice session.');
  });

  it('mentions the streak when above 1', () => {
    const message = buildPraiseMessage({ comebackPhrases: [], streak: 5 });
    expect(message).toContain('5 days in a row');
  });
});
