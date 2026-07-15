import { formatTime } from '../utils/time';

export function Sidebar({
  studentId,
  onStudentIdChange,
  user,
  onLogout,
  lessons,
  activeLessonId,
  onSelectLesson,
  progressMap,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">GVCC</div>
        <div>
          <p className="eyebrow">Learning Portal</p>
          <h1>Student Studio</h1>
        </div>
      </div>

      <section className="panel panel-tight">
        <label className="field-label" htmlFor="studentId">Student name</label>
        <input
          id="studentId"
          className="input"
          type="text"
          placeholder="Enter your full name"
          inputMode="text"
          autoComplete="off"
          value={studentId}
          onChange={(event) => onStudentIdChange(event.target.value)}
        />
      </section>

      <section className="panel panel-tight account-panel">
        <div>
          <p className="eyebrow">Account</p>
          <h2>{user?.name || 'Signed in'}</h2>
          <p className="hint">{user?.email || 'Authenticated session active'}</p>
          <p className="hint">{user?.id ? `ID: ${user.id.slice(0, 5).toUpperCase()}` : ''}</p>
        </div>
        <button className="button button-ghost" type="button" onClick={onLogout}>
          Logout
        </button>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Lessons</h2>
          <span className="chip">{lessons.length} lessons</span>
        </div>
        <div className="lesson-list" aria-live="polite">
          {lessons.map((lesson) => {
            const progress = progressMap[lesson.id] || { time: 0, percent: 0 };
            return (
              <button
                key={lesson.id}
                className={`lesson-card${lesson.id === activeLessonId ? ' active' : ''}`}
                type="button"
                onClick={() => onSelectLesson(lesson.id)}
                title={progress.time > 0 ? `Resume from ${formatTime(progress.time)}` : lesson.description}
              >
                <div className="lesson-card-top">
                  <div>
                    <p className="lesson-tag">{lesson.tag}</p>
                    <h3 className="lesson-title">{lesson.title}</h3>
                  </div>
                  <span className="lesson-duration">{lesson.durationLabel}</span>
                </div>
                <p className="lesson-description">{lesson.description}</p>
                <div className="lesson-progress">
                  <div className="lesson-progress-fill" style={{ width: `${progress.percent || 0}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Security Layer</h2>
          <span className="chip chip-alert">Deterrent</span>
        </div>
        <ul className="bullet-list">
          <li>Watermark overlays the player with learner and timestamp data.</li>
          <li>Video blurs and pauses when the tab loses focus.</li>
          <li>Context menu and common capture shortcuts are blocked in the player.</li>
        </ul>
        <p className="hint">
          Browser screens cannot be fully locked down, so this build uses the strongest practical client-side deterrents and documents the limitation clearly.
        </p>
      </section>
    </aside>
  );
}
