import { z } from 'zod';

export const UserDeletePathParamsDto = z.object({ id: z.string().uuid() });
