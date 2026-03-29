import { API_BASE_URL, getAuthToken } from "../api";

const marksheetService = {

  // ===============================
  // 1️⃣ GET SCHOOL PROFILE
  // ===============================
  getSchoolProfile: async () => {
    const token = getAuthToken();
    if (!token) throw new Error("Token missing");

    const res = await fetch(`${API_BASE_URL}/schooladmin/getSchoolAdminProfile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("API returned non-JSON response");
    }

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to load school profile");
    }

    const d = json.data || {};

    return {
      school_name: d.school_name || "",
      school_email: d.school_email || "",
      school_phone_number: d.school_phone_number || "",
      school_address: d.school_address || "",
    };
  },

  // ===============================
  // 2️⃣ GET ALL CLASSES
  // ===============================
  getAllClasses: async () => {
    const token = getAuthToken();
    if (!token) throw new Error("Token missing");

    const res = await fetch(`${API_BASE_URL}/schooladmin/getAllClasses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("API returned non-JSON response");
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load classes");
    }

    return data.data || [];
  },

  // ===============================
  // 3️⃣ GET SECTIONS BY CLASS
  // ===============================
  getSectionsByClass: async (classId) => {
    const token = getAuthToken();
    if (!token) throw new Error("Token missing");

    const res = await fetch(
      `${API_BASE_URL}/schooladmin/getAllSections?class_id=${classId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("API returned non-JSON response");
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load sections");
    }

    return data.data || [];
  },

  // ===============================
  // 4️⃣ GET STUDENTS BY CLASS & SECTION
  // ===============================
  getStudentsByClassAndSection: async (classId, sectionId) => {
    const token = getAuthToken();
    if (!token) throw new Error("Token missing");

    const res = await fetch(
      `${API_BASE_URL}/schooladmin/getTotalStudentsListBySchoolId?class_id=${classId}&section_id=${sectionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("API returned non-JSON response");
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load students");
    }

    return data.data || [];
  },

  // ===============================
  // 5️⃣ GENERATE MARKSHEET
  // ===============================
  generateMarksheet: async (studentId, academicYear) => {
    const token = getAuthToken();
    if (!token) throw new Error("Token missing");

    const res = await fetch(
      `${API_BASE_URL}/schooladmin/generateMarksheet?student_id=${studentId}&academic_year=${academicYear}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("API returned non-JSON response");
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to generate marksheet");
    }

    return data.data || {};
  },
};

export default marksheetService;