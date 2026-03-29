import { getAuthToken, API_BASE_URL } from '../api';

const feePaymentService = {

  // ===============================
  // 1️⃣ GET ALL STUDENTS
  // ===============================
  getAllStudents: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalStudentsListBySchoolId`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch students');
    return data;
  },

  // ===============================
  // 2️⃣ GET STUDENT FEES
  // ===============================
  getStudentFees: async (studentId, academicYear = '2026-27') => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getStudentFees?academic_year=${academicYear}&student_id=${studentId}`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            data: {
              student_info: null,
              current_academic_year: academicYear,
              fee_breakdown: [],
              transport_fee_breakdown: [],   // ✅ transport added
              payment_history: [],
              summary: {
                current_year: { total: 0, paid: 0, pending: 0, fine: 0 },
                previous_pending: 0,
                previous_fine: 0,
                grand_total_pending: 0,
                grand_total_fine: 0,
              },
            },
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('getStudentFees response:', data);
      return data;
    } catch (error) {
      console.error('getStudentFees error:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // ===============================
  // 3️⃣ COLLECT FEE PAYMENT (Offline/Manual)
  //    ✅ Now supports transport_installment_ids
  // ===============================
  collectFeePayment: async (paymentData) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const requestData = {
      student_id:                paymentData.student_id,
      installment_ids:           paymentData.installment_ids           || [],
      transport_installment_ids: paymentData.transport_installment_ids || [],  // ✅ NEW
      payment_mode:              paymentData.payment_mode,
      transaction_ref:           paymentData.transaction_ref || null,
      payment_gateway:           'offline',
      remarks:                   paymentData.remarks || '',
    };

    console.log('collectFeePayment payload:', requestData);

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/collectFeePayment`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify(requestData),
      }
    );

    const data = await response.json();
    console.log('collectFeePayment response:', data);

    if (!response.ok || !data || data.success !== true) {
      throw new Error(data?.message || `Payment failed with status: ${response.status}`);
    }

    return data;
  },

  // ===============================
  // 4️⃣ GET ALL CLASSES
  // ===============================
  getAllClasses: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllClasses`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch classes');
    return data;
  },

  // ===============================
  // 5️⃣ GET ALL SECTIONS BY CLASS ID
  // ===============================
  getAllSections: async (classId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data || data.success !== true) throw new Error(data?.message || 'Failed to fetch sections');

    const sectionNames = (data.data || []).map((s) => s.section_name).filter(Boolean);
    return { ...data, sectionNames };
  },

  // ===============================
  // 6️⃣ DISCONTINUE FEE
  // ===============================
  discontinueFee: async (payload) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    const response = await fetch(
      `${API_BASE_URL}/schooladmin/discontinueFee`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log('discontinueFee response:', data);

    if (!response.ok || !data.success) {
      throw new Error(data?.message || 'Failed to discontinue fee');
    }

    return data;
  },

  // ===============================
  // 7️⃣ GET SCHOOL ADMIN PROFILE
  // ===============================
  getSchoolProfile: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token missing');

    try {
      const response = await fetch(
        `${API_BASE_URL}/schooladmin/getSchoolAdminProfile`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('getSchoolProfile response:', data);

      if (data?.success) {
        const profile = data?.data?.school || data?.data || data?.school || {};
        return {
          success: true,
          profile: {
            school_name:  profile.school_name  || profile.name            || 'School',
            address:      profile.address      || profile.school_address   || '',
            city:         profile.city         || '',
            state:        profile.state        || '',
            pincode:      profile.pincode      || profile.pin_code         || '',
            phone:        profile.phone        || profile.contact_no       || profile.mobile || '',
            email:        profile.email        || profile.school_email     || '',
            website:      profile.website      || '',
            logo_url:     profile.logo_url     || profile.logo             || null,
            admin_name:   profile.admin_name   || data?.data?.name         || '',
          },
        };
      }

      return { success: false, profile: null };
    } catch (error) {
      console.error('getSchoolProfile error:', error);
      return { success: false, profile: null };
    }
  },
};

export default feePaymentService;