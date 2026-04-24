import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

import { env } from '@/env';
import { throwHttpError } from '@/server/utils/generic-ts-rest-error';

// ─── Client ──────────────────────────────────────────────────────────────────

function getSpacesConfig() {
  if (
    !env.DO_SPACES_ENDPOINT ||
    !env.DO_SPACES_REGION ||
    !env.DO_SPACES_BUCKET ||
    !env.DO_SPACES_KEY ||
    !env.DO_SPACES_SECRET
  ) {
    throw new Error('DigitalOcean Spaces is not configured');
  }

  return {
    endpoint: env.DO_SPACES_ENDPOINT,
    region: env.DO_SPACES_REGION,
    bucket: env.DO_SPACES_BUCKET,
    accessKeyId: env.DO_SPACES_KEY,
    secretAccessKey: env.DO_SPACES_SECRET,
    cdnUrl: env.DO_SPACES_CDN_URL,
  };
}

function createS3Client() {
  const config = getSpacesConfig();

  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // DigitalOcean Spaces uses virtual-hosted-style URLs
    forcePathStyle: false,
    // Disable automatic checksum — browser uploads don't compute CRC32,
    // so a presigned URL with checksum params always results in 403.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

// ─── File key ─────────────────────────────────────────────────────────────────

const CONTENT_TYPE_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

/**
 * Build a file key for Spaces storage.
 *
 * Pattern: {env}/{appSlug}/{userId}/{resource}/{uuid}.{ext}
 *
 * Examples:
 *   dev/affprof/user_abc123/brands/f4a8b2c1d3e5.png
 *   prod/affprof/user_abc123/products/9b2c4e7f1a2b.jpg
 */
export function buildFileKey(userId: string, resource: string, contentType: string): string {
  const envPrefix = env.APP_ENV;
  const appSlug = env.IAM_APP_SLUG;
  const ext = CONTENT_TYPE_EXT[contentType] ?? 'bin';
  const uuid = randomUUID().replace(/-/g, '');

  return `${envPrefix}/${appSlug}/${userId}/${resource}/${uuid}.${ext}`;
}

// ─── Public URL ───────────────────────────────────────────────────────────────

/**
 * Returns the public URL for a stored file key.
 * Uses CDN URL if configured, otherwise falls back to the direct Spaces URL.
 */
export function createSpacesPublicUrl(fileKey: string): string {
  const config = getSpacesConfig();

  if (config.cdnUrl) {
    return `${config.cdnUrl.replace(/\/$/, '')}/${fileKey}`;
  }

  // Direct Spaces URL: https://{bucket}.{region}.digitaloceanspaces.com/{key}
  const endpointUrl = new URL(config.endpoint);
  return `${endpointUrl.protocol}//${config.bucket}.${endpointUrl.host}/${fileKey}`;
}

// ─── Operations ───────────────────────────────────────────────────────────────

/**
 * Generate a presigned PUT URL so the browser can upload directly to Spaces.
 *
 * Returns the signed URL and the headers the browser MUST send with the PUT request.
 * The ACL header is signed into the URL — if the browser omits it, the request gets a 403.
 */
export async function createSpacesPresignedPutUrl(
  fileKey: string,
  contentType: string,
  expiresInSeconds = 900,
): Promise<{ url: string; headers: Record<string, string> }> {
  const config = getSpacesConfig();
  const client = createS3Client();

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: fileKey,
    ContentType: contentType,
    ACL: 'public-read',
  });

  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });

  return {
    url,
    headers: {
      'Content-Type': contentType,
      'x-amz-acl': 'public-read',
    },
  };
}

// ─── Presign helper ───────────────────────────────────────────────────────────

/**
 * Validates a file upload request and generates a presigned PUT URL for Spaces.
 * Throws 400 if the content type or file size is not allowed.
 */
export async function presignFileUpload(input: {
  userId: string;
  folder: string;
  contentType: string;
  fileSize: number;
  allowedTypes: readonly string[];
  maxBytes: number;
}) {
  if (!input.allowedTypes.includes(input.contentType)) {
    throwHttpError({ status: 400, message: 'Only JPG, PNG, and WEBP images are allowed', code: 'BAD_REQUEST' });
  }

  if (input.fileSize > input.maxBytes) {
    throwHttpError({ status: 400, message: 'Image is too large', code: 'BAD_REQUEST' });
  }

  const fileKey = buildFileKey(input.userId, input.folder, input.contentType);
  const { url: uploadUrl, headers: uploadHeaders } = await createSpacesPresignedPutUrl(fileKey, input.contentType);
  const publicUrl = createSpacesPublicUrl(fileKey);

  return { fileKey, uploadUrl, uploadHeaders, publicUrl, method: 'PUT' as const };
}

/**
 * Delete all files for a user from Spaces.
 * Uses the prefix {env}/{appSlug}/{userId}/ to find and delete all objects.
 * Handles pagination — deletes up to 1000 objects per batch (S3 limit).
 */
export async function deleteSpacesUserFiles(userId: string): Promise<void> {
  let config: ReturnType<typeof getSpacesConfig>;

  try {
    config = getSpacesConfig();
  } catch {
    // Spaces not configured — nothing to delete
    return;
  }

  const client = createS3Client();
  const envPrefix = env.APP_ENV;
  const prefix = `${envPrefix}/${env.IAM_APP_SLUG}/${userId}/`;

  try {
    let continuationToken: string | undefined;

    do {
      const listResult = await client.send(
        new ListObjectsV2Command({
          Bucket: config.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      const keys = listResult.Contents?.map((obj) => ({ Key: obj.Key! })) ?? [];

      if (keys.length > 0) {
        await client.send(
          new DeleteObjectsCommand({
            Bucket: config.bucket,
            Delete: { Objects: keys, Quiet: true },
          }),
        );
      }

      continuationToken = listResult.IsTruncated ? listResult.NextContinuationToken : undefined;
    } while (continuationToken);
  } catch (err) {
    console.error(`[spaces] Failed to delete files for user "${userId}":`, err);
  }
}

/**
 * Delete a file from Spaces. Fire-and-forget safe — logs errors instead of throwing.
 * Pass `silent: true` to suppress the error log (e.g. when key may not exist).
 */
export async function deleteSpacesObject(fileKey: string, options?: { silent?: boolean }): Promise<void> {
  const config = getSpacesConfig();
  const client = createS3Client();

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: fileKey,
      }),
    );
  } catch (err) {
    if (!options?.silent) {
      console.error(`[spaces] Failed to delete object "${fileKey}":`, err);
    }
  }
}
