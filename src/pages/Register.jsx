import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { gsap, prefersReducedMotion } from '../hooks/useGsapSetup';
import { registerMockUser, validateEmailFormat } from '../utils/mockAuth';
import ImageWithFallback from '../components/ImageWithFallback';

export default function Register() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

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
      gsap.from('.gsap-register-item', {
        y: 16,
        opacity: 0,
        duration: 0.48,
        stagger: 0.055,
        delay: 0.1,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }
    if (!email.trim()) {
      errors.email = 'Please enter an email address.';
    } else if (!validateEmailFormat(email)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }
    if (!password) {
      errors.password = 'Please create a demonstration password.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!acceptedTerms) {
      errors.acceptedTerms = 'Please accept the demonstration terms to continue.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatusMessage(null);
      return;
    }

    const result = registerMockUser({
      fullName,
      email,
      password,
    });

    if (!result.ok) {
      setStatusMessage({ type: 'error', text: result.error });
      return;
    }

    setStatusMessage({
      type: 'success',
      text: `Account created for ${result.user.fullName}! Redirecting you to Login...`,
    });

    setTimeout(() => {
      navigate('/login', {
        state: {
          justRegistered: true,
          registeredEmail: result.user.email,
        },
      });
    }, 900);
  };

  return (
    <div ref={pageRef} className="auth-page">
      <div className="container">
        <div className="auth-shell">
          {/* DECORATIVE VISUAL PANEL */}
          <div className="auth-visual-panel">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80"
              alt="Elegant gourmet dessert and coffee table setting"
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
                style={{ color: '#FFFFFF', fontSize: '2.05rem', marginBottom: '12px' }}
              >
                Personalize Your Dining Discovery.
              </h2>
              <p style={{ color: 'rgba(250, 248, 255, 0.82)', fontSize: '0.95rem' }}>
                Create a simulated local profile to save favorite restaurants, revisit
                menu prices, and plan meals within your budget.
              </p>
            </div>

            <div className="auth-visual-quote">
              <p>
                &ldquo;From ₱99 crispy chicken rice bowls to artisan mille crêpes—save
                every spot worth visiting.&rdquo;
              </p>
              <span>100% Client-Side Demonstration</span>
            </div>
          </div>

          {/* FORM PANEL */}
          <div className="auth-form-panel">
            <div className="gsap-register-item">
              <span className="eyebrow">Join FOOD FINDER</span>
              <h1
                className="editorial-serif"
                style={{ fontSize: '1.95rem', marginBottom: '6px' }}
              >
                Create Mock Account
              </h1>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.91rem',
                  marginBottom: '18px',
                }}
              >
                Register locally in seconds—no external servers or backend required.
              </p>
            </div>

            <div className="auth-sim-notice gsap-register-item">
              <Info size={17} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Demonstration Only:</strong> Please use sample credentials only
                (never real passwords). Account data stays strictly inside your
                browser&apos;s <code>localStorage</code>.
              </span>
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

            <form className="form-stack gsap-register-item" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="register-name">Full Name</label>
                <div className="form-input-wrap">
                  <User size={18} className="input-leading-icon" aria-hidden="true" />
                  <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    className={`form-input ${fieldErrors.fullName ? 'has-error' : ''}`}
                    placeholder="e.g. Bianca Reyes"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName)
                        setFieldErrors((p) => ({ ...p, fullName: '' }));
                    }}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="field-error-msg">{fieldErrors.fullName}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="register-email">Email Address</label>
                <div className="form-input-wrap">
                  <Mail size={18} className="input-leading-icon" aria-hidden="true" />
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                    placeholder="bianca@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email)
                        setFieldErrors((p) => ({ ...p, email: '' }));
                    }}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="field-error-msg">{fieldErrors.email}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="register-password">Demonstration Password</label>
                <div className="form-input-wrap">
                  <Lock size={18} className="input-leading-icon" aria-hidden="true" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                    placeholder="At least 6 characters (demo only)"
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
                    aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="field-error-msg">{fieldErrors.password}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="register-confirm-password">Confirm Password</label>
                <div className="form-input-wrap">
                  <Lock size={18} className="input-leading-icon" aria-hidden="true" />
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`form-input ${
                      fieldErrors.confirmPassword ? 'has-error' : ''
                    }`}
                    placeholder="Re-enter demonstration password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword)
                        setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                    }}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="field-error-msg">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (fieldErrors.acceptedTerms)
                        setFieldErrors((p) => ({ ...p, acceptedTerms: '' }));
                    }}
                  />
                  <span>
                    I understand this is a simulated frontend demonstration and agree to
                    the placeholder Terms &amp; Conditions.
                  </span>
                </label>
                {fieldErrors.acceptedTerms && (
                  <p className="field-error-msg">{fieldErrors.acceptedTerms}</p>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-full">
                <span>Create Account</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-switch-footer gsap-register-item">
              Already have a mock account?{' '}
              <Link to="/login" className="text-link">
                Sign In Here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
