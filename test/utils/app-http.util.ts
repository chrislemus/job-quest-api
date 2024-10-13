import axios, { AxiosError } from 'axios';

export const appHttp = axios.create({
  baseURL: 'http://localhost:3000',
  // baseURL: 'http://localhost:3000/v1',
  // baseURL: 'http://127.0.0.1/:3000/v1',
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
