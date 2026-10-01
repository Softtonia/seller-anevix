import apiClient from '../axiosClient';
import { API_ENDPOINTS } from '../endpoints';

export const sellerApi = {
  submitStep1: (data) =>
    apiClient.post(API_ENDPOINTS.SELLER.ONBOARDING_STEP1, data),
};
