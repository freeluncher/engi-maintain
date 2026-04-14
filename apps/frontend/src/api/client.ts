import ky from 'ky';
import { useAuthStore } from '../store/authStore';

const baseClient = ky.create({
  prefix: 'http://localhost:5000/api/v1',
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        // Handle 401 globally
        if (response && response.status === 401) {
          useAuthStore.getState().logout();
        }
        return response;
      },
    ],
  },
});

/**
 * Proxy wrapper yang 100% aman melampirkan JWT di level parameter,
 * menghindari bug pada signature hooks `beforeRequest` di versi ini.
 */
export const apiClient = {
  get: (url: string, options: any = {}) => 
    baseClient.get(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${useAuthStore.getState().token}`
      }
    }),
  post: (url: string, options: any = {}) => 
    baseClient.post(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${useAuthStore.getState().token}`
      }
    }),
  put: (url: string, options: any = {}) => 
    baseClient.put(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${useAuthStore.getState().token}`
      }
    }),
  delete: (url: string, options: any = {}) => 
    baseClient.delete(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${useAuthStore.getState().token}`
      }
    }),
};