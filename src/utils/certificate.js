import { escapeXml } from './time';

export function createCertificateSvg({ studentName, lessonsText, quizText, bookmarksText, issuedText }) {
  const name = escapeXml(studentName || 'GVCC Student');
  const issued = escapeXml(issuedText);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#07111f"/>
          <stop offset="100%" stop-color="#0f2139"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#57d6c6"/>
          <stop offset="100%" stop-color="#f8b84e"/>
        </linearGradient>
      </defs>
      <rect width="1400" height="1000" fill="url(#bg)"/>
      <rect x="50" y="50" width="1300" height="900" rx="42" fill="none" stroke="url(#accent)" stroke-width="4"/>
      <rect x="110" y="110" width="1180" height="780" rx="34" fill="#ffffff" fill-opacity="0.02" stroke="#ffffff" stroke-opacity="0.08"/>
      <circle cx="1180" cy="180" r="140" fill="#57d6c6" opacity="0.14"/>
      <circle cx="230" cy="820" r="170" fill="#f8b84e" opacity="0.12"/>
      <text x="140" y="210" fill="#57d6c6" font-size="34" font-family="Arial, sans-serif" letter-spacing="5">GVCC</text>
      <text x="140" y="300" fill="#edf3ff" font-size="72" font-family="Arial, sans-serif" font-weight="700">Certificate of Learning</text>
      <text x="140" y="390" fill="#bcd0ff" font-size="32" font-family="Arial, sans-serif">Awarded to</text>
      <text x="140" y="470" fill="#edf3ff" font-size="62" font-family="Arial, sans-serif" font-weight="700">${name}</text>
      <text x="140" y="560" fill="#bcd0ff" font-size="28" font-family="Arial, sans-serif">for completing the GVCC Learning Portal with verified study activity.</text>
      <text x="140" y="670" fill="#edf3ff" font-size="30" font-family="Arial, sans-serif">Lessons completed: ${escapeXml(lessonsText)}</text>
      <text x="140" y="725" fill="#edf3ff" font-size="30" font-family="Arial, sans-serif">Quiz average: ${escapeXml(quizText)}</text>
      <text x="140" y="780" fill="#edf3ff" font-size="30" font-family="Arial, sans-serif">Bookmarks saved: ${escapeXml(bookmarksText)}</text>
      <text x="140" y="865" fill="#bcd0ff" font-size="24" font-family="Arial, sans-serif">Issued on ${issued}</text>
    </svg>
  `;
}
