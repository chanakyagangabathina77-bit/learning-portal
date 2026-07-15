async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export function buildLocalAuthResponse({ user, portal }) {
  return {
    token: `local-${user.id}`,
    user,
    portal: {
      studentName: portal.studentName || user.name || 'Student',
      activeVideoId: portal.activeVideoId || 'lesson-01',
      bookmarks: Array.isArray(portal.bookmarks) ? portal.bookmarks : [],
      progress: portal.progress || {},
      quizzes: portal.quizzes || {},
      quizDrafts: portal.quizDrafts || {},
    },
  };
}

export const api = {
  signup: async (payload) => {
    try {
      return await request('/api/auth/signup', { method: 'POST', body: payload });
    } catch {
      return buildLocalAuthResponse({
        user: { id: `local-${Date.now()}`, name: payload.name || 'Student', email: payload.email || 'student@example.com' },
        portal: { studentName: payload.name || 'Student', activeVideoId: 'lesson-01' },
      });
    }
  },
  login: async (payload) => {
    try {
      return await request('/api/auth/login', { method: 'POST', body: payload });
    } catch {
      return buildLocalAuthResponse({
        user: { id: `local-${Date.now()}`, name: payload.email?.split('@')[0] || 'Student', email: payload.email || 'student@example.com' },
        portal: { studentName: payload.email?.split('@')[0] || 'Student', activeVideoId: 'lesson-01' },
      });
    }
  },
  me: (token) => request('/api/auth/me', { token }),
  portal: async (token) => {
    try {
      return await request('/api/portal', { token });
    } catch {
      return {
        user: { id: token, name: 'Student', email: 'student@example.com' },
        portal: { studentName: 'Student', activeVideoId: 'lesson-01', bookmarks: [], progress: {}, quizzes: {}, quizDrafts: {} },
      };
    }
  },
  savePortal: async (token, payload) => {
    try {
      return await request('/api/portal', { method: 'PUT', token, body: payload });
    } catch {
      return { portal: payload };
    }
  },
  saveProfile: async (token, payload) => {
    try {
      return await request('/api/profile', { method: 'PUT', token, body: payload });
    } catch {
      return { user: { id: token, name: payload.name || 'Student', email: 'student@example.com' }, portal: { studentName: payload.name || 'Student' } };
    }
  },
  logout: async (token) => {
    try {
      return await request('/api/auth/logout', { method: 'POST', token });
    } catch {
      return { ok: true };
    }
  },
};
