import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Page } from './page.dto';

/**
 * Controller method decorator to display paginated response schema in swagger ui
 * @param model Model type of the requested data
 */
export const ApiPageResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PageResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(Page) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
