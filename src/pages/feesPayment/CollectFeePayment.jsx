import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Loader2, AlertTriangle,
  IndianRupee, Calendar, FileText, X,
  Banknote, Smartphone, BookCheck, Landmark, ChevronDown,
  ChevronUp, BookOpen, Bus, MapPin, Navigation
} from 'lucide-react';
import feePaymentService from '../../services/feeallService/feePaymentService';

/* ─── helpers ─── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (d) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const statusStyle = (s) => {
  switch (s?.toLowerCase()) {
    case 'paid':    return { bg: '#DCFCE7', color: '#15803D', label: 'PAID' };
    case 'overdue': return { bg: '#FEE2E2', color: '#B91C1C', label: 'OVERDUE' };
    case 'pending': return { bg: '#FEF9C3', color: '#A16207', label: 'PENDING' };
    default:        return { bg: '#F1F5F9', color: '#475569', label: (s || '—').toUpperCase() };
  }
};

const PAYMENT_MODES = [
  { value: 'cash',          label: 'Cash',         Icon: Banknote   },
  { value: 'online',        label: 'Online',        Icon: Smartphone },
  { value: 'cheque',        label: 'Cheque',        Icon: BookCheck  },
  { value: 'dd',            label: 'DD',            Icon: FileText   },
  { value: 'bank_transfer', label: 'Bank Transfer', Icon: Landmark   },
];

/* ══════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════ */
const CollectFeePayment = () => {
  const navigate   = useNavigate();
  const { studentId } = useParams();

  /* ── data ── */
  const [loading,            setLoading]            = useState(true);
  const [apiData,            setApiData]            = useState(null);
  const [studentInfo,        setStudentInfo]        = useState(null);
  const [feeBreakdown,       setFeeBreakdown]       = useState([]);
  const [transportBreakdown, setTransportBreakdown] = useState([]);
  const [summary,            setSummary]            = useState({});
  const [error,              setError]              = useState('');

  /* ── expand state (default open) ── */
  const [expandedFee,       setExpandedFee]       = useState({});
  const [expandedTransport, setExpandedTransport] = useState({});

  /* ── unified selection map
     key = "fee_<id>" | "transport_<id>"
     value = { id, type, amount, fineAmount, installmentNo, feeHeadName, ... }
  ── */
  const [selected, setSelected] = useState({});

  /* ── payment form ── */
  const [paymentMode, setPaymentMode] = useState('cash');
  const [txRef,       setTxRef]       = useState('');
  const [remarks,     setRemarks]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState('');

  /* ─────────────────── fetch ─────────────────── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res = await feePaymentService.getStudentFees(studentId);
      if (res?.success && res?.data) {
        setApiData(res.data);
        setStudentInfo(res.data.student_info || null);
        setFeeBreakdown(res.data.fee_breakdown || []);
        setTransportBreakdown(res.data.transport_fee_breakdown || []);
        setSummary(res.data.summary || {});
      } else {
        setError(res?.error || 'Failed to load fee data');
      }
    } catch (e) { setError(e.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─────────────────── selection helpers ─────────────────── */
  const toggleFee = (feeHead, inst) => {
    const status = (inst.calculated_status || inst.status || '').toLowerCase();
    if (status === 'paid') return;
    const key = `fee_${inst.id}`;
    setSelected(prev => {
      const next = { ...prev };
      if (next[key]) { delete next[key]; }
      else {
        next[key] = {
          id:            inst.id,
          type:          'fee',
          amount:        parseFloat(inst.amount || 0),
          fineAmount:    parseFloat(inst.fine_amount || 0),
          installmentNo: inst.installment_no,
          feeHeadName:   feeHead.fee_head_name,
          instObj:       inst,
        };
      }
      return next;
    });
  };

  const toggleTransport = (tf, inst) => {
    const status = (inst.calculated_status || inst.status || '').toLowerCase();
    if (status === 'paid') return;
    const key = `transport_${inst.student_transport_installment_id}`;
    setSelected(prev => {
      const next = { ...prev };
      if (next[key]) { delete next[key]; }
      else {
        next[key] = {
          id:            inst.student_transport_installment_id,
          type:          'transport',
          amount:        parseFloat(inst.amount || 0),
          fineAmount:    parseFloat(inst.fine_amount || 0),
          installmentNo: inst.installment_no,
          feeHeadName:   tf.fee_head_name,
          routeName:     tf.route_name,
          stopName:      tf.stop_name,
          instObj:       inst,
        };
      }
      return next;
    });
  };

  const removeItem = (key) => setSelected(p => { const n = { ...p }; delete n[key]; return n; });
  const isSelected = (key) => !!selected[key];

  /* ─────────────────── derived totals ─────────────────── */
  const selectedList      = Object.entries(selected); // [key, val]
  const feeItems          = selectedList.filter(([, v]) => v.type === 'fee').map(([k, v]) => ({ key: k, ...v }));
  const transportItems    = selectedList.filter(([, v]) => v.type === 'transport').map(([k, v]) => ({ key: k, ...v }));
  const selectedCount     = selectedList.length;
  const totalAmount       = selectedList.reduce((s, [, v]) => s + v.amount, 0);
  const totalFine         = selectedList.reduce((s, [, v]) => s + v.fineAmount, 0);
  const grandTotal        = totalAmount + totalFine;
  const feeSubtotal       = feeItems.reduce((s, v) => s + v.amount, 0);
  const transportSubtotal = transportItems.reduce((s, v) => s + v.amount, 0);

  /* ─────────────────── summary numbers from breakdown ─────────────────── */
  const feeSummary = feeBreakdown.reduce(
    (acc, f) => ({
      total:   acc.total   + parseFloat(f.total_amount   || 0),
      paid:    acc.paid    + parseFloat(f.paid_amount    || 0),
      pending: acc.pending + parseFloat(f.pending_amount || 0),
    }),
    { total: 0, paid: 0, pending: 0 }
  );
  const tSummary = transportBreakdown.reduce(
    (acc, t) => ({
      total:   acc.total   + parseFloat(t.total_amount   || 0),
      paid:    acc.paid    + parseFloat(t.paid_amount    || 0),
      pending: acc.pending + parseFloat(t.pending_amount || 0),
    }),
    { total: 0, paid: 0, pending: 0 }
  );
  const cy          = summary.current_year || {};
  const grandPending = (cy.pending || 0) + (cy.fine || 0);

  /* ─────────────────── submit: two calls if both types selected ─────────────────── */
  const handleSubmit = async () => {
    setFormError('');
    if (selectedCount === 0) { setFormError('Please select at least one installment'); return; }
    if (paymentMode !== 'cash' && !txRef.trim()) { setFormError('Transaction reference is required'); return; }

    try {
      setSubmitting(true);

      const feeIds       = feeItems.map(v => v.id);
      const transportIds = transportItems.map(v => v.id);

      let lastRes = null;

      /* ── Call 1: Academic fee installments ── */
      if (feeIds.length > 0) {
        lastRes = await feePaymentService.collectFeePayment({
          student_id:                parseInt(studentId),
          installment_ids:           feeIds,
          transport_installment_ids: [],
          payment_mode:              paymentMode,
          transaction_ref:           txRef || null,
          payment_gateway:           'offline',
          remarks,
        });
        if (!lastRes?.success) throw new Error(lastRes?.message || 'Fee payment failed');
      }

      /* ── Call 2: Transport installments ── */
      if (transportIds.length > 0) {
        lastRes = await feePaymentService.collectFeePayment({
          student_id:                parseInt(studentId),
          installment_ids:           [],
          transport_installment_ids: transportIds,
          payment_mode:              paymentMode,
          transaction_ref:           txRef || null,
          payment_gateway:           'offline',
          remarks,
        });
        if (!lastRes?.success) throw new Error(lastRes?.message || 'Transport payment failed');
      }

      const receipt_id = lastRes?.data?.receipt_id || lastRes?.receipt_id || `RCP-${Date.now()}`;

      /* ── Build receipt payload ── */
      const receiptPayload = {
        receipt_id,
        date:          new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        time:          new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        student:       studentInfo,
        /* unified line items for new receipt */
        line_items: [
          ...feeItems.map(s => ({
            type:           'fee',
            fee_head_name:  s.feeHeadName,
            installment_no: s.installmentNo,
            amount:         s.amount,
            fine_amount:    s.fineAmount,
            label:          `Fee Installment #${s.installmentNo}`,
          })),
          ...transportItems.map(s => ({
            type:           'transport',
            fee_head_name:  s.feeHeadName,
            installment_no: s.installmentNo,
            amount:         s.amount,
            fine_amount:    s.fineAmount,
            route_name:     s.routeName,
            stop_name:      s.stopName,
            label:          `Transport Fee #${s.installmentNo}`,
          })),
        ],
        /* legacy compat */
        fee_head:     feeItems[0]?.feeHeadName || transportItems[0]?.feeHeadName,
        installments: feeItems.map(s => s.instObj),
        transport_installments: transportItems.map(s => s.instObj),
        amount:        totalAmount,
        fine:          totalFine,
        grand:         grandTotal,
        payment_mode:  paymentMode,
        transaction_ref: txRef,
        remarks,
        academic_year: apiData?.current_academic_year,
      };

      setSelected({});
      fetchData();
      navigate(`/admin/fees-payment/receipt/${receipt_id}`, { state: { receiptData: receiptPayload } });

    } catch (e) {
      setFormError(e.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────────── loading / error screens ─────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
          </div>
          <p className="text-gray-700 font-semibold">Loading Fee Data...</p>
        </div>
      </div>
    );
  }

  if (error && !studentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md border border-gray-200 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold mb-4">{error}</p>
          <button onClick={() => navigate('/admin/fees-payment/collect')}
            className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm"
            style={{ background: '#EA580C' }}>Back to Students</button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════ RENDER ═══════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        input:focus, select:focus, textarea:focus {
          outline: none; border-color: #EA580C !important;
          box-shadow: 0 0 0 3px rgba(234,88,12,0.12);
        }
      `}</style>

      {/* ── Back + Page Header ── */}
      <div className="mb-6">
        <button onClick={() => navigate('/admin/fees-payment/collect')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Students
        </button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{studentInfo?.name || 'Student'}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {studentInfo?.admission_no} · Class {studentInfo?.class_name} – {studentInfo?.section_name}
              {apiData?.current_academic_year ? ` · AY ${apiData.current_academic_year}` : ''}
            </p>
          </div>
          {grandPending > 0 ? (
            <div className="px-4 py-3 rounded-xl text-right" style={{ background: '#FEE2E2' }}>
              <p className="text-xs font-semibold text-red-600 mb-0.5">Total Pending</p>
              <p className="font-bold text-red-700 text-xl">{fmt(grandPending)}</p>
            </div>
          ) : (
            <div className="px-4 py-3 rounded-xl text-right" style={{ background: '#DCFCE7' }}>
              <p className="text-xs font-semibold text-green-700 mb-0.5">Status</p>
              <p className="font-bold text-green-700 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> All Paid
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary: Fee + Transport side-by-side ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Academic Fee Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Academic Fees</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: 'Total',   v: feeSummary.total,   c: '#1D4ED8', bg: '#EFF6FF' },
              { l: 'Paid',    v: feeSummary.paid,    c: '#15803D', bg: '#F0FDF4' },
              { l: 'Pending', v: feeSummary.pending, c: '#D97706', bg: '#FFFBEB' },
            ].map(({ l, v, c, bg }) => (
              <div key={l} className="rounded-lg p-3 text-center" style={{ background: bg }}>
                <p className="text-xs font-semibold mb-1" style={{ color: c }}>{l}</p>
                <p className="font-bold text-sm" style={{ color: c }}>{fmt(v)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transport Fee Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Bus className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Transport Fees</h3>
          </div>
          {transportBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">No transport fee assigned</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: 'Total',   v: tSummary.total,   c: '#1D4ED8', bg: '#EFF6FF' },
                { l: 'Paid',    v: tSummary.paid,    c: '#15803D', bg: '#F0FDF4' },
                { l: 'Pending', v: tSummary.pending, c: '#D97706', bg: '#FFFBEB' },
              ].map(({ l, v, c, bg }) => (
                <div key={l} className="rounded-lg p-3 text-center" style={{ background: bg }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: c }}>{l}</p>
                  <p className="font-bold text-sm" style={{ color: c }}>{fmt(v)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Previous year dues */}
      {(summary.previous_pending > 0 || summary.previous_fine > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-amber-800">Previous Year Dues</p>
            <p className="text-xs text-amber-600 mt-0.5">Outstanding from earlier sessions</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-amber-800">{fmt(summary.previous_pending)}</p>
            {summary.previous_fine > 0 && <p className="text-xs text-red-600">+{fmt(summary.previous_fine)} fine</p>}
          </div>
        </div>
      )}

      {/* ── Main Layout: Installment List (left) + Payment Panel (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ─────────── LEFT: All Installments ─────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* ── Section Title ── */}
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-base">All Installments</h2>
            <span className="text-xs text-gray-400">Select to pay</span>
          </div>

          {/* ── ACADEMIC FEE BLOCKS ── */}
          {feeBreakdown.map((fh, fIdx) => {
            const fhPending = parseFloat(fh.pending_amount || 0);
            const fhTotal   = parseFloat(fh.total_amount   || 0);
            const isAllPaid = fhPending === 0 && fhTotal > 0;
            const isExp     = expandedFee[fIdx] !== false;

            return (
              <div key={fh.student_fee_id ?? fIdx}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Head */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors select-none"
                  onClick={() => setExpandedFee(p => ({ ...p, [fIdx]: !isExp }))}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{fh.fee_head_name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {fh.fee_frequency && <span className="text-xs text-gray-400 capitalize">{fh.fee_frequency}</span>}
                        <span className="text-xs text-gray-500">
                          Paid: <span className="font-semibold text-green-600">{fmt(fh.paid_amount)}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Pending: <span className="font-semibold text-orange-600">{fmt(fhPending)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {isAllPaid
                      ? <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: '#DCFCE7', color: '#15803D' }}>✓ PAID</span>
                      : <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: '#FEF9C3', color: '#A16207' }}>PARTIAL</span>}
                    {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Installments list */}
                {isExp && (
                  <div className="border-t border-gray-100">
                    {/* Column headers */}
                    <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100">
                      <div className="col-span-1" />
                      <div className="col-span-1 text-xs font-bold text-gray-400">#</div>
                      <div className="col-span-4 text-xs font-bold text-gray-400 uppercase">Fee Installment</div>
                      <div className="col-span-3 text-xs font-bold text-gray-400 uppercase">Due Date</div>
                      <div className="col-span-2 text-xs font-bold text-gray-400 uppercase text-right">Amount</div>
                      <div className="col-span-1 text-xs font-bold text-gray-400 uppercase text-center">Status</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {fh.installments?.map((inst) => {
                        const key    = `fee_${inst.id}`;
                        const status = (inst.calculated_status || inst.status || '').toLowerCase();
                        const isPaid = status === 'paid';
                        const isSel  = isSelected(key);
                        const { bg, color, label } = statusStyle(status);

                        return (
                          <div key={inst.id}
                            onClick={() => toggleFee(fh, inst)}
                            className={`grid grid-cols-12 gap-2 px-5 py-3 items-center transition-colors
                              ${isPaid ? 'opacity-50 cursor-not-allowed bg-gray-50/50' : 'cursor-pointer'}
                              ${isSel && !isPaid ? 'bg-orange-50/70' : !isPaid ? 'hover:bg-gray-50/70' : ''}`}
                          >
                            <div className="col-span-1">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                                ${isSel ? 'bg-orange-500 border-orange-500' : isPaid ? 'border-gray-200 bg-gray-100' : 'border-gray-300 hover:border-orange-400'}`}>
                                {isSel && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                            <div className="col-span-1 text-xs font-bold text-gray-400">#{inst.installment_no}</div>
                            <div className="col-span-4">
                              <p className="text-sm font-medium text-gray-800">Fee Installment</p>
                              {inst.paid_on && <p className="text-xs text-green-600 mt-0.5">Paid {fmtDate(inst.paid_on)}</p>}
                            </div>
                            <div className="col-span-3 flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3 flex-shrink-0 text-gray-400" />
                              {fmtDate(inst.end_due_date || inst.start_due_date)}
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="text-sm font-bold text-gray-900">{fmt(inst.amount)}</p>
                              {parseFloat(inst.fine_amount) > 0 && (
                                <p className="text-xs text-red-500">+{fmt(inst.fine_amount)} fine</p>
                              )}
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: bg, color }}>{label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── TRANSPORT FEE BLOCKS ── */}
          {transportBreakdown.map((tf, tIdx) => {
            const tfPending = parseFloat(tf.pending_amount || 0);
            const tfTotal   = parseFloat(tf.total_amount   || 0);
            const isAllPaid = tfPending === 0 && tfTotal > 0;
            const isExp     = expandedTransport[tIdx] !== false;

            return (
              <div key={tf.student_transport_fee_id ?? tIdx}
                className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">

                {/* Head */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-blue-50/20 transition-colors select-none"
                  onClick={() => setExpandedTransport(p => ({ ...p, [tIdx]: !isExp }))}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Bus className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{tf.fee_head_name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {tf.route_name && (
                          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Navigation className="w-2.5 h-2.5" />{tf.route_name}
                          </span>
                        )}
                        {tf.stop_name && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <MapPin className="w-2.5 h-2.5" />{tf.stop_name}
                          </span>
                        )}
                        {tf.distance_km && <span className="text-xs text-gray-400">{tf.distance_km} km</span>}
                        <span className="text-xs text-gray-500">
                          Pending: <span className="font-semibold text-blue-600">{fmt(tfPending)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {isAllPaid
                      ? <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: '#DCFCE7', color: '#15803D' }}>✓ PAID</span>
                      : <span className="px-2.5 py-1 rounded text-xs font-bold" style={{ background: '#FEF9C3', color: '#A16207' }}>PARTIAL</span>}
                    {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Transport installments */}
                {isExp && (
                  <div className="border-t border-blue-100">
                    {/* Column headers */}
                    <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-blue-50/30 border-b border-blue-50">
                      <div className="col-span-1" />
                      <div className="col-span-1 text-xs font-bold text-gray-400">#</div>
                      <div className="col-span-4 text-xs font-bold text-gray-400 uppercase">Transport Fee</div>
                      <div className="col-span-3 text-xs font-bold text-gray-400 uppercase">Due Date</div>
                      <div className="col-span-2 text-xs font-bold text-gray-400 uppercase text-right">Amount</div>
                      <div className="col-span-1 text-xs font-bold text-gray-400 uppercase text-center">Status</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {tf.installments?.map((inst) => {
                        const key    = `transport_${inst.student_transport_installment_id}`;
                        const status = (inst.calculated_status || inst.status || '').toLowerCase();
                        const isPaid = status === 'paid';
                        const isSel  = isSelected(key);
                        const { bg, color, label } = statusStyle(status);

                        return (
                          <div key={inst.student_transport_installment_id}
                            onClick={() => toggleTransport(tf, inst)}
                            className={`grid grid-cols-12 gap-2 px-5 py-3 items-center transition-colors
                              ${isPaid ? 'opacity-50 cursor-not-allowed bg-gray-50/50' : 'cursor-pointer'}
                              ${isSel && !isPaid ? 'bg-blue-50/60' : !isPaid ? 'hover:bg-gray-50/70' : ''}`}
                          >
                            <div className="col-span-1">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                                ${isSel ? 'bg-blue-600 border-blue-600' : isPaid ? 'border-gray-200 bg-gray-100' : 'border-gray-300 hover:border-blue-400'}`}>
                                {isSel && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                            <div className="col-span-1 text-xs font-bold text-gray-400">#{inst.installment_no}</div>
                            <div className="col-span-4">
                              <p className="text-sm font-medium text-gray-800">Transport Fee</p>
                              {inst.paid_on && <p className="text-xs text-green-600 mt-0.5">Paid {fmtDate(inst.paid_on)}</p>}
                            </div>
                            <div className="col-span-3 flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3 flex-shrink-0 text-gray-400" />
                              {fmtDate(inst.due_date || inst.end_due_date || inst.start_due_date)}
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="text-sm font-bold text-gray-900">{fmt(inst.amount)}</p>
                              {parseFloat(inst.fine_amount) > 0 && (
                                <p className="text-xs text-red-500">+{fmt(inst.fine_amount)} fine</p>
                              )}
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: bg, color }}>{label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty */}
          {feeBreakdown.length === 0 && transportBreakdown.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No fee structure found</p>
            </div>
          )}

          {/* ── Payment History ── */}
          {apiData?.payment_history?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Payment History</h3>
              </div>
              <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100">
                <div className="col-span-4 text-xs font-bold text-gray-400 uppercase">Fee Head</div>
                <div className="col-span-2 text-xs font-bold text-gray-400 uppercase">Type</div>
                <div className="col-span-3 text-xs font-bold text-gray-400 uppercase">Date</div>
                <div className="col-span-2 text-xs font-bold text-gray-400 uppercase text-right">Amount</div>
                <div className="col-span-1 text-xs font-bold text-gray-400 uppercase text-center">Mode</div>
              </div>
              <div className="divide-y divide-gray-50">
                {apiData.payment_history.map((ph, i) => {
                  const isTransport = !!ph.route_name || !!ph.stop_name;
                  return (
                    <div key={i} className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-gray-50/50">
                      <div className="col-span-4 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ph.fee_head_name || 'Payment'}</p>
                        {isTransport && ph.stop_name && (
                          <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />{ph.stop_name}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        {isTransport ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                            <Bus className="w-3 h-3" />Transport
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full w-fit">
                            <BookOpen className="w-3 h-3" />Fee
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 text-xs text-gray-500">{fmtDate(ph.paid_on || ph.payment_date)}</div>
                      <div className="col-span-2 text-right font-bold text-green-600 text-sm">{fmt(ph.amount)}</div>
                      <div className="col-span-1 text-center text-xs text-gray-500 capitalize">{ph.payment_mode}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─────────── RIGHT: Sticky Payment Panel ─────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">

            {/* Selection Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">Payment Summary</h3>
                {selectedCount > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: '#EA580C' }}>
                    {selectedCount} selected
                  </span>
                )}
              </div>

              {selectedCount === 0 ? (
                <div className="px-5 py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <IndianRupee className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No installments selected</p>
                  <p className="text-gray-400 text-xs mt-1">Click rows on the left to select</p>
                </div>
              ) : (
                <div className="px-5 py-4">

                  {/* Fee items */}
                  {feeItems.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Fee Installments
                      </p>
                      <div className="space-y-1.5">
                        {feeItems.map(s => (
                          <div key={s.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeItem(s.key)}
                                className="w-4 h-4 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                <X className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs text-gray-700">Inst. #{s.installmentNo}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900">{fmt(s.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-1 border-t border-orange-100">
                          <span className="text-xs text-orange-600 font-semibold">Fee Subtotal</span>
                          <span className="text-xs font-bold text-orange-600">{fmt(feeSubtotal)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transport items */}
                  {transportItems.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Bus className="w-3 h-3" /> Transport Fee
                      </p>
                      <div className="space-y-1.5">
                        {transportItems.map(s => (
                          <div key={s.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeItem(s.key)}
                                className="w-4 h-4 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                <X className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs text-gray-700">Transport #{s.installmentNo}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900">{fmt(s.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-1 border-t border-blue-100">
                          <span className="text-xs text-blue-600 font-semibold">Transport Subtotal</span>
                          <span className="text-xs font-bold text-blue-600">{fmt(transportSubtotal)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="rounded-xl p-4 mt-2" style={{ background: '#FFF7ED', border: '2px solid #FED7AA' }}>
                    {totalFine > 0 && (
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-red-600">Fine</span>
                        <span className="font-semibold text-red-600">{fmt(totalFine)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm">Grand Total</span>
                      <span className="font-bold text-2xl" style={{ color: '#EA580C' }}>{fmt(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Payment Details</h3>

              {formError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-xs font-medium">{formError}</p>
                </div>
              )}

              {/* Payment Mode */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Mode</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {PAYMENT_MODES.map(({ value, label, Icon }) => (
                    <button key={value} type="button"
                      onClick={() => { setPaymentMode(value); if (value === 'cash') setTxRef(''); }}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all
                        ${paymentMode === value ? 'text-white' : 'border-gray-200 text-gray-600 hover:border-orange-300 bg-white'}`}
                      style={paymentMode === value ? { background: '#EA580C', borderColor: '#EA580C' } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMode !== 'cash' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Reference No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reference number"
                    value={txRef}
                    onChange={e => setTxRef(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm font-medium bg-white placeholder-gray-400 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Remarks <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Add notes..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm resize-none bg-white placeholder-gray-400 transition-all"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || selectedCount === 0}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                style={{ background: submitting || selectedCount === 0 ? '#9CA3AF' : '#EA580C' }}
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                  : <><CheckCircle className="w-4 h-4" />Submit Payment{selectedCount > 0 ? ` · ${fmt(grandTotal)}` : ''}</>}
              </button>

              {selectedCount > 0 && (
                <button onClick={() => setSelected({})}
                  className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                  Clear Selection
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectFeePayment;