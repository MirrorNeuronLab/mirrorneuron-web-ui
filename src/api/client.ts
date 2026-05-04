import axios from 'axios';

const env = import.meta.env as ImportMetaEnv & Record<string, string>;
const token = env.MN_WEB_API_TOKEN || '';

const api = axios.create({
  baseURL: env.MN_WEB_API_BASE_URL || '/api/v1',
});

if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export default api;
