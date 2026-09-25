import multer from 'multer';
import path from 'node:path';

const supportedTypes = {
  '.pdf': ['application/pdf'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};

const resourceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const validMime = supportedTypes[extension]?.includes(file.mimetype) || file.mimetype === 'application/octet-stream';
    if (!validMime) {
      return callback(Object.assign(new Error('Upload a PDF, DOCX, PPT, or PPTX file.'), { status: 400 }));
    }
    callback(null, true);
  },
});

export default resourceUpload;
