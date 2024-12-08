import { Router } from "express";
import { VideoController } from "../controllers/videoController";
import multer from "multer";

import { authMiddleware } from "../middleware/auth";
import { checkRole } from "../middleware/checkRole";
import { validateMiddleware } from "../middleware/validateMiddleware";
import { UserRole } from "../entities";
import { UploadVideoDto } from "../dtos/video.dto";

const router = Router();
const videoController = new VideoController();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "temp/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("Incoming file:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2000, // 2GB limit
  },
});

router.use(authMiddleware());

router.use(checkRole([UserRole.INSTRUCTOR, UserRole.ADMIN]));

router.post("/upload", upload.single("video"), videoController.uploadVideo);

router.get("/:videoId/stream", videoController.getStreamingUrl);

router.get("/:videoId", videoController.getVideoById);

export default router;
