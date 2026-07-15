export function CertificateModal({
  open,
  name,
  lessonsText,
  quizText,
  bookmarksText,
  issuedText,
  onClose,
  onDownload,
}) {
  return (
    <div className={`certificate-modal${open ? '' : ' hidden'}`} role="dialog" aria-modal="true" aria-labelledby="certificateTitle">
      <div className="certificate-sheet">
        <div className="certificate-badge">GVCC</div>
        <p className="eyebrow">Completion certificate</p>
        <h2 id="certificateTitle">Certificate of Learning</h2>
        <p className="certificate-name">{name}</p>
        <p className="certificate-copy">
          This certifies completion of the GVCC Learning Portal with saved progress, bookmark mastery, and a verified quiz scorecard.
        </p>
        <div className="certificate-metrics">
          <div>
            <span className="certificate-metric-value">{lessonsText}</span>
            <span className="certificate-metric-label">Lessons completed</span>
          </div>
          <div>
            <span className="certificate-metric-value">{quizText}</span>
            <span className="certificate-metric-label">Quiz average</span>
          </div>
          <div>
            <span className="certificate-metric-value">{bookmarksText}</span>
            <span className="certificate-metric-label">Bookmarks saved</span>
          </div>
        </div>
        <p className="certificate-issued">{issuedText}</p>
        <div className="certificate-actions">
          <button className="button button-primary" type="button" onClick={onDownload}>
            Download certificate
          </button>
          <button className="button button-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
