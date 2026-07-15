export function HeroSection({ bookmarkCount, minutesTracked }) {
  return (
    <section className="hero panel">
      <div>
        <p className="eyebrow">Assignment-ready build</p>
        <h2>Watch lessons, drop bookmarks, and resume from any timestamp.</h2>
        <p className="hero-copy">
          This portal keeps bookmarks per video, stores progress locally, and resumes playback exactly where the learner left off.
        </p>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-value">{bookmarkCount}</span>
          <span className="stat-label">Bookmarks</span>
        </div>
        <div className="stat">
          <span className="stat-value">{minutesTracked}</span>
          <span className="stat-label">Minutes tracked</span>
        </div>
      </div>
    </section>
  );
}
