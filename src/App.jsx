import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LESSONS, QUIZZES } from './data/portalContent';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { VideoWorkspace } from './components/VideoWorkspace';
import { RecentPanel } from './components/RecentPanel';
import { ScorecardSection } from './components/ScorecardSection';
import { CertificateModal } from './components/CertificateModal';
import { AuthGate } from './components/AuthGate';
import { api } from './api/client';
import { buildPoster, formatTime } from './utils/time';
import { createCertificateSvg } from './utils/certificate';
import { buildLearningReport } from './utils/report';

const STORAGE_KEYS = {
  bookmarks: 'gvcc.bookmarks',
  progress: 'gvcc.progress',
  quizzes: 'gvcc.quizzes',
  quizDrafts: 'gvcc.quizDrafts',
  student: 'gvcc.studentName',
  activeVideo: 'gvcc.activeVideoId',
  authToken: 'gvcc.authToken',
};

function App() {
  const [authToken, setAuthToken] = useLocalStorageState(STORAGE_KEYS.authToken, '');
  const [authUser, setAuthUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(Boolean(authToken));
  const [authError, setAuthError] = useState('');
  const [studentName, setStudentName] = useLocalStorageState(STORAGE_KEYS.student, '');
  const [activeVideoId, setActiveVideoId] = useLocalStorageState(STORAGE_KEYS.activeVideo, LESSONS[0].id);
  const [bookmarks, setBookmarks] = useLocalStorageState(STORAGE_KEYS.bookmarks, []);
  const [progress, setProgress] = useLocalStorageState(STORAGE_KEYS.progress, {});
  const [quizzes, setQuizzes] = useLocalStorageState(STORAGE_KEYS.quizzes, {});
  const [quizDrafts, setQuizDrafts] = useLocalStorageState(STORAGE_KEYS.quizDrafts, {});
  const [bookmarkName, setBookmarkName] = useState('');
  const [quizFeedback, setQuizFeedback] = useState('');
  const [captureShield, setCaptureShield] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [resumeBadgeText, setResumeBadgeText] = useState('');
  const [playerState, setPlayerState] = useState({ currentTime: 0, duration: 0, percent: 0 });
  const [playerMessage, setPlayerMessage] = useState('No progress yet.');
  const videoRef = useRef(null);
  const saveTimerRef = useRef(null);
  const pendingSeekRef = useRef(null);
  const portalHydratedRef = useRef(false);

  const lessons = useMemo(
    () =>
      LESSONS.map((lesson) => ({
        ...lesson,
        poster: buildPoster(lesson.title),
      })),
    []
  );

  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeVideoId) || lessons[0],
    [lessons, activeVideoId]
  );

  const currentProgress = progress[activeVideoId] || { time: 0, percent: 0, duration: 0 };
  const currentBookmarks = useMemo(
    () =>
      bookmarks
        .filter((bookmark) => bookmark.videoId === activeVideoId)
        .sort((a, b) => a.time - b.time),
    [bookmarks, activeVideoId]
  );

  const isAuthenticated = Boolean(authToken && authUser);

  const recentLessons = useMemo(() => {
    return Object.entries(progress)
      .map(([lessonId, lessonProgress]) => ({
        lesson: lessons.find((entry) => entry.id === lessonId),
        progress: lessonProgress,
      }))
      .filter(({ lesson, progress: lessonProgress }) => lesson && lessonProgress && lessonProgress.time > 0)
      .sort((a, b) => (b.progress.updatedAt || 0) - (a.progress.updatedAt || 0))
      .slice(0, 4)
      .map(({ lesson, progress: lessonProgress }) => ({
        lesson,
        progress: {
          ...lessonProgress,
          timeText: formatTime(lessonProgress.time),
        },
        active: lesson.id === activeVideoId,
      }));
  }, [activeVideoId, lessons, progress]);

  const quizQuestions = QUIZZES[currentLesson.id] || [];
  const quizDraft = quizDrafts[currentLesson.id] || [];
  const quizAttempt = quizzes[currentLesson.id];

  const completedLessonsCount = useMemo(() => {
    return lessons.filter((lesson) => {
      const lessonProgress = progress[lesson.id];
      const attempt = quizzes[lesson.id];
      return (
        lessonProgress &&
        lessonProgress.percent >= 80 &&
        attempt &&
        attempt.total > 0 &&
        attempt.score / attempt.total >= 0.67
      );
    }).length;
  }, [lessons, progress, quizzes]);

  const quizAverage = useMemo(() => {
    const attempts = Object.values(quizzes).filter((attempt) => attempt.total > 0);
    if (!attempts.length) return 0;
    const average = attempts.reduce((sum, attempt) => sum + attempt.score / attempt.total, 0) / attempts.length;
    return Math.round(average * 100);
  }, [quizzes]);

  const streakCount = useMemo(() => {
    const activeDays = new Set(
      Object.values(progress)
        .filter((entry) => entry.time > 0)
        .map((entry) => {
          const day = new Date(entry.updatedAt || 0);
          day.setHours(0, 0, 0, 0);
          return day.toDateString();
        })
    );

    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    let streak = 0;
    while (activeDays.has(cursor.toDateString())) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [progress]);

  const certificateUnlocked = completedLessonsCount === lessons.length;
  const minutesTracked = Math.round(
    Object.values(progress).reduce((sum, entry) => sum + (entry.time || 0), 0) / 60
  );

  const displayName = studentName.trim() || authUser?.name || 'GVCC';
  const displayStudentId = (authUser?.id || displayName || 'GVCC').slice(0, 5).toUpperCase();
  const progressText = currentProgress.time > 0 ? `Resume from ${formatTime(currentProgress.time)} on this lesson.` : 'No progress yet.';
  const completionLabel = certificateUnlocked ? 'Certificate ready' : `${completedLessonsCount}/${lessons.length} complete`;
  const certificateIssueDate = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const hydratePortal = useCallback(
    (portal, user) => {
      portalHydratedRef.current = true;
      setAuthUser(user || null);
      setStudentName((portal.studentName || user?.name || '').trim());
      setActiveVideoId(portal.activeVideoId || LESSONS[0].id);
      setBookmarks(Array.isArray(portal.bookmarks) ? portal.bookmarks : []);
      setProgress(portal.progress || {});
      setQuizzes(portal.quizzes || {});
      setQuizDrafts(portal.quizDrafts || {});
      setQuizFeedback('');
      setBookmarkName('');
      setAuthLoading(false);
      setAuthError('');
    },
    [setActiveVideoId, setAuthUser, setBookmarks, setBookmarkName, setProgress, setQuizDrafts, setQuizzes, setStudentName]
  );

  const resetPortal = useCallback(() => {
    portalHydratedRef.current = false;
    setAuthUser(null);
    setStudentName('');
    setActiveVideoId(LESSONS[0].id);
    setBookmarks([]);
    setProgress({});
    setQuizzes({});
    setQuizDrafts({});
    setQuizFeedback('');
    setBookmarkName('');
    setCaptureShield(false);
    setResumeBadgeText('');
    setPlayerState({ currentTime: 0, duration: 0, percent: 0 });
    setPlayerMessage('No progress yet.');
  }, [setActiveVideoId, setBookmarks, setProgress, setQuizDrafts, setQuizzes, setStudentName]);

  const handleLogout = useCallback(async () => {
    try {
      if (authToken) {
        await api.logout(authToken);
      }
    } catch {
      // Ignore logout errors; we still clear the local session.
    } finally {
      setAuthToken('');
      resetPortal();
      setAuthMode('login');
      setAuthLoading(false);
    }
  }, [authToken, resetPortal, setAuthToken]);

  const handleAuthSubmit = useCallback(
    async ({ name, email, password }) => {
      setAuthLoading(true);
      setAuthError('');

      try {
        const payload = authMode === 'signup' ? { name: name.trim(), email, password } : { email, password };
        const response = authMode === 'signup' ? await api.signup(payload) : await api.login(payload);
        setAuthToken(response.token);
        hydratePortal(response.portal, response.user);
      } catch (error) {
        setAuthError(error.message || 'Authentication failed.');
      } finally {
        setAuthLoading(false);
      }
    },
    [authMode, hydratePortal, setAuthToken]
  );

  useEffect(() => {
    let active = true;

    if (!authToken) {
      portalHydratedRef.current = false;
      setAuthUser(null);
      setAuthLoading(false);
      return () => {
        active = false;
      };
    }

    if (authUser && portalHydratedRef.current) {
      setAuthLoading(false);
      return () => {
        active = false;
      };
    }

    setAuthLoading(true);

    (async () => {
      try {
        const { user, portal } = await api.portal(authToken);
        if (!active) return;
        hydratePortal(portal, user);
      } catch (error) {
        if (!active) return;
        setAuthToken('');
        resetPortal();
        setAuthError(error.message || 'Session expired. Please sign in again.');
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [authToken, authUser, hydratePortal, resetPortal, setAuthToken]);

  const saveProgressNow = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const current = video.currentTime || 0;
    const duration = video.duration || 0;
    const percent = duration > 0 ? Math.min(100, Math.round((current / duration) * 100)) : 0;

    setPlayerState({
      currentTime: current,
      duration,
      percent,
    });

    setProgress((prev) => ({
      ...prev,
      [activeVideoId]: {
        time: current,
        duration,
        percent,
        updatedAt: Date.now(),
      },
    }));

    setResumeBadgeText(current > 0 ? `Resume at ${formatTime(current)}` : '');

    setPlayerMessage(current > 0 ? `Resume from ${formatTime(current)} on this lesson.` : 'No progress yet.');
  }, [activeVideoId, setProgress]);

  const scheduleSaveProgress = useCallback(() => {
    if (saveTimerRef.current) return;
    saveTimerRef.current = window.setTimeout(() => {
      saveProgressNow();
      saveTimerRef.current = null;
    }, 900);
  }, [saveProgressNow]);

  const syncWatermark = useCallback(() => {
    const label = displayStudentId;
    return {
      lineA: `ID ${label}`,
      lineB: `ID ${label}`,
      lineC: `ID ${label}`,
    };
  }, [displayStudentId]);

  const watermark = syncWatermark();

  useEffect(() => {
    if (pendingSeekRef.current == null) {
      pendingSeekRef.current = progress[activeVideoId]?.time || 0;
    }
    setPlayerState({ currentTime: 0, duration: 0, percent: 0 });
    setPlayerMessage(progress[activeVideoId]?.time > 0 ? `Resume from ${formatTime(progress[activeVideoId].time)} on this lesson.` : 'No progress yet.');
    setResumeBadgeText(progress[activeVideoId]?.time > 0 ? `Resume at ${formatTime(progress[activeVideoId].time)}` : '');
    setQuizFeedback('');
    setBookmarkName('');
  }, [activeVideoId]);

  useEffect(() => {
    if (!isAuthenticated || !portalHydratedRef.current) return;

    const handle = window.setTimeout(() => {
      api
        .saveProfile(authToken, { name: studentName.trim() || authUser?.name || 'Student' })
        .then(({ user }) => {
          setAuthUser(user);
        })
        .catch((error) => {
          if (String(error.message || '').includes('Unauthorized')) {
            handleLogout();
          }
        });
    }, 400);

    return () => window.clearTimeout(handle);
  }, [authToken, handleLogout, isAuthenticated, studentName]);

  useEffect(() => {
    if (!isAuthenticated || !portalHydratedRef.current) return;

    const handle = window.setTimeout(() => {
      api
        .savePortal(authToken, {
          studentName: studentName.trim() || authUser?.name || 'Student',
          activeVideoId,
          bookmarks,
          progress,
          quizzes,
          quizDrafts,
        })
        .catch((error) => {
          if (String(error.message || '').includes('Unauthorized')) {
            handleLogout();
          }
        });
    }, 450);

    return () => window.clearTimeout(handle);
  }, [
    activeVideoId,
    authToken,
    bookmarks,
    handleLogout,
    isAuthenticated,
    progress,
    quizDrafts,
    quizzes,
    studentName,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCaptureShield(true);
        saveProgressNow();
        videoRef.current?.pause();
      } else {
        setCaptureShield(false);
      }
    };

    const handleWindowBlur = () => {
      setCaptureShield(true);
      saveProgressNow();
      videoRef.current?.pause();
    };

    const handleWindowFocus = () => {
      setCaptureShield(false);
    };

    const handleKeydown = (event) => {
      const key = event.key.toLowerCase();
      const blocked =
        key === 'printscreen' ||
        (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (event.ctrlKey && key === 'u') ||
        (event.ctrlKey && key === 'p') ||
        (event.metaKey && key === 'p');

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
        setCaptureShield(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeunload', saveProgressNow);
    document.addEventListener('keydown', handleKeydown, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', saveProgressNow);
      document.removeEventListener('keydown', handleKeydown, true);
    };
  }, [saveProgressNow]);

  const handleStudentNameChange = (value) => {
    setStudentName(value.trim());
  };

  const handleSelectLesson = (lessonId) => {
    const nextProgress = progress[lessonId]?.time || 0;
    pendingSeekRef.current = nextProgress;
    setActiveVideoId(lessonId);
    setResumeBadgeText(nextProgress > 0 ? `Resume at ${formatTime(nextProgress)}` : '');
  };

  const handleAddBookmark = () => {
    const video = videoRef.current;
    if (!video) return;

    const time = Math.max(0, video.currentTime || 0);
    setBookmarks((prev) => [
      {
        id: crypto.randomUUID(),
        videoId: activeVideoId,
        name: bookmarkName.trim(),
        time,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      ...prev,
    ]);
    setBookmarkName('');
    setQuizFeedback('');
  };

  const handleBookmarkJump = (bookmark) => {
    if (bookmark.videoId !== activeVideoId) {
      pendingSeekRef.current = bookmark.time;
      setResumeBadgeText(`Resume at ${formatTime(bookmark.time)}`);
      setActiveVideoId(bookmark.videoId);
      return;
    }

    const video = videoRef.current;
    if (!video) return;
    video.currentTime = bookmark.time;
    video.play().catch(() => {});
    setPlayerState((prev) => ({ ...prev, currentTime: bookmark.time }));
    setResumeBadgeText(`Resume at ${formatTime(bookmark.time)}`);
  };

  const handleBookmarkEdit = (bookmarkId) => {
    const existing = bookmarks.find((bookmark) => bookmark.id === bookmarkId);
    if (!existing) return;

    const nextName = window.prompt('Edit bookmark name', existing.name || '');
    if (nextName === null) return;

    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === bookmarkId
          ? { ...bookmark, name: nextName.trim(), updatedAt: Date.now() }
          : bookmark
      )
    );
  };

  const handleBookmarkDelete = (bookmarkId) => {
    const existing = bookmarks.find((bookmark) => bookmark.id === bookmarkId);
    if (!existing) return;

    const confirmed = window.confirm(`Delete the bookmark at ${formatTime(existing.time)}?`);
    if (!confirmed) return;

    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== bookmarkId));
  };

  const handleVideoLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    const seekTarget = pendingSeekRef.current ?? progress[activeVideoId]?.time ?? 0;
    pendingSeekRef.current = null;

    if (Number.isFinite(video.duration)) {
      const duration = video.duration || 0;
      const current = Math.min(seekTarget || 0, duration || seekTarget || 0);
      if (current > 0 && current < duration - 1) {
        video.currentTime = current;
        setResumeBadgeText(`Resumed at ${formatTime(current)}`);
        setPlayerState({
          currentTime: current,
          duration,
          percent: Math.min(100, Math.round((current / duration) * 100)),
        });
        setPlayerMessage(`Resume from ${formatTime(current)} on this lesson.`);
      } else {
        setPlayerState({ currentTime: 0, duration, percent: 0 });
      }
    }
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const current = video.currentTime || 0;
    const duration = video.duration || 0;
    const percent = duration > 0 ? Math.min(100, Math.round((current / duration) * 100)) : 0;
    setPlayerState({ currentTime: current, duration, percent });
    setPlayerMessage(current > 0 ? `Resume from ${formatTime(current)} on this lesson.` : 'No progress yet.');
    scheduleSaveProgress();
  };

  const handleVideoPlay = () => {};
  const handleVideoPause = () => {};
  const handleVideoEnded = () => saveProgressNow();
  const handleVideoContextMenu = (event) => event.preventDefault();

  const handleQuizAnswerChange = (questionIndex, optionIndex) => {
    setQuizDrafts((prev) => {
      const currentDraft = [...(prev[currentLesson.id] || [])];
      currentDraft[questionIndex] = optionIndex;
      return {
        ...prev,
        [currentLesson.id]: currentDraft,
      };
    });
  };

  const handleSubmitQuiz = () => {
    if (!quizQuestions.length) return;

    const answers = [];
    let score = 0;
    let unanswered = false;

    quizQuestions.forEach((question, index) => {
      const answer = quizDraft[index];
      if (answer === undefined || answer === null) {
        unanswered = true;
        answers.push(null);
        return;
      }

      answers.push(answer);
      if (answer === question.answer) {
        score += 1;
      }
    });

    if (unanswered) {
      setQuizFeedback('Please answer every question before submitting.');
      return;
    }

    setQuizzes((prev) => ({
      ...prev,
      [currentLesson.id]: {
        score,
        total: quizQuestions.length,
        answers,
        updatedAt: Date.now(),
      },
    }));

    setQuizFeedback(
      score === quizQuestions.length
        ? 'Perfect score. This lesson is marked as mastered.'
        : `Score saved: ${score}/${quizQuestions.length}. Review the lesson and try again to improve.`
    );
  };

  const handleExportReport = () => {
    const report = buildLearningReport({
      student: displayStudentId,
      generatedAt: new Date().toISOString(),
      activeLessonId: activeVideoId,
      progress,
      bookmarks,
      quizzes,
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        progress: progress[lesson.id] || { time: 0, percent: 0, duration: 0 },
        quiz: quizzes[lesson.id] || null,
      })),
    });

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gvcc-learning-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
    setQuizFeedback('Learning report exported.');
  };

  const syncCertificateData = () => ({
    name: displayName,
    lessonsText: `${completedLessonsCount}/${lessons.length}`,
    quizText: `${quizAverage}%`,
    bookmarksText: String(bookmarks.length),
    issuedText: `Issued on ${certificateIssueDate}`,
  });

  const handleOpenCertificate = () => {
    if (!certificateUnlocked) return;
    setCertificateOpen(true);
  };

  const handleCloseCertificate = () => setCertificateOpen(false);

  const handleDownloadCertificate = () => {
    if (!certificateUnlocked) return;
    const certificate = syncCertificateData();
    const svg = createCertificateSvg(certificate);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gvcc-certificate-${new Date().toISOString().slice(0, 10)}.svg`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
    setQuizFeedback('Certificate downloaded.');
  };

  useEffect(() => {
    if (!certificateOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setCertificateOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [certificateOpen]);

  const certificateData = syncCertificateData();

  if (authLoading && authToken && !authUser) {
    return (
      <div className="auth-screen">
        <div className="auth-card panel">
          <p className="eyebrow">Secure access</p>
          <h1>Restoring your session</h1>
          <p className="hero-copy">We are loading your saved portal state from the backend.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthGate
        mode={authMode}
        loading={authLoading}
        error={authError}
        onSubmit={handleAuthSubmit}
        onModeChange={(nextMode) => {
          setAuthError('');
          setAuthMode(nextMode);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <Sidebar
        studentId={studentName}
        onStudentIdChange={handleStudentNameChange}
        user={authUser}
        onLogout={handleLogout}
        lessons={lessons}
        activeLessonId={activeVideoId}
        onSelectLesson={handleSelectLesson}
        progressMap={progress}
      />

      <main className="content">
        <HeroSection bookmarkCount={bookmarks.length} minutesTracked={minutesTracked} />

        <VideoWorkspace
          lesson={currentLesson}
          resumeBadgeText={resumeBadgeText}
          videoRef={videoRef}
          captureShield={captureShield}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          progressPercent={playerState.percent}
          progressText={playerMessage || progressText}
          bookmarkName={bookmarkName}
          onBookmarkNameChange={setBookmarkName}
          onAddBookmark={handleAddBookmark}
          onVideoLoadedMetadata={handleVideoLoadedMetadata}
          onVideoTimeUpdate={handleVideoTimeUpdate}
          onVideoPlay={handleVideoPlay}
          onVideoPause={handleVideoPause}
          onVideoEnded={handleVideoEnded}
          onVideoContextMenu={handleVideoContextMenu}
          onBookmarkJump={handleBookmarkJump}
          onBookmarkEdit={handleBookmarkEdit}
          onBookmarkDelete={handleBookmarkDelete}
          bookmarks={currentBookmarks}
          watermarkLineA={watermark.lineA}
          watermarkLineB={watermark.lineB}
          watermarkLineC={watermark.lineC}
        />

        <RecentPanel recentLessons={recentLessons} onOpenLesson={handleSelectLesson} />

        <ScorecardSection
          lessonId={currentLesson.id}
          completionLabel={completionLabel}
          completedLessonsCount={completedLessonsCount}
          quizAverage={quizAverage}
          streakCount={streakCount}
          certificateUnlocked={certificateUnlocked}
          quizPrompt={quizAttempt ? `Best score for this lesson: ${quizAttempt.score}/${quizAttempt.total}` : 'Answer all questions to lock in the lesson\'s learning score.'}
          quizQuestions={quizQuestions}
          quizDraft={quizDraft}
          quizAttempt={quizAttempt}
          quizFeedback={quizFeedback}
          onQuizAnswerChange={handleQuizAnswerChange}
          onSubmitQuiz={handleSubmitQuiz}
          onExportReport={handleExportReport}
          onOpenCertificate={handleOpenCertificate}
        />
      </main>

      <CertificateModal
        open={certificateOpen}
        name={certificateData.name}
        lessonsText={certificateData.lessonsText}
        quizText={certificateData.quizText}
        bookmarksText={certificateData.bookmarksText}
        issuedText={certificateData.issuedText}
        onClose={handleCloseCertificate}
        onDownload={handleDownloadCertificate}
      />
    </div>
  );
}

export default App;
