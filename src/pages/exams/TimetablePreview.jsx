import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import * as examTimetableService from '../../services/examService/examTimetableService';
import { toast } from 'react-hot-toast';

// ─── Helpers ───────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getDayName = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long' });
};

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const TimetablePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const printRef = useRef();

  const [loading, setLoading] = useState(false);
  const [examDetails, setExamDetails] = useState(null);
  const [classSection, setClassSection] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (location.state?.examDetails) {
      const { examDetails, classSection, scheduleRows } = location.state;
      setExamDetails(examDetails);
      setClassSection(classSection);
      setSchedules(scheduleRows || []);
    } else if (location.state?.timetableData) {
      const tt = location.state.timetableData;
      setExamDetails({
        exam_name: tt.exam_name,
        exam_type_name: tt.exam_type_name,
        academic_year: tt.academic_year,
        start_date: tt.start_date,
        end_date: tt.end_date,
      });
      setClassSection({ class_name: tt.class_name, section_name: tt.section_name });
      setSchedules((tt.schedules || []).map(s => ({
        ...s,
        pass_marks: s.min_passing_marks || s.pass_marks,
      })));
    } else if (id && id !== 'temp') {
      fetchTimetableById(id);
    }
  }, [location.state, id]);

  const fetchTimetableById = async (timetableId) => {
    setLoading(true);
    try {
      const res = await examTimetableService.getExamTimetable();
      if (res?.success) {
        const current = res.data.find(t => t.timetable_id === parseInt(timetableId));
        if (current) {
          const related = res.data.filter(t =>
            t.exam_id === current.exam_id &&
            t.class_id === current.class_id &&
            t.section_id === current.section_id
          );
          if (related.length > 0) {
            const first = related[0];
            setExamDetails({
              exam_name: first.exam_name,
              exam_type_name: first.exam_type_name,
              academic_year: first.academic_year,
              start_date: first.start_date,
              end_date: first.end_date,
            });
            setClassSection({ class_name: first.class_name, section_name: first.section_name });
            setSchedules(related.map(s => ({
              subject_name: s.subject_name,
              exam_date: s.exam_date,
              start_time: s.start_time,
              end_time: s.end_time,
              max_marks: s.max_marks,
              pass_marks: s.min_passing_marks,
              room_no: s.room_no,
              instructions: s.instructions,
            })));
          }
        } else {
          toast.error('Timetable not found');
          navigate('/admin/exams/timetable');
        }
      }
    } catch {
      toast.error('Failed to load timetable');
      navigate('/admin/exams/timetable');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=750');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exam Timetable - ${examDetails?.exam_name || ''}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; }
          
          .page { width: 100%; max-width: 900px; margin: 0 auto; padding: 32px 40px; }

          /* Header */
          .header { display: flex; align-items: center; gap: 20px; border-bottom: 3px solid #1e3a8a; padding-bottom: 18px; margin-bottom: 18px; }
          .school-logo { width: 64px; height: 64px; background: #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .school-logo svg { width: 36px; height: 36px; fill: white; }
          .school-info { flex: 1; }
          .school-name { font-size: 22px; font-weight: 800; color: #1e3a8a; letter-spacing: 0.5px; text-transform: uppercase; }
          .school-sub { font-size: 11.5px; color: #475569; margin-top: 3px; }
          .badge { background: #f0f4ff; border: 1.5px solid #c7d2fe; border-radius: 6px; padding: 6px 14px; text-align: center; flex-shrink: 0; }
          .badge-label { font-size: 9px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; }
          .badge-ref { font-size: 10px; color: #64748b; margin-top: 2px; }

          /* Title */
          .title-section { text-align: center; margin: 18px 0 14px; }
          .title-main { font-size: 18px; font-weight: 800; letter-spacing: 1.5px; color: #111; text-transform: uppercase; }
          .title-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          .title-divider { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
          .title-divider::before, .title-divider::after { content: ''; flex: 1; height: 1px; background: #cbd5e1; }
          .title-divider span { font-size: 11px; color: #94a3b8; font-weight: 600; }

          /* Info Grid */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border: 1.5px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 18px; }
          .info-cell { padding: 10px 14px; background: #f8fafc; }
          .info-cell:not(:last-child) { border-right: 1px solid #e2e8f0; }
          .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 3px; }
          .info-value { font-size: 13px; font-weight: 700; color: #1e293b; }

          /* Table */
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          thead tr { background: #1e3a8a; }
          th { color: white; font-weight: 700; padding: 10px 10px; text-align: left; font-size: 11px; letter-spacing: 0.4px; border: 1px solid #1e40af; }
          td { padding: 9px 10px; border: 1px solid #e2e8f0; color: #334155; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          tr:nth-child(odd) td { background: #ffffff; }
          .td-sno { color: #94a3b8; font-size: 11px; width: 36px; text-align: center; }
          .td-subject { font-weight: 700; color: #1e293b; }
          .td-date { white-space: nowrap; }
          .td-day { color: #6366f1; font-weight: 600; font-size: 11px; }
          .td-time { white-space: nowrap; font-weight: 600; color: #0369a1; }
          .td-room { font-weight: 600; background-color: inherit !important; }
          .td-marks { text-align: center; font-weight: 700; }
          .td-pass { text-align: center; font-weight: 700; color: #16a34a; }
          .td-instructions { font-size: 11px; color: #64748b; max-width: 160px; }

          /* Instructions box */
          .instructions-box { margin-top: 18px; border: 1.5px solid #bfdbfe; border-radius: 8px; overflow: hidden; }
          .instructions-header { background: #eff6ff; padding: 8px 14px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #bfdbfe; }
          .instructions-header span { font-size: 12px; font-weight: 700; color: #1e3a8a; }
          .instructions-body { padding: 10px 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
          .instructions-body li { font-size: 11.5px; color: #475569; list-style: none; padding-left: 14px; position: relative; }
          .instructions-body li::before { content: '✓'; position: absolute; left: 0; color: #16a34a; font-weight: 700; font-size: 10px; top: 1px; }

          /* Signatures */
          .sig-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
          .sig-block { text-align: center; }
          .sig-line { border-top: 2px solid #1e3a8a; width: 160px; margin-bottom: 6px; }
          .sig-name { font-size: 13px; font-weight: 700; color: #1e293b; }
          .sig-title { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; }
          .sig-date { font-size: 11px; color: #64748b; }

          /* Stamp */
          .stamp { width: 80px; height: 80px; border: 3px solid #1e3a8a; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; opacity: 0.25; }
          .stamp-text { font-size: 9px; font-weight: 800; color: #1e3a8a; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }

          /* Footer */
          .footer { text-align: center; margin-top: 16px; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 20px 24px; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Header -->
          <div class="header">
            <div class="school-logo">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
              </svg>
            </div>
            <div class="school-info">
              <div class="school-name">GREENWOOD INTERNATIONAL SCHOOL</div>
              <div class="school-sub">Affiliated to Central Board of Secondary Education (CBOE)</div>
              <div class="school-sub">123 Academic Lane, Education Hub, State – 560001 &nbsp;|&nbsp; contact@greenwood.edu</div>
            </div>
            <div class="badge">
              <div class="badge-label">OFFICIAL DOCUMENT</div>
              <div class="badge-ref">REF: ${examDetails?.academic_year || ''}</div>
              <div class="badge-ref">${new Date().toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'})}</div>
            </div>
          </div>

          <!-- Title -->
          <div class="title-section">
            <div class="title-main">${examDetails?.exam_type_name || 'EXAMINATION'} TIMETABLE</div>
            <div class="title-sub">Academic Year: ${examDetails?.academic_year || ''} &nbsp;•&nbsp; Class: ${classSection?.class_name || ''} Section ${classSection?.section_name || ''}</div>
          </div>
          <div class="title-divider"><span>${examDetails?.exam_name || ''}</span></div>

          <!-- Info Grid -->
          <div class="info-grid">
            <div class="info-cell">
              <div class="info-label">Exam Name</div>
              <div class="info-value">${examDetails?.exam_name || 'N/A'}</div>
            </div>
            <div class="info-cell">
              <div class="info-label">Class & Section</div>
              <div class="info-value">${classSection?.class_name || ''} – ${classSection?.section_name || ''}</div>
            </div>
            <div class="info-cell">
              <div class="info-label">Exam Period</div>
              <div class="info-value">${formatDate(examDetails?.start_date)} → ${formatDate(examDetails?.end_date)}</div>
            </div>
          </div>

          <!-- Schedule Table -->
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Day</th>
                <th>Time</th>
                <th>Room</th>
                <th style="text-align:center">Max</th>
                <th style="text-align:center">Pass</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${schedules.map((s, i) => `
                <tr>
                  <td class="td-sno">${i + 1}</td>
                  <td class="td-subject">${s.subject_name || 'N/A'}</td>
                  <td class="td-date">${formatDate(s.exam_date)}</td>
                  <td class="td-day">${getDayName(s.exam_date)}</td>
                  <td class="td-time">${formatTime(s.start_time)} – ${formatTime(s.end_time)}</td>
                  <td class="td-room">${s.room_no || '—'}</td>
                  <td class="td-marks">${s.max_marks}</td>
                  <td class="td-pass">${s.pass_marks || s.min_passing_marks || '—'}</td>
                  <td class="td-instructions">${s.instructions || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Important Instructions -->
          <div class="instructions-box">
            <div class="instructions-header">
              <span>📋 IMPORTANT INSTRUCTIONS FOR STUDENTS</span>
            </div>
            <ul class="instructions-body">
              <li>Students must report 15 minutes before the commencement of the exam</li>
              <li>Possession of any electronic gadgets (calculators, phones etc.) is strictly prohibited</li>
              <li>Valid School ID Card and Admit Card must be displayed throughout the examination period</li>
              <li>No student will be allowed to leave the examination hall before the duration is completed</li>
              <li>Write your Roll Number and Name clearly on the answer booklet</li>
              <li>Use of unfair means will result in immediate cancellation of the paper</li>
            </ul>
          </div>

          <!-- Signatures -->
          <div class="sig-row">
            <div class="sig-block">
              <div class="sig-date">Date: ${new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
            <div class="stamp">
              <div class="stamp-text">SCHOOL<br/>STAMP</div>
            </div>
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">Dr. Robert Henderson</div>
              <div class="sig-title">Principal</div>
            </div>
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">Prof. Sarah Jenkins</div>
              <div class="sig-title">Controller of Examinations</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            Greenwood International School &nbsp;|&nbsp; 123 Academic Lane, Education Hub, State – 560001 &nbsp;|&nbsp; +91 900-000-1234 &nbsp;|&nbsp; contact@greenwood.edu
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading timetable...
        </div>
      </div>
    );
  }

  if (!examDetails || schedules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-700 text-lg">No timetable data available</p>
        <button onClick={() => navigate('/admin/exams/timetable/create')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold">
          Create Timetable
        </button>``
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Timetable
            </button>
          </div>
        </div>
      </div>

      {/* Preview Document */}
      <div className="max-w-5xl mx-auto py-8 px-4" ref={printRef}>
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-5 border-b border-gray-200">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-extrabold text-blue-900 tracking-wide uppercase">GREENWOOD INTERNATIONAL SCHOOL</h1>
                <p className="text-xs text-gray-500 mt-1">Affiliated to Central Board of Secondary Education (CBSE)</p>
                <p className="text-xs text-gray-400 mt-0.5">123 Academic Lane, Education Hub, State – 560001 | contact@greenwood.edu</p>
              </div>
              <div className="flex-shrink-0 border border-indigo-200 bg-indigo-50 rounded-lg px-4 py-3 text-center">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Official Document</p>
                <p className="text-[10px] text-gray-500 mt-1">{examDetails.academic_year}</p>
                <p className="text-[10px] text-gray-400">{formatDate(new Date())}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="px-8 py-5 text-center border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900 tracking-widest uppercase">
              {examDetails.exam_type_name} TIMETABLE
            </h2>
            <p className="text-sm text-gray-500 mt-1">Academic Year: {examDetails.academic_year} &nbsp;•&nbsp; Class: {classSection?.class_name} Section {classSection?.section_name}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">{examDetails.exam_name}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-0 border-b border-gray-200">
            {[
              { label: 'Exam Name', value: examDetails.exam_name },
              { label: 'Class & Section', value: `${classSection?.class_name} – ${classSection?.section_name}` },
              { label: 'Exam Period', value: `${formatDate(examDetails.start_date)} → ${formatDate(examDetails.end_date)}` },
            ].map((item, i) => (
              <div key={i} className={`px-6 py-3 bg-gray-50 ${i < 2 ? 'border-r border-gray-200' : ''}`}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="px-8 py-6">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-900">
                    {['S.No', 'Subject', 'Date', 'Day', 'Time', 'Room', 'Max Marks', 'Pass Marks', 'Instructions'].map((h, i) => (
                      <th key={i} className={`px-3 py-3 text-white font-semibold text-xs uppercase tracking-wider ${i >= 6 && i <= 7 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedules.map((s, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className="px-3 py-3 text-gray-400 text-xs text-center">{i + 1}</td>
                      <td className="px-3 py-3 font-bold text-gray-900">{s.subject_name}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{formatDate(s.exam_date)}</td>
                      <td className="px-3 py-3 text-indigo-600 font-semibold text-xs whitespace-nowrap">{getDayName(s.exam_date)}</td>
                      <td className="px-3 py-3 text-blue-700 font-semibold whitespace-nowrap text-xs">{formatTime(s.start_time)} – {formatTime(s.end_time)}</td>
                      <td className="px-3 py-3 text-gray-700 font-semibold">{s.room_no || '—'}</td>
                      <td className="px-3 py-3 text-center font-bold text-gray-900">{s.max_marks}</td>
                      <td className="px-3 py-3 text-center font-bold text-green-700">{s.pass_marks || s.min_passing_marks || '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 max-w-[160px]" title={s.instructions}>{s.instructions || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions */}
          <div className="px-8 pb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
              <div className="bg-blue-100 px-5 py-3 flex items-center gap-2 border-b border-blue-200">
                <span className="text-sm font-bold text-blue-900">📋 IMPORTANT INSTRUCTIONS FOR STUDENTS</span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 px-5 py-4">
                {[
                  'Students must report 15 minutes before the commencement of the exam',
                  'Possession of electronic gadgets (calculators, phones etc.) is strictly prohibited',
                  'Valid School ID Card & Admit Card must be displayed throughout the exam',
                  'No student will be allowed to leave before the duration is completed',
                  'Write your Roll Number and Name clearly on the answer booklet',
                  'Use of unfair means will result in immediate cancellation of the paper',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer with Signatures */}
          <div className="border-t border-gray-200 px-8 py-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Issued on: {formatDate(new Date())}</p>
              </div>
              {/* School Stamp Placeholder */}
              <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center opacity-30">
                <span className="text-[9px] font-black text-gray-500 text-center leading-tight uppercase">SCHOOL<br/>STAMP</span>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-blue-900 w-44 mb-2" />
                <p className="text-sm font-bold text-gray-900">Dr. Robert Henderson</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Principal</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-blue-900 w-44 mb-2" />
                <p className="text-sm font-bold text-gray-900">Prof. Sarah Jenkins</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Controller of Examinations</p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400">
              Greenwood International School &nbsp;|&nbsp; 123 Academic Lane, Education Hub, State – 560001 &nbsp;|&nbsp; +91 900-000-1234 &nbsp;|&nbsp; contact@greenwood.edu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetablePreview;