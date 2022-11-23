import { appSetup } from './main-setup';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

// async function bootstrap() {
//   const app = await appSetup();
//   await app.listen(3001);
// }
// bootstrap();

let server: Handler;

async function bootstrap(): Promise<Handler> {
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
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
