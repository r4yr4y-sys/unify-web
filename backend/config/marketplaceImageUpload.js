import multer from 'multer';

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

const marketplaceImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_request, file, callback) => {
    const valid = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    callback(valid ? null : badRequest('Upload a JPEG, PNG, or WebP image.'), valid);
  },
});

export default marketplaceImageUpload;
