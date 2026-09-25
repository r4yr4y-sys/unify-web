import express from 'express';
import { Readable } from 'node:stream';
import cloudinary from '../config/cloudinary.js';
import pdfUpload from '../config/pdfUpload.js';
import resourceUpload from '../config/resourceUpload.js';
import lostFoundImageUpload from '../config/lostFoundImageUpload.js';
import marketplaceImageUpload from '../config/marketplaceImageUpload.js';
import { requireAuth } from '../middleware/auth.js';
import { text, badRequest } from '../utils/text.js';
import FlashcardPack from '../models/flashcardPackSchema.js';
import CgpaRecord from '../models/cgpaRecordSchema.js';
import StudyPlan from '../models/studyPlanSchema.js';
import StudySession from '../models/studySessionSchema.js';
import Note from '../models/noteSchema.js';
import StudyResource from '../models/studyResourceSchema.js';
import LostFoundItem from '../models/lostFoundItemSchema.js';
import MarketplaceListing from '../models/marketplaceListingSchema.js';
import Semester from '../models/semesterSchema.js';
import Course from '../models/courseSchema.js';

const router = express.Router();

const uploadPdfToCloudinary = (file, userId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: `unify/notes/${userId}`,
        public_id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

const uploadResourceToCloudinary = (file, userId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: `unify/resources/${userId}`,
        public_id: `resource-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

const uploadLostFoundImage = (file, userId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `unify/lost-found/${userId}`,
        public_id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        transformation: [{ width: 1400, crop: 'limit' }],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

const uploadMarketplaceImage = (file, userId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `unify/marketplace/${userId}`,
        public_id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        transformation: [{ width: 1400, crop: 'limit' }],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

router.get('/resources', requireAuth, async (request, response, next) => {
  try {
    const resources = await StudyResource.find({ user: request.user._id }).sort({ createdAt: -1 });
    response.json({ resources: resources.map(clientDocument) });
  } catch (error) {
    next(error);
  }
});

router.post('/resources', requireAuth, resourceUpload.single('file'), async (request, response, next) => {
  try {
    const course = text(request.body.course).slice(0, 80) || 'Unsorted';
    const detail = text(request.body.detail).slice(0, 300);
    let resourceData;
    if (request.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return response.status(503).json({ message: 'File uploads are not configured. Add the Cloudinary credentials to backend/.env.' });
      }
      const extension = request.file.originalname.split('.').pop().toLowerCase();
      const type = ({ pdf: 'PDF', docx: 'DOCX', ppt: 'PPT', pptx: 'PPTX' })[extension];
      const uploaded = await uploadResourceToCloudinary(request.file, request.user.id);
      resourceData = {
        type,
        title: text(request.body.title).slice(0, 180) || request.file.originalname.replace(/\.[^.]+$/, '').slice(0, 180),
        originalName: request.file.originalname.slice(0, 255),
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        bytes: uploaded.bytes || request.file.size,
      };
    } else {
      const title = text(request.body.title).slice(0, 180);
      let parsedUrl;
      try { parsedUrl = new URL(text(request.body.url)); } catch {}
      if (text(request.body.type).toUpperCase() !== 'LINK' || !title || !parsedUrl || !['http:', 'https:'].includes(parsedUrl.protocol)) {
        return response.status(400).json({ message: 'Enter a title and a valid HTTP or HTTPS link.' });
      }
      resourceData = { type: 'LINK', title, url: parsedUrl.toString(), bytes: 0 };
    }
    const resource = await StudyResource.create({ ...resourceData, user: request.user._id, course, detail });
    response.status(201).json({ resource: clientDocument(resource) });
  } catch (error) {
    if (error.status) return response.status(error.status).json({ message: error.message });
    next(error);
  }
});

router.get('/resources/:id/download', requireAuth, async (request, response, next) => {
  try {
    const resource = await StudyResource.findOne({ _id: request.params.id, user: request.user._id });
    if (!resource) return response.status(404).json({ message: 'Resource not found.' });
    if (resource.type === 'LINK') return response.status(400).json({ message: 'Links cannot be downloaded as files.' });
    const file = await fetch(resource.url);
    if (!file.ok || !file.body) throw new Error('The uploaded file could not be retrieved.');
    response.type(file.headers.get('content-type') || 'application/octet-stream');
    response.attachment(resource.originalName || resource.title);
    Readable.fromWeb(file.body).pipe(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/resources/:id', requireAuth, async (request, response, next) => {
  try {
    const resource = await StudyResource.findOne({ _id: request.params.id, user: request.user._id });
    if (!resource) return response.status(404).json({ message: 'Resource not found.' });
    if (resource.publicId) {
      const result = await cloudinary.uploader.destroy(resource.publicId, { resource_type: 'raw', invalidate: true });
      if (!['ok', 'not found'].includes(result.result)) throw new Error('The uploaded file could not be deleted.');
    }
    await resource.deleteOne();
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.get('/notes', requireAuth, async (request, response, next) => {
  try {
    const notes = await Note.find({ user: request.user._id }).sort({
      createdAt: -1,
    });
    response.json({ notes: notes.map(clientDocument) });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/notes',
  requireAuth,
  pdfUpload.single('file'),
  async (request, response, next) => {
    try {
      if (!request.file) throw badRequest('A PDF file is required.');
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return response.status(503).json({
          message:
            'PDF uploads are not configured. Add the Cloudinary credentials to backend/.env.',
        });
      }
      const uploaded = await uploadPdfToCloudinary(
        request.file,
        request.user.id,
      );
      const note = await Note.create({
        user: request.user._id,
        title:
          text(request.body.title).slice(0, 200) ||
          request.file.originalname.replace(/\.pdf$/i, ''),
        originalName: request.file.originalname.slice(0, 255),
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        bytes: uploaded.bytes || request.file.size,
      });
      response.status(201).json({ note: clientDocument(note) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);

router.get(
  '/notes/:id/download',
  requireAuth,
  async (request, response, next) => {
    try {
      const note = await Note.findOne({
        _id: request.params.id,
        user: request.user._id,
      });
      if (!note)
        return response.status(404).json({ message: 'Note not found.' });
      const file = await fetch(note.url);
      if (!file.ok || !file.body)
        throw new Error('The uploaded PDF could not be retrieved.');
      response.type(file.headers.get('content-type') || 'application/pdf');
      response.attachment(note.originalName);
      Readable.fromWeb(file.body).pipe(response);
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/notes/:id', requireAuth, async (request, response, next) => {
  try {
    const note = await Note.findOne({
      _id: request.params.id,
      user: request.user._id,
    });
    if (!note) return response.status(404).json({ message: 'Note not found.' });
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return response.status(503).json({
        message:
          'PDF uploads are not configured. Add the Cloudinary credentials to backend/.env.',
      });
    }
    const result = await cloudinary.uploader.destroy(note.publicId, {
      resource_type: 'raw',
      invalidate: true,
    });
    if (!['ok', 'not found'].includes(result.result)) {
      throw new Error('The uploaded PDF could not be deleted.');
    }
    await note.deleteOne();
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const clientDocument = (document) => ({
  id: document.id,
  ...document.toObject({
    versionKey: false,
    transform: (_doc, value) => {
      delete value._id;
      delete value.user;
      return value;
    },
  }),
});

const flashcardPackFromRequest = (input) => {
  if (!input || typeof input !== 'object')
    throw badRequest('Flashcard pack data is required.');
  const topic = text(input.topic).slice(0, 150);
  const cards = Array.isArray(input.cards) ? input.cards : [];
  if (!topic || !cards.length || cards.length > 50)
    throw badRequest('A topic and between 1 and 50 cards are required.');
  if (!text(input.colorScheme?.primary) || !text(input.colorScheme?.secondary))
    throw badRequest('A color scheme is required.');
  return {
    topic,
    colorScheme: {
      primary: text(input.colorScheme.primary).slice(0, 100),
      secondary: text(input.colorScheme.secondary).slice(0, 100),
    },
    cards: cards.map((card, index) => {
      const question = text(card?.question).slice(0, 2000);
      const answer = text(card?.answer).slice(0, 2000);
      if (!question || !answer)
        throw badRequest(`Card ${index + 1} needs a question and answer.`);
      return {
        id: text(card?.id) || `card-${Date.now()}-${index}`,
        question,
        answer,
      };
    }),
  };
};
const planFromRequest = (input) => {
  const subject = text(input?.subject).slice(0, 150);
  const topic = text(input?.topic).slice(0, 200);
  const checkpoints = Array.isArray(input?.checkpoints)
    ? input.checkpoints
    : [];
  if (!subject || !topic || !checkpoints.length || checkpoints.length > 100)
    throw badRequest(
      'A subject, topic, and at least one checkpoint are required.',
    );
  return {
    subject,
    topic,
    deadline: text(input.deadline) || null,
    checkpoints: checkpoints.map((item, index) => {
      const checkpointText = text(item?.text).slice(0, 500);
      if (!checkpointText)
        throw badRequest(`Checkpoint ${index + 1} needs text.`);
      return {
        id: text(item?.id) || `checkpoint-${Date.now()}-${index}`,
        text: checkpointText,
        completed: item?.completed === true,
      };
    }),
  };
};
const lostFoundItemFromRequest = (input) => {
  const status = text(input?.status);
  const title = text(input?.title).slice(0, 150);
  const location = text(input?.location).slice(0, 250);
  const description = text(input?.description).slice(0, 1000);
  const contactEmail = text(input?.contactEmail).toLowerCase().slice(0, 254);
  const contactPhone = text(input?.contactPhone).slice(0, 30);
  if (!['Lost', 'Found'].includes(status) || !title || !location || !contactEmail)
    throw badRequest('Item type, title, location, and email are required.');
  if (!/^\S+@\S+\.\S+$/.test(contactEmail)) throw badRequest('Enter a valid email address.');
  return { status, title, location, description, contactEmail, contactPhone };
};
const marketplaceListingFromRequest = (input) => {
  const title = text(input?.title).slice(0, 150);
  const category = text(input?.category).slice(0, 50);
  const condition = text(input?.condition).slice(0, 100);
  const description = text(input?.description).slice(0, 1000);
  const price = Number(input?.price);
  const contactEmail = text(input?.contactEmail).toLowerCase().slice(0, 254);
  const contactPhone = text(input?.contactPhone).slice(0, 30);
  if (!title || !category || !Number.isFinite(price) || price < 0 || price > 10000000)
    throw badRequest('Title, category, and a valid price are required.');
  if (contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail)) throw badRequest('Enter a valid email address.');
  return { title, category, price, condition, description, contactEmail, contactPhone };
};
const semestersFromRequest = (semesters) => {
  if (!Array.isArray(semesters))
    throw badRequest('Semester data must be a list.');
  return semesters.slice(0, 30).map((item) => {
    const semester = Number(item?.semester);
    const courses = Array.isArray(item?.courses) ? item.courses : [];
    if (
      !Number.isInteger(semester) ||
      semester < 1 ||
      !courses.length ||
      courses.length > 15
    )
      throw badRequest(
        'Each semester needs a number and between 1 and 15 courses.',
      );
    return {
      semester,
      courses: courses.map((course, index) => {
        const name = text(course?.name).slice(0, 150);
        const credits = Number(course?.credits);
        const grade = text(course?.grade).slice(0, 10);
        if (!name || !Number.isFinite(credits) || credits <= 0 || !grade)
          throw badRequest(`Course ${index + 1} is incomplete.`);
        return {
          id: text(course?.id) || `course-${Date.now()}-${index}`,
          name,
          credits,
          grade,
        };
      }),
    };
  });
};

router.get(
  '/flashcard-packs',
  requireAuth,
  async (request, response, next) => {
    try {
      const packs = await FlashcardPack.find({ user: request.user._id }).sort({
        createdAt: -1,
      });
      response.json({ packs: packs.map(clientDocument) });
    } catch (error) {
      next(error);
    }
  },
);
router.post(
  '/flashcard-packs',
  requireAuth,
  async (request, response, next) => {
    try {
      const pack = await FlashcardPack.create({
        user: request.user._id,
        ...flashcardPackFromRequest(request.body),
      });
      response.status(201).json({ pack: clientDocument(pack) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);
router.put(
  '/flashcard-packs/:id',
  requireAuth,
  async (request, response, next) => {
    try {
      const pack = await FlashcardPack.findOneAndUpdate(
        { _id: request.params.id, user: request.user._id },
        flashcardPackFromRequest(request.body),
        { new: true, runValidators: true },
      );
      if (!pack)
        return response
          .status(404)
          .json({ message: 'Flashcard pack not found.' });
      response.json({ pack: clientDocument(pack) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);
router.delete(
  '/flashcard-packs/:id',
  requireAuth,
  async (request, response, next) => {
    try {
      const pack = await FlashcardPack.findOneAndDelete({
        _id: request.params.id,
        user: request.user._id,
      });
      if (!pack)
        return response
          .status(404)
          .json({ message: 'Flashcard pack not found.' });
      response.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

const lostFoundClientDocument = (item, userId) => {
  const canEdit = String(item.user) === String(userId);
  const document = clientDocument(item);
  if (!canEdit) {
    delete document.contactEmail;
    delete document.contactPhone;
  }
  return { ...document, canEdit };
};

router.get('/lost-found-items', requireAuth, async (request, response, next) => {
  try {
    const items = await LostFoundItem.find().sort({ createdAt: -1 }).limit(200);
    response.json({ items: items.map((item) => lostFoundClientDocument(item, request.user._id)) });
  } catch (error) {
    next(error);
  }
});
router.post('/lost-found-items', requireAuth, lostFoundImageUpload.array('images', 5), async (request, response, next) => {
  try {
    let images = [];
    if (request.files?.length) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)
        return response.status(503).json({ message: 'Image uploads are not configured. Add the Cloudinary credentials to backend/.env.' });
      const uploaded = await Promise.all(request.files.map((file) => uploadLostFoundImage(file, request.user.id)));
      images = uploaded.map((image) => ({ url: image.secure_url, publicId: image.public_id }));
    }
    const item = await LostFoundItem.create({
      user: request.user._id,
      reporterName: text(request.user.profile?.name).slice(0, 100) || request.user.email,
      images,
      ...lostFoundItemFromRequest(request.body),
    });
    response.status(201).json({ item: lostFoundClientDocument(item, request.user._id) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.get('/lost-found-items/:id/contact', requireAuth, async (request, response, next) => {
  try {
    const item = await LostFoundItem.findById(request.params.id).select('contactEmail contactPhone');
    if (!item) return response.status(404).json({ message: 'Item report not found.' });
    response.json({ contactEmail: item.contactEmail, contactPhone: item.contactPhone });
  } catch (error) { next(error); }
});
router.put('/lost-found-items/:id', requireAuth, lostFoundImageUpload.array('images', 5), async (request, response, next) => {
  try {
    const existing = await LostFoundItem.findOne({ _id: request.params.id, user: request.user._id });
    if (!existing) return response.status(404).json({ message: 'Item report not found.' });
    const update = lostFoundItemFromRequest(request.body);
    if (request.files?.length) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)
        return response.status(503).json({ message: 'Image uploads are not configured. Add the Cloudinary credentials to backend/.env.' });
      const uploaded = await Promise.all(request.files.map((file) => uploadLostFoundImage(file, request.user.id)));
      update.images = [
        ...(existing.images || []),
        ...uploaded.map((image) => ({ url: image.secure_url, publicId: image.public_id })),
      ];
    }
    const item = await LostFoundItem.findByIdAndUpdate(existing._id, update, { new: true, runValidators: true });
    response.json({ item: lostFoundClientDocument(item, request.user._id) });
  } catch (error) {
    if (error.status) return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.delete('/lost-found-items/:id', requireAuth, async (request, response, next) => {
  try {
    const item = await LostFoundItem.findOneAndDelete({ _id: request.params.id, user: request.user._id });
    if (!item) return response.status(404).json({ message: 'Item report not found.' });
    const imageIds = [item.imagePublicId, ...(item.images || []).map((image) => image.publicId)].filter(Boolean);
    imageIds.forEach((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => {}));
    response.sendStatus(204);
  } catch (error) { next(error); }
});

const marketplaceClientDocument = (listing, userId) => {
  const canEdit = String(listing.user) === String(userId);
  const document = clientDocument(listing);
  if (!canEdit) {
    delete document.contactEmail;
    delete document.contactPhone;
  }
  return { ...document, canEdit };
};

router.get('/marketplace-listings', requireAuth, async (request, response, next) => {
  try {
    const listings = await MarketplaceListing.find().sort({ createdAt: -1 }).limit(200);
    response.json({ listings: listings.map((listing) => marketplaceClientDocument(listing, request.user._id)) });
  } catch (error) {
    next(error);
  }
});
router.post('/marketplace-listings', requireAuth, marketplaceImageUpload.array('images', 5), async (request, response, next) => {
  try {
    let images = [];
    if (request.files?.length) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)
        return response.status(503).json({ message: 'Image uploads are not configured. Add the Cloudinary credentials to backend/.env.' });
      const uploaded = await Promise.all(request.files.map((file) => uploadMarketplaceImage(file, request.user.id)));
      images = uploaded.map((image) => ({ url: image.secure_url, publicId: image.public_id }));
    }
    const listing = await MarketplaceListing.create({
      user: request.user._id,
      sellerName: text(request.user.profile?.name).slice(0, 100) || request.user.email,
      images,
      ...marketplaceListingFromRequest(request.body),
    });
    response.status(201).json({ listing: marketplaceClientDocument(listing, request.user._id) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.get('/marketplace-listings/:id/contact', requireAuth, async (request, response, next) => {
  try {
    const listing = await MarketplaceListing.findById(request.params.id).select('contactEmail contactPhone');
    if (!listing) return response.status(404).json({ message: 'Listing not found.' });
    response.json({ contactEmail: listing.contactEmail, contactPhone: listing.contactPhone });
  } catch (error) { next(error); }
});
router.put('/marketplace-listings/:id', requireAuth, marketplaceImageUpload.array('images', 5), async (request, response, next) => {
  try {
    const existing = await MarketplaceListing.findOne({ _id: request.params.id, user: request.user._id });
    if (!existing) return response.status(404).json({ message: 'Listing not found.' });
    const update = marketplaceListingFromRequest(request.body);
    if (request.files?.length) {
      const existingImages = existing.images || [];
      if (existingImages.length + request.files.length > 5)
        throw badRequest('A listing can have up to 5 images.');
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)
        return response.status(503).json({ message: 'Image uploads are not configured. Add the Cloudinary credentials to backend/.env.' });
      const uploaded = await Promise.all(request.files.map((file) => uploadMarketplaceImage(file, request.user.id)));
      update.images = [...existingImages, ...uploaded.map((image) => ({ url: image.secure_url, publicId: image.public_id }))];
    }
    const listing = await MarketplaceListing.findByIdAndUpdate(
      existing._id,
      update,
      { new: true, runValidators: true },
    );
    response.json({ listing: marketplaceClientDocument(listing, request.user._id) });
  } catch (error) {
    if (error.status) return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.delete('/marketplace-listings/:id', requireAuth, async (request, response, next) => {
  try {
    const listing = await MarketplaceListing.findOneAndDelete({ _id: request.params.id, user: request.user._id });
    if (!listing) return response.status(404).json({ message: 'Listing not found.' });
    (listing.images || []).map((image) => image.publicId).filter(Boolean).forEach((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => {}));
    response.sendStatus(204);
  } catch (error) { next(error); }
});

router.get('/cgpa', requireAuth, async (request, response, next) => {
  try {
    const record = await CgpaRecord.findOne({ user: request.user._id });
    response.json({ semesters: record?.semesters || [] });
  } catch (error) {
    next(error);
  }
});
router.put('/cgpa', requireAuth, async (request, response, next) => {
  try {
    const semesters = semestersFromRequest(request.body.semesters);
    const record = await CgpaRecord.findOneAndUpdate(
      { user: request.user._id },
      { semesters },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    response.json({ semesters: record.semesters });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.delete('/cgpa', requireAuth, async (request, response, next) => {
  try {
    await CgpaRecord.deleteOne({ user: request.user._id });
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.get('/study-plans', requireAuth, async (request, response, next) => {
  try {
    const plans = await StudyPlan.find({ user: request.user._id }).sort({
      createdAt: -1,
    });
    response.json({ plans: plans.map(clientDocument) });
  } catch (error) {
    next(error);
  }
});
router.post('/study-plans', requireAuth, async (request, response, next) => {
  try {
    const plan = await StudyPlan.create({
      user: request.user._id,
      ...planFromRequest(request.body),
    });
    response.status(201).json({ plan: clientDocument(plan) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.put(
  '/study-plans/:id',
  requireAuth,
  async (request, response, next) => {
    try {
      const plan = await StudyPlan.findOneAndUpdate(
        { _id: request.params.id, user: request.user._id },
        planFromRequest(request.body),
        { new: true, runValidators: true },
      );
      if (!plan)
        return response.status(404).json({ message: 'Study plan not found.' });
      response.json({ plan: clientDocument(plan) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);
router.delete('/study-plans/:id', requireAuth, async (request, response, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: request.params.id,
      user: request.user._id,
    });
    if (!plan) return response.status(404).json({ message: 'Study plan not found.' });
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.get('/study-sessions', requireAuth, async (request, response, next) => {
  try {
    const sessions = await StudySession.find({ user: request.user._id })
      .sort({ startedAt: -1 })
      .limit(365);
    const totals = new Map();
    sessions.forEach((session) => {
      const day = session.startedAt.toISOString().slice(0, 10);
      totals.set(day, (totals.get(day) || 0) + session.durationMs);
    });
    response.json({
      sessions: sessions.map(clientDocument),
      dailyTotals: [...totals]
        .map(([date, durationMs]) => ({ date, durationMs }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) {
    next(error);
  }
});
router.post(
  '/study-sessions',
  requireAuth,
  async (request, response, next) => {
    try {
      const startedAt = new Date(request.body.startedAt);
      const endedAt = new Date(request.body.endedAt);
      const durationMs = Number(request.body.durationMs);
      if (
        Number.isNaN(startedAt.getTime()) ||
        Number.isNaN(endedAt.getTime()) ||
        !Number.isFinite(durationMs) ||
        durationMs < 1000 ||
        !['countdown', 'open'].includes(request.body.mode)
      )
        throw badRequest('A completed study session is required.');
      const session = await StudySession.create({
        user: request.user._id,
        startedAt,
        endedAt,
        durationMs: Math.floor(durationMs),
        mode: request.body.mode,
        backgroundId: text(request.body.backgroundId).slice(0, 100),
      });
      response.status(201).json({ session: clientDocument(session) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);

const courseFromRequest = (input, semesterId) => {
  const code = text(input?.code).slice(0, 50),
    title = text(input?.title).slice(0, 150);
  const totalClasses = Number(input?.totalClasses),
    totalQuizzes = Number(input?.totalQuizzes),
    totalAssignments = Number(input?.totalAssignments),
    credits = Number(input?.credits);
  const courseType = text(input?.courseType).toLowerCase();
  if (
    !code ||
    !title ||
    !Number.isFinite(credits) ||
    credits < 0 ||
    ![totalClasses, totalQuizzes, totalAssignments].every(
      (value) => Number.isInteger(value) && value >= 0,
    ) ||
    !["theory", "lab"].includes(courseType)
  )
    throw badRequest('Complete the course details with valid counts.');
  const assessments = (type, count) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${type}-${index + 1}`,
      type,
      number: index + 1,
      status: 'pending',
      marksObtained: null,
      maxMarks: null,
      date: null,
      time: null,
    }));
  return {
    semester: semesterId,
    code,
    title,
    credits,
    totalClasses,
    totalQuizzes,
    totalAssignments,
    courseType,
    hasMidterm: courseType === 'theory',
    hasFinal: courseType === 'theory',
    attendance: Array.from({ length: totalClasses }, (_, index) => ({
      number: index + 1,
      status: 'pending',
    })),
    assessments: [
      ...assessments('quiz', totalQuizzes),
      ...assessments('assignment', totalAssignments),
      ...(courseType === 'theory' ? assessments('midterm', 1) : []),
      ...(courseType === 'theory' ? assessments('final', 1) : []),
      ...(courseType === 'lab' ? assessments('labMidterm', 1) : []),
      ...(courseType === 'lab' ? assessments('labFinal', 1) : []),
    ],
  };
};

const ensureExamAssessments = (course) => {
  if (!['theory', 'lab'].includes(course.courseType)) return false;
  const requiredTypes =
    course.courseType === 'theory'
      ? ['midterm', 'final']
      : ['labMidterm', 'labFinal'];
  let changed = false;
  for (const type of requiredTypes) {
    if (course.assessments.some((assessment) => assessment.type === type))
      continue;
    course.assessments.push({
      id: `${type}-1`,
      type,
      number: 1,
      status: 'pending',
      marksObtained: null,
      maxMarks: null,
      date: null,
      time: null,
    });
    changed = true;
  }
  return changed;
};
router.get('/semesters', requireAuth, async (request, response, next) => {
  try {
    const semesters = await Semester.find({ user: request.user._id }).sort({
      isCurrent: -1,
      createdAt: -1,
    });
    response.json({ semesters: semesters.map(clientDocument) });
  } catch (error) {
    next(error);
  }
});
router.post('/semesters', requireAuth, async (request, response, next) => {
  try {
    const name = text(request.body.name).slice(0, 100);
    if (!name) throw badRequest('Semester name is required.');
    const hasCurrent = await Semester.exists({
      user: request.user._id,
      isCurrent: true,
    });
    const semester = await Semester.create({
      user: request.user._id,
      name,
      isCurrent: !hasCurrent || request.body.isCurrent === true,
    });
    if (semester.isCurrent)
      await Semester.updateMany(
        { user: request.user._id, _id: { $ne: semester._id } },
        { isCurrent: false },
      );
    response.status(201).json({ semester: clientDocument(semester) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.put('/semesters/:id', requireAuth, async (request, response, next) => {
  try {
    const update = {};
    if (request.body.name !== undefined) {
      update.name = text(request.body.name).slice(0, 100);
      if (!update.name) throw badRequest('Semester name is required.');
    }
    if (request.body.isCurrent === true) {
      await Semester.updateMany(
        { user: request.user._id },
        { isCurrent: false },
      );
      update.isCurrent = true;
    }
    const semester = await Semester.findOneAndUpdate(
      { _id: request.params.id, user: request.user._id },
      update,
      { new: true, runValidators: true },
    );
    if (!semester)
      return response.status(404).json({ message: 'Semester not found.' });
    response.json({ semester: clientDocument(semester) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.get('/courses', requireAuth, async (request, response, next) => {
  try {
    const filter = { user: request.user._id };
    if (request.query.semesterId) filter.semester = request.query.semesterId;
    const courses = await Course.find(filter).sort({ createdAt: 1 });
    await Promise.all(
      courses.map((course) =>
        ensureExamAssessments(course) ? course.save() : Promise.resolve(),
      ),
    );
    response.json({ courses: courses.map(clientDocument) });
  } catch (error) {
    next(error);
  }
});
router.post('/courses', requireAuth, async (request, response, next) => {
  try {
    const semester = await Semester.findOne({
      _id: request.body.semesterId,
      user: request.user._id,
    });
    if (!semester)
      return response.status(404).json({ message: 'Semester not found.' });
    const course = await Course.create({
      user: request.user._id,
      ...courseFromRequest(request.body, semester._id),
    });
    response.status(201).json({ course: clientDocument(course) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
router.put('/courses/:id', requireAuth, async (request, response, next) => {
  try {
    const course = await Course.findOne({
      _id: request.params.id,
      user: request.user._id,
    });
    if (!course)
      return response.status(404).json({ message: 'Course not found.' });
    if (Array.isArray(request.body.attendance))
      course.attendance = request.body.attendance;
    if (Array.isArray(request.body.assessments))
      course.assessments = request.body.assessments;
    if (request.body.courseType !== undefined) {
      const courseType = text(request.body.courseType).toLowerCase();
      if (!['theory', 'lab'].includes(courseType))
        throw badRequest('Choose either Theory or Lab as the course type.');
      course.courseType = courseType;
      ensureExamAssessments(course);
    }
    await course.save();
    response.json({ course: clientDocument(course) });
  } catch (error) {
    next(error);
  }
});

export default router;
