import { z } from 'zod';

export const CreateCustomDomainBodySchema = z.object({
  hostname: z.string().trim().min(3).max(255),
});

export const VerifyCustomDomainBodySchema = z.object({});

export const SetPrimaryCustomDomainBodySchema = z.object({});

export type CreateCustomDomainBody = z.infer<typeof CreateCustomDomainBodySchema>;
