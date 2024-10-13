import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { appHttp } from '../utils';
import { appUrl } from '../utils/app-urls.util';
import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod';

export class User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  jwt: TokenSchema;
  createUserRes: AxiosResponse<{
    accessToken: string;
    refreshToken: string;
  }>;

  constructor(user: UserSignupData, jwt?: User['jwt']) {
    Object.assign(this, user);
    if (jwt) this.jwt = jwt;
  }

  static async createUser(userSignupData?: UserSignupData) {
    const uuid = uuidV4();
    const password = 'Hello123';
    const firstName = userSignupData?.firstName || `firssstName${uuid}`;

    const lastName = userSignupData?.lastName || `lasssstName${uuid}`;

    const originalEmail = userSignupData?.email ?? 'random@acme.com';
    const email = `${uuid}${originalEmail}`;

    const data = { email, password, firstName, lastName };
    const config = appUrl.auth.signup.reqConfig(data);

    const res = await appHttp.request<TokenSchema>(config);
    const jwt = res.data;
    const newUser = new User({ email, password, firstName, lastName }, jwt);
    newUser.createUserRes = res;
    return newUser;
  }

  async loginRaw() {
    const { email, password } = this;
    const data = { email, password };
    const config = appUrl.auth.login.reqConfig(data);
    const res = await appHttp.request<{ data: TokenSchema }>(config);
    this.jwt = res.data.data;
    return res;
  }

  async login() {
    const res = await this.loginRaw();
    return res.data.data;
  }

  async logout() {
    const config = appUrl.auth.logout.reqConfig(this.jwt.accessToken);
    const res = await appHttp.request<true>(config);
    return res;
  }

  async refreshJwt() {
    const config = appUrl.auth.refresh.reqConfig(this.jwt.refreshToken);
    const res = await appHttp.request<{ data: TokenSchema }>(config);
    this.jwt = res.data.data;
    return res;
  }

  async profileRaw() {
    const config = appUrl.user.profile.reqConfig(this.jwt.accessToken);
    const res = await appHttp.request<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    }>(config);
    return res;
  }

  async profile() {
    const res = await this.profileRaw();
    return res.data;
  }

  async deleteRaw() {
    const { accessToken } = this.jwt;
    const { id: userId } = await this.profile();
    const config = appUrl.user.delete.reqConfig({ accessToken, userId });
    const res = await appHttp.request<{ data: { id: string } }>(config);
    return res;
  }

  async delete() {
    const res = await this.deleteRaw();
    return res.data;
  }

  async authFetch(reqConfig: AxiosRequestConfig<any>) {
    const config = {
      ...reqConfig,
      headers: {
        Authorization: `Bearer ${this.jwt.accessToken}`,
        ...reqConfig.headers,
      },
    };
    const res = await appHttp.request(config);
    return res;
  }
}

type UserSignupData = {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
};

const tokenSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
type TokenSchema = z.infer<typeof tokenSchema>;

export const createUserReqSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(1),
});
export type CreateUserReqSchemaInput = z.input<typeof createUserReqSchema>;

function randomBoolean() {
  // function that creates a boolean value at random. 80 percent of the time it will return true.
  return Math.random() > 0.2;
}
// export async function createUserDbData() {
//   const data = await Promise.all(users);
//   const usersCreateData = data.map((user) => {
//     const { id, ...data } = user;
//     return {
//       PutRequest: {
//         Item: { pk: `user#${id}`, sk: '"info"', userId: id, ...data },
//       },
//     };
//   });

//   return usersCreateData;
// }
// const aaaaaaaa = Array.from({ length:  }, (_, i) => {
