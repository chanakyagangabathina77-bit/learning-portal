import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLearningReport } from '../src/utils/report.js';

test('buildLearningReport includes the active lesson id in the exported payload', () => {
  const report = buildLearningReport({
    student: 'MAYA',
    generatedAt: '2026-07-15T00:00:00.000Z',
    activeLessonId: 'lesson-03',
    progress: { 'lesson-03': { time: 120, percent: 50, duration: 240 } },
    bookmarks: [{ id: 'b1', videoId: 'lesson-03', time: 120, name: 'Checkpoint' }],
    quizzes: {},
    lessons: [{ id: 'lesson-03', title: 'Media Handling', progress: { time: 120, percent: 50, duration: 240 }, quiz: null }],
  });

  assert.equal(report.activeLessonId, 'lesson-03');
  assert.equal(report.lessons[0].id, 'lesson-03');
  assert.equal(report.bookmarks[0].name, 'Checkpoint');
});
