import { loginSchema } from '@routes/auth/login/login-schema';
import { z } from 'zod';

export const createUserSchema = z
  .object({
    email: z.string().trim().email(),
  })
  .merge(loginSchema);
