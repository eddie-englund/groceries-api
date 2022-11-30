import { JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';
import { JwtSchema } from '@util/validate-session';

interface JwtUser extends JwtPayload {
  user?: z.infer<JwtSchema>;
}

declare module 'fastify' {
  interface FastifyRequest {
    jwtPayload: JwtUser;
  }
}
