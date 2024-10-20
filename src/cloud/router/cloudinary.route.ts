import { Router } from 'express';
import multer from 'multer';
import Cloudinary from '../config/cloudinary.config'; // Adjust path if needed
import { serverError } from '@/common/errors/serverError';
import { Request, Response } from '@/types';

const imageFieldName = 'image';
// Configure multer for temporary file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1, // One image per request
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

const cloudinaryRouter = Router();
// Route to upload an image
cloudinaryRouter.post(
  '/upload',
  upload.single(imageFieldName),
  async (req: Request, res: Response) => {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = Cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto', // Auto-detect resource type (image, video, etc.)

            use_filename: true,
            unique_filename: true,
            folder: 'techblog_imgs',
            overwrite: false,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(req?.file?.buffer);
      });

      // Return the uploaded image URL
      res.status(200).json({ isSuccess: true, data: uploadResult });
    } catch (error: any) {
      serverError(res, error.message);
    }
  }
);

export default cloudinaryRouter;
