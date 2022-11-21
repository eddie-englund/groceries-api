import z from 'zod';

export const MsgResponses = z.enum(['Success', 'Failure']);

export const ZodDefaultResponse = z.object({
  msg: z.string().min(1).max(128),
  status: MsgResponses,
  statusCode: z.number().min(100).max(500),
});

export type ZodDefaultResponseT = z.infer<typeof ZodDefaultResponse>;
