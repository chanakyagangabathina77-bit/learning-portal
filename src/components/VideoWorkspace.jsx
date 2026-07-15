import { formatTime } from '../utils/time';

export function VideoWorkspace({
  lesson,
  resumeBadgeText,
  videoRef,
  captureShield,
  currentTime,
  duration,
  progressPercent,
  progressText,
  bookmarkName,
  onBookmarkNameChange,
  onAddBookmark,
  onVideoLoadedMetadata,
  onVideoTimeUpdate,
  onVideoPlay,
  onVideoPause,
  onVideoEnded,
  onVideoContextMenu,
  onBookmarkJump,
  onBookmarkEdit,
  onBookmarkDelete,
  bookmarks,
  watermarkLineA,
  watermarkLineB,
  watermarkLineC,
}) {
  return (
    <section className="video-layout">
      <article className="panel video-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">{lesson.tag}</p>
            <h2>{lesson.title}</h2>
          </div>
          <div className="video-meta">
            {resumeBadgeText ? <span className="chip chip-success">{resumeBadgeText}</span> : null}
          </div>
        </div>

        <div className="player-shell">
          <video
            ref={videoRef}
            key={lesson.id}
            className="video-player"
            controls
            playsInline
            preload="metadata"
            src={lesson.videoSrc}
            poster={lesson.poster}
            onLoadedMetadata={onVideoLoadedMetadata}
            onTimeUpdate={onVideoTimeUpdate}
            onPlay={onVideoPlay}
            onPause={onVideoPause}
            onEnded={onVideoEnded}
            onContextMenu={onVideoContextMenu}
          />
          <div className="watermark-layer" aria-hidden="true">
            <span id="watermarkA">{watermarkLineA}</span>
            <span id="watermarkB">{watermarkLineB}</span>
            <span id="watermarkC">{watermarkLineC}</span>
          </div>
          <div className={`focus-shield${captureShield ? '' : ' hidden'}`}>
            <div className="shield-card">
              <p className="eyebrow">Protected view</p>
              <h3>Return to the tab to continue learning.</h3>
              <p>Playback is paused while the page is out of focus to discourage screen capture and unauthorized recording.</p>
            </div>
          </div>
        </div>

        <div className="control-bar">
          <button className="button button-primary" type="button" onClick={onAddBookmark}>
            Add bookmark
          </button>
          <label className="inline-field" htmlFor="bookmarkName">
            <span>Bookmark name</span>
            <input
              id="bookmarkName"
              className="input"
              type="text"
              placeholder="Optional title or note"
              maxLength={60}
              value={bookmarkName}
              onChange={(event) => onBookmarkNameChange(event.target.value)}
            />
          </label>
          <div className="progress-readout">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="timeline-shell">
          <div className="timeline-head">
            <div>
              <h3>Continue watching</h3>
              <p className="hint">{progressText}</p>
            </div>
            <span className="chip">{duration ? `${progressPercent}% watched` : 'Loading...'}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </article>

      <aside className="panel bookmarks-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Saved for this video</p>
            <h2>Bookmarks</h2>
          </div>
          <span className="chip">{bookmarks.length} saved</span>
        </div>

        <div className="bookmark-list" aria-live="polite">
          {bookmarks.length === 0 ? (
            <div className="empty-state">No bookmarks yet. Add one while the video is playing.</div>
          ) : (
            bookmarks.map((bookmark) => (
              <article key={bookmark.id} className="bookmark-card">
                <button className="bookmark-jump" type="button" onClick={() => onBookmarkJump(bookmark)}>
                  <div className="bookmark-top">
                    <strong className="bookmark-label">{bookmark.name || `Bookmark ${formatTime(bookmark.time)}`}</strong>
                    <span className="bookmark-time">{formatTime(bookmark.time)}</span>
                  </div>
                  <p className="bookmark-note">{bookmark.name ? 'Tap to resume from this moment.' : 'Untitled bookmark'}</p>
                </button>
                <div className="bookmark-actions">
                  <button className="text-button" type="button" onClick={() => onBookmarkEdit(bookmark.id)}>
                    Edit
                  </button>
                  <button className="text-button" type="button" onClick={() => onBookmarkDelete(bookmark.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </section>
  );
}
