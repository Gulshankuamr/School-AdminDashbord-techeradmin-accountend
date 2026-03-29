// src/components/timetable/PrintDownloadTimetable.jsx
import React, { useRef } from 'react';
import { Download, Printer } from 'lucide-react';

const PrintDownloadTimetable = ({ 
  timetableData, 
  selectedClass, 
  selectedSection,
  selectedDay,
  classes,
  sections,
  subjects,
  teachers,
  days
}) => {
  const printRef = useRef();

  // Helper Functions
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSubjectName = (id) => subjects.find(sub => sub.subject_id == id)?.subject_name || 'Not assigned';
  const getTeacherName = (id) => teachers.find(teach => teach.teacher_id == id)?.name || 'Not assigned';
  const getClassName = (id) => classes.find(cls => cls.class_id == id)?.class_name || 'Select Class';
  const getSectionName = (id) => sections.find(sec => sec.section_id == id)?.section_name || 'Select Section';

  // Group by Day
  const groupedByDay = timetableData.reduce((acc, period) => {
    if (!acc[period.day_of_week]) {
      acc[period.day_of_week] = [];
    }
    acc[period.day_of_week].push(period);
    return acc;
  }, {});

  // Sort periods by time
  Object.keys(groupedByDay).forEach(day => {
    groupedByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  const isDaySelected = selectedDay !== '';

  // Print Function
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const windowPrint = window.open('', '', 'width=1024,height=768');
    
    windowPrint.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timetable - ${getClassName(selectedClass)} - ${getSectionName(selectedSection)}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: 'Arial', sans-serif; 
              padding: 30px;
              color: #000;
              background: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            h1 { 
              color: #1e40af;
              font-size: 32px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            h2 { 
              color: #374151;
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 5px;
            }
            .date-info {
              color: #6b7280;
              font-size: 14px;
              margin-top: 10px;
            }
            table { 
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              background: #fff;
            }
            th, td { 
              border: 2px solid #1e40af;
              padding: 12px 15px;
              text-align: left;
              color: #000;
            }
            th { 
              background-color: #2563eb;
              color: #fff;
              font-weight: bold;
              font-size: 14px;
              text-transform: uppercase;
            }
            td {
              font-size: 13px;
            }
            tr:nth-child(even) { 
              background-color: #f3f4f6;
            }
            tr:hover {
              background-color: #e5e7eb;
            }
            .day-header {
              background-color: #dbeafe !important;
              color: #1e40af !important;
              font-weight: bold;
              font-size: 16px;
              padding: 15px;
              border: 2px solid #2563eb;
            }
            .period-card {
              margin-bottom: 15px;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 15px;
              background: #fff;
            }
            .period-subject {
              font-size: 16px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            .period-teacher {
              font-size: 14px;
              color: #374151;
              margin-bottom: 8px;
            }
            .period-time {
              font-size: 14px;
              color: #6b7280;
              font-weight: 600;
            }
            .day-section {
              margin-bottom: 30px;
            }
            .day-title {
              background: #2563eb;
              color: #fff;
              padding: 12px 20px;
              font-size: 18px;
              font-weight: bold;
              border-radius: 8px 8px 0 0;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 Class Timetable</h1>
            <h2>${getClassName(selectedClass)} - Section ${getSectionName(selectedSection)}</h2>
            <div class="date-info">Generated on: ${new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          ${printContent.innerHTML}
          <div class="footer">
            <p>© School Management System - Timetable Report</p>
            <p style="margin-top: 5px;">This is a computer-generated document and does not require a signature.</p>
          </div>
        </body>
      </html>
    `);
    
    windowPrint.document.close();
    windowPrint.focus();
    
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 300);
  };

  // Download PDF Function
  const handleDownloadPDF = () => {
    alert('💡 To download as PDF:\n\n1. Click the "Print" button\n2. In the print dialog, select "Save as PDF"\n3. Choose your destination and save\n\nThis ensures the best quality PDF output with proper formatting.');
    handlePrint();
  };

  if (!timetableData || timetableData.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg font-semibold"
        >
          <Download size={20} />
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg font-semibold"
        >
          <Printer size={20} />
          Print Timetable
        </button>
      </div>

      {/* Hidden Print Content */}
      <div ref={printRef} style={{ display: 'none' }}>
        {!isDaySelected ? (
          /* All Days View */
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Day</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                groupedByDay[day] && groupedByDay[day].length > 0 && (
                  <React.Fragment key={day}>
                    <tr>
                      <td colSpan="4" className="day-header">{day}</td>
                    </tr>
                    {groupedByDay[day].map((period) => (
                      <tr key={period.timetable_id}>
                        <td style={{ fontWeight: '600' }}>{getSubjectName(period.subject_id)}</td>
                        <td>{getTeacherName(period.teacher_id)}</td>
                        <td>{day}</td>
                        <td>{formatTime(period.start_time)} - {formatTime(period.end_time)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              ))}
            </tbody>
          </table>
        ) : (
          /* Single Day View */
          <div>
            <div className="day-title">{selectedDay}</div>
            {groupedByDay[selectedDay]?.length > 0 ? (
              groupedByDay[selectedDay].map((period) => (
                <div key={period.timetable_id} className="period-card">
                  <div className="period-subject">{getSubjectName(period.subject_id)}</div>
                  <div className="period-teacher">👨‍🏫 {getTeacherName(period.teacher_id)}</div>
                  <div className="period-time">🕐 {formatTime(period.start_time)} - {formatTime(period.end_time)}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                No classes scheduled for {selectedDay}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintDownloadTimetable;