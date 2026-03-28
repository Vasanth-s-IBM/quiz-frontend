/**
 * API service layer
 * All backend API calls organized by feature
 */
import axiosInstance from './axios';

/* =====================
   AUTH APIs
   ===================== */
export const authAPI = {
  login: (email: string, password: string) =>
    axiosInstance.post('/auth/login', { email, password }),
};

/* =====================
   TOPIC APIs
   ===================== */
export const topicAPI = {
  getAll: () => axiosInstance.get('/topics/'),
  create: (name: string) => axiosInstance.post('/topics/', { name }),
  update: (topicId: number, data: { name: string }) =>
    axiosInstance.put(`/topics/${topicId}`, data),
};

/* =====================
   QUESTION APIs
   ===================== */
export const questionAPI = {
  create: (data: any) => axiosInstance.post('/questions/', data),
  getByTopic: (topicId: number) =>
    axiosInstance.get(`/questions/topic/${topicId}`),
  update: (questionId: number, data: any) =>
    axiosInstance.put(`/questions/${questionId}`, data),
};

/* =====================
   EXAM APIs  ✅ RESTORED
   ===================== */
export const examAPI = {
  start: (topic_id: number) =>
    axiosInstance.post('/exam/start', { topic_id }),
  submit: (data: any) =>
    axiosInstance.post('/exam/submit', data),
};

/* =====================
   ADMIN APIs
   ===================== */
export const adminAPI = {
  getDashboard: () => axiosInstance.get('/admin/dashboard'),
  getUsers: () => axiosInstance.get('/admin/users'),
  createUser: (data: any) => axiosInstance.post('/admin/users', data),
  updateUser: (userId: number, data: any) =>
    axiosInstance.put(`/admin/users/${userId}`, data),
  deactivateUser: (userId: number) =>
    axiosInstance.delete(`/admin/users/${userId}`),
  getResults: () => axiosInstance.get('/admin/results'),
  getUserResults: (userId: number) =>
    axiosInstance.get(`/admin/results/user/${userId}`),
  updateCertificateStatus: (scoreId: number, status: string) =>
    axiosInstance.put(`/admin/results/${scoreId}/status`, { status }),
  getProctoringConfig: () => axiosInstance.get('/admin/proctor-config'),
  updateProctoringConfig: (data: any) => axiosInstance.put('/admin/proctor-config', data),
};

/* =====================
   USER APIs
   ===================== */
export const userAPI = {
  getProfile: () => axiosInstance.get('/user/profile'),
  downloadCertificate: (scoreId: number) =>
    axiosInstance.get(`/user/certificate/download/${scoreId}`, { responseType: 'blob' }),
};

/* =====================
   CERTIFICATE APIs
   ===================== */
export const certificateAPI = {
  publish: (user_score_id: number) =>
    axiosInstance.post('/certificate/publish', { user_score_id }),
};

/* =====================
   PROCTOR APIs
   ===================== */
export const proctorAPI = {
  getConfig: () => axiosInstance.get('/proctor/config'),
};
