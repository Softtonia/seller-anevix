import apiClient from '../axiosClient';
import { API_ENDPOINTS } from '../endpoints';

export const sellerApi = {
  submitStep1: (data) =>
    apiClient.post(API_ENDPOINTS.SELLER.ONBOARDING_STEP1, data),
  verifyPan: (data) =>
    apiClient.post(API_ENDPOINTS.SELLER.ONBOARDING.PAN, data),
  verifyGstin: (data) =>
    apiClient.post(API_ENDPOINTS.SELLER.ONBOARDING.GSTIN, data),
  verifyBank: (data) =>
    apiClient.post(API_ENDPOINTS.SELLER.ONBOARDING.BANK, data),
};
