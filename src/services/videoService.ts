import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ffmpeg from "fluent-ffmpeg";
import { join } from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { Video } from "../entities/Video";
import { config } from "../config/config";
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { HttpException } from "../exceptions/HttpException";

interface VideoServiceConfig {
  s3: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  tempDir: string;
  cdnDomain?: string;
}

// Video processing options
interface ProcessingOptions {
  qualities: {
    name: string;
    height: number;
    bitrate: string;
  }[];
}

export class VideoService {
  private s3Client: S3Client;
  private videoRepository: Repository<Video>;
  private defaultProcessingOptions: ProcessingOptions = {
    qualities: [
      { name: "1080p", height: 1080, bitrate: "5000k" },
      { name: "720p", height: 720, bitrate: "2800k" },
      { name: "480p", height: 480, bitrate: "1400k" },
      { name: "360p", height: 360, bitrate: "800k" },
    ],
  };

  constructor() {
    this.s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });

    this.videoRepository = AppDataSource.getRepository(Video);
  }

  async uploadVideo(
    filePath: string,
    metadata: { title: string; description: string; instructorId: string },
  ): Promise<Video> {
    const videoId = uuidv4();
    const workDir = join(config.tempDir, videoId);

    try {
      // Create working directory
      await fs.mkdir(workDir, { recursive: true });

      // Process video for HLS streaming
      const processedFiles = await this.processVideo(
        filePath,
        workDir,
        videoId,
      );

      // Upload all processed files to S3
      const uploadPromises = [];
      const qualities = [];

      // Upload HLS segments and quality-specific manifests
      for (const quality of processedFiles.qualities) {
        // Upload all segments for this quality
        for (const file of quality.files) {
          const s3Key = `videos/${videoId}/${quality.name}/${file.name}`;
          uploadPromises.push(this.uploadToS3(file.path, s3Key));
        }
        qualities.push(quality.name);
      }

      // Upload master manifest
      const masterManifestKey = `videos/${videoId}/master.m3u8`;
      uploadPromises.push(
        this.uploadToS3(processedFiles.masterManifest, masterManifestKey),
      );

      await Promise.all(uploadPromises);

      // Create video entity
      const video = this.videoRepository.create();
      video.id = videoId;
      video.title = metadata.title;
      video.description = metadata.description;
      video.instructorId = metadata.instructorId;
      video.qualities = qualities;
      video.hlsManifestUrl = this.getPublicUrl(masterManifestKey);
      video.duration = await this.getVideoDuration(filePath);

      await this.videoRepository.save(video);
      return video;
    } finally {
      // Cleanup temporary files
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }

  private async processVideo(
    inputPath: string,
    workDir: string,
    videoId: string,
  ) {
    const outputs = {
      qualities: [],
      masterManifest: join(workDir, "master.m3u8"),
    };

    const masterManifestContent = "#EXTM3U\n#EXT-X-VERSION:3\n";
    const qualityPromises = this.defaultProcessingOptions.qualities.map(
      async (quality) => {
        const qualityDir = join(workDir, quality.name);
        await fs.mkdir(qualityDir, { recursive: true });

        const playlistPath = join(qualityDir, "playlist.m3u8");

        await this.transcodeVideoHLS(inputPath, qualityDir, {
          height: quality.height,
          bitrate: quality.bitrate,
          playlistPath,
        });

        // Get list of generated files
        const files = await fs.readdir(qualityDir);
        const qualityFiles = await Promise.all(
          files.map(async (filename) => ({
            name: filename,
            path: join(qualityDir, filename),
          })),
        );

        outputs.qualities.push({
          name: quality.name,
          files: qualityFiles,
        });

        // Add quality stream to master manifest
        return `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(quality.bitrate) * 1000},RESOLUTION=${quality.height}p\n${quality.name}/playlist.m3u8\n`;
      },
    );

    const qualityEntries = await Promise.all(qualityPromises);
    await fs.writeFile(
      outputs.masterManifest,
      masterManifestContent + qualityEntries.join(""),
    );

    return outputs;
  }

  private async transcodeVideoHLS(
    inputPath: string,
    outputDir: string,
    options: { height: number; bitrate: string; playlistPath: string },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoBitrate(options.bitrate)
        .outputOptions([
          "-f hls",
          "-hls_time 6", // Segment duration in seconds
          "-hls_list_size 0", // Keep all segments
          "-hls_segment_type fmp4", // Use fMP4 segments for better compatibility
          "-hls_segment_filename",
          join(outputDir, "segment_%03d.m4s"),
          "-hls_flags independent_segments",
          "-hls_playlist_type vod",
        ])
        .output(options.playlistPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });
  }

  private async uploadToS3(filePath: string, key: string): Promise<void> {
    const fileBuffer = await fs.readFile(filePath);
    const command = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: fileBuffer,
    });

    await this.s3Client.send(command);
  }

  private getPublicUrl(key: string): string {
    if (config.cdnDomain) {
      return `https://${config.cdnDomain}/${key}`;
    }
    return `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;
  }

  private async getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        resolve(metadata.format.duration || 0);
      });
    });
  }

  async getStreamingUrl(videoId: string): Promise<string> {
    const key = `videos/${videoId}/master.m3u8`;
    const command = new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    });

    // Generate a signed URL that expires in 1 hour
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async getVideoById(videoId: string): Promise<any> {
    const video = await this.videoRepository.findOne({
      where:{
        id: videoId
      }
    });
    
    if(!video){
      throw new HttpException(404, "Video Not found!");
    }
    
    return video;
  }
}
