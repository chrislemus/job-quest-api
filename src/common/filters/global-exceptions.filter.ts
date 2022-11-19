import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.error(exception);
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let error = exception?.['name'];
    if (error === 'Error') error = 'InternalServerErrorException';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let messages: string[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const resMsg = exception.getResponse()?.['message'];
      if (typeof resMsg === 'string') {
        messages = [resMsg];
      } else if (Array.isArray(resMsg)) {
        messages = [...resMsg];
      }
    }

    if (messages.length === 0) {
      messages.push('Internal Server Error');
    }

    const responseBody = { statusCode, error, messages };
    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
