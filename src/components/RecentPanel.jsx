export function RecentPanel({ recentLessons, onOpenLesson }) {
  return (
    <section className="panel recent-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Bonus feature</p>
          <h2>Recently watched</h2>
        </div>
        <span className="chip">Local storage</span>
      </div>

      <div className="recent-list">
        {recentLessons.length === 0 ? (
          <div className="empty-state">Watch any lesson to populate your recent activity.</div>
        ) : (
          recentLessons.map(({ lesson, progress, active }) => (
            <button
              key={lesson.id}
              className={`recent-card${active ? ' active' : ''}`}
              type="button"
              onClick={() => onOpenLesson(lesson.id)}
            >
              <div>
                <p className="recent-tag">{lesson.tag}</p>
                <h3 className="recent-title">{lesson.title}</h3>
              </div>
              <div className="recent-progress">
                <span className="recent-time">Resume at {progress.timeText}</span>
                <span className="recent-percent">{progress.percent}% watched</span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
