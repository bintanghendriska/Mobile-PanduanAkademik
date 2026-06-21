import axios, { AxiosError } from 'axios';

// JSONPlaceholder is used as a stand-in academic data source — it has no
// real course data, but its REST semantics (GET/POST /posts) are close
// enough to simulate fetching/submitting mata kuliah from a campus API.
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  console.log(`[API] → ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const message = normalizeApiError(error);
    console.error(`[API] ✗ ${error.config?.url}:`, message);
    return Promise.reject(new Error(message));
  },
);

function normalizeApiError(error: AxiosError): string {
  if (error.code === 'ECONNABORTED') return 'Koneksi timeout. Periksa jaringan Anda.';
  if (!error.response) return 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
  if (error.response.status >= 500) return 'Server sedang bermasalah. Coba lagi nanti.';
  if (error.response.status === 404) return 'Data tidak ditemukan di server.';
  return `Gagal memuat data (${error.response.status}).`;
}
