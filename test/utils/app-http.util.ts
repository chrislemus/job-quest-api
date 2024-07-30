import axios, { AxiosError } from 'axios';

export const appHttp = axios.create({
  baseURL: 'http://localhost:3001',
});

appHttp.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const path = error.request.path;
    const method = error.request.method;
    const message = error.message;
    const data = error.response?.data;
    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const errorObj = { path, method, message, data, status, statusText };
    const errorStr = JSON.stringify(errorObj, null, 2);
    return Promise.reject(errorStr);
  },
);
