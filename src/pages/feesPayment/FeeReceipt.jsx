import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Printer, Download, Home, CheckCircle,
  CreditCard, Banknote, Smartphone, BookCheck,
  FileText, Landmark, Loader2, Bus, BookOpen
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import feePaymentService from '../../services/feeallService/feePaymentService';

/* ─── helpers ─── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2,
  }).format(Number(n) || 0);

const fmtDate = (d) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return String(d); }
};

const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 0) return 'Zero';
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };
  return convert(Math.floor(num)) + ' Rupees Only';
};

const PAYMENT_MODE_ICONS = {
  cash: Banknote, online: Smartphone, cheque: BookCheck,
  dd: FileText, bank_transfer: Landmark,
};

const GradCap = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════ */
const FeeReceipt = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { receiptId } = useParams();

  const [receiptData,    setReceiptData]    = useState(null);
  const [visible,        setVisible]        = useState(false);
  const [pdfLoading,     setPdfLoading]     = useState(false);
  const [schoolProfile,  setSchoolProfile]  = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const receiptRef = useRef(null);

  /* ── Load receipt data ── */
  useEffect(() => {
    let data = location.state?.receiptData ?? null;
    if (!data) {
      try { const s = sessionStorage.getItem('feeReceiptData'); if (s) data = JSON.parse(s); } catch {}
    }
    if (data) {
      setReceiptData(data);
      try { sessionStorage.setItem('feeReceiptData', JSON.stringify(data)); } catch {}
      setTimeout(() => setVisible(true), 80);
    } else {
      navigate('/admin/fees-payment/collect', { replace: true });
    }
  }, []);

  /* ── Load school profile ── */
  useEffect(() => {
    const load = async () => {
      try {
        setProfileLoading(true);
        const res = await feePaymentService.getSchoolProfile();
        if (res?.success && res?.profile) {
          setSchoolProfile(res.profile);
          try { sessionStorage.setItem('schoolProfile', JSON.stringify(res.profile)); } catch {}
        } else {
          try { const c = sessionStorage.getItem('schoolProfile'); if (c) setSchoolProfile(JSON.parse(c)); } catch {}
        }
      } catch {
        try { const c = sessionStorage.getItem('schoolProfile'); if (c) setSchoolProfile(JSON.parse(c)); } catch {}
      } finally { setProfileLoading(false); }
    };
    load();
  }, []);

  const handleDone = () => {
    sessionStorage.removeItem('feeReceiptData');
    navigate('/admin/fees-payment/collect');
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || pdfLoading) return;
    try {
      setPdfLoading(true);
      const el = receiptRef.current;
      const origStyle = el.getAttribute('style') || '';
      el.style.borderRadius = '0';
      el.style.boxShadow    = 'none';

      const canvas = await html2canvas(el, {
        scale: 3, useCORS: true, allowTaint: false,
        backgroundColor: '#ffffff', logging: false,
      });
      el.setAttribute('style', origStyle);

      const imgData  = canvas.toDataURL('image/png');
      const pdf      = new jsPDF('p', 'mm', 'a4');
      const pageW    = 210; const pageH = 297;
      const imgW     = pageW;
      const imgH     = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH; let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
        heightLeft -= pageH;
      }

      const studentSlug = (receiptData?.student?.name || 'Student')
        .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      pdf.save(`Fee_Receipt_${receiptData?.receipt_id || 'receipt'}_${studentSlug}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try Print instead.');
    } finally { setPdfLoading(false); }
  };

  if (!receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  const {
    receipt_id, date, time,
    student, academic_year,
    payment_mode = 'cash', transaction_ref, remarks,
    /* ✅ new unified format */
    line_items = [],
    /* legacy fallback */
    fee_head, installments = [], transport_installments = [],
    amount = 0, fine = 0, grand = 0,
  } = receiptData;

  /* ── Build line items: prefer new `line_items`, fall back to legacy ── */
  const allLineItems = line_items.length > 0
    ? line_items
    : [
        ...installments.map((inst, i) => ({
          type:           'fee',
          fee_head_name:  fee_head || 'Fee',
          installment_no: inst.installment_no || (i + 1),
          amount:         parseFloat(inst.amount || 0),
          fine_amount:    parseFloat(inst.fine_amount || 0),
          label:          `Fee Installment #${inst.installment_no || (i + 1)}`,
        })),
        ...(transport_installments || []).map((inst, i) => ({
          type:           'transport',
          fee_head_name:  fee_head || 'Transport Fee',
          installment_no: inst.installment_no || (i + 1),
          amount:         parseFloat(inst.amount || 0),
          fine_amount:    parseFloat(inst.fine_amount || 0),
          label:          `Transport Fee #${inst.installment_no || (i + 1)}`,
        })),
      ];

  const feeLines       = allLineItems.filter(l => l.type === 'fee');
  const transportLines = allLineItems.filter(l => l.type === 'transport');

  const subtotal    = allLineItems.reduce((s, l) => s + parseFloat(l.amount || 0), 0);
  const lateCharge  = allLineItems.reduce((s, l) => s + parseFloat(l.fine_amount || 0), 0) || Number(fine) || 0;
  const totalPaid   = Number(grand) || (subtotal + lateCharge);

  const hasFee       = feeLines.length > 0;
  const hasTransport = transportLines.length > 0;

  /* ── School info ── */
  const schoolName    = schoolProfile?.school_name || 'School';
  const schoolAddress = [schoolProfile?.address, schoolProfile?.city, schoolProfile?.state, schoolProfile?.pincode]
    .filter(Boolean).join(', ') || 'School Address';
  const schoolPhone   = schoolProfile?.phone   || '';
  const schoolEmail   = schoolProfile?.email   || '';
  const schoolWebsite = schoolProfile?.website || '';
  const schoolLogo    = schoolProfile?.logo_url || null;

  const contactParts = [];
  if (schoolPhone)   contactParts.push(`📞 ${schoolPhone}`);
  if (schoolEmail)   contactParts.push(`✉ ${schoolEmail}`);
  if (schoolWebsite) contactParts.push(schoolWebsite);
  const contactLine = contactParts.join('  |  ');

  const PayModeIcon = PAYMENT_MODE_ICONS[payment_mode?.toLowerCase()] || CreditCard;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        @media print {
          body, html { background: white !important; margin: 0; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #eee !important; }
        }
        @page { size: A4; margin: 15mm 20mm; }
      `}</style>

      <div className="max-w-2xl mx-auto">

        {/* ── Success Banner ── */}
        <div className={`no-print text-center mb-8 fade-up transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#15803D,#16A34A)' }}>
            <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500">The fee payment has been processed and recorded.</p>
          {hasFee && hasTransport && (
            <p className="text-xs text-gray-400 mt-2">Academic fees and transport fees processed as separate transactions.</p>
          )}
        </div>

        {/* ── Receipt Card ── */}
        <div
          ref={receiptRef}
          className={`print-card bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 transition-all duration-500 fade-up ${visible ? 'opacity-100' : 'opacity-0'}`}
        >

          {/* Header: School Logo + Name */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: '#FFF3E0' }}>
                {schoolLogo ? (
                  <img src={schoolLogo} alt="School Logo"
                    className="w-full h-full object-contain"
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : <GradCap />}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg leading-tight">
                  {profileLoading
                    ? <span className="inline-block w-40 h-5 bg-gray-200 rounded animate-pulse" />
                    : schoolName}
                </h2>
                <p className="text-gray-400 text-xs uppercase tracking-wider mt-0.5">Fee Receipt</p>
              </div>
            </div>
          </div>

          {/* Title block */}
          <div className="text-center py-6 border-b border-gray-100 px-6">
            <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                {student?.name?.charAt(0) || 'S'}
              </div>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider" style={{ color: '#EA580C' }}>
              Official Fee Receipt
            </h3>
            <p className="text-gray-800 font-semibold text-base mt-1">
              {profileLoading
                ? <span className="inline-block w-48 h-4 bg-gray-200 rounded animate-pulse" />
                : schoolName}
            </p>
            {schoolAddress && <p className="text-gray-400 text-sm mt-1">{schoolAddress}</p>}
            {contactLine && <p className="text-gray-400 text-xs mt-1">{contactLine}</p>}
            {academic_year && (
              <div className="mt-3">
                <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
                  style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                  Academic Year {academic_year}
                </span>
              </div>
            )}
          </div>

          {/* Student + Receipt info */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Student Details</h4>
                {[
                  ['Student Name',    student?.name],
                  ['Admission No.',   student?.admission_no],
                  ['Class & Section', `${student?.class_name || '–'} - ${student?.section_name || '–'}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start gap-2 mb-2">
                    <span className="text-gray-400 text-sm w-28 flex-shrink-0">{label}</span>
                    <span className="font-semibold text-gray-900 text-sm">{val || '—'}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Receipt Details</h4>
                {[
                  ['Receipt No.',     receipt_id],
                  ['Payment Date',    date],
                  ['Payment Time',    time || '—'],
                  ['Payment Method',  payment_mode?.replace(/_/g, ' ')?.toUpperCase()],
                  ...(transaction_ref ? [['Transaction ID', `TXN_${transaction_ref}`]] : []),
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start gap-2 mb-2">
                    <span className="text-gray-400 text-sm w-32 flex-shrink-0">{label}</span>
                    <span className={`font-semibold text-sm ${label === 'Receipt No.' ? 'font-mono' : ''}`}
                      style={{ color: label === 'Receipt No.' ? '#EA580C' : '#111827' }}>
                      {val || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Fee Table — Combined Fee + Transport in one receipt */}
          <div className="px-8 py-4 border-b border-gray-100">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-3 rounded-l-lg">Description</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-3">Type</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-3">Inst. #</th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-3 rounded-r-lg">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">

                {/* ── Fee Installment rows ── */}
                {feeLines.map((item, i) => (
                  <tr key={`fee_${i}`}>
                    <td className="py-3 px-3 text-sm text-gray-700">
                      <p className="font-medium">{item.fee_head_name}</p>
                      <p className="text-xs text-gray-400">Fee Installment #{item.installment_no}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        <BookOpen className="w-3 h-3" />Fee
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-500 text-center">#{item.installment_no}</td>
                    <td className="py-3 px-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.amount)}</td>
                  </tr>
                ))}

                {/* ── Transport Fee rows ── */}
                {transportLines.map((item, i) => (
                  <tr key={`transport_${i}`}>
                    <td className="py-3 px-3 text-sm text-gray-700">
                      <p className="font-medium">{item.fee_head_name}</p>
                      <p className="text-xs text-gray-400">Transport Fee #{item.installment_no}</p>
                      {(item.route_name || item.stop_name) && (
                        <p className="text-xs text-blue-500 mt-0.5">
                          {[item.route_name, item.stop_name].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Bus className="w-3 h-3" />Transport
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-500 text-center">#{item.installment_no}</td>
                    <td className="py-3 px-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.amount)}</td>
                  </tr>
                ))}

                {/* ── Fine row ── */}
                {lateCharge > 0 && (
                  <tr>
                    <td className="py-3 px-3 text-sm font-medium" style={{ color: '#DC2626' }}>
                      Late Payment Penalty
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs text-red-600">Fine</span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-500 text-center">—</td>
                    <td className="py-3 px-3 text-sm font-semibold text-right" style={{ color: '#DC2626' }}>{fmt(lateCharge)}</td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                {/* Subtotals row (show only if both types present) */}
                {hasFee && hasTransport && (
                  <>
                    <tr className="border-t border-gray-100">
                      <td colSpan={3} className="py-2 px-3 text-xs text-right text-orange-600 font-semibold">
                        Fee Subtotal ({feeLines.length} installment{feeLines.length > 1 ? 's' : ''})
                      </td>
                      <td className="py-2 px-3 text-xs font-bold text-right text-orange-600">
                        {fmt(feeLines.reduce((s, l) => s + parseFloat(l.amount || 0), 0))}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-xs text-right text-blue-600 font-semibold">
                        Transport Subtotal ({transportLines.length} installment{transportLines.length > 1 ? 's' : ''})
                      </td>
                      <td className="py-2 px-3 text-xs font-bold text-right text-blue-600">
                        {fmt(transportLines.reduce((s, l) => s + parseFloat(l.amount || 0), 0))}
                      </td>
                    </tr>
                  </>
                )}
                <tr className="border-t border-gray-200">
                  <td colSpan={3} className="py-3 px-3 text-sm font-semibold text-gray-700 text-right">SUBTOTAL</td>
                  <td className="py-3 px-3 text-sm font-semibold text-gray-900 text-right">{fmt(subtotal + lateCharge)}</td>
                </tr>
                <tr style={{ background: '#EFF6FF' }}>
                  <td colSpan={3} className="py-4 px-3 text-base font-bold text-right rounded-l-lg" style={{ color: '#EA580C' }}>
                    TOTAL PAID
                  </td>
                  <td className="py-4 px-3 text-xl font-bold text-right rounded-r-lg" style={{ color: '#EA580C' }}>
                    {fmt(totalPaid)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="px-8 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Amount in words:</span>{' '}
              <em>{numberToWords(Math.round(totalPaid))}</em>
            </p>
          </div>

          {/* Remarks */}
          {remarks && (
            <div className="px-8 py-3 border-b border-gray-100 bg-amber-50">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-0.5">Remarks</p>
              <p className="text-sm text-gray-700">{remarks}</p>
            </div>
          )}

          {/* Stamp & Signature */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 gap-8 items-end">
              <div className="text-center">
                <div className="h-16 border-b-2 border-dashed border-gray-200 mb-2 flex items-end justify-center pb-1">
                  <span className="text-gray-200 text-2xl">📋</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">SCHOOL SEAL</p>
              </div>
              <div className="text-center">
                <div className="h-16 border-b-2 border-dashed border-gray-200 mb-2" />
                <p className="text-xs font-bold text-gray-700">AUTHORIZED SIGNATORY</p>
                <p className="text-xs text-gray-400">Accounts Department</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs font-semibold text-gray-500">{schoolName}</p>
            {schoolAddress && <p className="text-xs text-gray-400 mt-0.5">{schoolAddress}</p>}
            <p className="text-xs text-gray-400 mt-2">
              This is a computer-generated receipt and does not require a physical signature.
            </p>
            <p className="text-xs text-gray-300 mt-0.5">
              Please keep this copy for your records. Refund policy applies as per school guidelines.
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className={`no-print mt-5 space-y-3 fade-up transition-all duration-500 delay-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white">
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#EA580C' }}>
              {pdfLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
                : <><Download className="w-4 h-4" /> Download PDF</>}
            </button>
          </div>
          <button onClick={handleDone}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-[0.99]"
            style={{ background: '#1D4ED8' }}>
            <Home className="w-4 h-4" /> Back to Fee List
          </button>
        </div>

      </div>
    </div>
  );
};

export default FeeReceipt;