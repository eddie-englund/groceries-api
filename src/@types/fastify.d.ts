import { JwtSchema } from '../util/validate-session';
import { z } from 'zod';

declare module 'fastify' {
  interface FastifyRequest {
    user: z.infer<JwtSchema>;
  }
}
