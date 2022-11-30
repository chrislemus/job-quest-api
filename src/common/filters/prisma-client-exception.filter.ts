import {
  ArgumentsHost,
  Catch,
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(PrismaClientExceptionFilter.name);
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    /** Prisma error references: https://www.prisma.io/docs/reference/api-reference/error-reference */
    switch (exception.code) {
      case 'P2021': {
        this.logger.error(`Prisma internal server error code: ${exception}`);
        const baseError = new InternalServerErrorException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: InternalServerErrorException.name,
          messages: [],
        });
        super.catch(baseError, host);
        break;
      }
      case 'P2025': {
        const messageRaw = exception.message.replace(/\n/g, '');
        const msgStart = 'An operation failed';
        const msgEnd = messageRaw.split(msgStart)?.[1];

        const messages: string[] = [];
        if (msgEnd) messages.push(`${msgStart}${msgEnd}`);

        const httpError = new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: NotFoundException.name,
          messages,
        });

        super.catch(httpError, host);
        break;
      }
      case 'P2002': {
        const messageRaw = exception.message.replace(/\n/g, '');
        const msgStart = 'Unique constraint failed';
        const msgEnd = messageRaw.split(msgStart)?.[1];

        const messages: string[] = [];
        if (msgEnd) messages.push(`${msgStart}${msgEnd}`);

        const httpError = new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          error: ConflictException.name,
          messages,
        });

        super.catch(httpError, host);
        break;
      }
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
