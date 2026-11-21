import axios from 'axios';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://freedom-truck-backend.vercel.app/api'
    : 'http://localhost:5001/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('freedom_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('freedom_token');
      localStorage.removeItem('freedom_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getUsers: (params?: any) => api.get('/auth/users', { params }),
  register: (data: any) => api.post('/auth/register', data),
  updateUserStatus: (id: string, data: any) => api.put(`/auth/users/${id}/status`, data),
  acknowledgePolicy: (data: any) => api.post('/auth/acknowledge-policy', data),
};

// Customer API
export const customerApi = {
  getCustomers: (params?: any) => api.get('/customers', { params }),
  getCustomerById: (id: string) => api.get(`/customers/${id}`),
  createCustomer: (data: any) => api.post('/customers', data),
  updateCustomer: (id: string, data: any) => api.put(`/customers/${id}`, data),
};

// Vehicle API
export const vehicleApi = {
  getVehicles: (params?: any) => api.get('/vehicles', { params }),
  getVehicleById: (id: string) => api.get(`/vehicles/${id}`),
  createVehicle: (data: any) => api.post('/vehicles', data),
  updateVehicle: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
};

// Estimate API
export const estimateApi = {
  getEstimates: (params?: any) => api.get('/estimates', { params }),
  getEstimateById: (id: string) => api.get(`/estimates/${id}`),
  createEstimate: (data: any) => api.post('/estimates', data),
  reviseEstimate: (id: string, data: any) => api.put(`/estimates/${id}`, data),
  convertEstimateToRO: (id: string) => api.post(`/estimates/${id}/convert-ro`),
};

// Authorization API
export const authorizationApi = {
  createAuthorization: (data: any) => api.post('/authorizations', data),
  getByRO: (roId: string) => api.get(`/authorizations/ro/${roId}`),
};

// Deposit API
export const depositApi = {
  collectDeposit: (data: any) => api.post('/deposits', data),
  getByRO: (roId: string) => api.get(`/deposits/ro/${roId}`),
};

// Repair Order API
export const repairOrderApi = {
  getRepairOrders: (params?: any) => api.get('/repair-orders', { params }),
  getRepairOrderById: (id: string) => api.get(`/repair-orders/${id}`),
  createIntake: (data: any) => api.post('/repair-orders/intake', data),
  dispatchTechnician: (id: string, data: any) => api.post(`/repair-orders/${id}/dispatch`, data),
  updateStatus: (id: string, data: any) => api.put(`/repair-orders/${id}/status`, data),
  managerOverride: (id: string, data: any) => api.post(`/repair-orders/${id}/override`, data),
};

// Technician Worksheet API
export const technicianApi = {
  getWorksheets: (params?: any) => api.get('/technician/worksheets', { params }),
  getWorksheetById: (id: string) => api.get(`/technician/worksheets/${id}`),
  updateLighting: (id: string, data: any) => api.put(`/technician/worksheets/${id}/lighting`, data),
  updateLift: (id: string, data: any) => api.put(`/technician/worksheets/${id}/lift`, data),
  updateInspection: (id: string, data: any) => api.put(`/technician/worksheets/${id}/inspection`, data),
  updateFluids: (id: string, data: any) => api.put(`/technician/worksheets/${id}/fluids`, data),
  tech1Signoff: (id: string, data: any) => api.post(`/technician/worksheets/${id}/tech1-signoff`, data),
  qcSignoff: (id: string, data: any) => api.post(`/technician/worksheets/${id}/qc-signoff`, data),
  updateExitObservation: (id: string, data: any) => api.put(`/technician/worksheets/${id}/exit-observation`, data),
  serviceWriterRelease: (id: string, data: any) => api.post(`/technician/worksheets/${id}/service-writer-release`, data),
};

// Invoice API
export const invoiceApi = {
  getInvoices: (params?: any) => api.get('/invoices', { params }),
  getInvoiceById: (id: string) => api.get(`/invoices/${id}`),
  createFromRO: (roId: string) => api.post(`/invoices/from-ro/${roId}`),
  downloadPDFUrl: (id: string) => `${API_BASE_URL}/invoices/${id}/pdf`,
};

// Payment API
export const paymentApi = {
  processPayment: (data: any) => api.post('/payments', data),
  signOfficeReceipt: (paymentId: string, data: any) => api.post(`/payments/${paymentId}/sign-office`, data),
  getReceipt: (paymentId: string) => api.get(`/payments/receipt/${paymentId}`),
};

// Daily Cash-Up API
export const cashUpApi = {
  getCashUps: (params?: any) => api.get('/cash-up', { params }),
  getTodaySummary: () => api.get('/cash-up/today'),
  submitCashUp: (data: any) => api.post('/cash-up', data),
  managerReview: (id: string, data: any) => api.post(`/cash-up/${id}/manager-review`, data),
  downloadPDFUrl: (id: string) => `${API_BASE_URL}/cash-up/${id}/pdf`,
};

// Information Security API
export const securityApi = {
  getModifications: (params?: any) => api.get('/security/modifications', { params }),
  submitModification: (data: any) => api.post('/security/modifications', data),
  reviewModification: (id: string, data: any) => api.put(`/security/modifications/${id}/review`, data),
  implementModification: (id: string, data: any) => api.put(`/security/modifications/${id}/implement`, data),

  getChecklists: (params?: any) => api.get('/security/checklists', { params }),
  submitChecklist: (data: any) => api.post('/security/checklists', data),

  getIncidents: (params?: any) => api.get('/security/incidents', { params }),
  reportIncident: (data: any) => api.post('/security/incidents', data),
};

// Tasks API
export const taskApi = {
  getTasks: (params?: any) => api.get('/tasks', { params }),
  getTaskById: (id: string) => api.get(`/tasks/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/tasks/${id}/status`, data),
  reviewTask: (id: string, data: any) => api.post(`/tasks/${id}/review`, data),
  addComment: (id: string, data: any) => api.post(`/tasks/${id}/comments`, data),
};

// Reports API
export const reportApi = {
  getDashboardStats: () => api.get('/reports/dashboard-stats'),
  getFinancialSummary: (params?: any) => api.get('/reports/financial-summary', { params }),
  getAuditTrail: (params?: any) => api.get('/reports/audit-trail', { params }),
};

// Settings & Markup API
export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/settings', data),
  updateMarkupMatrix: (data: any) => api.put('/settings/markup-matrix', data),
  calculatePrice: (data: any) => api.post('/settings/calculate-price', data),
};

// Notifications API
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
