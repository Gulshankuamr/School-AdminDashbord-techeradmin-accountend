import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, CheckCircle, Ban,
  ChevronDown, FileText, Loader2, XCircle, X,
  BookOpen, Bus, MapPin, Navigation, Clock,
  Banknote, Smartphone, BookCheck, Landmark, CreditCard,
  TrendingUp, Wallet, AlertCircle, Receipt
} from 'lucide-react';
import feePaymentService from '../../services/feeallService/feePaymentService';

/* ─── helpers ─── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (d) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
};

const DISCONTINUE_REASONS = [
  'Student left school', 'Service/facility stopped', 'Scholarship granted',
  'Fee waiver approved', 'Relocation / Moving', 'Other',
];

const avatarColors = [
  { bg: '#FFF3E0', text: '#E65100' }, { bg: '#E8F5E9', text: '#2E7D32' },
  { bg: '#E3F2FD', text: '#1565C0' }, { bg: '#FCE4EC', text: '#880E4F' },
  { bg: '#EDE7F6', text: '#4527A0' }, { bg: '#E0F2F1', text: '#00695C' },
];
const getAvatar = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

const PAYMENT_MODE_ICONS = {
  cash: Banknote, online: Smartphone, cheque: BookCheck, dd: FileText, bank_transfer: Landmark,
};

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => (
  <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl"
    style={{ background: type === 'success' ? '#15803D' : '#B91C1C', animation: 'slideIn 0.3s ease', minWidth: 280 }}>
    {type === 'success'
      ? <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
      : <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />}
    <span className="text-white font-semibold text-sm flex-1">{message}</span>
    <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
  </div>
);

/* ── Tab button ── */
const Tab = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${active ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
    style={active ? { background: '#EA580C' } : {}}>
    {children}
  </button>
);

/* ── Status Badge ── */
const StatusBadge = ({ status, discontinuedOn }) => {
  if (discontinuedOn) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
      <Ban className="w-3 h-3" /> Disc.
    </span>
  );
  const map = {
    paid:    { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E', label: 'Paid' },
    partial: { bg: '#FEF9C3', color: '#A16207', dot: '#EAB308', label: 'Partial' },
    pending: { bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444', label: 'Pending' },
  };
  const s = map[status?.toLowerCase()] || { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8', label: status || '—' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════ */
const StudentFeeProfile = () => {
  const navigate  = useNavigate();
  const { studentId } = useParams();

  const [loading,      setLoading]      = useState(true);
  const [apiData,      setApiData]      = useState(null);
  const [studentInfo,  setStudentInfo]  = useState(null);
  const [assignedFees, setAssignedFees] = useState([]);
  const [summary,      setSummary]      = useState({});
  const [error,        setError]        = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');

  /* Tab: 'fees' | 'history' */
  const [activeTab, setActiveTab] = useState('fees');

  /* Discontinue modal */
  const [modal,       setModal]       = useState(false);
  const [activeFee,   setActiveFee]   = useState(null);
  const [discDate,    setDiscDate]    = useState(new Date().toISOString().split('T')[0]);
  const [discReason,  setDiscReason]  = useState('');
  const [discNotes,   setDiscNotes]   = useState('');
  const [discLoading, setDiscLoading] = useState(false);
  const [discError,   setDiscError]   = useState('');

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res = await feePaymentService.getStudentFees(studentId, academicYear);
      if (res?.success && res?.data) {
        setApiData(res.data);
        setStudentInfo(res.data.student_info || null);
        setAssignedFees(res.data.fee_breakdown || []);
        setSummary(res.data.summary || {});
      } else { setError(res?.error || 'Failed to load fee data'); }
    } catch (e) { setError(e.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, [studentId, academicYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDiscontinue = (fee) => {
    setActiveFee(fee);
    setDiscDate(new Date().toISOString().split('T')[0]);
    setDiscReason(''); setDiscNotes(''); setDiscError('');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setActiveFee(null); };

  const handleDiscontinue = async () => {
    if (!discReason) { setDiscError('Please select a reason'); return; }
    if (!discDate)   { setDiscError('Please select a date'); return; }
    try {
      setDiscLoading(true); setDiscError('');
      await feePaymentService.discontinueFee({
        student_id: parseInt(studentId), student_fee_id: activeFee.student_fee_id,
        discontinued_on: discDate, discontinue_reason: discNotes ? `${discReason} - ${discNotes}` : discReason,
      });
      closeModal(); showToast(`${activeFee.fee_head_name} discontinued successfully`); fetchData();
    } catch (e) { setDiscError(e.message || 'Failed to discontinue fee'); }
    finally { setDiscLoading(false); }
  };

  const handlePay = (fee) =>
    navigate(`/admin/fees-payment/collect/${studentId}`, { state: { preselectedFeeId: fee.student_fee_id } });

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
        </div>
        <p className="text-gray-700 font-semibold">Loading Fee Profile...</p>
      </div>
    </div>
  );

  if (error && !studentInfo) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full border border-gray-200">
        <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load</h3>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button onClick={() => navigate('/admin/fees-payment/collect')}
          className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm" style={{ background: '#EA580C' }}>
          Back to Students
        </button>
      </div>
    </div>
  );

  const cy             = summary.current_year || {};
  const av             = getAvatar(studentInfo?.name || '');
  const paymentHistory = apiData?.payment_history || [];
  const pendingCount   = assignedFees.filter(f => parseFloat(f.pending_amount) > 0 && !f.discontinued_on).length;

  // ✅ Total Fee = base_amount sum (original fee when created, no fine)
  const totalBaseAmount = assignedFees.reduce((s, f) => s + parseFloat(f.base_amount || 0), 0);

  // ✅ Paid Amount = paid + fine (actual money collected from student)
  const paidAmountWithFine = (cy.paid || 0) + (cy.fine || 0);

  // ✅ Total Collected in history = amount + fine_amount per transaction
  const totalHistoryAmt = paymentHistory.reduce(
    (s, p) => s + parseFloat(p.amount || 0) + parseFloat(p.fine_amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .modal-enter { animation: modalIn 0.25s ease both; }
        .fee-row:hover { background: #FAFAFA; }
        .progress-bar { transition: width 0.6s ease; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #EA580C !important; box-shadow: 0 0 0 3px rgba(234,88,12,0.12); }
      `}</style>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/admin/fees-payment/collect')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Fee Collection
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Fee Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage and view detailed fee information</p>
        </div>
      </div>

      {/* ── Student Info Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: av.bg, color: av.text }}>
            {studentInfo?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{studentInfo?.name}</h2>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <span className="text-sm text-gray-500">🪪 {studentInfo?.admission_no}</span>
              <span className="text-sm text-gray-500">📚 {studentInfo?.class_name} – {studentInfo?.section_name}</span>
              {studentInfo?.joined_on && <span className="text-sm text-gray-500">📅 Joined {fmtDate(studentInfo.joined_on)}</span>}
            </div>
          </div>
          <span className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
            AY {academicYear}
          </span>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">

        {/* ✅ Total Fee = base_amount (original fee, NO fine) */}
        <div className="rounded-2xl border p-5 bg-blue-50 border-blue-100 relative overflow-hidden">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Total Fee</p>
          <p className="text-2xl font-extrabold text-blue-700 mb-1">{fmt(totalBaseAmount)}</p>
          <p className="text-xs text-blue-400">Base fee assigned</p>
        </div>

        {/* ✅ Total Paid = paid + fine (actual collected) */}
        <div className="rounded-2xl border p-5 bg-green-50 border-green-100 relative overflow-hidden">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Total Paid</p>
          <p className="text-2xl font-extrabold text-green-700 mb-1">{fmt(paidAmountWithFine)}</p>
          <p className="text-xs text-green-400">
            {fmt(cy.paid || 0)} fee {cy.fine > 0 ? `+ ${fmt(cy.fine)} fine` : ''}
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border p-5 bg-amber-50 border-amber-100 relative overflow-hidden">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Pending</p>
          <p className="text-2xl font-extrabold text-amber-700 mb-1">{fmt(cy.pending || 0)}</p>
          <p className="text-xs text-amber-400">{cy.pending > 0 ? 'Due soon' : 'No pending dues'}</p>
        </div>

        {/* Late Fine */}
        <div className="rounded-2xl border p-5 bg-red-50 border-red-100 relative overflow-hidden">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Late Fine</p>
          <p className="text-2xl font-extrabold text-red-600 mb-1">{fmt(cy.fine || 0)}</p>
          <p className="text-xs text-red-300">{cy.fine > 0 ? 'Applied for overdue' : 'No fines'}</p>
        </div>

      </div>

      {/* ── Main Card with Tabs ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Tab active={activeTab === 'fees'} onClick={() => setActiveTab('fees')}>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Academic Fees
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600">{pendingCount}</span>
                )}
              </span>
            </Tab>
            <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Payment History
                {paymentHistory.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600">{paymentHistory.length}</span>
                )}
              </span>
            </Tab>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-100">
            {activeTab === 'fees'
              ? `${assignedFees.length} fee${assignedFees.length !== 1 ? 's' : ''}`
              : `${paymentHistory.length} txn${paymentHistory.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* ══ ACADEMIC FEES ══ */}
        {activeTab === 'fees' && (
          <>
            {assignedFees.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold">No fees assigned</p>
                <p className="text-gray-400 text-sm mt-1">No fee records found for {academicYear}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50">
                  <div className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Fee Head</div>
                  <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Base Fee</div>
                  <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Paid</div>
                  <div className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Fine</div>
                  <div className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</div>
                  <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</div>
                </div>

                {assignedFees.map((fee, idx) => {
                  const isDisc  = !!fee.discontinued_on;
                  const isPaid  = fee.status?.toLowerCase() === 'paid';
                  const hasFine = parseFloat(fee.fine_amount) > 0;
                  const base    = parseFloat(fee.base_amount || fee.total_amount || 0);
                  const paid    = parseFloat(fee.paid_amount || 0);
                  const pct     = base > 0 ? Math.min(100, Math.round((paid / base) * 100)) : 0;
                  const barColor = pct === 100 ? '#22C55E' : pct > 50 ? '#F59E0B' : '#EF4444';

                  return (
                    <div key={fee.student_fee_id ?? idx}
                      className={`fee-row grid grid-cols-12 gap-3 px-6 py-5 items-center transition-colors ${isDisc ? 'opacity-50' : ''}`}>

                      {/* Fee Head */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: isDisc ? '#F3F4F6' : '#FFF3E0' }}>
                          <BookOpen className={`w-4 h-4 ${isDisc ? 'text-gray-400' : 'text-orange-500'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm leading-tight ${isDisc ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {fee.fee_head_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {fee.fee_frequency && (
                              <span className="text-xs text-gray-400 capitalize">{fee.fee_frequency.replace(/_/g, ' ')}</span>
                            )}
                            {fee.assigned_on && (
                              <span className="text-xs text-gray-300">· {fmtDate(fee.assigned_on)}</span>
                            )}
                          </div>
                          {/* Progress bar */}
                          {!isDisc && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="w-20 bg-gray-100 rounded-full h-1.5">
                                <div className="progress-bar h-1.5 rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                              </div>
                              <span className="text-xs font-semibold" style={{ color: barColor }}>{pct}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ✅ Base Fee (original assigned amount) */}
                      <div className="col-span-2">
                        <p className="text-sm font-bold text-gray-900">{fmt(base)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Assigned</p>
                      </div>

                      {/* Paid */}
                      <div className="col-span-2">
                        <p className="text-sm font-bold" style={{ color: '#15803D' }}>{fmt(fee.paid_amount)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Collected</p>
                      </div>

                      {/* Fine */}
                      <div className="col-span-1">
                        {hasFine ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-100">
                            +{fmt(fee.fine_amount)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <StatusBadge status={fee.status} discontinuedOn={fee.discontinued_on} />
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {!isDisc && !isPaid && (
                          <button onClick={() => handlePay(fee)}
                            className="px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                            style={{ background: '#EA580C' }}>
                            Pay Now
                          </button>
                        )}
                        {!isDisc && !isPaid && (
                          <button onClick={() => openDiscontinue(fee)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 active:scale-95 transition-all border border-red-200 text-red-500">
                            Stop
                          </button>
                        )}
                        {isPaid && !isDisc && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                            <CheckCircle className="w-3.5 h-3.5" /> Cleared
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══ PAYMENT HISTORY ══ */}
        {activeTab === 'history' && (
          <>
            {paymentHistory.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold">No payment history</p>
                <p className="text-gray-400 text-sm mt-1">No transactions recorded for {academicYear}</p>
              </div>
            ) : (
              <>
                {/* History table header */}
                <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50">
                  {[
                    { h: 'Fee Head', s: 'col-span-4' },
                    { h: 'Type',     s: 'col-span-2' },
                    { h: 'Date',     s: 'col-span-2' },
                    { h: 'Mode',     s: 'col-span-2' },
                    { h: 'Amount',   s: 'col-span-2 text-right' },
                  ].map(({ h, s }) => (
                    <div key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${s}`}>{h}</div>
                  ))}
                </div>

                <div className="divide-y divide-gray-100">
                  {paymentHistory.map((ph, i) => {
                    const isTransport = !!ph.route_name;
                    const ModeIcon    = PAYMENT_MODE_ICONS[ph.payment_mode?.toLowerCase()] || CreditCard;
                    const rowTotal    = parseFloat(ph.amount || 0) + parseFloat(ph.fine_amount || 0);
                    const hasFine     = parseFloat(ph.fine_amount) > 0;

                    return (
                      <div key={ph.payment_id ?? i}
                        className="fee-row grid grid-cols-12 gap-3 px-6 py-4 items-center transition-colors">

                        {/* Fee Head */}
                        <div className="col-span-4 flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: isTransport ? '#EFF6FF' : '#FFF3E0' }}>
                            {isTransport
                              ? <Bus className="w-4 h-4 text-blue-500" />
                              : <BookOpen className="w-4 h-4 text-orange-500" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 leading-tight">{ph.fee_head_name || '—'}</p>
                            {isTransport && (
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {ph.route_name && (
                                  <span className="flex items-center gap-0.5 text-xs text-blue-500">
                                    <Navigation className="w-2.5 h-2.5" />{ph.route_name}
                                  </span>
                                )}
                                {ph.stop_name && (
                                  <span className="flex items-center gap-0.5 text-xs text-green-600">
                                    <MapPin className="w-2.5 h-2.5" />{ph.stop_name}
                                  </span>
                                )}
                              </div>
                            )}
                            {ph.transaction_ref && (
                              <p className="text-xs text-gray-400 mt-0.5 font-mono">TXN: {ph.transaction_ref}</p>
                            )}
                          </div>
                        </div>

                        {/* Type */}
                        <div className="col-span-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold"
                            style={isTransport
                              ? { background: '#EFF6FF', color: '#1D4ED8' }
                              : { background: '#FFF3E0', color: '#EA580C' }}>
                            {isTransport ? 'Transport' : 'Fee'}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="col-span-2">
                          <p className="text-sm text-gray-800 font-semibold">{fmtDate(ph.paid_on)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {ph.paid_on
                              ? new Date(ph.paid_on).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </p>
                        </div>

                        {/* Mode */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5">
                            <ModeIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700 font-medium capitalize">
                              {ph.payment_mode?.replace(/_/g, ' ') || '—'}
                            </span>
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={ph.status === 'success'
                              ? { background: '#DCFCE7', color: '#15803D' }
                              : { background: '#FEF9C3', color: '#A16207' }}>
                            {(ph.status || '').toUpperCase()}
                          </span>
                        </div>

                        {/* ✅ Amount = fee + fine total */}
                        <div className="col-span-2 text-right">
                          <p className="font-extrabold text-green-600 text-base">{fmt(rowTotal)}</p>
                          {hasFine && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {fmt(ph.amount)} + <span className="text-red-400">{fmt(ph.fine_amount)} fine</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ✅ Footer total = fee + fine */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">{paymentHistory.length} transaction(s)</span>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Total Collected</p>
                    <p className="text-xl font-extrabold" style={{ color: '#15803D' }}>{fmt(totalHistoryAmt)}</p>
                    {cy.fine > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">Incl. {fmt(cy.fine)} fine</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Previous Year Dues ── */}
      {(summary.previous_pending > 0 || summary.previous_fine > 0) && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-amber-800 text-sm">Previous Year Dues</p>
            <p className="text-xs text-amber-600 mt-0.5">Outstanding from earlier academic sessions</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-amber-800 text-lg">{fmt(summary.previous_pending)}</p>
            {summary.previous_fine > 0 && <p className="text-xs text-red-500">+{fmt(summary.previous_fine)} fine</p>}
          </div>
        </div>
      )}

      {/* ══ DISCONTINUE MODAL ══ */}
      {modal && activeFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FFF3E0' }}>
                  <Ban className="w-4 h-4" style={{ color: '#EA580C' }} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Discontinue Fee Service</h3>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {discError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{discError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fee Head</label>
                  <input type="text" readOnly value={activeFee.fee_head_name}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm font-semibold cursor-default" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Balance</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <span className="text-xs font-semibold" style={{ color: '#15803D' }}>Paid {fmt(activeFee.paid_amount)}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs font-semibold" style={{ color: '#DC2626' }}>Due {fmt(activeFee.pending_amount)}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={discDate} onChange={e => setDiscDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reason <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={discReason} onChange={e => setDiscReason(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm bg-white appearance-none">
                      <option value="">Select reason...</option>
                      {DISCONTINUE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Notes <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
                <textarea rows={3} placeholder="Provide detailed explanation for records..."
                  value={discNotes} onChange={e => setDiscNotes(e.target.value)} maxLength={300}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm resize-none bg-white placeholder-gray-400" />
              </div>
            </div>
            <div className="px-6 pb-5 flex items-center justify-end gap-3">
              <button onClick={closeModal} disabled={discLoading}
                className="px-5 py-2.5 rounded-lg border border-gray-200 font-semibold text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleDiscontinue} disabled={discLoading}
                className="px-5 py-2.5 rounded-lg text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: discLoading ? '#9CA3AF' : '#EA580C' }}>
                {discLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : 'Confirm Discontinuation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeProfile;