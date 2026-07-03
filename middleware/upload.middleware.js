const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const DIRS = {
  video: path.join(UPLOAD_ROOT, 'videos'),
  pdf: path.join(UPLOAD_ROOT, 'pdfs'),
  file: path.join(UPLOAD_ROOT, 'files'),
};

for (const dir of Object.values(DIRS)) {
  fs.mkdirSync(dir, { recursive: true });
}

const ALLOWED_MIME = {
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  pdf: ['application/pdf'],
  file: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
    'application/zip',
    'application/x-zip-compressed',
  ],
};

function resolveKind(mimetype) {
  if (ALLOWED_MIME.video.includes(mimetype)) return 'video';
  if (ALLOWED_MIME.pdf.includes(mimetype)) return 'pdf';
  if (ALLOWED_MIME.file.includes(mimetype)) return 'file';
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
    return cb(new Error('Tipo de ficheiro não suportado. Envie um vídeo, PDF, planilha, documento ou ZIP.'));
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
