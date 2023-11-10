import { PrismaClient } from '@prisma/client';
import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, BeforeApplicationShutdown
{
  private logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
  }

  async beforeApplicationShutdown() {
    await this.$disconnect()
      .then(() => {
        this.logger.verbose('Prisma client disconnected');
      })
      .catch((err) => {
        this.logger.error(`Flawed Prisma client disconnect: ${err}`);
      });
  }
}
