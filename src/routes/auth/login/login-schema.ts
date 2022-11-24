import { ZodDefaultResponse } from '@util/zod-response';
import z from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1).max(64).trim(),
  password: z.string().min(6).max(256).trim(),
});

export const LoginResponseSchema = z
  .object({
    data: z.object({
      refreshToken: z.string().min(1).max(1024),
      sessionToken: z.string().min(1).max(1024),
    }),
  })
  .merge(ZodDefaultResponse);

export type LoginResponseSchemaT = z.infer<typeof LoginResponseSchema>;
