import { API_BASE_URL, getAuthToken } from '../api';

// ===============================
// 1️⃣ CREATE EXAM TIMETABLE (Single Subject Entry)
// ===============================
export const createExamTimetable = async (payload) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    console.log('📤 Creating exam timetable:', payload);

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/createExamTimetable`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    console.log('📥 Create response:', data);
    return data;
  } catch (error) {
    console.error('❌ Create exam timetable error:', error);
    throw error;
  }
};

// ===============================
// 2️⃣ GET ALL EXAM TIMETABLES
// ===============================
export const getExamTimetable = async () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    console.log('📤 Fetching all exam timetables');

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getExamTimetable`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    console.log('📥 Get timetables response:', data);
    return data;
  } catch (error) {
    console.error('❌ Get exam timetables error:', error);
    throw error;
  }
};

// ===============================
// 3️⃣ UPDATE EXAM TIMETABLE
// ===============================
export const updateExamTimetable = async (payload) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    console.log('📤 Updating exam timetable:', payload);

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/updateExamTimetable`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    console.log('📥 Update response:', data);
    return data;
  } catch (error) {
    console.error('❌ Update exam timetable error:', error);
    throw error;
  }
};

// ===============================
// 4️⃣ DELETE EXAM TIMETABLE
// ===============================
export const deleteExamTimetable = async (timetableId) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    console.log('📤 Deleting exam timetable ID:', timetableId);

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/deleteExamTimetable`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timetable_id: timetableId }),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('📥 Delete response (JSON):', data);
      return data;
    } else {
      console.log('📥 Delete response (non-JSON):', await response.text());
      if (response.ok) {
        return { success: true, message: 'Exam timetable deleted successfully' };
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('❌ Delete exam timetable error:', error);
    throw error;
  }
};

// ===============================
// 5️⃣ GET ALL CLASSES
// ===============================
export const getAllClasses = async () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllClassList`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get classes error:', error);
    throw error;
  }
};

// ===============================
// 6️⃣ GET SECTIONS BY CLASS ID
// ===============================
export const getSectionsByClass = async (classId) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get sections error:', error);
    throw error;
  }
};

// ===============================
// 7️⃣ GET ALL SUBJECTS
// ===============================
export const getSubjectsByClass = async (classId) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSubjects`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get subjects error:', error);
    throw error;
  }
};

// ===============================
// 8️⃣ GET ALL EXAM TYPES
// ===============================
export const getAllExamTypes = async () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getExamTypes`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get exam types error:', error);
    throw error;
  }
};

// ===============================
// 9️⃣ GET ALL EXAMS
// ===============================
export const getAllExams = async () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getExams`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get exams error:', error);
    throw error;
  }
};
