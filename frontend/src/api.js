import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Only redirect if we're NOT on the login/register endpoints
      const url = err.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('fleetflow_token');
        localStorage.removeItem('fleetflow_user');
        window.location.href = '/landing';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const getMeAPI = () => API.get('/auth/me');

// Vehicles
export const getVehiclesAPI = (params) => API.get('/vehicles', { params });
export const getVehicleAPI = (id) => API.get(`/vehicles/${id}`);
export const createVehicleAPI = (data) => API.post('/vehicles', data);
export const updateVehicleAPI = (id, data) => API.put(`/vehicles/${id}`, data);
export const deleteVehicleAPI = (id) => API.delete(`/vehicles/${id}`);

// Drivers
export const getDriversAPI = (params) => API.get('/drivers', { params });
export const getDriverAPI = (id) => API.get(`/drivers/${id}`);
export const createDriverAPI = (data) => API.post('/drivers', data);
export const updateDriverAPI = (id, data) => API.put(`/drivers/${id}`, data);
export const deleteDriverAPI = (id) => API.delete(`/drivers/${id}`);

// Trips
export const getTripsAPI = (params) => API.get('/trips', { params });
export const createTripAPI = (data) => API.post('/trips', data);
export const updateTripAPI = (id, data) => API.put(`/trips/${id}`, data);
export const deleteTripAPI = (id) => API.delete(`/trips/${id}`);

// Maintenance
export const getMaintenanceAPI = (params) => API.get('/maintenance', { params });
export const createMaintenanceAPI = (data) => API.post('/maintenance', data);
export const updateMaintenanceAPI = (id, data) => API.put(`/maintenance/${id}`, data);
export const deleteMaintenanceAPI = (id) => API.delete(`/maintenance/${id}`);

// Expenses
export const getExpensesAPI = (params) => API.get('/expenses', { params });
export const createExpenseAPI = (data) => API.post('/expenses', data);
export const updateExpenseAPI = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpenseAPI = (id) => API.delete(`/expenses/${id}`);

// Analytics
export const getDashboardAPI = (params) => API.get('/analytics/dashboard', { params });
export const getAnalyticsAPI = () => API.get('/analytics/analytics');

export default API;
