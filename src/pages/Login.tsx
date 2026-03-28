import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../api/services';
import { GridIcon, EyeIcon, EyeOffIcon, BookIcon, ShieldIcon, AwardIcon, AlertTriangleIcon, CheckIcon } from '../components/Icons';

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({ length: 36 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 1,
      dx: (Math.random() - .5) * .45, dy: (Math.random() - .5) * .45,
      o: Math.random() * .45 + .1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${.1 * (1 - d / 110)})`; ctx.lineWidth = .5; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />;
};

const Login: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwdFocused, setPwdFocused]     = useState(false);

  const { user, token, initialized, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (initialized && user && token) {
    return <Navigate to={user.role?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/topics'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await authAPI.login(email, password);
      const { access_token, refresh_token, role, role_id, user_id, name } = res.data;
      let userRole = role;
      if (!userRole && role_id !== undefined) userRole = role_id === 1 ? 'Admin' : 'User';
      login(access_token, refresh_token, { id: user_id, name, email, role: userRole });
      navigate(userRole?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/topics');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      setError(msg); showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isTypingPassword = password.length > 0;

  return (
    <div className="login-page">
      {/* Left */}
      <div className="login-left">
        <div className="login-form-wrap">
          <div className="login-top-bar">
            <div className="login-logo">
              <div className="login-logo-icon"><GridIcon size={20} /></div>
              <span className="login-logo-text">QuizPlatform</span>
            </div>
          </div>

          <h1 className="login-heading">Welcome back</h1>
          <p className="login-subheading">Sign in to continue to your account</p>

          {error && (
            <div className="error-banner" role="alert">
              <AlertTriangleIcon size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={`login-field ${emailFocused ? 'focused' : ''} ${email && emailValid ? 'valid' : ''}`}>
              <label htmlFor="email">Email address</label>
              <div className="login-input-wrap">
                <input id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required placeholder="you@example.com" autoComplete="email" />
                {email && emailValid && <span className="login-input-check"><CheckIcon size={15} /></span>}
              </div>
            </div>

            <div className={`login-field ${pwdFocused ? 'focused' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <input id="password" type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPwdFocused(true)}
                  onBlur={() => setPwdFocused(false)}
                  required placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" className="password-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  {showPwd ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-submit-btn" aria-busy={loading}>
              {loading ? <><span className="btn-spinner" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="login-footer">© {new Date().getFullYear()} QuizPlatform. All rights reserved.</p>
        </div>
      </div>

      {/* Right */}
      <div className="login-right" aria-hidden="true">
        <ParticleCanvas />
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />

        <div className="login-right-content">
          <div className="login-img-wrap">
            <img
              key={isTypingPassword ? 'hide' : 'show'}
              src={isTypingPassword
                ? 'https://img.freepik.com/free-vector/privacy-policy-concept-illustration_114360-7853.jpg'
                : 'https://img.freepik.com/free-vector/online-test-concept-illustration_114360-956.jpg'}
              alt="Quiz illustration"
              className="login-illustration"
            />
          </div>
          <h2>Knowledge Testing Platform</h2>
          <p>Take exams, earn certificates, and showcase your expertise.</p>
          <div className="login-features">
            {([
              [<BookIcon size={14} />,   'Multiple topic exams'],
              [<ShieldIcon size={14} />, 'AI-powered proctoring'],
              [<AwardIcon size={14} />,  'Instant grading & certificates'],
            ] as [React.ReactNode, string][]).map(([icon, text]) => (
              <div className="login-feature" key={String(text)}>
                <div className="login-feature-icon">{icon}</div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
