import path from 'path';
import express from 'express';
import multer from 'multer';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post('/', protect, adminGuard, upload.single('image'), (req, res) => {
  res.json({ imageUrl: `/${req.file.path.replace(/\\/g, '/')}` });
});

export default router;
