export function buildLearningReport(payload) {
  return {
    student: payload.student,
    generatedAt: payload.generatedAt,
    activeLessonId: payload.activeLessonId,
    progress: payload.progress,
    bookmarks: payload.bookmarks,
    quizzes: payload.quizzes,
    lessons: payload.lessons,
  };
}
