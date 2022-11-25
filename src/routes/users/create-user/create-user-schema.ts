import { loginSchema } from '@routes/auth/login/login-schema';
import { z } from 'zod';

export const createUserSchema = z
  .object({
    email: z.string().trim().email(),
    adminUsername: z.string().trim().min(1).max(256),
    adminPassword: z.string().trim().min(8).max(256),
  })
  .merge(loginSchema);
