import axios from 'axios';

export const appHttp = axios.create({
  baseURL: 'http://localhost:3001',
});
