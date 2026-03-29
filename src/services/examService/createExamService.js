import { API_BASE_URL, getAuthToken } from '../api';

export const createExam = async (payload) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/schooladmin/createExam`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    throw new Error('Session expired');
  }

  return await response.json();
};

export const getAllExams = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/schooladmin/getExams`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    throw new Error('Session expired');
  }

  return await response.json();
};

// API expects exam_id in the BODY → PUT /schooladmin/updateExam
export const updateExam = async (examId, payload) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const bodyPayload = { exam_id: examId, ...payload };

  console.log(`📤 PUT ${API_BASE_URL}/schooladmin/updateExam`, bodyPayload);

  const response = await fetch(`${API_BASE_URL}/schooladmin/updateExam`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    throw new Error('Session expired');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    console.log('📥 Update response:', data);
    return data;
  } else {
    const text = await response.text();
    console.log('📥 Update response (non-JSON):', text);
    if (response.ok) return { success: true, message: 'Exam updated successfully' };
    throw new Error(`Update failed with status: ${response.status}`);
  }
};

export const deleteExam = async (examId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  console.log('📤 Sending delete request for exam ID:', examId);

  const response = await fetch(`${API_BASE_URL}/schooladmin/deleteExam`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ exam_id: examId }),
  });

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
    const text = await response.text();
    console.log('📥 Delete response (non-JSON):', text);
    if (response.ok) return { success: true, message: 'Exam deleted successfully' };
    throw new Error(`Delete failed with status: ${response.status}`);
  }
};