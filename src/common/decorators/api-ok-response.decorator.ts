import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse as _ApiOkResponse,
  ApiNotFoundResponse as _ApiNotFoundResponse,
  ApiResponseSchemaHost,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiOkResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: Omit<ApiResponseSchemaHost, 'schema'>,
) => {
  return applyDecorators(
    _ApiOkResponse({
      ...options,
      schema: {
        properties: {
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
};
