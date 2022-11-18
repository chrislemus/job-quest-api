import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponseSchemaHost, getSchemaPath } from '@nestjs/swagger';
import { ApiCreatedResponse as _ApiCreatedResponse } from '@nestjs/swagger';

export const ApiCreatedResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: Omit<ApiResponseSchemaHost, 'schema'>,
) => {
  return applyDecorators(
    _ApiCreatedResponse({
      ...options,
      schema: {
        properties: {
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
};
