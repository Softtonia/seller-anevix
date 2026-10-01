export const API_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    CUSTOMER: {
      REGISTER: '/auth/customer/register',
      SEND_REGISTRATION_OTP: '/auth/customer/send-registration-otp',
      VERIFY_REGISTRATION_OTP: '/auth/customer/verify-registration-otp',
      SEND_EMAIL_OTP: '/auth/customer/send-email-otp',
      VERIFY_EMAIL_OTP: '/auth/customer/verify-email-otp',
      SEND_MOBILE_OTP: '/auth/customer/send-mobile-otp',
      VERIFY_MOBILE_OTP: '/auth/customer/verify-mobile-otp',
      RESEND_EMAIL_OTP: '/auth/customer/resend-email-otp',
      RESEND_MOBILE_OTP: '/auth/customer/resend-mobile-otp',
      UPDATE_UNVERIFIED_CONTACT: '/auth/customer/update-unverified-contact',
      FORGOT_PASSWORD: '/auth/customer/forgot-password',
      RESET_PASSWORD: (token) => `/auth/customer/reset-password/${token}`,
      LOGIN: '/auth/customer/login',
      ME: '/auth/customer/me',
    },
    BUSINESS: {
      REGISTER: '/auth/business/register',
      SEND_EMAIL_OTP: '/auth/business/send-email-otp',
      VERIFY_EMAIL_OTP: '/auth/business/verify-email-otp',
      SEND_MOBILE_OTP: '/auth/business/send-mobile-otp',
      VERIFY_MOBILE_OTP: '/auth/business/verify-mobile-otp',
      RESEND_EMAIL_OTP: '/auth/business/resend-email-otp',
      RESEND_MOBILE_OTP: '/auth/business/resend-mobile-otp',
      UPDATE_UNVERIFIED_CONTACT: '/auth/business/update-unverified-contact',
      FORGOT_PASSWORD: '/auth/business/forgot-password',
      RESET_PASSWORD: (token) => `/auth/business/reset-password/${token}`,
      LOGIN: '/auth/business/login',
      ME: '/auth/business/me',
    },
  },
  // Seller Endpoints
  SELLER: {
    ONBOARDING_STEP1: '/seller/onboarding/step1',
  },
  // Roles
  ROLES: '/roles',
  // Users / Profile
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    ADDRESSES: '/user/addresses',
    LOGOUT: '/users/logout',
  },
  // Products
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    DETAILS: (id) => `/products/${id}`,
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    CATEGORIES: '/categories',
    FEATURED: '/products/featured',
    SCHEMA: '/products/schema',
    SCHEMA_TYPE: (type) => `/products/schema/${type}`,
  },
  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (itemId) => `/cart/item/${itemId}`,
    REMOVE: (itemId) => `/cart/item/${itemId}`,
    CLEAR: '/cart/clear',
  },
  // Orders & Checkout
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: (orderId) => `/orders/${orderId}`,
    CANCEL: (orderId) => `/orders/${orderId}/cancel`,
  },
  // Upload Endpoints
  UPLOAD: {
    INIT: '/upload/init',
    THUMBNAIL: '/upload/thumbnail',
    BATCH: '/upload/images/batch',
    STREAM: (uploadId) => `/upload/stream/${uploadId}`,
  },
};
