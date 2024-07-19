import { AxiosRequestConfig } from 'axios';
import { CreateUserReqSchemaInput } from './mocks/user.mock';

export const appUrl = {
  auth: {
    signup: {
      path: '/auth/signup',
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
      path: '/auth/login',
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
      path: '/auth/refresh',
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
      fullPath: '/auth/logout',
      path: '/auth/logout',
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
      path: '/user/profile',
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
      path: '/user',
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
      path: '/job-list',
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
      path: '/job-list',
      method: 'GET',
      reqConfig() {
        return {
          url: this.path,
          method: this.method,
        } as AxiosRequestConfig;
      },
    },
    getById: {
      path: '/job-list',
      method: 'GET',
      reqConfig(jobListId: string) {
        return {
          url: `${this.path}/${jobListId}`,
          method: this.method,
        } as AxiosRequestConfig;
      },
    },
    update: {
      path: '/job-list',
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
    // delete: {
    //   path: '/user',
    //   method: 'DELETE',
    //   reqConfig(config: { userId: string; accessToken: string }) {
    //     return {
    //       url: `${this.path}/${config.userId}`,
    //       method: this.method,
    //       headers: { Authorization: `Bearer ${config.accessToken}` },
    //     } as AxiosRequestConfig;
    //   },
    // },
  },
};
