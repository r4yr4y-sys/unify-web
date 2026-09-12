import multer from 'multer';

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const isPdf =
      file.mimetype === 'application/pdf' && /\.pdf$/i.test(file.originalname);
    callback(isPdf ? null : badRequest('Only PDF files can be uploaded.'), isPdf);
  },
});

export default pdfUpload;
