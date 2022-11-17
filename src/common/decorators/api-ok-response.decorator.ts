import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse as _ApiOkResponse,
  ApiResponseSchemaHost,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiOkResponse = <TModel extends Type<any>>(
  model: TModel,
  args?: Omit<ApiResponseSchemaHost, 'schema'>,
) => {
  return applyDecorators(
    _ApiOkResponse({
      ...args,
      schema: {
        properties: {
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
};
