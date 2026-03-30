// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  BarChart2,
  Users,
  DollarSign,
  CalendarCheck,
  ShieldCheck,
  GraduationCap,
  PieChart,
} from 'lucide-react'

/* ─── Floating Label Component ───────────────────────────────── */
function FloatingLabel({ children, icon: Icon, color, style, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { delay, duration: 0.4 },
        scale:   { delay, duration: 0.4 },
      }}
      className="absolute flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/60 z-20 select-none"
      style={style}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: color + '22' }}
      >
        <Icon size={11} style={{ color }} />
      </div>
      <span className="text-xs font-bold whitespace-nowrap text-slate-700">{children}</span>
    </motion.div>
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember,     setRemember]     = useState(false)
  const [error,        setError]        = useState('')
  const [isLoading,    setIsLoading]    = useState(false)

  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.message || 'Invalid credentials. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ══════════ LEFT PANEL ══════════ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex flex-col relative overflow-hidden px-14 pt-7 pb-10"
        style={{
          flex: '0 0 58%',
          background: 'linear-gradient(145deg,#eef2ff 0%,#e0e7ff 35%,#dbeafe 65%,#d1fae5 100%)',
        }}
      >
        {/* Soft blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(129,140,248,.22),transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(52,211,153,.18),transparent 70%)' }} />

        {/* ── Logo ── tight to top, no extra gap */}
        <div className="relative z-10 flex-shrink-0 -mt-8">
<img
  src="/logoconnectskool.png"
  alt="ConnectSkool – Empowering Learning"
  style={{ height: '160px', width: 'auto' }}
  className="object-contain"
  onError={(e) => {
    e.currentTarget.style.display = 'none'
    document.getElementById('cs-logo-fallback').style.display = 'flex'
  }}
/>
          
          <div id="cs-logo-fallback" className="hidden items-center gap-3">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <path d="M13 17l7-5 7 5v9a1 1 0 01-1 1H14a1 1 0 01-1-1v-9z" fill="#fff"/>
                <rect x="17" y="21" width="6" height="6" rx="1" fill="#2563EB"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 leading-tight">
                Connect<span className="text-blue-600">Skool</span>
                <span className="text-slate-400 font-medium">.com</span>
              </p>
              <p className="text-sm text-slate-500 font-semibold">Empowering Learning</p>
            </div>
          </div>
        </div>

        {/* ── Hero — fills remaining space ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <span className="inline-block text-xs font-bold text-blue-600 tracking-widest uppercase mb-3 bg-blue-100 px-3 py-1.5 rounded-full">
              Welcome to ConnectSkool
            </span>
            <h1 className="text-5xl font-black text-slate-900 leading-tight mb-3">
              Smart School<br />
              <span className="text-blue-600">Management</span>{' '}
              <span className="text-emerald-500">System</span>
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-md mb-5">
              Manage students, teachers, attendance, fees, and reports —{' '}
              <span className="font-bold text-slate-700">all in one powerful platform.</span>
            </p>
            <p className="text-xs text-slate-400 font-bold italic tracking-wide mb-2">
              ✦ One platform. Complete school control.
            </p>
          </motion.div>

          {/* ── Image + Floating Labels ── */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="relative flex justify-center items-center mt-2"
            style={{ minHeight: '240px' }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-30 z-0"
              style={{ background: 'radial-gradient(ellipse at center, #818cf8 0%, #34d399 100%)' }}
            />

            {/* Main Image */}
            <img
              src="/schoolimagelogin.png"
              alt="School ERP Illustration"
              className="w-full max-w-xs object-contain relative z-10 drop-shadow-xl"
            />

            {/* Floating Labels */}
            <FloatingLabel icon={GraduationCap} color="#2563eb" delay={0.60} style={{ top: '6%',  left: '2%'  }}>Student Management</FloatingLabel>
            <FloatingLabel icon={Users}         color="#059669" delay={0.75} style={{ top: '8%',  right: '0%' }}>Teacher Panel</FloatingLabel>
            <FloatingLabel icon={DollarSign}    color="#d97706" delay={0.90} style={{ top: '44%', left: '-4%' }}>Fee Management</FloatingLabel>
            <FloatingLabel icon={BarChart2}     color="#7c3aed" delay={1.05} style={{ top: '44%', right: '-2%'}}>Analytics</FloatingLabel>
            <FloatingLabel icon={CalendarCheck} color="#e11d48" delay={1.20} style={{ bottom: '6%', left: '2%'  }}>Attendance</FloatingLabel>
            <FloatingLabel icon={PieChart}      color="#0891b2" delay={1.35} style={{ bottom: '6%', right: '0%' }}>Reports</FloatingLabel>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex-shrink-0 flex items-center justify-between border-t border-blue-200/50 pt-4">
          <span className="text-xs text-slate-400">© 2026 ConnectSkool. All rights reserved.</span>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms & Conditions'].map((t) => (
              <a key={t} href="#" className="text-xs text-slate-500 font-semibold hover:text-blue-600 transition-colors">
                {t}
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex-1 bg-white flex items-center justify-center px-8 py-12"
      >
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/logoconnectskool.png"
              alt="ConnectSkool"
              className="h-14 object-contain"
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-1">Welcome Back 👋</h2>
            <p className="text-slate-500 text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5"
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
              />
              <span className="text-sm text-slate-600 font-semibold">Remember Me</span>
            </label>

            {/* Login button */}
            <motion.button
              whileHover={{ scale: 1.015, filter: 'brightness(1.05)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing you in…</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Login to Dashboard</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Role info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
            <ShieldCheck size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-700 mb-0.5">
                Access for Admin, Teacher &amp; Accountant
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                You'll be automatically redirected to your dashboard based on your role.
              </p>
            </div>
          </div>

          {/* No account */}
          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <a href="#" className="text-blue-600 font-bold hover:underline">Contact Admin</a>
          </p>

          {/* Mobile footer */}
          <div className="lg:hidden mt-8 text-center text-xs text-slate-400 space-x-2">
            <span>© 2026 ConnectSkool</span>
            <span>·</span>
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-blue-600">Terms</a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage