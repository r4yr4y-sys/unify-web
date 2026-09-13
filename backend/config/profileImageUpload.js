import multer from 'multer';

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(
      file.mimetype,
    );
    callback(
      isImage ? null : badRequest('Profile pictures must be JPEG, PNG, or WebP images.'),
      isImage,
    );
  },
});

export default profileImageUpload;
