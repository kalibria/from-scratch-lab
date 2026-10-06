import { apiFetch } from '../api-client.js';

export type LessonStep = 'vocab' | 'grammar' | 'writing' | 'speaking' | 'checkpoint';

export async function markLessonStep(lessonId: number, step: LessonStep, score?: number) {
  await apiFetch(`/lessons/${lessonId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ step, score }),
  });
}
