import z from 'zod';

export const MsgResponsesE = z.enum(['Success', 'Failure']);

export enum MsgResponses {
  Success = "Success",
  Failure = "Failure"
}

export const defaultResponse = z.object({
  msg: z
    .enum(MsgResponsesE)
  ),
  statusCode: z.strign
})
