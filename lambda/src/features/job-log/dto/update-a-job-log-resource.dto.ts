import { z } from 'zod';
import { JobLogEntity } from '../entities';

export const UpdateAJobLogReqBodyDto = JobLogEntity.pick({
  content: true,
});

export type UpdateAJobLogReqBodyDto = z.output<typeof UpdateAJobLogReqBodyDto>;
export type UpdateAJobLogReqBodyDtoInput = z.input<
  typeof UpdateAJobLogReqBodyDto
>;

export const UpdateAJobLogPathParamsDto = z.object({
  id: z.string().uuid(),
});
export type UpdateAJobLogPathParamsDto = z.output<
  typeof UpdateAJobLogPathParamsDto
>;
export type UpdateAJobLogPathParamsDtoInput = z.input<
  typeof UpdateAJobLogPathParamsDto
>;
