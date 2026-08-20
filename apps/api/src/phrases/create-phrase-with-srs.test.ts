import { describe, it, expect, vi } from 'vitest';
import { createPhraseWithSrs } from './create-phrase-with-srs.js';

describe('createPhraseWithSrs', () => {
  it('inserts the phrase and its srs_state row', async () => {
    const phraseRow = {
      id: 1,
      enText: 'break the ice',
      ruGloss: null,
      source: 'manual',
      errorTags: null,
      createdAt: new Date(),
    };

    const returning = vi.fn().mockResolvedValue([phraseRow]);
    const valuesForPhrase = vi.fn().mockReturnValue({ returning });
    const valuesForSrs = vi.fn().mockResolvedValue(undefined);

    const insert = vi
      .fn()
      .mockReturnValueOnce({ values: valuesForPhrase })
      .mockReturnValueOnce({ values: valuesForSrs });

    const tx = { insert } as never;

    const result = await createPhraseWithSrs(tx, { enText: 'break the ice', source: 'manual' });

    expect(result).toEqual(phraseRow);
    expect(valuesForSrs).toHaveBeenCalledWith({ phraseId: 1 });
  });
});
