// import { EventHandler } from './common/types';
// import { ExceptionError } from './common';
// import { handler as authLoginOptionsHandler } from './auth/login/options.handler';
// import { handler as authLoginPostHandler } from './auth/login/post.handler';
// import { handler as authLogoutOptionsHandler } from './auth/logout/options.handler';
// import { handler as authLogoutPostHandler } from './auth/logout/post.handler';
// import { handler as authRefreshOptionsHandler } from './auth/refresh/options.handler';
// import { handler as authRefreshPostHandler } from './auth/refresh/post.handler';
// import { handler as authSignupOptionsHandler } from './auth/signup/options.handler';
// import { handler as authSignupPostHandler } from './auth/signup/post.handler';
// import { handler as getHandler } from './get.handler';
// import { handler as jobGetHandler } from './job/get.handler';
// import { handler as jobOptionsHandler } from './job/options.handler';
// import { handler as jobPostHandler } from './job/post.handler';
// import { handler as jobIdDeleteHandler } from './job/{id}/delete.handler';
// import { handler as jobIdGetHandler } from './job/{id}/get.handler';
// import { handler as jobIdOptionsHandler } from './job/{id}/options.handler';
// import { handler as jobIdPatchHandler } from './job/{id}/patch.handler';
// import { handler as jobListGetHandler } from './job-list/get.handler';
// import { handler as jobListOptionsHandler } from './job-list/options.handler';
// import { handler as jobListPostHandler } from './job-list/post.handler';
// import { handler as jobListIdDeleteHandler } from './job-list/{id}/delete.handler';
// import { handler as jobListIdGetHandler } from './job-list/{id}/get.handler';
// import { handler as jobListIdOptionsHandler } from './job-list/{id}/options.handler';
// import { handler as jobListIdPatchHandler } from './job-list/{id}/patch.handler';
// import { handler as userOptionsHandler } from './user/options.handler';
// import { handler as userProfileGetHandler } from './user/profile/get.handler';
// import { handler as userProfileOptionsHandler } from './user/profile/options.handler';
// import { handler as userIdDeleteHandler } from './user/{id}/delete.handler';
// import { handler as userIdOptionsHandler } from './user/{id}/options.handler';

// const resourceHandlers: Record<string, Record<string, EventHandler>> = {
//   ['/v1/auth/login']: {
//     options: authLoginOptionsHandler,
//     post: authLoginPostHandler,
//   },
//   ['/v1/auth/logout']: {
//     options: authLogoutOptionsHandler,
//     post: authLogoutPostHandler,
//   },
//   ['/v1/auth/refresh']: {
//     options: authRefreshOptionsHandler,
//     post: authRefreshPostHandler,
//   },
//   ['/v1/auth/signup']: {
//     options: authSignupOptionsHandler,
//     post: authSignupPostHandler,
//   },
//   ['/v1']: { get: getHandler },
//   ['/v1/job']: {
//     get: jobGetHandler,
//     options: jobOptionsHandler,
//     post: jobPostHandler,
//   },
//   ['/v1/job/{id}']: {
//     delete: jobIdDeleteHandler,
//     get: jobIdGetHandler,
//     options: jobIdOptionsHandler,
//     patch: jobIdPatchHandler,
//   },
//   ['/v1/job-list']: {
//     get: jobListGetHandler,
//     options: jobListOptionsHandler,
//     post: jobListPostHandler,
//   },
//   ['/v1/job-list/{id}']: {
//     delete: jobListIdDeleteHandler,
//     get: jobListIdGetHandler,
//     options: jobListIdOptionsHandler,
//     patch: jobListIdPatchHandler,
//   },
//   ['/v1/user']: { options: userOptionsHandler },
//   ['/v1/user/profile']: {
//     get: userProfileGetHandler,
//     options: userProfileOptionsHandler,
//   },
//   ['/v1/user/{id}']: {
//     delete: userIdDeleteHandler,
//     options: userIdOptionsHandler,
//   },
// };

// export const handler: EventHandler = async (event, ctx) => {
//   const { resource, httpMethod, multiValueQueryStringParameters } = event;
//   const method = httpMethod.toLowerCase();

//   const queryParams: Record<string, string[] | string> = {};
//   if (multiValueQueryStringParameters) {
//     Object.entries(multiValueQueryStringParameters).forEach(([k, v]) => {
//       if (!v) return;
//       queryParams[k] = v.length === 1 ? v[0] : v;
//     });
//   }
//   event['queryParams'] = queryParams;

//   const childHandler: EventHandler = resourceHandlers[resource]?.[method];
//   if (!childHandler) {
//     throw new Error(`NoHandler|resource:${resource}|method:${method}`);
//   }

//   try {
//     const res = await childHandler(event, ctx);
//     if (!res['headers']) res['headers'] = {};
//     res['headers']['Access-Control-Allow-Origin'] = '*';
//     return res;
//   } catch (error) {
//     if (error instanceof ExceptionError) {
//       return {
//         statusCode: error.statusCode,
//         body: JSON.stringify({ message: error.message, error: error.error }),
//       };
//     } else {
//       console.error(error);
//       return {
//         statusCode: 500,
//         body: JSON.stringify({ message: 'Internal Server Error' }),
//       };
//     }
//   }
// };
