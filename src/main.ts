import { appSetup } from './app-setup';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

const notServerlessBuild =
  process.env.NOT_SERVERLESS_BUILD === 'true' ? true : false;

// ---------------------------
// Development watch build
// ---------------------------
async function bootstrap() {
  const app = await appSetup();
  await app.listen(3001);
}

if (notServerlessBuild) bootstrap();

// ---------------------------
// Serverless build
// ---------------------------
let server: Handler;

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
  server = server ?? (await bootstrapServerless());
  return server(event, context, callback);
};
