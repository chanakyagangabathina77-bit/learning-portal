export const LESSONS = [
  {
    id: 'lesson-01',
    tag: 'Foundations',
    title: 'Learning Portal Fundamentals',
    description: 'Learn how a modern student portal presents content, tracks progress, and keeps bookmarks tied to each lesson.',
    durationLabel: '09 min',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'lesson-02',
    tag: 'UI Flow',
    title: 'Building a Student-Friendly Interface',
    description: 'Focus on layout, navigation, and a clear call to action so students can resume learning without friction.',
    durationLabel: '09 min',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'lesson-03',
    tag: 'Media',
    title: 'Media Handling and Bookmarking',
    description: 'Capture timestamps, store them locally, and jump back to exactly where the learner paused.',
    durationLabel: '09 min',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'lesson-04',
    tag: 'Security',
    title: 'Screenshot Deterrence Strategy',
    description: 'Use practical browser protections like blur-on-switch, watermarking, and key interception to discourage capture.',
    durationLabel: '09 min',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
];

export const QUIZZES = {
  'lesson-01': [
    {
      question: 'What is the main purpose of the learning portal?',
      options: ['To host only static images', 'To help students watch lessons and manage progress', 'To replace the browser video player'],
      answer: 1,
    },
    {
      question: 'Why does the portal store data locally?',
      options: ['To make bookmarks and progress persist between visits', 'To disable all video controls', 'To remove mobile support'],
      answer: 0,
    },
    {
      question: 'Which feature lets the learner continue from a saved moment?',
      options: ['Watch later list', 'Bookmark timestamp', 'Theme switcher'],
      answer: 1,
    },
  ],
  'lesson-02': [
    {
      question: 'What improves the student experience most in a portal?',
      options: ['A confusing side menu', 'Clear navigation and visible progress', 'Hiding all controls'],
      answer: 1,
    },
    {
      question: 'Which UI choice makes the app feel more premium?',
      options: ['Dense text everywhere', 'Strong hierarchy and visible call-to-action buttons', 'Random colors on each card'],
      answer: 1,
    },
    {
      question: 'Why do responsive layouts matter?',
      options: ['They help the app work on desktop and mobile', 'They remove the need for media', 'They prevent bookmark storage'],
      answer: 0,
    },
  ],
  'lesson-03': [
    {
      question: 'What does a bookmark need to resume playback accurately?',
      options: ['A timestamp and video ID', 'Only a title', 'A random color'],
      answer: 0,
    },
    {
      question: 'What should happen when a learner clicks a bookmark?',
      options: ['The video should jump to that exact timestamp', 'The video should restart from 00:00', 'The bookmark should disappear'],
      answer: 0,
    },
    {
      question: 'Why is multiple bookmark support valuable?',
      options: ['It lets learners revisit several important moments in the same lesson', 'It makes the page lighter', 'It removes progress tracking'],
      answer: 0,
    },
  ],
  'lesson-04': [
    {
      question: 'What is the best browser-level screenshot strategy in a web app?',
      options: ['A perfect hard block on all devices', 'Practical deterrents like watermarking and blur-on-switch', 'Doing nothing'],
      answer: 1,
    },
    {
      question: 'Why is a visible watermark useful?',
      options: ['It discourages misuse and identifies the learner', 'It increases internet speed', 'It replaces the video content'],
      answer: 0,
    },
    {
      question: 'What is a realistic limitation of browser screenshot protection?',
      options: ['It can be completely perfect on every platform', 'It is only a deterrent, not a full lock', 'It disables the operating system'],
      answer: 1,
    },
  ],
};
