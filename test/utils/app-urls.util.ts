import { AxiosRequestConfig } from 'axios';
import { CreateUserReqSchemaInput } from '../mocks/user.mock';

export const appUrl = {
  auth: {
    signup: {
      path: '/v1/auth/signup',
      method: 'POST',
      reqConfig<T extends CreateUserReqSchemaInput>(data: T) {
        return {
          url: this.path,
          method: this.method,
          data,
        } as AxiosRequestConfig<T>;
      },
    },
    login: {
      path: '/v1/auth/login',
      method: 'POST',
      reqConfig<T extends { email: string; password: string }>(credentials: T) {
        return {
          url: this.path,
          method: this.method,
          data: credentials,
        } as AxiosRequestConfig<T>;
      },
    },
    refresh: {
      path: '/v1/auth/refresh',
      method: 'POST',
      reqConfig<T extends string>(refreshToken: T) {
        const { path, method } = this;
        return {
          url: path,
          method,
          headers: { Authorization: `Bearer ${refreshToken}` },
        } as AxiosRequestConfig<T>;
      },
    },
    logout: {
      fullpath: '/v1/auth/logout',
      path: '/v1/auth/logout',
      method: 'POST',
      reqConfig<T extends string>(accessToken: T) {
        return {
          url: this.path,
          method: this.method,
          headers: { Authorization: `Bearer ${accessToken}` },
        } as AxiosRequestConfig;
      },
    },
  },
  user: {
    profile: {
      path: '/v1/user/profile',
      method: 'GET',
      reqConfig<T extends string>(accessToken: T) {
        return {
          url: this.path,
          method: this.method,
          headers: { Authorization: `Bearer ${accessToken}` },
        } as AxiosRequestConfig;
      },
    },
    delete: {
      path: '/v1/user',
      method: 'DELETE',
      reqConfig(config: { userId: string; accessToken: string }) {
        return {
          url: `${this.path}/${config.userId}`,
          method: this.method,
          headers: { Authorization: `Bearer ${config.accessToken}` },
        } as AxiosRequestConfig;
      },
    },
  },
  jobList: {
    create: {
      path: '/v1/job-list',
      method: 'POST',
      reqConfig(data: { label: string }) {
        return {
          url: this.path,
          method: this.method,
          data,
        } as AxiosRequestConfig;
      },
    },
    getAll: {
      path: '/v1/job-list',
      method: 'GET',
      reqConfig() {
        return {
          url: this.path,
          method: this.method,
        } as AxiosRequestConfig;
      },
    },
    getById: {
      path: '/v1/job-list',
      method: 'GET',
      reqConfig(jobListId: string) {
        return {
          url: `${this.path}/${jobListId}`,
          method: this.method,
        } as AxiosRequestConfig;
      },
    },
    update: {
      path: '/v1/job-list',
      method: 'PATCH',
      reqConfig(data: { id: string; label: string }) {
        const { id, ...res } = data;
        return {
          url: `${this.path}/${id}`,
          method: this.method,
          data: res,
        } as AxiosRequestConfig;
      },
    },
    delete: {
      path: '/v1/job-list',
      method: 'DELETE',
      reqConfig(jobId: string) {
        return {
          url: `${this.path}/${jobId}`,
          method: this.method,
        } as AxiosRequestConfig;
      },
    },
  },
  job: {
    create: {
      path: '/v1/job',
      method: 'POST',
      reqConfig(data: {
        jobListId: string;
        title: string;
        company: string;
        location?: string;
        url?: string;
        salary?: string;
        description?: string;
        color?: string;
      }) {
        return {
          url: this.path,
          method: this.method,
          data,
        } as AxiosRequestConfig;
      },
    },
  },
};
