import { z } from 'zod';

export const MsgResponses = z.enum(['Success', 'Failure']);

export const MsgStatusResponses = z.enum(['Internal server error', 'Bad request']);

export const InternalServerError: ZodDefaultResponseT = {
  status: MsgResponses.enum.Failure,
  msg: MsgStatusResponses.enum['Internal server error'],
  statusCode: 500,
};

export const ZodDefaultResponse = z.object({
  msg: z.string().min(1).max(128),
  status: MsgResponses,
  statusCode: z.number().min(100).max(500),
});

export type ZodDefaultResponseT = z.infer<typeof ZodDefaultResponse>;
