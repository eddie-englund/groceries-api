import { JwtSchema } from '../../util/validate-session';
import { JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';

export interface JwtUser extends JwtPayload {
  expiresIn: number;
  iat: number;
  data: {
    user: z.infer<typeof JwtSchema>;
  };
}

export interface JwtUndefUser extends JwtPayload {
  expiresIn?: number;
  iat?: number;
  data?: {
    user?: object;
  };
}
