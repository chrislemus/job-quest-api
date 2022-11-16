import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class HttpTransformResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    //  return next
    //    .handle()
    //    .pipe(
    //      catchError((err) => throwError(() => new BadGatewayException())),
    //    );
    return next.handle().pipe(
      map((data) => ({ data })),
      // catchError((err) => {
      //   let messages: string[] = [];

      //   if (err.message) {
      //     if (typeof err.message === 'string') {
      //       messages.push(err.message);
      //     } else if (Array.isArray(err.message)) {
      //       messages = [...err.message];
      //     }
      //     err.messages = messages;
      //     err.message = undefined;
      //   }
      //   console.log(err);
      //   return throwError(() => err);
      // }),
    );
  }
}
