import path from 'path';
import multer from 'multer';
import { type Request, type Response, type NextFunction } from 'express';
import { statusCodes } from '@/constants/statusCodes';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB for Vercel request limits
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) || ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are accepted'));
    }
  },
});

export function csvUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
          error: 'File too large. Maximum allowed size is 4 MB.',
        });
      }
      return res.status(statusCodes.BAD_REQUEST).json({ error: err.message });
    }

    if (err instanceof Error) {
      return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({ error: err.message });
    }

    next(err);
  });
}
