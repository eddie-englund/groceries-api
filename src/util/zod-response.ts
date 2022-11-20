import z from 'zod';

export const MsgResponses = z.enum(['Success', 'Failure']);

export const ZodDefaultResponse = z.object({
  msg: MsgResponses,
  statusCode: z.number().min(100).max(500),
});
