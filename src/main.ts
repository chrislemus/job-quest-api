import { appSetup } from './app-setup';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

const notServerlessApp =
  process.env.NOT_SERVERLESS_BUILD === 'true' ? true : false;

// ---------------------------
// Development watch build
// ---------------------------
async function bootstrap() {
  const app = await appSetup();
  await app.listen(3001);
}

if (notServerlessApp) bootstrap();

// ---------------------------
// Serverless build
// ---------------------------
let serverlessApp: Handler;

async function bootstrapServerless(): Promise<Handler> {
  const app = await appSetup();
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  serverlessApp = serverlessApp ?? (await bootstrapServerless());
  return serverlessApp(event, context, callback);
};
