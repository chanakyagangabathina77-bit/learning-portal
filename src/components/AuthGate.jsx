import { useState } from 'react';

export function AuthGate({ mode, loading, error, onSubmit, onModeChange }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSignup = mode === 'signup';

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, email, password });
  };

  return (
    <div className="auth-screen">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="auth-card panel">
        <p className="eyebrow">Secure access</p>
        <h1>Sign in to the Learning Portal</h1>
        <p className="hero-copy">
          This version adds a real authentication step so the portal feels like a product a company would actually shortlist.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup ? (
            <label className="auth-field">
              <span>Name</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
            </label>
          ) : null}
          <label className="auth-field">
            <span>Email</span>
            <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          <button
            className="text-button"
            type="button"
            onClick={() => onModeChange(isSignup ? 'login' : 'signup')}
          >
            {isSignup ? 'Have an account? Login' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
