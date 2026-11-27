import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/ownerMenus';
import { authErrorMessage } from '../utils/authErrorMessage';

export default function AccountForm({ mode, session, dashboardPath = '/dashboard' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const registering = mode === 'register';
  const recovering = mode === 'recover';
  const resetting = mode === 'reset';
  const title = registering ? 'Create an account' : recovering ? 'Reset your password'
    : resetting ? 'Set a new password' : 'Sign in to FoodFinder';

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get('email')?.trim();
    const password = form.get('password');
    const origin = window.location.origin;
    setBusy(true);
    setError('');
    setStatus('');
    try {
      let response;
      if (registering) {
        const fullName = form.get('fullName').trim();
        if (!fullName) throw new Error('Enter your name.');
        response = await supabase.auth.signUp({
          email, password, options: { data: { full_name: fullName }, emailRedirectTo: origin + '/dashboard' },
        });
      } else if (recovering) {
        response = await supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' });
      } else if (resetting) {
        response = await supabase.auth.updateUser({ password });
      } else {
        response = await supabase.auth.signInWithPassword({ email, password });
      }
      if (response.error) throw response.error;
      if (recovering) setStatus('If an account exists for that email, you’ll receive a reset link.');
      else if (registering && !response.data.session) setStatus('Check your email to confirm your account.');
      else if (resetting) navigate(dashboardPath, { replace: true });
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  if (session && (mode === 'login' || registering)) {
    const destination = dashboardPath === '/owner' ? dashboardPath : location.state?.from || dashboardPath;
    return <Navigate to={destination} replace />;
  }

  return (
    <section className="container section owner-portal">
      <h1 className="section-title">{title}</h1>
      {!supabase ? <p>FoodFinder accounts are unavailable until Supabase is configured.</p>
        : resetting && session === undefined ? <p role="status">Checking your reset link…</p>
          : resetting && !session ? <p>Request a <Link to="/forgot-password">new password reset link</Link>.</p>
            : <form className="owner-panel owner-form" onSubmit={submit}>
              {registering && <label>Name<input name="fullName" autoComplete="name" maxLength={100} required /></label>}
              {!resetting && <label>Email<input name="email" type="email" autoComplete="email" required /></label>}
              {!recovering && <label>Password<input name="password" type="password"
                minLength={registering || resetting ? 8 : undefined}
                autoComplete={registering || resetting ? 'new-password' : 'current-password'} required /></label>}
              {error && <p role="alert">{error}</p>}
              {status && <p role="status">{status}</p>}
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {registering ? 'Create account' : recovering ? 'Send reset link' : resetting ? 'Save password' : 'Sign in'}
              </button>
            </form>}
      <div className="owner-actions">
        {mode === 'login' ? <>
          <Link to="/register">Create an account</Link>
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/owner">Restaurant owner portal</Link>
        </> : <Link to="/login">Back to sign in</Link>}
      </div>
    </section>
  );
}
