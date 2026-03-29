
import { API_BASE_URL, getAuthToken } from '../api.js';

const timetableService = {
  // ============ CREATE TIMETABLE ============
  createTimetable: async (timetableData) => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication token missing' };
    }

    try {
      console.log('Creating timetable with data:', timetableData);
      
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/createTimetable`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(timetableData),
        }
      );

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Create timetable error:', error);
      throw error;
    }
  },

  // ============ GET TIMETABLE BY CLASS & SECTION ============
  getTimetable: async (classId, sectionId) => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication token missing' };
    }

    try {
      console.log(`Fetching timetable for class: ${classId}, section: ${sectionId}`);
      
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getTimetable?class_id=${classId}&section_id=${sectionId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get timetable error:', error);
      throw error;
    }
  },

  // ============ UPDATE TIMETABLE ============
  updateTimetable: async (timetableId, timetableData) => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication token missing' };
    }

    try {
      console.log('Updating timetable:', timetableId, timetableData);
      
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/updateTimetable`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timetable_id: timetableId,
            ...timetableData
          }),
        }
      );

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Update timetable error:', error);
      throw error;
    }
  },

  // ============ DELETE TIMETABLE ============
  deleteTimetable: async (timetableId) => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication token missing' };
    }

    try {
      console.log('Deleting timetable:', timetableId);
      
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/deleteTimetable`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timetable_id: timetableId,
          }),
        }
      );

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Delete timetable error:', error);
      throw error;
    }
  },

  // ============ GET ALL CLASSES ============
  getAllClasses: async () => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication token missing' };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllClassList`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get all classes error:', error);
      throw error;
    }
  },

  // ============ GET SECTIONS BY CLASS ============
  getSectionsByClass: async (classId) => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication token missing' };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get sections error:', error);
      throw error;
    }
  },

  // ============ GET ALL SUBJECTS ============
  getAllSubjects: async () => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication token missing' };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getAllSubjects`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get all subjects error:', error);
      throw error;
    }
  },

  // ============ GET ALL TEACHERS ============
  getAllTeachers: async () => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication token missing' };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getTotalTeachersListBySchoolId`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get all teachers error:', error);
      throw error;
    }
  }
};


export default timetableService;