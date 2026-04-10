import { env } from '@/env';
import { createHash, createHmac, randomUUID } from 'node:crypto';

function hmac(key: Buffer | string, value: string): Buffer {
  return createHmac('sha256', key).update(value, 'utf8').digest();
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function encodePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

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
    endpoint: new URL(env.DO_SPACES_ENDPOINT),
    region: env.DO_SPACES_REGION,
    bucket: env.DO_SPACES_BUCKET,
    key: env.DO_SPACES_KEY,
    secret: env.DO_SPACES_SECRET,
    cdnUrl: env.DO_SPACES_CDN_URL,
  };
}

function createPresignedUrl(args: {
  method: 'PUT' | 'GET';
  fileKey: string;
  contentType?: string;
  expiresInSeconds?: number;
}): string {
  const { endpoint, region, bucket, key, secret } = getSpacesConfig();
  const host = endpoint.host;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const expiresInSeconds = args.expiresInSeconds ?? 900;
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const bucketKeyPath = `${bucket}/${args.fileKey}`;
  const canonicalUri = `/${encodePath(bucketKeyPath)}`;
  const signedHeaders = args.contentType ? 'content-type;host' : 'host';

  const query = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${key}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresInSeconds),
    'X-Amz-SignedHeaders': signedHeaders,
  });

  const canonicalQueryString = query
    .toString()
    .split('&')
    .sort()
    .join('&');
  const canonicalHeaders = args.contentType
    ? `content-type:${args.contentType}\nhost:${host}\n`
    : `host:${host}\n`;
  const payloadHash = 'UNSIGNED-PAYLOAD';
  const canonicalRequest = [
    args.method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  return `${endpoint.protocol}//${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

function normalizeFileName(fileName: string): string {
  const normalized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);

  return normalized || 'image';
}

export function buildDatedFileKey(prefix: string, fileName: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');

  return `${prefix}/${yyyy}/${mm}/${dd}/${randomUUID()}-${normalizeFileName(fileName)}`;
}

export function createSpacesPresignedPutUrl(
  fileKey: string,
  contentType: string,
  expiresInSeconds?: number,
): string {
  return createPresignedUrl({
    method: 'PUT',
    fileKey,
    contentType,
    expiresInSeconds,
  });
}

export function createSpacesPublicUrl(fileKey: string): string {
  const { endpoint, bucket, cdnUrl } = getSpacesConfig();

  if (cdnUrl) {
    return `${cdnUrl.replace(/\/$/, '')}/${encodePath(fileKey)}`;
  }

  return `${endpoint.protocol}//${bucket}.${endpoint.host}/${encodePath(fileKey)}`;
}
