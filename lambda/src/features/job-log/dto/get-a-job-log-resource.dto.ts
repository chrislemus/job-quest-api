import { z } from 'zod';

export const GetAJobLogPathParamsDto = z.object({ id: z.string().uuid() });
export type GetAJobLogPathParamsDto = z.output<typeof GetAJobLogPathParamsDto>;
export type GetAJobLogPathParamsDtoInput = z.input<
  typeof GetAJobLogPathParamsDto
>;
