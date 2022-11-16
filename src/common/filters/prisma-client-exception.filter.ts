import {
  ArgumentsHost,
  Catch,
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    this.logger.error(exception);

    switch (exception.code) {
      case 'P2001':
        const messageRaw = exception.message.replace(/\n/g, '');
        const msgStart = `Unique constraint failed`;
        const msgEnd = messageRaw.split('Unique constraint failed')?.[1];

        const messages: string[] = [];
        if (msgEnd) {
          messages.push(`${msgStart}${msgEnd}`);
        }

        const httpError = new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          error: ConflictException.name,
          messages,
        });

        super.catch(httpError, host);
        break;
      default:
        const baseError = new InternalServerErrorException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: InternalServerErrorException.name,
          messages: [],
        });
        super.catch(baseError, host);
        break;
    }
  }
}
