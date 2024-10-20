import { z } from 'zod';

export const DeleteAJobLogPathParamsDto = z.object({
  id: z.string().uuid(),
});
export type DeleteAJobLogPathParamsDto = z.output<
  typeof DeleteAJobLogPathParamsDto
>;
export type DeleteAJobLogPathParamsDtoInput = z.input<
  typeof DeleteAJobLogPathParamsDto
>;
