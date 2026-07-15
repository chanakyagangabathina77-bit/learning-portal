export function ScorecardSection({
  lessonId,
  completionLabel,
  completedLessonsCount,
  quizAverage,
  streakCount,
  certificateUnlocked,
  quizPrompt,
  quizQuestions,
  quizDraft,
  quizAttempt,
  quizFeedback,
  onQuizAnswerChange,
  onSubmitQuiz,
  onExportReport,
  onOpenCertificate,
}) {
  return (
    <section className="panel scorecard-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Product signal</p>
          <h2>Learning Scorecard</h2>
        </div>
        <span className={`chip${certificateUnlocked ? ' chip-success' : ' chip-alert'}`}>{completionLabel}</span>
      </div>

      <div className="score-grid">
        <div className="score-card">
          <span className="score-value">{completedLessonsCount}</span>
          <span className="score-label">Completed lessons</span>
        </div>
        <div className="score-card">
          <span className="score-value">{quizAverage}%</span>
          <span className="score-label">Quiz average</span>
        </div>
        <div className="score-card">
          <span className="score-value">{streakCount}</span>
          <span className="score-label">Active streak</span>
        </div>
        <div className="score-card">
          <span className="score-value">{certificateUnlocked ? 'Unlocked' : 'Locked'}</span>
          <span className="score-label">Certificate</span>
        </div>
      </div>

      <div className="quiz-shell">
        <div className="quiz-head">
          <div>
            <p className="eyebrow">Quick check</p>
            <h3>Knowledge check for the selected lesson</h3>
          </div>
          <p className="hint">{quizPrompt}</p>
        </div>

        <div className="quiz-list">
          {quizQuestions.length === 0 ? (
            <div className="empty-state">No quiz is defined for this lesson.</div>
          ) : (
            quizQuestions.map((item, index) => (
              <section key={index} className="quiz-question">
                <h4>{index + 1}. {item.question}</h4>
                <div className="quiz-options">
                  {item.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="quiz-option">
                      <input
                        type="radio"
                        name={`quiz-${lessonId}-${index}`}
                        value={optionIndex}
                        checked={quizDraft[index] === optionIndex}
                        onChange={() => onQuizAnswerChange(index, optionIndex)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="quiz-actions">
          <button className="button button-primary" type="button" onClick={onSubmitQuiz}>
            Submit quiz
          </button>
          <button className="button button-ghost" type="button" onClick={onExportReport}>
            Export learning report
          </button>
          <button className="button button-ghost" type="button" onClick={onOpenCertificate} disabled={!certificateUnlocked}>
            View certificate
          </button>
          <span className="hint">{quizFeedback}</span>
        </div>

        {quizAttempt ? (
          <p className="hint" style={{ marginTop: 10 }}>
            Best saved score for this lesson: {quizAttempt.score}/{quizAttempt.total}
          </p>
        ) : null}
      </div>
    </section>
  );
}
