import apiClient from '../axiosClient';
import { API_ENDPOINTS } from '../endpoints';

export const authApi = {
  // --- Customer Authentication ---
  customer: {
    // 1. Registration OTPs
    sendRegistrationOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.SEND_REGISTRATION_OTP, data),

    verifyRegistrationOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.VERIFY_REGISTRATION_OTP, data),

    // 2. Dedicated Email OTP
    sendEmailOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.SEND_EMAIL_OTP, data),

    verifyEmailOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.VERIFY_EMAIL_OTP, data),

    // 3. Dedicated Mobile OTP
    sendMobileOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.SEND_MOBILE_OTP, data),

    verifyMobileOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.VERIFY_MOBILE_OTP, data),

    // 4. Resend email OTP
    resendEmailOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.RESEND_EMAIL_OTP, data),

    // Resend mobile OTP
    resendMobileOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.RESEND_MOBILE_OTP, data),

    // 5. Update unverified contact details
    updateUnverifiedContact: (data) =>
      apiClient.put(API_ENDPOINTS.AUTH.CUSTOMER.UPDATE_UNVERIFIED_CONTACT, data),

    // 5. Final Register Customer
    register: (userData) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.REGISTER, userData),

    // 6. Forgot Password
    forgotPassword: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.FORGOT_PASSWORD, data),

    // 7. Reset Password
    resetPassword: (token, data) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.RESET_PASSWORD(token), data),

    // 8. Login & Me
    login: (credentials) =>
      apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER.LOGIN, credentials),

    getMe: () =>
      apiClient.get(API_ENDPOINTS.AUTH.CUSTOMER.ME),
  },

  // --- Business Authentication ---
  business: {
    // 1. Send Email OTP
    sendEmailOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.SEND_EMAIL_OTP, data),

    // 2. Verify Email OTP
    verifyEmailOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.VERIFY_EMAIL_OTP, data),

    // 3. Send Mobile OTP
    sendMobileOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.SEND_MOBILE_OTP, data),

    // 4. Verify Mobile OTP
    verifyMobileOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.VERIFY_MOBILE_OTP, data),

    // 5. Register Business
    register: (userData) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.REGISTER, userData),

    // 6. Resend Email OTP
    resendEmailOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.RESEND_EMAIL_OTP, data),

    // Resend Mobile OTP
    resendMobileOtp: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.RESEND_MOBILE_OTP, data),

    // 7. Update Unverified Contact
    updateUnverifiedContact: (data) =>
      apiClient.put(API_ENDPOINTS.AUTH.BUSINESS.UPDATE_UNVERIFIED_CONTACT, data),

    // 8. Forgot Password
    forgotPassword: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.FORGOT_PASSWORD, data),

    // 9. Reset Password
    resetPassword: (token, data) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.RESET_PASSWORD(token), data),

    // 10. Login & Profile
    login: (credentials) =>
      apiClient.post(API_ENDPOINTS.AUTH.BUSINESS.LOGIN, credentials),

    getMe: () =>
      apiClient.get(API_ENDPOINTS.AUTH.BUSINESS.ME),
  },

  // --- Dynamic Universal Helpers ---
  signup: (userData, role = 'customer') => {
    if (role === 'business') {
      return authApi.business.register(userData);
    }
    return authApi.customer.register(userData);
  },

  sendEmailOtp: (data, role = 'customer') => {
    if (role === 'business') {
      return authApi.business.sendEmailOtp(data);
    }
    return authApi.customer.sendEmailOtp(data);
  },

  verifyEmailOtp: (data, role = 'customer') => {
    if (role === 'business') {
      return authApi.business.verifyEmailOtp(data);
    }
    return authApi.customer.verifyEmailOtp(data);
  },

  resendEmailOtp: (data, role = 'customer') => {
    if (role === 'business') {
      return authApi.business.resendEmailOtp(data);
    }
    return authApi.customer.resendEmailOtp(data);
  },

  sendMobileOtp: (data, role = 'customer') => {
    if (role === 'business') {
      return authApi.business.sendMobileOtp(data);
    }
    return authApi.customer.sendMobileOtp(data);
  },

  verifyMobileOtp: (data, role = 'customer') => {
    if (role === 'business') {
      return authApi.business.verifyMobileOtp(data);
    }
    return authApi.customer.verifyMobileOtp(data);
  },

  resendMobileOtp: (data, role = 'customer') => {
    if (role === 'business') {
      return authApi.business.resendMobileOtp(data);
    }
    return authApi.customer.resendMobileOtp(data);
  },

  login: (credentials, role = 'customer') => {
    if (role === 'business') {
      return authApi.business.login(credentials);
    }
    return authApi.customer.login(credentials);
  },

  getRoles: () => apiClient.get(API_ENDPOINTS.ROLES),

  logout: async () => {
    try {
      // Call backend logout endpoint (token is automatically added by apiClient request interceptor)
      await apiClient.post(API_ENDPOINTS.USER.LOGOUT);
    } catch (error) {
      // In case network or token already invalid, log error and proceed to clear local state
      console.warn('Logout API call error:', error?.message || error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    }
  },
};

