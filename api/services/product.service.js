import apiClient from '../axiosClient';
import { API_ENDPOINTS } from '../endpoints';

export const productService = {
  getProductTypesSchema: () => apiClient.get(API_ENDPOINTS.PRODUCTS.SCHEMA),
  getProductTypeSchema: (type) => apiClient.get(API_ENDPOINTS.PRODUCTS.SCHEMA_TYPE(type)),
  
  createProduct: (data) => apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data),
  getAllProducts: (params) => apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params }),
  getProductById: (id) => apiClient.get(API_ENDPOINTS.PRODUCTS.DETAILS(id)),
  updateProduct: (id, data) => apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), data),
  deleteProduct: (id) => apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),
};
