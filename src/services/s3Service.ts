import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'fs';
import { lookup } from 'mime-types';
import { basename, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config';

interface UploadParams {
  fileName?: string;
  mimeType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

interface PresignedUrlParams {
  fileName: string;
  mimeType?: string;
  expiresIn?: number;
}

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
    this.bucket = config.s3.bucket;
  }

  async uploadFile(
    key: string,
    fileContent: Buffer | NodeJS.ReadableStream,
    contentType: string,
    options: UploadParams = {}
  ): Promise<string> {
    this.validateMimeType(contentType);
    // const finalKey = this.generateKey(key);

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          //@ts-ignore
          Body: fileContent,
          ContentType: contentType,
          Metadata: options.metadata,
          ACL: options.isPublic ? 'public-read' : 'private'
        }
      });

      await upload.done();
      return this.getFileUrl(key);
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Upload a file from local filesystem
   */
  async uploadFromFile(
    filePath: string,
    options: UploadParams = {}
  ): Promise<string> {
    const stream = createReadStream(filePath);
    const mimeType = options.mimeType || lookup(filePath) || 'application/octet-stream';
    const fileName = options.fileName || basename(filePath);

    return this.uploadFile(fileName, stream, mimeType, options);
  }

  /**
   * Generate a pre-signed URL for uploading a file
   */
  async getUploadUrl(params: PresignedUrlParams): Promise<string> {
    this.validateMimeType(params.mimeType || '');
    const key = this.generateKey(params.fileName);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: params.mimeType,
      });

      return await getSignedUrl(this.s3Client, command, {
        expiresIn: params.expiresIn || config.s3.uploadExpiry
      });
    } catch (error) {
      console.error('Failed to generate upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Generate a pre-signed URL for downloading a file
   */
  async getDownloadUrl(key: string, expiresIn = config.s3.downloadExpiry): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Failed to generate download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Copy a file within S3
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw new Error('Failed to copy file');
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(prefix: string): Promise<{ Key?: string }[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix
      });

      const response = await this.s3Client.send(command);
      return response.Contents || [];
    } catch (error) {
      console.error('Failed to list files:', error);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<Record<string, any>> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      return await this.s3Client.send(command);
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Generate a unique key for the file
   */
  private generateKey(originalKey: string): string {
    const ext = extname(originalKey);
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const uuid = uuidv4().slice(0, 8);
    const fileName = basename(originalKey, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

    return `${timestamp}-${uuid}-${fileName}${ext}`;
  }

  /**
   * Get the full URL for a file
   */
  private getFileUrl(key: string): string {
    return `https://${this.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;
  }

  /**
   * Validate mime type against allowed types
   */
  private validateMimeType(mimeType: string): void {
    const isAllowed = config.s3.allowedMimeTypes.some(allowed => {
      if (allowed.endsWith('/*')) {
        const type = allowed.slice(0, -2);
        return mimeType.startsWith(type);
      }
      return allowed === mimeType;
    });

    if (!isAllowed) {
      throw new Error(`Mime type ${mimeType} is not allowed`);
    }
  }
}