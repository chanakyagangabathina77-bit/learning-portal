import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLocalAuthResponse } from '../src/api/client.js';

test('buildLocalAuthResponse returns a token, user, and portal payload', () => {
  const response = buildLocalAuthResponse({
    user: { id: 'u1', name: 'Ava', email: 'ava@example.com' },
    portal: { studentName: 'Ava', activeVideoId: 'lesson-01' },
  });

  assert.match(response.token, /^local-/);
  assert.equal(response.user.name, 'Ava');
  assert.equal(response.portal.studentName, 'Ava');
});
