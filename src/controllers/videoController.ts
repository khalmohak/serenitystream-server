import { Request, Response, NextFunction } from "express";
import { VideoService } from "../services/VideoService";


export class VideoController {
  private videoService: VideoService;

  constructor() {
    this.videoService = new VideoService();
  }

  uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      //@ts-ignore
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      const { title, description } = req.body;
      const instructorId = req.user?.id;

      if (!title || !description || !instructorId) {
        return res.status(400).json({
          error:
            "Missing required fields: title, description, or instructor ID",
        });
      }

      //@ts-ignore
      const video = await this.videoService.uploadVideo(req.file.path, {
        title,
        description,
        instructorId,
      });

      res.status(201).json(video);
    } catch (error) {
      next(error);
    }
  };

  // Get streaming URL
  getStreamingUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.params;

      if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      const url = await this.videoService.getStreamingUrl(videoId);
      res.json({ url });
    } catch (error) {
      next(error)
    }
  };
  
  getVideoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.params;

      if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      const data = await this.videoService.getVideoById(videoId);
      res.json({ data });
    } catch (error) {
      next(error)
    }
  }
}
