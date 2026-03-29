import React, { useState, useEffect } from "react";
import admitCardService from "../../services/examService/admitCardService";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};
const fmtDay = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });
};

// ─── Admit Card Print CSS ─────────────────────────────────────────────────────
const ADMIT_PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', Arial, sans-serif; background: #fff; padding: 20px; }
  @page { size: A4; margin: 15mm; }

  .admit-card {
    font-family: 'DM Sans', Arial, sans-serif;
    background: #fff;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    max-width: 800px;
    margin: 0 auto;
    overflow: hidden;
    box-shadow: none;
  }
  .admit-header {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    background: #f8f7ff;
    border-bottom: 2px solid #e2e8f0;
  }
  .admit-logo-img { width: 80px; height: 80px; object-fit: contain; border-radius: 12px; }
  .admit-logo-placeholder {
    width: 80px; height: 80px; border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; font-weight: 700; color: #fff;
    font-family: 'Libre Baskerville', Georgia, serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .admit-school-center { flex: 1; text-align: center; }
  .admit-school-name {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 1.6rem; font-weight: 700; color: #1e293b; letter-spacing: .01em;
  }
  .admit-school-addr { font-size: .75rem; color: #64748b; margin-top: 5px; line-height: 1.5; }
  .admit-title-text {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; padding: 6px 30px; border-radius: 30px;
    font-size: .9rem; font-weight: 700; letter-spacing: .06em; margin-top: 10px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .admit-hline { border: none; border-top: 1.5px solid #e2e8f0; }
  .admit-info-row { display: flex; align-items: flex-start; gap: 20px; padding: 16px 24px; }
  .admit-info-table { flex: 1; border-collapse: collapse; font-size: .85rem; }
  .admit-info-table td { padding: 4px 6px; vertical-align: top; }
  .ik { color: #dc2626; font-weight: 600; white-space: nowrap; width: 70px; }
  .ic { color: #64748b; width: 10px; }
  .iv { color: #1e293b; }
  .iv.bold { font-weight: 700; }
  .iv.red { color: #dc2626; }
  .iv.uc { text-transform: uppercase; }
  .admit-photo-box {
    width: 100px; height: 120px; border: 2px solid #e2e8f0; border-radius: 8px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0; background: #f8fafc;
  }
  .admit-photo-box img { width: 100%; height: 100%; object-fit: cover; }
  .admit-photo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .admit-photo-placeholder span { font-size: .7rem; color: #94a3b8; }
  .admit-sched { width: 100%; border-collapse: collapse; font-size: .85rem; margin: 0; }
  .admit-sched th {
    background: #f8fafc; padding: 10px 12px; font-weight: 600; color: #1e293b;
    text-align: center; font-size: .8rem; border: 1px solid #e2e8f0;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .admit-sched td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: center; color: #334155; }
  .td-date { text-align: left !important; }
  .td-sig { width: 120px; }
  .admit-inst {
    padding: 16px 24px 12px; font-size: .8rem; color: #334155;
    background: #f8fafc; border-top: 2px solid #e2e8f0;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .inst-head { font-weight: 600; margin-bottom: 6px; color: #dc2626; }
  .admit-inst ul { padding-left: 24px; }
  .admit-inst li { margin-bottom: 3px; line-height: 1.5; }
  .admit-sig-row {
    display: flex; justify-content: space-between;
    padding: 16px 30px 20px; border-top: 1px solid #e2e8f0;
    font-size: .8rem; color: #1e293b; font-weight: 500;
  }
`;

// ─── ID Card Print CSS — A4 Full Page ─────────────────────────────────────────
const ID_PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'DM Sans', Arial, sans-serif;
    background: #fff;
    width: 210mm;
    min-height: 297mm;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    padding: 0;
  }
  @page { size: A4 portrait; margin: 0; }

  .id-card-wrapper {
    width: 210mm;
    min-height: 297mm;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .id-card {
    font-family: 'DM Sans', Arial, sans-serif;
    background: #fff;
    border: 3px solid #dc2626;
    border-radius: 24px;
    width: 160mm;
    overflow: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .id-card-header {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    padding: 26px 20px 20px;
    display: flex; align-items: center; gap: 16px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .id-logo-img {
    width: 80px; height: 80px; object-fit: contain;
    border-radius: 12px; background: #fff; padding: 4px;
  }
  .id-logo-placeholder {
    width: 80px; height: 80px; border-radius: 12px; background: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 700; color: #dc2626;
    font-family: 'Libre Baskerville', Georgia, serif;
  }
  .id-school-info { flex: 1; }
  .id-school-name {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 1.3rem; font-weight: 700; color: #fff; line-height: 1.3;
  }
  .id-school-addr {
    font-size: .8rem; color: rgba(255,255,255,.9); margin-top: 6px; line-height: 1.5;
  }

  .id-photo-section {
    display: flex; justify-content: center;
    padding: 28px 0 16px; background: #fff;
  }
  .id-photo-box {
    width: 150px; height: 180px;
    border: 4px solid #dc2626; border-radius: 16px;
    overflow: hidden; background: #f8f8f8;
    display: flex; align-items: center; justify-content: center;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .id-photo-box img { width: 100%; height: 100%; object-fit: cover; }
  .id-photo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }

  .id-student-name {
    text-align: center;
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 1.4rem; font-weight: 700; color: #1e293b;
    padding: 0 20px 6px; text-transform: uppercase; letter-spacing: .02em;
  }
  .id-academic-year {
    text-align: center; font-size: .9rem; color: #64748b;
    margin-bottom: 16px; font-weight: 500;
  }

  .id-details-table { padding: 0 24px 16px; display: flex; flex-direction: column; gap: 6px; }
  .id-detail-row { display: flex; align-items: baseline; font-size: .95rem; line-height: 1.8; }
  .id-detail-key { color: #dc2626; font-weight: 600; white-space: nowrap; min-width: 80px; }
  .id-detail-sep { color: #64748b; width: 14px; flex-shrink: 0; }
  .id-detail-val { color: #1e293b; flex: 1; }
  .id-detail-val.id-red { color: #dc2626; font-weight: 700; }
  .id-detail-val.id-uc { text-transform: uppercase; font-size: .85rem; }
  .roll-key { padding-left: 20px; min-width: 60px; }

  .id-sig-row {
    display: flex; justify-content: space-between; align-items: flex-end;
    padding: 20px 36px 16px; border-top: 1.5px solid #e2e8f0;
    font-size: .8rem; color: #1e293b; font-weight: 500;
  }
  .id-sig-box { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .id-sig-line { width: 100px; border-top: 1.5px solid #1e293b; }

  .id-footer {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: #fff; text-align: center; font-size: .9rem; font-weight: 700;
    letter-spacing: .05em; padding: 14px 16px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
`;

// ─── Universal print + download handler ───────────────────────────────────────
const buildHtml = (contentHtml, cssString, title) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>${cssString}</style>
</head>
<body>${contentHtml}</body>
</html>`;

const triggerPrint = (contentHtml, cssString, title) => {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(buildHtml(contentHtml, cssString, title));
  doc.close();
  iframe.contentWindow.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 4000);
  };
};

const triggerDownload = (contentHtml, cssString, filename) => {
  const blob = new Blob(
    [buildHtml(contentHtml, cssString, filename.replace(".html", ""))],
    { type: "text/html;charset=utf-8" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
};

// ─── Stepper ──────────────────────────────────────────────────────────────────
const STEPS = ["Exam", "Class", "Section", "Student"];
const Stepper = ({ current }) => (
  <div className="ac-stepper">
    {STEPS.map((label, i) => (
      <React.Fragment key={label}>
        <div className={`ac-step ${i < current ? "done" : i === current ? "active" : ""}`}>
          <div className="ac-step-circle">
            {i < current ? (
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : <span>{i + 1}</span>}
          </div>
          <span className="ac-step-label">{label}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`ac-step-line ${i < current ? "done" : ""}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── SelectCard ───────────────────────────────────────────────────────────────
const SelectCard = ({ label, value, onChange, options, placeholder, loading, disabled }) => (
  <div className="ac-select-wrap">
    <label className="ac-label">{label}</label>
    <div className="ac-select-box">
      {loading ? (
        <div className="ac-spinner-row"><span className="ac-spinner" /> Loading…</div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || !options.length}
          className="ac-select"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </div>
  </div>
);

// ─── ADMIT CARD VIEW ──────────────────────────────────────────────────────────
const AdmitCardView = ({ data, school }) => {
  const student = data?.students?.[0];
  if (!student) return null;
  const schedule = student.exam_schedule || [];

  const schoolName  = school?.school_name  || data?.school_info?.school_name || "";
  const schoolAddr  = school?.school_address || data?.school_info?.address   || "";
  const schoolEmail = school?.school_email  || data?.school_info?.email      || "";
  const schoolPhone = school?.school_phone_number || data?.school_info?.phone || "";
  const website     = school?.website       || data?.school_info?.website    || "";

  const addrLine    = [schoolAddr, website && `www.${website.replace(/^https?:\/\/(www\.)?/, "")}`].filter(Boolean).join(" ");
  const contactLine = [addrLine, schoolEmail, schoolPhone && `Phone No. +91-${schoolPhone.replace(/^\+91/, "")}`].filter(Boolean).join(" | ");

  return (
    <div className="admit-card" id="admit-card-print">
      {/* Header */}
      <div className="admit-header">
        <div className="admit-logo-box">
          {school?.logo_url
            ? <img src={school.logo_url} alt="logo" className="admit-logo-img" />
            : <div className="admit-logo-placeholder">{schoolName[0] || "S"}</div>
          }
        </div>
        <div className="admit-school-center">
          <div className="admit-school-name">{schoolName}</div>
          <div className="admit-school-addr">{contactLine}</div>
          <div className="admit-title-line">
            <span className="admit-title-text">Admit Card</span>
          </div>
        </div>
      </div>

      <div className="admit-hline thick" />

      {/* Student Info */}
      <div className="admit-info-row">
        <table className="admit-info-table">
          <tbody>
            <tr>
              <td className="ik">Name</td><td className="ic">:</td>
              <td className="iv bold">{student.name}</td>
              <td className="ik" style={{ paddingLeft: 32 }}>Roll No.</td><td className="ic">:</td>
              <td className="iv bold red">{student.roll_no || "—"}</td>
            </tr>
            <tr>
              <td className="ik">Class-Sec</td><td className="ic">:</td>
              <td className="iv">{data?.class_info?.class_name} {data?.class_info?.section_name}</td>
              <td className="ik" style={{ paddingLeft: 32 }}>Reg. No.</td><td className="ic">:</td>
              <td className="iv bold red">{student.admission_no || "—"}</td>
            </tr>
            <tr>
              <td className="ik">D.O.B.</td><td className="ic">:</td>
              <td className="iv" colSpan={3}>{fmt(student.dob)}</td><td />
            </tr>
            <tr>
              <td className="ik">Father</td><td className="ic">:</td>
              <td className="iv" colSpan={4}>{student.father_name}</td>
            </tr>
            <tr>
              <td className="ik">Mother</td><td className="ic">:</td>
              <td className="iv" colSpan={4}>{student.mother_name}</td>
            </tr>
            <tr>
              <td className="ik">Address</td><td className="ic">:</td>
              <td className="iv uc" colSpan={4}>{student.address}</td>
            </tr>
          </tbody>
        </table>

        <div className="admit-photo-box">
          {student.student_photo
            ? <img src={student.student_photo} alt={student.name} />
            : <div className="admit-photo-placeholder">
                <svg viewBox="0 0 40 40" fill="none" style={{ width: 36, height: 36, opacity: .35 }}>
                  <circle cx="20" cy="14" r="7" stroke="#555" strokeWidth="1.5"/>
                  <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#555" strokeWidth="1.5"/>
                </svg>
                <span>Photo</span>
              </div>
          }
        </div>
      </div>

      <div className="admit-hline" />

      {/* Schedule */}
      <table className="admit-sched">
        <thead>
          <tr>
            <th>Exam Date</th><th>Shift</th><th>Exam Time</th>
            <th>Subject Name</th><th>Signature</th>
          </tr>
        </thead>
        <tbody>
          {schedule.length > 0
            ? schedule.map((s, i) => (
                <tr key={i}>
                  <td className="td-date"><b>{fmtDay(s.exam_date)}</b> {fmt(s.exam_date)}</td>
                  <td>{s.shift}</td>
                  <td>{s.start_time} <b>To</b> {s.end_time}</td>
                  <td>{s.subject_name}</td>
                  <td className="td-sig" />
                </tr>
              ))
            : <tr><td colSpan={5} style={{ textAlign: "center", padding: 14, color: "#888" }}>No schedule available</td></tr>
          }
        </tbody>
      </table>

      {/* Instructions */}
      {data?.instructions?.length > 0 && (
        <div className="admit-inst">
          <div className="inst-head">Important Instructions to be strictly complied with -</div>
          <ul>{data.instructions.map((ins, i) => <li key={i}>{ins}</li>)}</ul>
        </div>
      )}

      {/* Signatures */}
      <div className="admit-sig-row">
        <span>Student Signature</span>
        <span>Principal Signature &amp; Stamp</span>
      </div>
    </div>
  );
};

// ─── ID CARD VIEW — A4 Print Ready ───────────────────────────────────────────
const IdCardView = ({ data, school }) => {
  const student = data?.students?.[0];
  if (!student) return null;

  const schoolName  = school?.school_name || data?.school_info?.school_name || "";
  const schoolAddr  = school?.school_address || data?.school_info?.address  || "";
  const schoolPhone = school?.school_phone_number || data?.school_info?.phone || "";
  const schedule    = student.exam_schedule || [];

  const academicYear = data?.academic_year || (schedule[0]?.exam_date
    ? (() => { const yr = new Date(schedule[0].exam_date).getFullYear(); return `${yr}-${yr + 1}`; })()
    : "2025-2026");

  return (
    // id-card-wrapper: print pe A4 full page center mein card dikhayega
    <div className="id-card-wrapper" id="id-card-print">
      <div className="id-card">

        {/* School Header */}
        <div className="id-card-header">
          <div className="id-card-logo">
            {school?.logo_url
              ? <img src={school.logo_url} alt="logo" className="id-logo-img" />
              : <div className="id-logo-placeholder">{schoolName[0] || "S"}</div>
            }
          </div>
          <div className="id-school-info">
            <div className="id-school-name">{schoolName}</div>
            {schoolAddr && <div className="id-school-addr">{schoolAddr}</div>}
          </div>
        </div>

        {/* Photo */}
        <div className="id-photo-section">
          <div className="id-photo-box">
            {student.student_photo
              ? <img src={student.student_photo} alt={student.name} />
              : <div className="id-photo-placeholder">
                  <svg viewBox="0 0 40 40" fill="none" style={{ width: 54, height: 54, opacity: .4 }}>
                    <circle cx="20" cy="14" r="8" stroke="#555" strokeWidth="1.5"/>
                    <path d="M5 38c0-8.284 6.716-15 15-15s15 6.716 15 15" stroke="#555" strokeWidth="1.5"/>
                  </svg>
                </div>
            }
          </div>
        </div>

        {/* Student Name & Year */}
        <div className="id-student-name">{student.name}</div>
        <div className="id-academic-year">{academicYear}</div>

        {/* Details */}
        <div className="id-details-table">
          <div className="id-detail-row">
            <span className="id-detail-key">Class-Sec</span>
            <span className="id-detail-sep">:</span>
            <span className="id-detail-val">{data?.class_info?.class_name} {data?.class_info?.section_name}</span>
            <span className="id-detail-key roll-key">Roll No.</span>
            <span className="id-detail-sep">:</span>
            <span className="id-detail-val id-red">{student.roll_no || "—"}</span>
          </div>
          <div className="id-detail-row">
            <span className="id-detail-key">D.O.B.</span>
            <span className="id-detail-sep">:</span>
            <span className="id-detail-val">{fmt(student.dob)}</span>
            <span className="id-detail-key roll-key">Reg. No.</span>
            <span className="id-detail-sep">:</span>
            <span className="id-detail-val id-red">{student.admission_no || "—"}</span>
          </div>
          <div className="id-detail-row">
            <span className="id-detail-key">Father</span>
            <span className="id-detail-sep">:</span>
            <span className="id-detail-val" style={{ flex: 3 }}>{student.father_name}</span>
          </div>
          <div className="id-detail-row">
            <span className="id-detail-key">Mother</span>
            <span className="id-detail-sep">:</span>
            <span className="id-detail-val" style={{ flex: 3 }}>{student.mother_name}</span>
          </div>
          <div className="id-detail-row">
            <span className="id-detail-key">Address</span>
            <span className="id-detail-sep">:</span>
            <span className="id-detail-val id-uc" style={{ flex: 3 }}>{student.address}</span>
          </div>
          {student.mobile_no && (
            <div className="id-detail-row">
              <span className="id-detail-key">Mobile No.</span>
              <span className="id-detail-sep">:</span>
              <span className="id-detail-val id-red" style={{ flex: 3 }}>{student.mobile_no}</span>
            </div>
          )}
        </div>

        {/* Signature Row */}
        <div className="id-sig-row">
          <div className="id-sig-box">
            <div className="id-sig-line" />
            <span>Student Signature</span>
          </div>
          <div className="id-sig-box">
            <div className="id-sig-line" />
            <span>Principal Signature</span>
          </div>
        </div>

        {/* Footer */}
        {schoolPhone && (
          <div className="id-footer">
            School Contact # {schoolPhone.replace(/^\+91/, "")}
          </div>
        )}

      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const GenerateAdmitCard = () => {
  const [exams,    setExams]    = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [schoolProfile, setSchoolProfile] = useState(null);

  const [selectedExam,    setSelectedExam]    = useState("");
  const [selectedClass,   setSelectedClass]   = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [loadingExams,    setLoadingExams]    = useState(false);
  const [loadingClasses,  setLoadingClasses]  = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [admitCardData, setAdmitCardData] = useState(null);
  const [error,         setError]         = useState("");
  const [activeView,    setActiveView]    = useState("admit");

  const currentStep =
    selectedExam && selectedClass && selectedSection && selectedStudent ? 4
    : selectedExam && selectedClass && selectedSection ? 3
    : selectedExam && selectedClass ? 2
    : selectedExam ? 1 : 0;

  // ── mount ──
  useEffect(() => {
    const load = async () => {
      setLoadingExams(true); setLoadingClasses(true);
      try {
        const [e, c, sp] = await Promise.all([
          admitCardService.getAllExams(),
          admitCardService.getAllClasses(),
          admitCardService.getSchoolProfile(),
        ]);
        setExams(e); setClasses(c); setSchoolProfile(sp);
      } catch (err) { setError(err.message); }
      finally { setLoadingExams(false); setLoadingClasses(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedClass) { setSections([]); setSelectedSection(""); return; }
    const load = async () => {
      setLoadingSections(true);
      try { setSections(await admitCardService.getSectionsByClass(selectedClass)); }
      catch (err) { setError(err.message); }
      finally { setLoadingSections(false); }
    };
    load();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass || !selectedSection) { setStudents([]); setSelectedStudent(""); return; }
    const load = async () => {
      setLoadingStudents(true);
      try { setStudents(await admitCardService.getStudentsByClassAndSection(selectedClass, selectedSection)); }
      catch (err) { setError(err.message); }
      finally { setLoadingStudents(false); }
    };
    load();
  }, [selectedClass, selectedSection]);

  const handleGenerate = async () => {
    setGenerating(true); setError(""); setAdmitCardData(null);
    try {
      const data = await admitCardService.generateAdmitCard(
        selectedExam, selectedClass, selectedSection, selectedStudent
      );
      setAdmitCardData(data);
      setActiveView("admit");
    } catch (err) { setError(err.message); }
    finally { setGenerating(false); }
  };

  // ── Print ──
  const handlePrint = () => {
    const elId  = activeView === "admit" ? "admit-card-print" : "id-card-print";
    const el    = document.getElementById(elId);
    if (!el) return;
    const css   = activeView === "admit" ? ADMIT_PRINT_CSS : ID_PRINT_CSS;
    const title = activeView === "admit" ? "Admit Card" : "ID Card";
    triggerPrint(el.outerHTML, css, title);
  };

  // ── Download HTML ──
  const handleDownload = () => {
    const student = admitCardData?.students?.[0];
    const elId    = activeView === "admit" ? "admit-card-print" : "id-card-print";
    const el      = document.getElementById(elId);
    if (!el) return;
    const css      = activeView === "admit" ? ADMIT_PRINT_CSS : ID_PRINT_CSS;
    const sName    = (student?.name || "Student").replace(/\s+/g, "_");
    const filename = `${activeView === "admit" ? "AdmitCard" : "IDCard"}_${sName}.html`;
    triggerDownload(el.outerHTML, css, filename);
  };

  const handleReset = () => {
    setAdmitCardData(null);
    setSelectedExam(""); setSelectedClass(""); setSelectedSection(""); setSelectedStudent("");
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');
        :root {
          --ink:#0f172a; --paper:#f8fafc; --card:#fff;
          --accent:#2563eb; --red:#dc2626; --muted:#64748b; --border:#e2e8f0;
          --green:#16a34a; --shadow:0 10px 25px -5px rgba(0,0,0,0.05);
        }
        *{box-sizing:border-box;margin:0;padding:0;}

        .ac-page{
          font-family:'DM Sans',sans-serif;
          background:var(--paper); min-height:100vh;
          padding:28px 24px 80px; color:var(--ink);
          max-width:1400px; margin:0 auto;
        }

        /* page header */
        .ac-page-header{
          display:flex; align-items:center; gap:16px;
          margin-bottom:28px;
          background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
          padding:24px 32px; border-radius:20px; color:white;
          box-shadow:var(--shadow);
        }
        .ac-page-icon{
          width:56px; height:56px; background:rgba(255,255,255,0.2);
          border-radius:16px; display:flex; align-items:center;
          justify-content:center; backdrop-filter:blur(10px);
        }
        .ac-page-icon svg{width:26px;height:26px;stroke:white;}
        .ac-page-title{font-size:1.8rem;font-weight:700;letter-spacing:-.02em;line-height:1.2;}
        .ac-page-sub{font-size:.9rem;opacity:.9;margin-top:4px;}

        /* stepper */
        .ac-stepper{
          display:flex; align-items:center; margin-bottom:32px;
          overflow-x:auto; background:white; padding:20px 24px;
          border-radius:16px; box-shadow:var(--shadow);
        }
        .ac-step{display:flex;flex-direction:column;align-items:center;gap:8px;flex-shrink:0;}
        .ac-step-circle{
          width:40px;height:40px;border-radius:50%;border:2px solid var(--border);
          background:var(--card);display:flex;align-items:center;justify-content:center;
          font-size:.9rem;font-weight:600;color:var(--muted);transition:all .3s;
        }
        .ac-step-circle svg{width:18px;height:18px;}
        .ac-step.active .ac-step-circle{
          border-color:var(--accent);background:var(--accent);color:#fff;
          transform:scale(1.05);box-shadow:0 5px 15px rgba(37,99,235,.3);
        }
        .ac-step.done .ac-step-circle{border-color:var(--green);background:var(--green);color:#fff;}
        .ac-step-label{font-size:.75rem;color:var(--muted);font-weight:500;text-transform:uppercase;letter-spacing:.5px;}
        .ac-step.active .ac-step-label,.ac-step.done .ac-step-label{color:var(--ink);font-weight:600;}
        .ac-step-line{flex:1;height:2px;background:var(--border);min-width:60px;margin:0 10px 24px;transition:background .3s;}
        .ac-step-line.done{background:var(--green);}

        /* form */
        .ac-form-grid{
          display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
          gap:20px;margin-bottom:24px;background:white;
          padding:24px;border-radius:20px;box-shadow:var(--shadow);
        }
        .ac-select-wrap{display:flex;flex-direction:column;gap:8px;}
        .ac-label{font-size:.75rem;font-weight:600;color:var(--ink);letter-spacing:.04em;text-transform:uppercase;}
        .ac-select-box{
          background:var(--card);border:2px solid var(--border);
          border-radius:12px;overflow:hidden;transition:all .2s;
        }
        .ac-select-box:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .ac-select{
          width:100%;padding:12px 15px;border:none;outline:none;
          font-family:'DM Sans',sans-serif;font-size:.9rem;color:var(--ink);
          background:transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 15px center/15px;
          appearance:none;padding-right:40px;cursor:pointer;
        }
        .ac-select:disabled{color:var(--muted);cursor:not-allowed;background-color:#f8fafc;}
        .ac-spinner-row{display:flex;align-items:center;gap:10px;padding:12px 15px;font-size:.9rem;color:var(--muted);}
        .ac-spinner{
          width:18px;height:18px;border:2px solid var(--border);
          border-top-color:var(--accent);border-radius:50%;
          animation:spin .7s linear infinite;flex-shrink:0;
        }
        @keyframes spin{to{transform:rotate(360deg);}}

        /* generate button */
        .ac-generate-btn{
          display:inline-flex;align-items:center;justify-content:center;gap:10px;
          background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
          color:#fff;border:none;border-radius:12px;padding:14px 32px;
          font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:600;
          cursor:pointer;transition:all .3s;margin-bottom:32px;
          box-shadow:0 5px 15px rgba(102,126,234,.3);
        }
        .ac-generate-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 25px rgba(102,126,234,.4);}
        .ac-generate-btn:disabled{opacity:.6;cursor:not-allowed;}
        .ac-generate-btn svg{width:18px;height:18px;}
        .ac-error{
          background:#fef2f2;border:1px solid #fecaca;color:#991b1b;
          border-radius:12px;padding:14px 18px;font-size:.9rem;margin-bottom:24px;
        }

        /* toggle tabs */
        .ac-toggle-bar{
          display:flex;align-items:center;background:white;border-radius:12px;
          padding:6px;width:fit-content;margin-bottom:24px;box-shadow:var(--shadow);
        }
        .ac-toggle-btn{
          display:inline-flex;align-items:center;gap:8px;padding:10px 24px;
          border:none;border-radius:8px;font-family:'DM Sans',sans-serif;
          font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;
          background:transparent;color:var(--muted);
        }
        .ac-toggle-btn.active{
          background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
          color:#fff;box-shadow:0 3px 10px rgba(102,126,234,.3);
        }
        .ac-toggle-btn svg{width:16px;height:16px;}

        /* action bar */
        .ac-action-bar{
          display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;align-items:center;
        }

        /* action buttons */
        .ac-btn-icon{
          display:inline-flex;align-items:center;gap:8px;
          border:none;border-radius:10px;padding:12px 22px;
          font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:600;
          cursor:pointer;transition:all .2s;
        }
        .ac-btn-icon svg{width:16px;height:16px;flex-shrink:0;}
        .ac-btn-print{ background:var(--ink);color:#fff; }
        .ac-btn-print:hover{background:#1e293b;transform:translateY(-1px);box-shadow:0 5px 15px rgba(0,0,0,.15);}
        .ac-btn-download{ background:linear-gradient(135deg,#059669,#047857);color:#fff; }
        .ac-btn-download:hover{transform:translateY(-1px);box-shadow:0 5px 15px rgba(5,150,105,.25);}
        .ac-btn-reset{ background:transparent;color:var(--muted);border:2px solid var(--border); }
        .ac-btn-reset:hover{border-color:var(--ink);color:var(--ink);background:white;}

        /* card container */
        .ac-card-container{
          background:white;padding:30px;border-radius:24px;
          box-shadow:var(--shadow);display:flex;justify-content:center;
          overflow-x:auto;
        }

        /* ── ADMIT CARD (screen) ── */
        .admit-card{
          font-family:'DM Sans',sans-serif;background:#fff;
          border:2px solid #e2e8f0;border-radius:16px;
          max-width:870px;box-shadow:0 10px 40px rgba(0,0,0,.1);overflow:hidden;
        }
        .admit-header{
          display:flex;align-items:center;gap:20px;padding:20px 24px;
          background:linear-gradient(135deg,#667eea08 0%,#764ba208 100%);
          border-bottom:2px solid #e2e8f0;
        }
        .admit-logo-img{width:80px;height:80px;object-fit:contain;border-radius:12px;}
        .admit-logo-placeholder{
          width:80px;height:80px;border-radius:12px;
          background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
          display:flex;align-items:center;justify-content:center;
          font-size:2.2rem;font-weight:700;color:#fff;
          font-family:'Libre Baskerville',Georgia,serif;
        }
        .admit-school-center{flex:1;text-align:center;}
        .admit-school-name{
          font-family:'Libre Baskerville',Georgia,serif;
          font-size:1.6rem;font-weight:700;color:#1e293b;letter-spacing:.01em;
        }
        .admit-school-addr{font-size:.75rem;color:#64748b;margin-top:5px;line-height:1.5;}
        .admit-title-line{margin-top:10px;}
        .admit-title-text{
          display:inline-block;
          background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
          color:white;padding:6px 30px;border-radius:30px;
          font-size:.9rem;font-weight:700;letter-spacing:.06em;
        }
        .admit-hline{border:none;border-top:1.5px solid #e2e8f0;}
        .admit-hline.thick{border-top-width:2px;}
        .admit-info-row{display:flex;align-items:flex-start;gap:20px;padding:16px 24px;}
        .admit-info-table{flex:1;border-collapse:collapse;font-size:.85rem;}
        .admit-info-table td{padding:4px 6px;vertical-align:top;}
        .ik{color:#dc2626;font-weight:600;white-space:nowrap;width:70px;}
        .ic{color:#64748b;width:10px;}
        .iv{color:#1e293b;}
        .iv.bold{font-weight:700;}
        .iv.red{color:#dc2626;}
        .iv.uc{text-transform:uppercase;}
        .admit-photo-box{
          width:100px;height:120px;border:2px solid #e2e8f0;border-radius:8px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          overflow:hidden;flex-shrink:0;background:#f8fafc;
        }
        .admit-photo-box img{width:100%;height:100%;object-fit:cover;}
        .admit-photo-placeholder{display:flex;flex-direction:column;align-items:center;gap:4px;}
        .admit-photo-placeholder span{font-size:.7rem;color:#94a3b8;}
        .admit-sched{width:100%;border-collapse:collapse;font-size:.85rem;margin:16px 0;}
        .admit-sched th{
          background:#f8fafc;padding:10px 12px;font-weight:600;color:#1e293b;
          text-align:center;font-size:.8rem;border:1px solid #e2e8f0;
        }
        .admit-sched td{border:1px solid #e2e8f0;padding:8px 12px;text-align:center;color:#334155;}
        .td-date{text-align:left !important;}
        .td-sig{width:120px;}
        .admit-inst{
          padding:16px 24px 12px;font-size:.8rem;color:#334155;
          background:#f8fafc;border-top:2px solid #e2e8f0;
        }
        .inst-head{font-weight:600;margin-bottom:6px;color:#dc2626;}
        .admit-inst ul{padding-left:24px;}
        .admit-inst li{margin-bottom:3px;line-height:1.5;}
        .admit-sig-row{
          display:flex;justify-content:space-between;padding:16px 30px 20px;
          border-top:1px solid #e2e8f0;font-size:.8rem;color:#1e293b;font-weight:500;
        }

        /* ── ID CARD (screen) ── */
        .id-card-wrapper{
          display:flex; justify-content:center; align-items:center; width:100%;
        }
        .id-card{
          font-family:'DM Sans',sans-serif;background:#fff;
          border:2px solid #dc2626;border-radius:20px;width:350px;
          overflow:hidden;box-shadow:0 10px 30px rgba(220,38,38,.15);
        }
        .id-card-header{
          background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);
          padding:18px 16px 14px;display:flex;align-items:center;gap:12px;
        }
        .id-logo-img{width:60px;height:60px;object-fit:contain;border-radius:10px;background:#fff;padding:3px;}
        .id-logo-placeholder{
          width:60px;height:60px;border-radius:10px;background:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:1.6rem;font-weight:700;color:#dc2626;
          font-family:'Libre Baskerville',Georgia,serif;
        }
        .id-school-info{flex:1;}
        .id-school-name{font-family:'Libre Baskerville',Georgia,serif;font-size:1rem;font-weight:700;color:#fff;line-height:1.3;}
        .id-school-addr{font-size:.65rem;color:rgba(255,255,255,.9);margin-top:4px;line-height:1.4;}
        .id-photo-section{display:flex;justify-content:center;padding:20px 0 12px;background:#fff;}
        .id-photo-box{
          width:110px;height:130px;border:3px solid #dc2626;border-radius:12px;
          overflow:hidden;background:#f8f8f8;display:flex;align-items:center;justify-content:center;
          box-shadow:0 5px 15px rgba(0,0,0,.1);
        }
        .id-photo-box img{width:100%;height:100%;object-fit:cover;}
        .id-photo-placeholder{display:flex;flex-direction:column;align-items:center;gap:6px;}
        .id-student-name{
          text-align:center;font-family:'Libre Baskerville',Georgia,serif;
          font-size:1.1rem;font-weight:700;color:#1e293b;
          padding:0 16px 4px;text-transform:uppercase;letter-spacing:.01em;
        }
        .id-academic-year{text-align:center;font-size:.75rem;color:#64748b;margin-bottom:12px;font-weight:500;}
        .id-details-table{padding:0 16px 12px;display:flex;flex-direction:column;gap:5px;}
        .id-detail-row{display:flex;align-items:baseline;font-size:.8rem;line-height:1.7;}
        .id-detail-key{color:#dc2626;font-weight:600;white-space:nowrap;min-width:68px;}
        .id-detail-sep{color:#64748b;width:12px;flex-shrink:0;}
        .id-detail-val{color:#1e293b;flex:1;}
        .id-detail-val.id-red{color:#dc2626;font-weight:700;}
        .id-detail-val.id-uc{text-transform:uppercase;font-size:.75rem;}
        .roll-key{padding-left:15px;min-width:55px;}
        .id-sig-row{
          display:flex;justify-content:space-between;align-items:flex-end;
          padding:14px 24px 12px;border-top:1px solid #e2e8f0;
          font-size:.75rem;color:#1e293b;font-weight:500;
        }
        .id-sig-box{display:flex;flex-direction:column;align-items:center;gap:5px;}
        .id-sig-line{width:80px;border-top:1.5px solid #1e293b;}
        .id-footer{
          background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);
          color:#fff;text-align:center;font-size:.8rem;font-weight:700;
          letter-spacing:.04em;padding:10px 12px;margin-top:0;
        }

        @media(max-width:768px){
          .ac-page{padding:16px;}
          .ac-page-header{padding:16px 20px;}
          .ac-page-title{font-size:1.4rem;}
          .ac-form-grid{grid-template-columns:1fr;}
          .admit-header{flex-direction:column;text-align:center;}
          .admit-info-row{flex-direction:column;}
          .admit-photo-box{align-self:center;}
        }
      `}</style>

      <div className="ac-page">
        {/* Header */}
        <div className="ac-page-header">
          <div className="ac-page-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="M7 8h4M7 12h8M7 16h5"/>
            </svg>
          </div>
          <div>
            <div className="ac-page-title">Generate Admit Card &amp; ID Card</div>
          </div>
        </div>

        <Stepper current={currentStep} />
        {error && <div className="ac-error">⚠ {error}</div>}

        {/* Dropdowns */}
        {!admitCardData && (
          <>
            <div className="ac-form-grid">
              <SelectCard label="Exam" value={selectedExam} onChange={setSelectedExam}
                options={exams.map(e => ({ value: e.exam_id, label: e.exam_name }))}
                placeholder="— Select Exam —" loading={loadingExams} />
              <SelectCard label="Class" value={selectedClass}
                onChange={v => { setSelectedClass(v); setSelectedSection(""); setSelectedStudent(""); }}
                options={classes.map(c => ({ value: c.class_id, label: c.class_name }))}
                placeholder="— Select Class —" loading={loadingClasses} />
              <SelectCard label="Section" value={selectedSection}
                onChange={v => { setSelectedSection(v); setSelectedStudent(""); }}
                options={sections.map(s => ({ value: s.section_id, label: s.section_name }))}
                placeholder={selectedClass ? "— Select Section —" : "Select class first"}
                loading={loadingSections} disabled={!selectedClass} />
              <SelectCard label="Student" value={selectedStudent}
                onChange={setSelectedStudent}
                options={students.map(s => ({
                  value: s.student_id,
                  label: `${s.name} (${s.admission_no || s.student_id})`
                }))}
                placeholder={selectedSection ? "— Select Student —" : "Select section first"}
                loading={loadingStudents} disabled={!selectedSection} />
            </div>

            <button className="ac-generate-btn" onClick={handleGenerate}
              disabled={!selectedExam || !selectedClass || !selectedSection || !selectedStudent || generating}>
              {generating ? (
                <><span className="ac-spinner" style={{ borderTopColor: "#fff" }} /> Generating Both Cards...</>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  Generate Admit Card &amp; ID Card
                </>
              )}
            </button>
          </>
        )}

        {/* After generation */}
        {admitCardData && (
          <>
            {/* Toggle Tabs */}
            <div className="ac-toggle-bar">
              <button className={`ac-toggle-btn ${activeView === "admit" ? "active" : ""}`} onClick={() => setActiveView("admit")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2"/>
                  <path d="M7 8h4M7 12h8M7 16h5"/>
                </svg>
                Admit Card
              </button>
              <button className={`ac-toggle-btn ${activeView === "id" ? "active" : ""}`} onClick={() => setActiveView("id")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <circle cx="9" cy="11" r="2.5"/>
                  <path d="M13 9h5M13 13h4"/>
                </svg>
                ID Card
              </button>
            </div>

            {/* Action Bar */}
            <div className="ac-action-bar">
              <button className="ac-btn-icon ac-btn-print" onClick={handlePrint}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8" rx="1"/>
                </svg>
                Print {activeView === "admit" ? "Admit Card" : "ID Card"}
              </button>

              <button className="ac-btn-icon ac-btn-download" onClick={handleDownload}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download {activeView === "admit" ? "Admit Card" : "ID Card"}
              </button>

              <button className="ac-btn-icon ac-btn-reset" onClick={handleReset}>
                ← Generate New Cards
              </button>
            </div>

            {/* Card Display */}
            <div className="ac-card-container">
              {activeView === "admit"
                ? <AdmitCardView data={admitCardData} school={schoolProfile} />
                : <IdCardView    data={admitCardData} school={schoolProfile} />
              }
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default GenerateAdmitCard;