import React, { useState, useEffect } from 'react';
import { Printer, Download, ArrowLeft } from 'lucide-react';

const PrintMarksheet = () => {
  const [studentData, setStudentData] = useState({
    studentName: 'Johnathan Doe',
    rollNumber: '2024-SEC-0105',
    class: 'Grade 10 - Section B',
    examDate: 'October 15, 2024',
    guardianName: 'Richard Doe',
    attendance: '94.5% (Excellent)',
    subjects: [
      { name: 'English Language & Literature', maxMarks: 100, minPass: 33, obtained: 88, result: 'Pass' },
      { name: 'Mathematics (Advanced)', maxMarks: 100, minPass: 33, obtained: 85, result: 'Pass' },
      { name: 'Physical Science', maxMarks: 100, minPass: 33, obtained: 82, result: 'Pass' },
      { name: 'Information Technology', maxMarks: 100, minPass: 33, obtained: 80, result: 'Pass' },
      { name: 'Social Science', maxMarks: 100, minPass: 33, obtained: 87, result: 'Pass' }
    ],
    total: 500,
    obtainedTotal: 450,
    aggregate: 90.00,
    grade: 'A+',
    result: 'PROMOTED',
    rank: 2
  });

  // Load data from localStorage and find specific student
  useEffect(() => {
    const savedMarks = localStorage.getItem('examMarks');
    if (savedMarks) {
      const parsed = JSON.parse(savedMarks);
      // You can modify this to load a specific student's data
      // For now, using static data as shown in the UI
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('marksheet-content');
    // You can implement PDF generation here
    alert('PDF download functionality will be implemented with a library like jspdf');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Printer size={20} />
            Print
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download size={20} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Marksheet */}
      <div id="marksheet-content" className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* School Header */}
        <div className="bg-blue-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">EXCEL INTERNATIONAL SCHOOL</h1>
          <p className="text-sm">123 Education Lane, Academic District, City Center - 400012</p>
          <p className="text-sm">Contact: +1 234 567 890 | Website: www.excel-international.edu</p>
        </div>

        {/* Exam Title */}
        <div className="border-b p-6 text-center">
          <h2 className="text-2xl font-bold">HALF YEARLY EXAMINATION 2024-25</h2>
          <p className="text-gray-600">ACADEMIC PROGRESS REPORT</p>
        </div>

        {/* Student Info */}
        <div className="p-6 grid grid-cols-2 gap-4 border-b">
          <div>
            <p className="text-sm text-gray-600">STUDENT NAME</p>
            <p className="font-bold text-lg">{studentData.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ROLL NUMBER</p>
            <p className="font-bold text-lg">{studentData.rollNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">CLASS SECTION</p>
            <p className="font-bold">{studentData.class}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">DATE OF EXAMINATION</p>
            <p className="font-bold">{studentData.examDate}</p>
          </div>
        </div>

        {/* Guardian & Attendance */}
        <div className="p-6 grid grid-cols-2 gap-4 border-b bg-gray-50">
          <div>
            <p className="text-sm text-gray-600">NAME OF GUARDIAN</p>
            <p className="font-bold">{studentData.guardianName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ATTENDANCE STATUS</p>
            <p className="font-bold text-green-600">{studentData.attendance}</p>
          </div>
        </div>

        {/* Marks Table */}
        <div className="p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">SUBJECT NAME</th>
                <th className="border p-3 text-center">MAX MARKS</th>
                <th className="border p-3 text-center">MIN PASS</th>
                <th className="border p-3 text-center">MARKS OBTAINED</th>
                <th className="border p-3 text-center">RESULT</th>
              </tr>
            </thead>
            <tbody>
              {studentData.subjects.map((subject, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-3">{subject.name}</td>
                  <td className="border p-3 text-center">{subject.maxMarks}</td>
                  <td className="border p-3 text-center">{subject.minPass}</td>
                  <td className="border p-3 text-center font-semibold">{subject.obtained}</td>
                  <td className="border p-3 text-center">
                    <span className={`px-2 py-1 rounded ${
                      subject.result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {subject.result}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="border p-3" colSpan="2">OVERALL TOTAL</td>
                <td className="border p-3 text-center">{studentData.total}</td>
                <td className="border p-3 text-center">{studentData.obtainedTotal}</td>
                <td className="border p-3 text-center">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Results Summary */}
        <div className="p-6 grid grid-cols-4 gap-4 border-t bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600">AGGREGATE SCORE</p>
            <p className="text-2xl font-bold text-blue-600">{studentData.aggregate}%</p>
            <p className="text-sm font-semibold">{studentData.grade} Grade</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">FINAL RESULT</p>
            <p className="text-xl font-bold text-green-600">{studentData.result}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">RANK IN CLASS</p>
            <p className="text-2xl font-bold text-purple-600">{studentData.rank}</p>
            <p className="text-sm">Position</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">TOTAL STUDENTS</p>
            <p className="text-2xl font-bold">48</p>
          </div>
        </div>

        {/* Signatures */}
        <div className="p-6 grid grid-cols-2 gap-4 border-t">
          <div className="text-center">
            <p className="border-t border-gray-300 pt-2 mt-8">CLASS TEACHER'S SIGNATURE</p>
          </div>
          <div className="text-center">
            <p className="border-t border-gray-300 pt-2 mt-8">PRINCIPAL'S SIGNATURE</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-3 text-center text-xs text-gray-600">
          This is a computer generated marksheet - valid without signature
        </div>
      </div>
    </div>
  );
};

export default PrintMarksheet;