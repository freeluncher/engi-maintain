import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan folder uploads tersedia saat runtime
const uploadDir = path.resolve(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer Storage Local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Memberikan prefix timestamp untuk mencegah konflik penamaan file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Middleware Multer 
export const uploadMiddleware = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    // Mengizinkan file PDF
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap unggah PDF atau Image.'));
    }
  }
});
