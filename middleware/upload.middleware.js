const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const DIRS = {
  video: path.join(UPLOAD_ROOT, 'videos'),
  pdf: path.join(UPLOAD_ROOT, 'pdfs'),
};

for (const dir of Object.values(DIRS)) {
  fs.mkdirSync(dir, { recursive: true });
}

const ALLOWED_MIME = {
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  pdf: ['application/pdf'],
};

function resolveKind(mimetype) {
  if (ALLOWED_MIME.video.includes(mimetype)) return 'video';
  if (ALLOWED_MIME.pdf.includes(mimetype)) return 'pdf';
  return null;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const kind = resolveKind(file.mimetype);
    cb(null, DIRS[kind] || UPLOAD_ROOT);
  },
  filename(req, file, cb) {
    const unique = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const kind = resolveKind(file.mimetype);
  if (!kind) {
    return cb(new Error('Tipo de ficheiro não suportado. Envie um vídeo (mp4/webm/ogg) ou um PDF.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB
});

function publicUrlFor(file) {
  const kind = resolveKind(file.mimetype);
  return `/uploads/${kind}s/${file.filename}`;
}

module.exports = { upload, publicUrlFor };
