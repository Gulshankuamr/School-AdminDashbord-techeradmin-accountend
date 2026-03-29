import React, { useState, useEffect } from "react";
import marksheetService from "../../services/examService/marksheetService";
import MarksheetPreview from "./MarksheetPreview";
import Spinner from "../../components/ui/Spinner";

const ACADEMIC_YEARS = ["2023-24","2024-25","2025-26","2026-27","2027-28","2028-29","2029-30"];

const GRADING_SCALE = [
  { grade:"A1", desc:"Outstanding",   color:"#16a34a" },
  { grade:"A2", desc:"Excellent",     color:"#2563eb" },
  { grade:"B1", desc:"Very Good",     color:"#7c3aed" },
  { grade:"B2", desc:"Good",          color:"#0891b2" },
  { grade:"C1", desc:"Above Average", color:"#d97706" },
  { grade:"C2", desc:"Average",       color:"#ea580c" },
  { grade:"D",  desc:"Below Average", color:"#dc2626" },
  { grade:"E",  desc:"Needs Effort",  color:"#991b1b" },
];

// ═══════════════════════════════════════
//  PARSE SCHOLASTIC — handles new API structure:
//  scholastic.term1.subject_totals / scholastic.term2.subject_totals
// ═══════════════════════════════════════
const parseScholastic = (scholastic) => {
  if (!scholastic) return [];

  // ✅ NEW API FORMAT: { term1: { subject_totals: { "120": { subject_name, total_obtained, per_exam } } }, term2: {...} }
  if (scholastic.term1 && scholastic.term1.subject_totals) {
    const term1Subs = scholastic.term1.subject_totals || {};
    const term2Subs = scholastic.term2?.subject_totals || {};

    const allSubjectIds = new Set([
      ...Object.keys(term1Subs),
      ...Object.keys(term2Subs),
    ]);

    // Collect all unique exam names for term1 and term2 (for dynamic column headers)
    const t1ExamNames = [];
    const t2ExamNames = [];
    Object.values(term1Subs).forEach(s => {
      Object.keys(s.per_exam || {}).forEach(name => {
        if (!t1ExamNames.includes(name)) t1ExamNames.push(name);
      });
    });
    Object.values(term2Subs).forEach(s => {
      Object.keys(s.per_exam || {}).forEach(name => {
        if (!t2ExamNames.includes(name)) t2ExamNames.push(name);
      });
    });

    return Array.from(allSubjectIds).map((id) => {
      const s1 = term1Subs[id] || {};
      const s2 = term2Subs[id] || {};

      const t1Total = typeof s1.total_obtained === "number" ? Math.round(s1.total_obtained * 10) / 10 : (s1.total_obtained ?? "—");
      const t2Total = typeof s2.total_obtained === "number" ? Math.round(s2.total_obtained * 10) / 10 : (s2.total_obtained ?? "—");

      const t1Exams = Object.entries(s1.per_exam || {}).map(([name, e]) => ({
        name,
        marks: e.marks_obtained ?? "—",
        max_marks: e.max_marks ?? "—",
        normalized: e.marks_obtained ?? "—",
      }));
      const t2Exams = Object.entries(s2.per_exam || {}).map(([name, e]) => ({
        name,
        marks: e.marks_obtained ?? "—",
        max_marks: e.max_marks ?? "—",
        normalized: e.marks_obtained ?? "—",
      }));

      const finalMark = (typeof s1.total_obtained === "number" && typeof s2.total_obtained === "number")
        ? s1.total_obtained + s2.total_obtained
        : (s1.total_obtained ?? s2.total_obtained ?? "—");

      const finalPct = (typeof s1.total_obtained === "number" && typeof s2.total_obtained === "number")
        ? `${Math.round((s1.total_obtained + s2.total_obtained) / 2 * 10) / 10}%`
        : s1.total_obtained != null ? `${s1.total_obtained}%` : "—";

      const gradeVal = typeof s1.total_obtained === "number"
        ? getGrade(Number(finalPct) || s1.total_obtained)
        : "—";

      return {
        subject: s1.subject_name || s2.subject_name || id,
        term1_exams: t1Exams,
        term1_total: t1Total,
        term2_exams: t2Exams,
        term2_total: t2Total,
        final_marks: finalMark,
        final_percentage: finalPct,
        final_grade: gradeVal,
        final_grade_point: gradeVal,
        // legacy fields
        fa1: t1Exams[0]?.marks ?? "—",
        fa2: t1Exams[1]?.marks ?? "—",
        sa1: "—", total1: t1Total,
        fa3: t2Exams[0]?.marks ?? "—",
        fa4: t2Exams[1]?.marks ?? "—",
        sa2: "—", total2: t2Total,
        fa_final: finalMark, sa_final: "—",
        overall: finalMark, grade: gradeVal, gp: gradeVal,
        isNew: true,
      };
    });
  }

  // ✅ FLAT ARRAY FORMAT
  if (Array.isArray(scholastic)) return scholastic.map((row, i) => ({
    subject: row.subject_name || row.subject || `Subject ${i + 1}`,
    fa1: row.fa1 ?? "—", fa2: row.fa2 ?? "—", sa1: row.sa1 ?? "—",
    total1: row.total1 ?? "—",
    fa3: row.fa3 ?? "—", fa4: row.fa4 ?? "—", sa2: row.sa2 ?? "—",
    total2: row.total2 ?? "—",
    fa_final: row.fa_final ?? "—", sa_final: row.sa_final ?? "—",
    overall: row.overall ?? "—", grade: row.grade ?? "—", gp: row.gp ?? "—",
    term1_exams: [], term2_exams: [],
    final_marks: row.overall ?? "—", final_percentage: "—",
    final_grade: row.grade ?? "—", final_grade_point: row.gp ?? "—", isNew: false,
  }));

  // ✅ NESTED OBJECT FORMAT
  const { term1 = {}, term2 = {}, final = {} } = scholastic;
  if (Array.isArray(term1)) {
    return term1.map((row, i) => ({
      subject: row.subject_name || row.subject || `Subject ${i + 1}`,
      fa1: row.fa1 ?? "—", fa2: row.fa2 ?? "—", sa1: row.sa1 ?? "—",
      total1: row.total1 ?? "—",
      fa3: row.fa3 ?? "—", fa4: row.fa4 ?? "—", sa2: row.sa2 ?? "—",
      total2: row.total2 ?? "—",
      fa_final: row.fa_final ?? "—", sa_final: row.sa_final ?? "—",
      overall: row.overall ?? "—", grade: row.grade ?? "—", gp: row.gp ?? "—",
      term1_exams: [], term2_exams: [],
      final_marks: row.overall ?? "—", final_percentage: "—",
      final_grade: row.grade ?? "—", final_grade_point: row.gp ?? "—", isNew: false,
    }));
  }
  const names = new Set([...Object.keys(term1), ...Object.keys(term2), ...Object.keys(final)]);
  return Array.from(names).map(sub => {
    const t1 = term1[sub] || {}, t2 = term2[sub] || {}, fin = final[sub] || {};
    const t1Exams = Object.entries(t1.exams || {}).map(([name, e]) => ({
      name, marks: e.marks ?? "—", max_marks: e.max_marks ?? "—",
      normalized: typeof e.normalized === "number" ? Math.round(e.normalized * 10) / 10 : "—",
    }));
    const t2Exams = Object.entries(t2.exams || {}).map(([name, e]) => ({
      name, marks: e.marks ?? "—", max_marks: e.max_marks ?? "—",
      normalized: typeof e.normalized === "number" ? Math.round(e.normalized * 10) / 10 : "—",
    }));
    const t1Total = typeof t1.total === "number" ? Math.round(t1.total * 10) / 10 : "—";
    const t2Total = typeof t2.total === "number" ? Math.round(t2.total * 10) / 10 : "—";
    return {
      subject: sub,
      term1_exams: t1Exams, term1_total: t1Total,
      term2_exams: t2Exams, term2_total: t2Total,
      final_marks: fin.marks ?? "—",
      final_percentage: fin.percentage != null ? `${Math.round(fin.percentage * 10) / 10}%` : "—",
      final_grade: fin.grade ?? "—", final_grade_point: fin.grade_point ?? "—",
      fa1: t1Exams[0]?.normalized ?? "—", fa2: t1Exams[1]?.normalized ?? "—",
      sa1: "—", total1: t1Total,
      fa3: t2Exams[0]?.normalized ?? "—", fa4: t2Exams[1]?.normalized ?? "—",
      sa2: "—", total2: t2Total,
      fa_final: fin.marks ?? "—", sa_final: "—",
      overall: fin.marks ?? "—", grade: fin.grade ?? "—",
      gp: fin.grade_point ?? "—", isNew: true,
    };
  });
};

// Simple getGrade helper (mirrors MarksheetPreview)
const getGrade = (pct) => {
  const n = Number(pct);
  if (n >= 91) return "A1"; if (n >= 81) return "A2";
  if (n >= 71) return "B1"; if (n >= 61) return "B2";
  if (n >= 51) return "C1"; if (n >= 41) return "C2";
  if (n >= 33) return "D";  return "E";
};

// ✅ FIX: co_scholastic term keys are subject IDs, values are { subject_id, subject_name, grade }
const parseCoScholastic = (co) => {
  if (!co) return [];
  if (Array.isArray(co)) return co;
  const t1 = co.term1 || {};
  const t2 = co.term2 || {};
  const acts = new Set([...Object.keys(t1), ...Object.keys(t2)]);
  return Array.from(acts).map(a => ({
    activity: t1[a]?.subject_name || t2[a]?.subject_name || a,
    term1: typeof t1[a] === "object" ? (t1[a]?.grade || "—") : (t1[a] || "—"),
    term2: typeof t2[a] === "object" ? (t2[a]?.grade || "—") : (t2[a] || "—"),
  }));
};

const triggerPrint = (studentName = "Student", pageId = "printable-report") => {
  const page = document.getElementById(pageId);
  if (!page) return;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Marksheet_${studentName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}@page{size:A4 portrait;margin:0;}</style>
</head><body>${page.outerHTML}</body></html>`;
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;";
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 3000);
  };
};

const PrintableCard = React.forwardRef(({ data, school }, ref) => {
  if (!data) return null;
  const {
    student_info = {}, attendance = {},
    scholastic, co_scholastic,
    cgpa, overall_percentage,
    academic_year,              // ✅ FIX: top-level field
  } = data;

  const rows    = parseScholastic(scholastic);
  const coRows  = parseCoScholastic(co_scholastic);

  // ✅ FIX: cgpa can be "0.0" string
  const isPassed = overall_percentage != null && Number(overall_percentage) >= 33;
  const cgpaDisplay = (cgpa && Number(cgpa) > 0) ? cgpa : "—";

  const bc = "1px solid #bbb";
  const td = (x = {}) => ({ border: bc, padding: "3.5px 4px", fontSize: 8, color: "#111", verticalAlign: "middle", ...x });
  const th = (bg = "#1e3a8a", x = {}) => ({ border: bc, padding: "4px 4px", background: bg, color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 7.5, letterSpacing: 0.2, verticalAlign: "middle", ...x });

  const isNew   = rows.length > 0 && rows[0]?.isNew;
  const t1Names = isNew ? [...new Set(rows.flatMap(r => (r.term1_exams || []).map(e => e.name)))] : [];
  const t2Names = isNew ? [...new Set(rows.flatMap(r => (r.term2_exams || []).map(e => e.name)))] : [];
  const hasT1   = t1Names.length > 0;
  const hasT2   = t2Names.length > 0;
  const half1   = coRows.slice(0, Math.ceil(coRows.length / 2));
  const half2   = coRows.slice(Math.ceil(coRows.length / 2));

  return (
    <div ref={ref} id="printable-report" style={{ width:"210mm", minHeight:"297mm", background:"#fff", fontFamily:"Arial,Helvetica,sans-serif", boxSizing:"border-box", padding:"7mm 8mm", color:"#000" }}>

      <div style={{ textAlign:"right", fontSize:7, color:"#777", marginBottom:2 }}>Affilation No.7805-08/17-18</div>

      <div style={{ display:"flex", alignItems:"center", gap:12, paddingBottom:6, borderBottom:"2.5px solid #1e3a8a", marginBottom:6 }}>
        <div style={{ width:52,height:52,borderRadius:"50%",flexShrink:0,border:"3px solid #1e3a8a",background:"linear-gradient(135deg,#1e3a8a,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
        </div>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:22,fontWeight:900,color:"#1e3a8a",letterSpacing:2,textTransform:"uppercase",lineHeight:1.1 }}>{school?.school_name||"J.PUBLIC SCHOOL"}</div>
          <div style={{ fontSize:7.5,color:"#555",marginTop:2 }}>An English Medium School With Indian Value</div>
          <div style={{ fontSize:7.5,color:"#555" }}>{school?.school_address||"Parahupur, Mughalsarai Chandauli, Uttar Pradesh -232101"}</div>
          <div style={{ fontSize:7.5,color:"#555" }}>www.jpublicschool.in{school?.school_phone_number?` | Phone No. +91-${school.school_phone_number}`:" | Phone No. +91-9889806526"}</div>
        </div>
      </div>

      <div style={{ textAlign:"center", marginBottom:5 }}>
        <div style={{ display:"inline-block",width:"100%",fontSize:11,fontWeight:900,color:"#1e3a8a",letterSpacing:2,textTransform:"uppercase",borderTop:"1.5px solid #1e3a8a",borderBottom:"1.5px solid #1e3a8a",padding:"3px 0" }}>
          {/* ✅ FIX: academic_year is top-level */}
          REPORT CARD • SESSION {academic_year || student_info?.academic_year || "2024-2025"}
        </div>
        <div style={{ fontSize:10,fontWeight:700,marginTop:2,letterSpacing:1,textTransform:"uppercase",color:"#222" }}>CLASS - {student_info?.class_name||"—"}</div>
      </div>

      <div style={{ marginBottom:5,background:"#f8faff",border:"1px solid #cce",borderRadius:4,padding:"5px 10px" }}>
        <div style={{ fontSize:9,fontWeight:800,color:"#1e3a8a",marginBottom:3,textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid #dde",paddingBottom:2 }}>Student Profile</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2.5px 20px" }}>
          {[
            ["Name of Student", student_info?.name],
            ["Roll No",         student_info?.roll_no ?? "—"],
            ["Admission No.",   student_info?.admission_no],
            ["Section",         student_info?.section_name],
            // ✅ FIX: API sends dob not date_of_birth — handle both
            ["Date of Birth",   student_info?.dob
              ? new Date(student_info.dob).toLocaleDateString("en-IN")
              : student_info?.date_of_birth ?? "—"],
            ["Class",           student_info?.class_name],
            ["Mother's Name",   student_info?.mother_name],
            ["Father's Name",   student_info?.father_name],
            ["Address",         student_info?.address],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ display:"flex",gap:4 }}>
              <span style={{ fontSize:8,fontWeight:700,color:"#333",minWidth:84,flexShrink:0 }}>{lbl}</span>
              <span style={{ fontSize:8,color:"#111" }}>: {val||"—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ FIX: API uses present_days not total_attendance */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:4,padding:"4px 10px" }}>
        <div style={{ display:"flex",gap:20 }}>
          <span style={{ fontSize:8.5 }}><b>Attendance</b></span>
          <span style={{ fontSize:8.5 }}>Total Working Days : <b style={{ color:"#1e3a8a",fontSize:10 }}>{attendance?.total_working_days ?? "—"}</b></span>
          <span style={{ fontSize:8.5 }}>Total Attendance : <b style={{ color:"#059669",fontSize:10 }}>{attendance?.present_days ?? "—"}</b></span>
        </div>
        <span style={{ fontSize:8.5 }}>Roll No : <b style={{ color:"#1e3a8a",fontSize:10 }}>{student_info?.roll_no ?? "—"}</b></span>
      </div>

      <div style={{ background:"#1e3a8a",color:"#fff",padding:"3px 8px",borderRadius:"3px 3px 0 0",fontSize:8.5,fontWeight:800,letterSpacing:1,textTransform:"uppercase" }}>
        SCHOLASTIC AREA &nbsp;&nbsp;(8 Point Scale)
      </div>

      {rows.length > 0 ? (<>
        {isNew && (hasT1 || hasT2) ? (
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:7.5 }}>
            <thead>
              <tr>
                <th rowSpan={3} style={{ ...th(),textAlign:"left",width:70,verticalAlign:"middle" }}>Subjects</th>
                {hasT1 && <th colSpan={t1Names.length + 1} style={th("#1d4ed8")}>Term-1</th>}
                {hasT2 && <th colSpan={t2Names.length + 1} style={th("#1d4ed8")}>Term-2</th>}
                <th colSpan={3} style={th("#0f2460")}>Final Assessment</th>
              </tr>
              <tr>
                {t1Names.map((n, i) => <th key={i} style={th("#2563eb",{fontSize:6.5})}>{n.length > 16 ? n.slice(0,16)+"." : n}</th>)}
                {hasT1 && <th style={th("#334155",{fontSize:6.5})}>Total</th>}
                {t2Names.map((n, i) => <th key={i} style={th("#2563eb",{fontSize:6.5})}>{n.length > 16 ? n.slice(0,16)+"." : n}</th>)}
                {hasT2 && <th style={th("#334155",{fontSize:6.5})}>Total</th>}
                <th style={th("#0f2460",{fontSize:6.5})}>Marks</th>
                <th style={th("#0f2460",{fontSize:6.5})}>%</th>
                <th style={th("#0f2460",{fontSize:6.5})}>Grade</th>
              </tr>
              <tr>
                {t1Names.map((_, i) => <th key={i} style={{ ...th("#374155"),fontSize:6 }}></th>)}
                {hasT1 && <th style={{ ...th("#334155"),fontSize:6 }}>100%</th>}
                {t2Names.map((_, i) => <th key={i} style={{ ...th("#374155"),fontSize:6 }}></th>)}
                {hasT2 && <th style={{ ...th("#334155"),fontSize:6 }}>100%</th>}
                <th style={{ ...th("#0f2460"),fontSize:6 }}></th>
                <th style={{ ...th("#0f2460"),fontSize:6 }}></th>
                <th style={{ ...th("#0f2460"),fontSize:6 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ background:i%2===0?"#f8faff":"#fff" }}>
                  <td style={td({textAlign:"left",fontWeight:700,textTransform:"uppercase",fontSize:7.5})}>{row.subject}</td>
                  {t1Names.map((en, ei) => {
                    const e = (row.term1_exams||[]).find(x => x.name===en);
                    return <td key={ei} style={td({textAlign:"center"})}>{e ? `${e.marks}/${e.max_marks}` : "—"}</td>;
                  })}
                  {hasT1 && <td style={td({textAlign:"center",fontWeight:700,background:"#eef4ff"})}>{row.term1_total}</td>}
                  {t2Names.map((en, ei) => {
                    const e = (row.term2_exams||[]).find(x => x.name===en);
                    return <td key={ei} style={td({textAlign:"center"})}>{e ? `${e.marks}/${e.max_marks}` : "—"}</td>;
                  })}
                  {hasT2 && <td style={td({textAlign:"center",fontWeight:700,background:"#eef4ff"})}>{row.term2_total}</td>}
                  <td style={td({textAlign:"center",fontWeight:700})}>{row.final_marks}</td>
                  <td style={td({textAlign:"center"})}>{row.final_percentage}</td>
                  <td style={td({textAlign:"center",fontWeight:900,color:"#1e3a8a",background:"#f0f4ff"})}>{row.final_grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:7.5 }}>
            <thead>
              <tr>
                <th rowSpan={3} style={{ ...th(),textAlign:"left",width:70,verticalAlign:"middle" }}>Subjects</th>
                <th colSpan={4} style={th("#1d4ed8")}>Term-1</th>
                <th colSpan={4} style={th("#1d4ed8")}>Term-2</th>
                <th colSpan={4} style={th("#1e3a8a")}>FINAL ASSESSMENT</th>
              </tr>
              <tr>
                {["FA-1","FA-2","SA-1","Total","FA-3","FA-4","SA-2","Total","FA","SA","Overall","GP"].map((h,i) => (
                  <th key={i} style={th(i<4?"#2563eb":i<8?"#2563eb":"#1e3a8a",{fontSize:6.5})}>{h}</th>
                ))}
              </tr>
              <tr>
                {["10%","10%","80%","100%","10%","10%","80%","100%","40%","160%","200%",""].map((w,i) => (
                  <th key={i} style={{ ...th("#334155"),fontSize:6 }}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ background:i%2===0?"#f8faff":"#fff" }}>
                  <td style={td({textAlign:"left",fontWeight:700,textTransform:"uppercase"})}>{row.subject_name||row.subject}</td>
                  <td style={td({textAlign:"center"})}>{row.fa1}</td>
                  <td style={td({textAlign:"center"})}>{row.fa2}</td>
                  <td style={td({textAlign:"center"})}>{row.sa1}</td>
                  <td style={td({textAlign:"center",fontWeight:700,background:"#eef4ff"})}>{row.total1}</td>
                  <td style={td({textAlign:"center"})}>{row.fa3}</td>
                  <td style={td({textAlign:"center"})}>{row.fa4}</td>
                  <td style={td({textAlign:"center"})}>{row.sa2}</td>
                  <td style={td({textAlign:"center",fontWeight:700,background:"#eef4ff"})}>{row.total2}</td>
                  <td style={td({textAlign:"center"})}>{row.fa_final}</td>
                  <td style={td({textAlign:"center"})}>{row.sa_final}</td>
                  <td style={td({textAlign:"center",fontWeight:700})}>{row.overall}</td>
                  <td style={td({textAlign:"center",fontWeight:900,color:"#1e3a8a",background:"#f0f4ff"})}>{row.gp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ border:bc,borderTop:"none",background:"#f0f4ff",padding:"3px 8px",fontSize:7.5,color:"#444",marginBottom:6,display:"flex",justifyContent:"space-between" }}>
          <span>8 Point Scale : A1(91%-100%), A2(81%-90%), B1(71%-80%), B2(61%-70%), C1(51%-60%), C2(41%-50%), D(33%-40%), F(32% AND BELOW)</span>
          {/* ✅ FIX: only show cgpa if > 0 */}
          <span style={{ fontWeight:800,color:"#1e3a8a" }}>CGPA &nbsp;{cgpaDisplay}</span>
        </div>
      </>) : (
        <div style={{ border:bc,borderTop:"none",background:"#f8fafc",padding:10,textAlign:"center",color:"#999",fontSize:9,marginBottom:6 }}>No scholastic records for this session.</div>
      )}

      <div style={{ display:"flex",gap:8,marginBottom:8 }}>
        {[
          { label:"CGPA",      value: cgpaDisplay,                                              bg:"#eff6ff", border:"#bfdbfe", color:"#1e3a8a" },
          { label:"Overall %", value:overall_percentage != null ? `${overall_percentage}%`:"—", bg:"#f0fdf4", border:"#bbf7d0", color:"#059669" },
          { label:"Result",    value:overall_percentage != null ? (isPassed ? "PASS ✓" : "FAIL ✗") : "—", bg:isPassed?"#f0fdf4":"#fef2f2", border:isPassed?"#86efac":"#fca5a5", color:isPassed?"#059669":"#dc2626" },
        ].map(({ label, value, bg, border, color }) => (
          <div key={label} style={{ flex:1,textAlign:"center",background:bg,border:`2px solid ${border}`,borderRadius:6,padding:"5px 8px" }}>
            <div style={{ fontSize:14,fontWeight:900,color }}>{value}</div>
            <div style={{ fontSize:7,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:0.8,marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 0.55fr",gap:7,marginBottom:10 }}>
        {[half1, half2].map((half, hi) => (
          <div key={hi}>
            <div style={{ background:"#4c1d95",color:"#fff",padding:"3px 7px",borderRadius:"3px 3px 0 0",fontSize:8,fontWeight:800,textTransform:"uppercase" }}>Co Scholastic Area</div>
            {half.length > 0 ? (
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:8 }}>
                <thead>
                  <tr>
                    <th style={{ ...th("#4c1d95"),textAlign:"left" }}>Activity</th>
                    <th style={th("#4c1d95")}>Term-1</th>
                    <th style={th("#4c1d95")}>Term-2</th>
                  </tr>
                </thead>
                <tbody>
                  {half.map((row, i) => (
                    <tr key={i} style={{ background:i%2===0?"#faf5ff":"#fff" }}>
                      <td style={td({textAlign:"left",fontWeight:600,textTransform:"capitalize",fontSize:7.5})}>{row.activity}</td>
                      <td style={td({textAlign:"center",fontWeight:700,fontSize:7.5})}>{row.term1}</td>
                      <td style={td({textAlign:"center",fontWeight:700,fontSize:7.5})}>{row.term2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ border:bc,borderTop:"none",padding:8,textAlign:"center",color:"#aaa",fontSize:7.5 }}>No data.</div>
            )}
          </div>
        ))}
        <div>
          <div style={{ background:"#164e63",color:"#fff",padding:"3px 7px",borderRadius:"3px 3px 0 0",fontSize:8,fontWeight:800,textTransform:"uppercase" }}>Scale</div>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:7.5 }}>
            <tbody>
              {GRADING_SCALE.map((g, i) => (
                <tr key={i} style={{ background:i%2===0?"#f0fdfe":"#fff" }}>
                  <td style={td({textAlign:"center",fontWeight:900,color:g.color,width:22,fontSize:8.5})}>{g.grade}</td>
                  <td style={td({fontWeight:600})}>{g.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display:"flex",justifyContent:"space-between",paddingTop:14,borderTop:"1.5px dashed #aaa" }}>
        {["Director","Class Teacher","Principal"].map(role => (
          <div key={role} style={{ textAlign:"center",flex:1 }}>
            <div style={{ width:100,height:1,background:"#444",margin:"0 auto 5px" }}/>
            <div style={{ fontSize:8,fontWeight:800,color:"#333",textTransform:"uppercase",letterSpacing:1.5 }}>{role}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
PrintableCard.displayName = "PrintableCard";

const Caret = ({ loading }) => (
  <div style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}>
    {loading
      ? <Spinner />
      : <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
    }
  </div>
);

const MarksheetGenerator = () => {
  const [school,   setSchool]   = useState(null);
  const [classes,  setClasses]  = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const [selClass,     setSelClass]     = useState("");
  const [selSection,   setSelSection]   = useState("");
  const [selStudent,   setSelStudent]   = useState("");
  const [acYear,       setAcYear]       = useState("2026-27");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [ldClasses,  setLdClasses]  = useState(false);
  const [ldSections, setLdSections] = useState(false);
  const [ldStudents, setLdStudents] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [marksheetData, setMarksheetData] = useState(null);
  const [error,         setError]         = useState("");
  const [activeTab,     setActiveTab]     = useState("marksheet");

  const canGenerate = selClass && selSection && selStudent && acYear;

  const filteredStudents = searchQuery.trim()
    ? students.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.roll_no && String(s.roll_no).includes(searchQuery))
      )
    : students;

  useEffect(() => {
    marksheetService.getSchoolProfile().then(setSchool).catch(e => console.warn(e.message));
  }, []);

  useEffect(() => {
    setLdClasses(true);
    marksheetService.getAllClasses()
      .then(d => setClasses(d.map(c => ({ value: String(c.class_id), label: c.class_name }))))
      .catch(e => setError(e.message))
      .finally(() => setLdClasses(false));
  }, []);

  useEffect(() => {
    if (!selClass) { setSections([]); setSelSection(""); return; }
    setLdSections(true);
    setSelSection(""); setStudents([]); setSelStudent(""); setSearchQuery(""); setMarksheetData(null);
    marksheetService.getSectionsByClass(selClass)
      .then(d => setSections(d.map(s => ({ value: String(s.section_id), label: s.section_name }))))
      .catch(e => setError(e.message))
      .finally(() => setLdSections(false));
  }, [selClass]);

  useEffect(() => {
    if (!selClass || !selSection) { setStudents([]); setSelStudent(""); setSearchQuery(""); return; }
    setLdStudents(true);
    setSelStudent(""); setSearchQuery(""); setMarksheetData(null);
    marksheetService.getStudentsByClassAndSection(selClass, selSection)
      .then(d => setStudents(d.map(s => ({ value: String(s.student_id), label: s.name, roll_no: s.roll_no }))))
      .catch(e => setError(e.message))
      .finally(() => setLdStudents(false));
  }, [selClass, selSection]);

  const handleGenerate = async () => {
    if (!canGenerate) { setError("Please select all fields."); return; }
    setError(""); setMarksheetData(null); setGenerating(true);
    try {
      const data = await marksheetService.generateMarksheet(selStudent, acYear);
      setMarksheetData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleStudentSelect = (s) => {
    setSelStudent(s.value); setSearchQuery(s.label); setShowDropdown(false);
  };

  const SS = {
    width:"100%", padding:"8px 28px 8px 11px",
    borderRadius:6, border:"1.5px solid #e2e8f0",
    background:"#fff", color:"#374151",
    fontSize:13, fontWeight:500, outline:"none",
    appearance:"none", cursor:"pointer",
    boxShadow:"0 1px 2px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      <div style={{ background:"#fff", borderBottom:"1.5px solid #e2e8f0", padding:"18px 28px 14px" }}>
        <h1 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0 }}>Generate Marksheet</h1>
        <p style={{ fontSize:12, color:"#94a3b8", margin:"3px 0 0" }}>Manage and generate student academic reports.</p>
      </div>

      <div style={{ background:"#fff", borderBottom:"1.5px solid #e2e8f0", padding:"14px 28px" }}>
        <div style={{ display:"flex", gap:14, alignItems:"flex-end", flexWrap:"wrap" }}>

          <div style={{ display:"flex",flexDirection:"column",gap:5,minWidth:130 }}>
            <label style={{ fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1 }}>Academic Year</label>
            <div style={{ position:"relative" }}>
              <select value={acYear} onChange={e => setAcYear(e.target.value)} style={SS}>
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <Caret/>
            </div>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:5,minWidth:130 }}>
            <label style={{ fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1 }}>Class</label>
            <div style={{ position:"relative" }}>
              <select value={selClass} onChange={e => setSelClass(e.target.value)} disabled={ldClasses} style={{ ...SS, color:selClass?"#374151":"#94a3b8" }}>
                <option value="">{ldClasses ? "Loading…" : "Select Class"}</option>
                {classes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <Caret loading={ldClasses}/>
            </div>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:5,minWidth:130 }}>
            <label style={{ fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1 }}>Section</label>
            <div style={{ position:"relative" }}>
              <select value={selSection} onChange={e => setSelSection(e.target.value)} disabled={!selClass||ldSections} style={{ ...SS, color:selSection?"#374151":"#94a3b8" }}>
                <option value="">{ldSections ? "Loading…" : selClass ? "Select Section" : "Select class first"}</option>
                {sections.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <Caret loading={ldSections}/>
            </div>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:5,minWidth:200,flex:1,position:"relative" }}>
            <label style={{ fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1 }}>Student Search</label>
            <div style={{ position:"relative" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelStudent(""); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                placeholder="Roll No or Name"
                disabled={!selSection || ldStudents}
                style={{ ...SS, paddingRight:36, cursor:"text", color:"#374151", width:"100%", boxSizing:"border-box" }}
              />
              <div style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}>
                {ldStudents
                  ? <Spinner/>
                  : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                }
              </div>
            </div>
            {showDropdown && selSection && filteredStudents.length > 0 && (
              <div style={{ position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:9999,maxHeight:200,overflowY:"auto",marginTop:2 }}>
                {filteredStudents.map(s => (
                  <button key={s.value} onMouseDown={() => handleStudentSelect(s)}
                    style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",background:"transparent",border:"none",borderBottom:"1px solid #f1f5f9",cursor:"pointer",textAlign:"left" }}
                    onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <span style={{ fontSize:13,color:"#1e293b",fontWeight:500 }}>{s.label}</span>
                    {s.roll_no && <span style={{ fontSize:11,color:"#3b82f6",fontWeight:700,background:"#eff6ff",padding:"1px 7px",borderRadius:99 }}>#{s.roll_no}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            style={{
              padding:"9px 20px", borderRadius:7, border:"none",
              cursor: canGenerate && !generating ? "pointer" : "not-allowed",
              background: canGenerate && !generating ? "#3b82f6" : "#cbd5e1",
              color:"#fff", fontWeight:700, fontSize:13,
              display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap",
              boxShadow: canGenerate && !generating ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
              height:40,
            }}
          >
            {generating
              ? <><Spinner white/> Generating…</>
              : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>Search Student</>
            }
          </button>
        </div>

        {error && (
          <div style={{ marginTop:10,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:7,padding:"8px 14px",display:"flex",alignItems:"center",gap:8 }}>
            <span>⚠️</span>
            <span style={{ color:"#dc2626",fontSize:12,fontWeight:500,flex:1 }}>{error}</span>
            <button onClick={() => setError("")} style={{ background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:18,lineHeight:1 }}>×</button>
          </div>
        )}
      </div>

      <div style={{ padding:"20px 28px" }}>

        {marksheetData && !generating && (
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10 }}>
            <div style={{ display:"flex",background:"#f1f5f9",borderRadius:8,padding:3,gap:2 }}>
              {[{key:"marksheet",label:"Marksheet"},{key:"chart",label:"Chart Marksheet"}].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding:"7px 22px", borderRadius:6, border:"none", cursor:"pointer",
                    background: activeTab===tab.key ? "#fff" : "transparent",
                    color: activeTab===tab.key ? "#1e293b" : "#64748b",
                    fontWeight: activeTab===tab.key ? 700 : 500,
                    fontSize:13, transition:"all 0.15s",
                    boxShadow: activeTab===tab.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                >{tab.label}</button>
              ))}
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button
                onClick={() => triggerPrint(marksheetData?.student_info?.name, activeTab==="marksheet" ? "printable-report" : "printable-chart-page")}
                style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:7,border:"1.5px solid #e2e8f0",background:"#fff",color:"#374151",fontWeight:600,fontSize:13,cursor:"pointer" }}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print Marksheet
              </button>
              <button
                onClick={() => triggerPrint(marksheetData?.student_info?.name, activeTab==="marksheet" ? "printable-report" : "printable-chart-page")}
                style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:7,border:"none",background:"#1e293b",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer" }}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Download PDF
              </button>
            </div>
          </div>
        )}

        {!marksheetData && !generating && (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:420,gap:14,textAlign:"center" }}>
            <div style={{ width:72,height:72,borderRadius:16,background:"#f1f5f9",border:"2px dashed #cbd5e1",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div>
              <p style={{ color:"#475569",fontWeight:700,fontSize:15,margin:0 }}>Report card will appear here</p>
              <p style={{ color:"#94a3b8",fontSize:12,margin:"4px 0 0" }}>Select class → section → student → click Search Student</p>
            </div>
          </div>
        )}

        {generating && (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:420,gap:14 }}>
            <Spinner size={48}/>
            <p style={{ color:"#475569",fontWeight:600,fontSize:14,margin:0 }}>Generating report card…</p>
          </div>
        )}

        {marksheetData && !generating && (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
            {activeTab === "marksheet" && (
              <div style={{ boxShadow:"0 4px 32px rgba(0,0,0,0.13)",borderRadius:2,overflow:"hidden" }}>
                <PrintableCard data={marksheetData} school={school}/>
              </div>
            )}
            {activeTab === "chart" && (
              <div style={{ boxShadow:"0 4px 32px rgba(0,0,0,0.13)",borderRadius:2,overflow:"hidden" }}>
                <MarksheetPreview data={marksheetData} school={school}/>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #fff; color: #374151; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
      `}</style>
    </div>
  );
};

export default MarksheetGenerator;
