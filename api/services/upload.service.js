import apiClient from '../axiosClient';
import { API_ENDPOINTS } from '../endpoints';

export const uploadService = {
  // Initialize upload session to get uploadId
  initUpload: (data = {}) => apiClient.post(API_ENDPOINTS.UPLOAD.INIT, data),

  // Upload single thumbnail
  uploadThumbnail: (formData, onProgress) =>
    apiClient.post(API_ENDPOINTS.UPLOAD.THUMBNAIL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),

  // Upload batch images and/or videos
  uploadBatch: (formData, onProgress) =>
    apiClient.post(API_ENDPOINTS.UPLOAD.BATCH, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),

  // Get stream URL for Server-Sent Events progress tracking
  getStreamUrl: (uploadId) => {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:5000';
    return `${baseURL.replace(/\/api\/?$/, '')}/api/upload/stream/${uploadId}`;
  },
};
