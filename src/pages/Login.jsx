import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { gsap, prefersReducedMotion } from '../hooks/useGsapSetup';
import {
  PREDEFINED_DEMO_USER,
  loginMockUser,
  validateEmailFormat,
} from '../utils/mockAuth';
import ImageWithFallback from '../components/ImageWithFallback';

export default function Login({ onLoginSuccess }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const prefilledEmail = location.state?.registeredEmail || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(
    location.state?.justRegistered
      ? {
          type: 'success',
          text: 'Mock account saved in localStorage! Sign in below with your demonstration credentials.',
        }
      : null
  );

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.auth-shell', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
      gsap.from('.gsap-login-item', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        delay: 0.12,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleFillDemo = () => {
    setEmail(PREDEFINED_DEMO_USER.email);
    setPassword(PREDEFINED_DEMO_USER.demoPasscode);
    setFieldErrors({});
    setStatusMessage({
      type: 'success',
      text: 'Demo account credentials filled. Click Login to continue.',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!validateEmailFormat(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatusMessage(null);
      return;
    }

    const result = loginMockUser({ email, password, rememberMe });
    if (!result.ok) {
      setStatusMessage({ type: 'error', text: result.error });
      return;
    }

    setStatusMessage({
      type: 'success',
      text: `Welcome back, ${result.session.fullName}! Redirecting...`,
    });

    if (onLoginSuccess) {
      onLoginSuccess(result.session);
    }

    const destination = location.state?.from || '/dashboard';
    setTimeout(() => {
      navigate(destination, { replace: true });
    }, 550);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!validateEmailFormat(resetEmail)) {
      setResetFeedback('Please enter a valid email address to preview reset feedback.');
      return;
    }
    setResetFeedback(
      `Simulated Notice: Because FOOD FINDER is frontend-only, no external email was sent to ${resetEmail}. You can sign in anytime using "${PREDEFINED_DEMO_USER.email}" / "${PREDEFINED_DEMO_USER.demoPasscode}" or register a fresh local account.`
    );
  };

  return (
    <div ref={pageRef} className="auth-page">
      <div className="container">
        <div className="auth-shell">
          {/* DECORATIVE VISUAL PANEL */}
          <div className="auth-visual-panel">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
              alt="Warm ambient dining room interior"
              className="auth-bg-img"
            />
            <div className="auth-visual-overlay" />

            <div className="auth-visual-content">
              <Link to="/" className="brand-logo" style={{ marginBottom: '28px' }}>
                <span className="brand-mark" aria-hidden="true">
                  <UtensilsCrossed size={20} />
                </span>
                <span className="brand-text-wrap">
                  <span className="brand-name" style={{ color: '#FFFFFF' }}>
                    FOOD FINDER
                  </span>
                  <span className="brand-tagline" style={{ color: '#D8C5FF' }}>
                    Menus &amp; Dining Guide
                  </span>
                </span>
              </Link>

              <h2
                className="editorial-serif"
                style={{ color: '#FFFFFF', fontSize: '2.1rem', marginBottom: '12px' }}
              >
                Curated Menus at Your Fingertips.
              </h2>
              <p style={{ color: 'rgba(250, 248, 255, 0.82)', fontSize: '0.96rem' }}>
                Sign in to access your simulated dining hub, manage bookmarked
                restaurants, and compare Philippine Peso meal budgets across cities.
              </p>
            </div>

            <div className="auth-visual-quote">
              <p>
                &ldquo;Checking full menus and exact Peso prices before walking in turns
                every lunch or dinner outing into an effortless delight.&rdquo;
              </p>
              <span>FOOD FINDER Editorial Experience</span>
            </div>
          </div>

          {/* FORM PANEL */}
          <div className="auth-form-panel">
            <div className="gsap-login-item">
              <span className="eyebrow">Welcome Back</span>
              <h1
                className="editorial-serif"
                style={{ fontSize: '2rem', marginBottom: '8px' }}
              >
                Sign In to FOOD FINDER
              </h1>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.93rem',
                  marginBottom: '20px',
                }}
              >
                Enter your demonstration credentials or use the predefined sample
                account.
              </p>
            </div>

            <div className="auth-sim-notice gsap-login-item">
              <Info size={17} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Simulated Authentication:</strong> Login state is stored locally
                in browser <code>localStorage</code> for frontend demonstration only—not
                secure server authentication.
              </span>
            </div>

            <div className="demo-autofill-box gsap-login-item">
              <div>
                <strong style={{ color: 'var(--color-primary-deep)' }}>
                  Demo User:
                </strong>{' '}
                <span>{PREDEFINED_DEMO_USER.email}</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="btn btn-secondary btn-sm"
              >
                <Sparkles size={14} />
                <span>Fill Demo Login</span>
              </button>
            </div>

            {statusMessage && (
              <div
                className={`alert-banner ${statusMessage.type}`}
                role="status"
                aria-live="polite"
              >
                {statusMessage.type === 'error' ? (
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form className="form-stack gsap-login-item" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="login-email">Email Address</label>
                <div className="form-input-wrap">
                  <Mail size={18} className="input-leading-icon" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                    }}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="field-error-msg">{fieldErrors.email}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="login-password">Password</label>
                <div className="form-input-wrap">
                  <Lock size={18} className="input-leading-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                    placeholder="Enter your demonstration password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password)
                        setFieldErrors((p) => ({ ...p, password: '' }));
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="field-error-msg">{fieldErrors.password}</p>
                )}
              </div>

              <div className="form-row-between">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me on this browser</span>
                </label>

                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setResetEmail(email);
                    setResetFeedback('');
                    setForgotModalOpen(true);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-full">
                <span>Login</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-switch-footer gsap-login-item">
              New to FOOD FINDER?{' '}
              <Link to="/register" className="text-link">
                Create a Mock Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MOCK MODAL */}
      {forgotModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setForgotModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setForgotModalOpen(false)}
              aria-label="Close password recovery dialog"
            >
              <X size={18} />
            </button>
            <span className="eyebrow">Mock Recovery</span>
            <h2
              id="forgot-password-title"
              className="editorial-serif"
              style={{ fontSize: '1.55rem', marginBottom: '8px' }}
            >
              Simulated Password Reset
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>
              Enter your email below to preview the frontend password reset interaction.
            </p>

            <form onSubmit={handleForgotSubmit} className="form-stack">
              <div className="form-field">
                <label htmlFor="reset-email-input">Email Address</label>
                <div className="form-input-wrap">
                  <Mail size={18} className="input-leading-icon" />
                  <input
                    id="reset-email-input"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
              </div>

              {resetFeedback && (
                <div className="alert-banner success" style={{ marginBottom: 0 }}>
                  <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{resetFeedback}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full">
                Preview Recovery Instructions
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
