import { appSetup } from './main-setup';

async function bootstrap() {
  const app = await appSetup();
  await app.listen(3001);
}

bootstrap();
