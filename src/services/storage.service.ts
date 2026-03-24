import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type { Config } from '../config';

const createClient = (config: Config): S3Client => {
  return new S3Client({
    region: 'auto',
    endpoint: config.R2_ENDPOINT,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY,
      secretAccessKey: config.R2_SECRET_KEY,
    },
  });
};

export const createStorageService = (config: Config) => {
  const client = createClient(config);

  const upload = async (buffer: Buffer, originalName: string): Promise<string> => {
    const ext = extname(originalName) || '';
    const filename = `${randomUUID()}${ext}`;
    await client.send(
      new PutObjectCommand({
        Bucket: config.R2_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: 'application/octet-stream',
      }),
    );
    return `${config.R2_PUBLIC_URL}/${filename}`;
  };

  return { upload };
};

export type StorageService = ReturnType<typeof createStorageService>;
