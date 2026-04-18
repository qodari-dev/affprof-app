import { z } from 'zod';

const HexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Use a 6-digit hex color like #111111')
  .transform((value) => value.toUpperCase());

// Accepts a Spaces file key (e.g. "dev/affprof/user_abc/brands/uuid.png") or empty string
const OptionalLogoKeySchema = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined));

export const BRAND_LOGO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const BRAND_LOGO_MAX_BYTES = 4 * 1024 * 1024;

export const CreateBrandBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  logoKey: OptionalLogoKeySchema,
  qrForeground: HexColorSchema.default('#111111'),
  qrBackground: HexColorSchema.default('#FFFFFF'),
  isDefault: z.boolean().optional().default(false),
});

export const UpdateBrandBodySchema = CreateBrandBodySchema.partial();

export const SetDefaultBrandBodySchema = z.object({});

export const PresignBrandLogoUploadBodySchema = z.object({
  contentType: z.enum(BRAND_LOGO_ALLOWED_TYPES),
  fileSize: z.number().int().positive().max(BRAND_LOGO_MAX_BYTES),
});

export const PresignBrandLogoUploadResponseSchema = z.object({
  fileKey: z.string().min(1),
  uploadUrl: z.url(),
  uploadHeaders: z.record(z.string(), z.string()),
  publicUrl: z.url(),
  method: z.literal('PUT'),
});

export type CreateBrandBody = z.infer<typeof CreateBrandBodySchema>;
