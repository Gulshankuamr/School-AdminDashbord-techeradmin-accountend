import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Calendar, BookOpen, User, Clock, ArrowLeft } from 'lucide-react';
import timetableService from '../../services/timetableService/timetableService';
import { useToast } from '../../components/ui/toast';
import { useNavigate } from 'react-router-dom'


const CreateTimetable = ({ onSaveSuccess }) => {



  const navigate = useNavigate()
  
  const { ToastContainer, success, error } = useToast();
  
  // State Management
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [periods, setPeriods] = useState([]);
  
  const [loading, setLoading] = useState({
    initial: false,
    sections: false,
    saving: false
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load Initial Data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        timetableService.getAllClasses(),
        timetableService.getAllSubjects(),
        timetableService.getAllTeachers()
      ]);

      if (classesRes.success) setClasses(classesRes.data || []);
      if (subjectsRes.success) setSubjects(subjectsRes.data || []);
      if (teachersRes.success) setTeachers(teachersRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  // Load Sections when Class changes
  useEffect(() => {
    if (selectedClass) {
      loadSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedClass]);

  const loadSections = async (classId) => {
    try {
      setLoading(prev => ({ ...prev, sections: true }));
      const response = await timetableService.getSectionsByClass(classId);
      if (response.success) {
        setSections(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load sections:', err);
    } finally {
      setLoading(prev => ({ ...prev, sections: false }));
    }
  };

  // Check for duplicate period in current form
  const checkDuplicatePeriod = (newPeriod, existingPeriods) => {
    return existingPeriods.some(p => 
      p.day_of_week === newPeriod.day_of_week &&
      p.start_time === newPeriod.start_time &&
      p.end_time === newPeriod.end_time
    );
  };

  // Check time conflict with existing timetable in database
  const checkTimeConflict = async (period) => {
    try {
      const conflictCheck = await timetableService.checkTimetableConflict({
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        day_of_week: period.day_of_week,
        start_time: period.start_time + ':00',
        end_time: period.end_time + ':00'
      });

      if (conflictCheck.exists) {
        return {
          hasConflict: true,
          message: `Time slot conflicts with existing timetable for ${conflictCheck.data.subject_name} with ${conflictCheck.data.teacher_name}`
        };
      }
      return { hasConflict: false, message: '' };
    } catch (err) {
      console.error('Error checking conflict:', err);
      return { hasConflict: false, message: 'Error checking conflict' };
    }
  };

  // Add New Period
  const handleAddPeriod = async () => {
    if (!selectedClass || !selectedSection) {
      error('Please select class and section first');
      return;
    }

    const lastPeriod = periods[periods.length - 1];
    let nextStart = '09:00';
    let nextEnd = '09:45';
    
    if (lastPeriod && lastPeriod.end_time) {
      const [hours, minutes] = lastPeriod.end_time.split(':');
      const endHour = parseInt(hours);
      const endMin = parseInt(minutes);
      
      nextStart = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      let newEndMin = endMin + 45;
      let newEndHour = endHour;
      if (newEndMin >= 60) {
        newEndMin -= 60;
        newEndHour += 1;
      }
      nextEnd = `${newEndHour.toString().padStart(2, '0')}:${newEndMin.toString().padStart(2, '0')}`;
    }

    const newPeriod = {
      id: Date.now() + Math.random(),
      subject_id: '',
      teacher_id: '',
      day_of_week: 'Monday',
      start_time: nextStart,
      end_time: nextEnd
    };

    // Check for duplicate in current form
    if (checkDuplicatePeriod(newPeriod, periods)) {
      error('Duplicate period detected in current form');
      return;
    }

    // Check for conflict with existing timetable
    const conflictResult = await checkTimeConflict(newPeriod);
    if (conflictResult.hasConflict) {
      error(conflictResult.message);
      return;
    }

    setPeriods([...periods, newPeriod]);
  };

  // Remove Period
  const handleRemovePeriod = (id) => {
    if (periods.length === 1) {
      if (window.confirm('Remove the last period?')) {
        setPeriods([]);
      }
      return;
    }
    setPeriods(periods.filter(p => p.id !== id));
  };

  // Update Period Field
  const handlePeriodChange = async (id, field, value) => {
    const updatedPeriods = periods.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    
    // Check for duplicate if time-related fields are changed
    if (field === 'day_of_week' || field === 'start_time' || field === 'end_time') {
      const changedPeriod = updatedPeriods.find(p => p.id === id);
      const otherPeriods = updatedPeriods.filter(p => p.id !== id);
      
      if (checkDuplicatePeriod(changedPeriod, otherPeriods)) {
        error('Duplicate period detected in current form');
        return;
      }

      // Check conflict with existing timetable
      if (changedPeriod.start_time && changedPeriod.end_time) {
        const conflictResult = await checkTimeConflict(changedPeriod);
        if (conflictResult.hasConflict) {
          error(conflictResult.message);
          return;
        }
      }
    }
    
    setPeriods(updatedPeriods);
  };

  // Validation
  const validatePeriods = () => {
    if (!selectedClass) {
      error('Please select a class');
      return false;
    }

    if (!selectedSection) {
      error('Please select a section');
      return false;
    }

    if (periods.length === 0) {
      error('Please add at least one period');
      return false;
    }

    const emptyField = periods.find(p => 
      !p.subject_id || !p.teacher_id || !p.start_time || !p.end_time
    );

    if (emptyField) {
      error('Please fill all fields for each period');
      return false;
    }

    const timeError = periods.find(p => p.start_time >= p.end_time);
    if (timeError) {
      error('End time must be after start time for all periods');
      return false;
    }

    return true;
  };

  // Save Timetable
  const handleSaveTimetable = async () => {
    if (!validatePeriods()) return;

    try {
      setLoading(prev => ({ ...prev, saving: true }));

      const results = [];
      const failedPeriods = [];
      
      for (const period of periods) {
        try {
          const timetableData = {
            class_id: parseInt(selectedClass),
            section_id: parseInt(selectedSection),
            subject_id: parseInt(period.subject_id),
            teacher_id: parseInt(period.teacher_id),
            day_of_week: period.day_of_week,
            start_time: period.start_time + ':00',
            end_time: period.end_time + ':00'
          };

          const result = await timetableService.createTimetable(timetableData);
          results.push(result);
          
          if (!result.success) {
            failedPeriods.push({
              period,
              error: result.message
            });
          }
        } catch (err) {
          failedPeriods.push({
            period,
            error: err.message
          });
        }
      }
      
      const successfulCount = results.filter(r => r.success).length;
      const failedCount = failedPeriods.length;
      
      if (failedCount === 0) {
        success(`✅ Timetable created successfully! ${successfulCount} periods added.`);
        
        // Clear periods but keep class and section selected
        setPeriods([]);
        
        // Auto-add new empty row for continued entry
        setTimeout(() => {
          handleAddPeriod();
        }, 100);
      } else {
        // Show detailed error for failed periods
        const errorMessages = failedPeriods.map(fp => 
          `Period ${fp.period.day_of_week} ${fp.period.start_time}-${fp.period.end_time}: ${fp.error}`
        ).join('\n');
        
        error(`Failed to add ${failedCount} period(s):\n${errorMessages}`);
      }
    } catch (err) {
      console.error('Error creating timetable:', err);
      error('Failed to create timetable: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Helper Functions
  const getClassName = (id) => {
    const cls = classes.find(c => c.class_id == id);
    return cls ? cls.class_name : 'Select Class';
  };

  const getSectionName = (id) => {
    const sec = sections.find(s => s.section_id == id);
    return sec ? sec.section_name : 'Select Section';
  };

  return (
    <div className="p-6">
      <ToastContainer />
      
      {/* Class Selection */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
        {/* <h3 className="text-lg font-bold mb-4 text-black">Select Class & Section</h3> */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/timetable/view')}
            className="p-2 hover:bg-white rounded-lg transition shadow-sm bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 left-end" />
          </button>
         <div>
  <h1 className="text-4xl font-bold text-gray-900">
    Add Class Timetable
  </h1>
  <p className="text-gray-600 mt-1">
    Add period-wise schedule for the selected class and section
  </p>
</div>

        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
              disabled={loading.initial}
            >
              <option value="" className="text-black">Select Class</option>
              {classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id} className="text-black">
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
              disabled={!selectedClass || loading.sections}
            >
              <option value="" className="text-black">Select Section</option>
              {sections.map(sec => (
                <option key={sec.section_id} value={sec.section_id} className="text-black">
                  {sec.section_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Periods Management */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-black">Periods</h3>
          <button
            onClick={handleAddPeriod}
            disabled={!selectedClass || !selectedSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Period
          </button>
        </div>

        {periods.length === 0 ? (
          <div className="text-center py-8 text-black border-2 border-dashed border-gray-300 rounded-lg">
            No periods added yet. Click "Add Period" to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-black font-bold">#</th>
                  <th className="px-4 py-2 text-left text-black font-bold">Subject</th>
                  <th className="px-4 py-2 text-left text-black font-bold">Teacher</th>
                  <th className="px-4 py-2 text-left text-black font-bold">Day</th>
                  <th className="px-4 py-2 text-left text-black font-bold">Start Time</th>
                  <th className="px-4 py-2 text-left text-black font-bold">End Time</th>
                  <th className="px-4 py-2 text-center text-black font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period, idx) => (
                  <tr key={period.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-black font-medium">{idx + 1}</td>
                    
                    <td className="px-4 py-3">
                      <select
                        value={period.subject_id}
                        onChange={(e) => handlePeriodChange(period.id, 'subject_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white"
                      >
                        <option value="" className="text-black">Select Subject</option>
                        {subjects.map(s => (
                          <option key={s.subject_id} value={s.subject_id} className="text-black">
                            {s.subject_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="px-4 py-3">
                      <select
                        value={period.teacher_id}
                        onChange={(e) => handlePeriodChange(period.id, 'teacher_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white"
                      >
                        <option value="" className="text-black">Select Teacher</option>
                        {teachers.map(t => (
                          <option key={t.teacher_id} value={t.teacher_id} className="text-black">
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="px-4 py-3">
                      <select
                        value={period.day_of_week}
                        onChange={(e) => handlePeriodChange(period.id, 'day_of_week', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white"
                      >
                        {days.map(d => (
                          <option key={d} value={d} className="text-black">{d}</option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={period.start_time}
                        onChange={(e) => handlePeriodChange(period.id, 'start_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                    </td>
                    
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={period.end_time}
                        onChange={(e) => handlePeriodChange(period.id, 'end_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemovePeriod(period.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Remove period"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSaveTimetable}
          disabled={!selectedClass || !selectedSection || periods.length === 0 || loading.saving}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading.saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Timetable ({periods.length} periods)
            </>
          )}
        </button>
      </div>

      {/* Summary Stats */}
      {periods.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <h4 className="font-bold text-black mb-3">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{periods.length}</div>
              <div className="text-sm text-black">Total Periods</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {new Set(periods.map(p => p.day_of_week)).size}
              </div>
              <div className="text-sm text-black">Days</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {new Set(periods.map(p => p.subject_id).filter(Boolean)).size}
              </div>
              <div className="text-sm text-black">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {new Set(periods.map(p => p.teacher_id).filter(Boolean)).size}
              </div>
              <div className="text-sm text-black">Teachers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTimetable;