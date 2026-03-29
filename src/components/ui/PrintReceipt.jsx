import React from 'react';

const PrintReceipt = ({ receiptData }) => {
  if (!receiptData) return null;

  return (
    <div id="printable-receipt" className="bg-white rounded-2xl overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Success Header - Only show on screen */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center border-b-4 border-green-500 no-print">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">Payment Recorded Successfully!</h2>
        <p className="text-slate-600">The fee has been added to the school records.</p>
      </div>

      {/* School Info */}
      <div className="p-8 border-b border-slate-200 text-center bg-slate-50">
        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">🏫</span>
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-800">Green Valley International School</h3>
        <p className="text-sm text-slate-600 mt-1">123 Education Lane, Academic District, New Delhi</p>
        <div className="inline-block mt-4 px-6 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
          FEE PAYMENT RECEIPT
        </div>
      </div>

      {/* Receipt Details */}
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Receipt No</p>
            <p className="text-lg font-bold text-indigo-600">#{receiptData.receiptNo}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Date</p>
            <p className="text-lg font-bold text-slate-800">{receiptData.date}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border-l-4 border-indigo-500">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">Student Details</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Student Name</span>
              <span className="font-bold text-slate-800">{receiptData.student.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Class</span>
              <span className="font-bold text-slate-800">{receiptData.student.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Admission No</span>
              <span className="font-bold text-slate-800">{receiptData.student.admissionNo}</span>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">Fee Breakdown</p>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Tuition Fee (July 2024)</span>
              <span className="font-bold text-slate-800">₹{receiptData.installmentFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Late Fee</span>
              <span className="font-bold text-slate-800">₹{receiptData.lateFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-4 bg-green-50 rounded-lg px-4">
              <span className="font-bold text-slate-800 text-lg">Total Paid</span>
              <span className="text-2xl font-bold text-green-600">₹{receiptData.totalPaid.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Payment Mode</p>
              <p className="text-lg font-bold text-slate-800">{receiptData.payment.mode}</p>
            </div>
            {receiptData.payment.transactionNo && (
              <div className="text-right">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Transaction No</p>
                <p className="text-sm font-bold text-slate-800">{receiptData.payment.transactionNo}</p>
              </div>
            )}
          </div>
          {receiptData.payment.remarks && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Remarks</p>
              <p className="text-sm text-slate-700">{receiptData.payment.remarks}</p>
            </div>
          )}
        </div>

        {/* Recorded By */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Recorded By</p>
            <p className="font-bold text-slate-800">{receiptData.recordedBy}</p>
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-xs">
            ✓ VERIFIED
          </div>
        </div>

        {/* Print Footer - Only visible in print */}
        <div className="mt-8 pt-6 border-t-2 border-slate-300 text-center" style={{ pageBreakInside: 'avoid' }}>
          <p className="text-sm text-slate-600 mb-2">This is a computer-generated receipt</p>
          <p className="text-xs text-slate-500">For any queries, contact school office: +91-XXXXX-XXXXX</p>
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;