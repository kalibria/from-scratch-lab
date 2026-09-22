import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';

export function usePhraseCategories() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const res = await apiFetch('/phrases/categories');

      if (res.ok) {
        setCategories(await res.json());
      }
    }

    load();
  }, []);

  return categories;
}
