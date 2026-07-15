# GVCC Learning Portal

A clean React + Vite learning portal with a lightweight Node backend and login flow that demonstrates:

- Student-friendly lesson browsing
- HTML5 video playback
- Multiple bookmarks per video
- Resume playback from bookmarked timestamps
- Persistent state with `localStorage`
- Backend-backed authentication and portal persistence
- Screenshot deterrence measures in the browser
- Edit and delete bookmark support
- Continue-watching and recent activity views
- Lesson knowledge check and learning scorecard
- Exportable learning report for submission/demo
- Completion certificate download

## Stack

- React 18
- Vite
- Plain CSS
- Node.js HTTP API

## How screenshot protection works

Web browsers do not provide a perfect way to block screenshots on desktop, so this project uses the strongest practical client-side deterrents:

- A moving watermark showing the learner name, lesson, and timestamp
- Pausing and blurring the video overlay when the tab loses focus
- Blocking right-click and common capture or developer shortcut keys inside the player area
- A visible protected-view overlay when the tab loses focus

This approach is realistic for a web assignment and is documented clearly in the UI.

## Run locally

1. Install dependencies with `npm install`.
2. Start the full stack with `npm run dev`.
3. Open the local URL shown by Vite and create a login or sign in with an existing account.

## Storage

The app stores:

- `bookmarks` per video
- `progress` per video
- `quizzes` per lesson
- quiz drafts
- learner name
- last opened lesson
- auth token

Everything is saved locally in the browser using `localStorage`.

## Notes

- The demo uses a public sample video source for quick setup.
- To replace the sample source, update `src/data/portalContent.js`.
- `src/App.jsx` is the stateful orchestrator and already connects to the backend API.
- `server/index.js` contains the lightweight auth and portal persistence layer.

## Suggested submission extras

- Add screenshots of the lesson list, player, bookmark panel, scorecard, and certificate modal.
- Record a short screen capture showing bookmark creation and resume behavior.
- If you deploy it, host the React app on Netlify, Vercel, or GitHub Pages.
